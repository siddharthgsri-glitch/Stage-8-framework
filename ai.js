/* Stage 8 AI connector (loaded fresh, never cached).
   1) If an AI key is configured on Vercel, /api/complete is used (fast, no limits).
   2) Otherwise the free keyless service is used. It allows ONE new reply every ~45 s per device,
      so requests are queued and spaced out automatically, and a countdown is shown while waiting. */
(function () {
  var SYS = 'You are a friendly, encouraging tutor for Cambridge Lower Secondary Stage 8 students aged 12-13. Keep language simple, safe and age-appropriate. Never ask for or include personal information. When asked for JSON, return only valid JSON with no extra text.';
  var apiState = /github\.io$/.test(location.hostname) ? 'off' : (sessionStorage.getItem('s8-ai-api') || 'unknown');
  var GAP = 46000;
  function norm(arg) { return typeof arg === 'string' ? [{ role: 'user', content: arg }] : ((arg && arg.messages) || []); }
  function signal(ms) { var c = new AbortController(); setTimeout(function () { c.abort(); }, ms); return c.signal; }
  function sleep(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }
  function clean(t) { return String(t || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\\\(|\\\)|\\\[|\\\]/g, '').replace(/^#+\s*/gm, '').trim(); }
  // free service accepts exactly one system message; fold all instructions into the first user turn for reliability
  function shape(msgs) {
    var sys = [SYS], conv = [];
    msgs.slice(-14).forEach(function (m) { var c = String(m.content == null ? '' : m.content).slice(0, 5000); if (!c) return; if (m.role === 'system') { sys.push(c); return; } var role = m.role === 'assistant' ? 'assistant' : 'user'; var last = conv[conv.length - 1]; if (last && last.role === role) last.content += '\n\n' + c; else conv.push({ role: role, content: c }); });
    if (!conv.length || conv[0].role !== 'user') conv.unshift({ role: 'user', content: '(start)' });
    conv[0].content = 'INSTRUCTIONS:\n' + sys.slice(1).join('\n\n') + (sys.length > 1 ? '\n\n---\n' : '') + conv[0].content;
    return [{ role: 'system', content: SYS }].concat(conv);
  }
  // shared waiting state so the UI can show a countdown
  var listeners = [], waitUntil = +(localStorage.getItem('s8-ai-next') || 0);
  function notify() { var s = Math.max(0, Math.ceil((waitUntil - Date.now()) / 1000)); listeners.forEach(function (f) { try { f(s); } catch (e) {} }); }
  setInterval(notify, 1000);
  function setNext(ms) { waitUntil = Date.now() + ms; localStorage.setItem('s8-ai-next', String(waitUntil)); notify(); }
  async function viaApi(msgs) {
    var r = await fetch('api/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: msgs }), signal: signal(30000) });
    if (!r.ok) { if ([404, 405, 503].indexOf(r.status) >= 0) { apiState = 'off'; sessionStorage.setItem('s8-ai-api', 'off'); } throw new Error('api ' + r.status); }
    var j = await r.json(); if (!j.text) throw new Error('empty'); apiState = 'on'; sessionStorage.setItem('s8-ai-api', 'on'); return j.text;
  }
  var chain = Promise.resolve();
  function queued(fn) { var run = chain.then(fn); chain = run.catch(function () {}); return run; }
  async function freeOnce(conv) {
    var w = waitUntil - Date.now(); if (w > 0) await sleep(w + 300);
    var r = await fetch('https://text.pollinations.ai/openai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'openai', messages: conv, private: true, seed: Math.floor(Math.random() * 1e9) }), signal: signal(60000) });
    if (r.status === 402 || r.status === 429) {
      var retry = 15; try { var j = await r.json(); var m = /retry after (\d+)\s*s/i.exec(JSON.stringify(j)); if (m) retry = +m[1]; } catch (e) {}
      setNext((retry + 1) * 1000); var er = new Error('wait'); er.wait = true; throw er;
    }
    if (!r.ok) throw new Error('free ' + r.status);
    setNext(GAP);
    var j2 = await r.json(); var x = j2 && j2.choices && j2.choices[0] && j2.choices[0].message && j2.choices[0].message.content;
    if (!x) throw new Error('empty'); return x;
  }
  function viaFree(msgs) {
    var conv = shape(msgs);
    return queued(async function () {
      var err;
      for (var i = 0; i < 4; i++) {
        try { return clean(await freeOnce(conv)); } catch (e) { err = e; if (window.console) console.warn('[AI] try ' + (i + 1) + ':', e.message); if (!e.wait) await sleep(2500); }
      }
      throw err || new Error('AI unavailable');
    });
  }
  async function complete(arg) {
    var msgs = norm(arg);
    if (apiState !== 'off') { try { return clean(await viaApi(msgs)); } catch (e) { if (window.console) console.warn('[AI] own key not available, using free AI:', e.message); } }
    return await viaFree(msgs);
  }
  window.genspark = { complete: complete }; window.claude = window.genspark;
  window.S8AI = { complete: complete, status: function () { return apiState; }, onWait: function (f) { listeners.push(f); notify(); return function () { listeners = listeners.filter(function (x) { return x !== f; }); }; }, secondsLeft: function () { return Math.max(0, Math.ceil((waitUntil - Date.now()) / 1000)); }, usingFree: function () { return apiState === 'off'; } };
})();
