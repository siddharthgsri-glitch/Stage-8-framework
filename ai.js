/* Stage 8 AI connector (loaded fresh, never cached).
   1) If the site owner added an AI key on Vercel, /api/complete is used.
   2) Otherwise a free, keyless AI service is used. */
(function () {
  var SYS = 'You are a friendly, encouraging tutor for Cambridge Lower Secondary Stage 8 students aged 12-13. Keep language simple, safe and age-appropriate. Never ask for or include personal information. When asked for JSON, return only valid JSON with no extra text.';
  var apiState = /github\.io$/.test(location.hostname) ? 'off' : (sessionStorage.getItem('s8-ai-api') || 'unknown');
  function norm(arg) { return typeof arg === 'string' ? [{ role: 'user', content: arg }] : ((arg && arg.messages) || []); }
  function signal(ms) { try { if (AbortSignal.timeout) return AbortSignal.timeout(ms); } catch (e) {} var c = new AbortController(); setTimeout(function () { c.abort(); }, ms); return c.signal; }
  function sleep(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }
  function clean(t) { return String(t || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\\\(|\\\)|\\\[|\\\]/g, '').replace(/^#+\s*/gm, '').trim(); }
  function shape(msgs) {
    var out = [{ role: 'system', content: SYS }];
    msgs.slice(-14).forEach(function (m) { var role = m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user'; var c = String(m.content == null ? '' : m.content).slice(0, 5000); if (!c) return; var last = out[out.length - 1]; if (last.role === role && role !== 'system') last.content += '\n\n' + c; else out.push({ role: role, content: c }); });
    return out;
  }
  async function viaApi(msgs) {
    var r = await fetch('api/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: msgs }), signal: signal(30000) });
    if (!r.ok) { if ([404, 405, 503].indexOf(r.status) >= 0) { apiState = 'off'; sessionStorage.setItem('s8-ai-api', 'off'); } throw new Error('api ' + r.status); }
    var j = await r.json(); if (!j.text) throw new Error('empty'); apiState = 'on'; sessionStorage.setItem('s8-ai-api', 'on'); return j.text;
  }
  async function freePost(conv, model) {
    var r = await fetch('https://text.pollinations.ai/openai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: model, messages: conv, private: true, seed: Math.floor(Math.random() * 1e6) }), signal: signal(55000) });
    if (!r.ok) throw new Error('free ' + r.status);
    var j = await r.json(); var x = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    if (!x) throw new Error('empty'); return x;
  }
  async function freeGet(conv) {
    var last = ''; for (var i = conv.length - 1; i >= 0; i--) if (conv[i].role === 'user') { last = conv[i].content; break; }
    var r = await fetch('https://text.pollinations.ai/' + encodeURIComponent(last.slice(-1500)) + '?model=openai&private=true&system=' + encodeURIComponent(SYS), { signal: signal(55000) });
    if (!r.ok) throw new Error('get ' + r.status);
    var t = await r.text(); if (!t || /^\s*\{\s*"error"/.test(t)) throw new Error('get empty'); return t;
  }
  var busy = Promise.resolve(), lastAt = 0;
  function queued(fn) { var run = busy.then(async function () { var w = 2500 - (Date.now() - lastAt); if (w > 0) await sleep(w); try { return await fn(); } finally { lastAt = Date.now(); } }); busy = run.catch(function () {}); return run; }
  async function viaFree(msgs) {
    var conv = shape(msgs), err;
    var plan = [function () { return freePost(conv, 'openai'); }, function () { return freePost(conv, 'openai-fast'); }, function () { return freeGet(conv); }, function () { return freePost(conv, 'openai'); }];
    for (var i = 0; i < plan.length; i++) {
      try { return clean(await queued(plan[i])); } catch (e) { err = e; if (window.console) console.warn('[AI] attempt ' + (i + 1) + ' failed:', e && e.message); await sleep(1500 + i * 1500); }
    }
    throw err || new Error('AI unavailable');
  }
  async function complete(arg) {
    var msgs = norm(arg);
    if (apiState !== 'off') { try { return clean(await viaApi(msgs)); } catch (e) { if (window.console) console.warn('[AI] own key not available, using free AI:', e.message); } }
    return await viaFree(msgs);
  }
  window.genspark = { complete: complete }; window.claude = window.genspark; window.S8AI = { complete: complete, status: function () { return apiState; } };
})();
