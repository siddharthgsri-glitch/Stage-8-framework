/* Shared voice picker: always prefers a voice from France for French (never Canadian/Belgian/Swiss),
   and a British voice for English. Used by every read-aloud feature, videos and the speaking coach. */
(function () {
  var cache = {};
  function score(v, lang) {
    var L = (v.lang || '').replace('_', '-').toLowerCase(), n = (v.name || '').toLowerCase(), s = 0;
    if (lang === 'fr-FR') {
      if (!L.startsWith('fr')) return -1;
      if (L === 'fr-fr') s += 100;
      else if (L === 'fr') s += 60;
      else return -1; // fr-CA, fr-BE, fr-CH are rejected
      if (/canad|qu[eé]bec|belg|suisse|swiss|chantal|felix|félix|nicolas|amélie \(c|sylvie|antoine|jean|sylvain|caroline/.test(n)) s -= 200;
      if (/fran[cç]e|\(france\)|paris/.test(n)) s += 20;
      if (/thomas|aur[eé]lie|marie|audrey|denise|henri|eloise|élo|vivienne|remy|rémy|julie|paul|hortense|mathieu|lea|léa|virginie|celine|céline|google fran/.test(n)) s += 15;
    } else if (lang.startsWith('en')) {
      if (!L.startsWith('en')) return -1;
      if (L === lang.toLowerCase()) s += 50; else if (L === 'en-gb') s += 40; else s += 20;
      if (/daniel|kate|serena|arthur|martha|libby|sonia|ryan|google uk/.test(n)) s += 10;
    } else { if (!L.startsWith(lang.slice(0, 2))) return -1; s += L === lang.toLowerCase() ? 50 : 20; }
    if (/natural|neural|online|premium|enhanced/.test(n)) s += 12;
    if (/google/.test(n)) s += 6;
    if (/compact|eloquence|novelty|whisper|bad news|bells|zarvox|trinoids|bubbles/.test(n)) s -= 30;
    return s;
  }
  function pick(lang) {
    if (!window.speechSynthesis) return null;
    var vs = speechSynthesis.getVoices(); if (!vs.length) return null;
    var best = null, bs = -1;
    vs.forEach(function (v) { var s = score(v, lang); if (s > bs) { bs = s; best = v; } });
    return bs >= 0 ? best : null;
  }
  function voiceFor(lang) {
    lang = lang.toLowerCase().startsWith('fr') ? 'fr-FR' : lang.toLowerCase().startsWith('en') ? (lang.length > 2 ? lang : 'en-GB') : lang;
    if (!(lang in cache) || !cache[lang]) cache[lang] = pick(lang);
    return cache[lang];
  }
  if (window.speechSynthesis) { speechSynthesis.addEventListener ? speechSynthesis.addEventListener('voiceschanged', function () { cache = {}; }) : (speechSynthesis.onvoiceschanged = function () { cache = {}; }); setTimeout(function () { cache = {}; }, 1000); }
  // patch every utterance: whatever the app sets, French always gets a France voice
  if (window.SpeechSynthesisUtterance && window.speechSynthesis && !speechSynthesis.__s8patched) {
    var orig = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = function (u) {
      try {
        var lang = (u.lang || '').toLowerCase();
        if (lang.startsWith('fr')) { u.lang = 'fr-FR'; var v = voiceFor('fr-FR'); if (v) u.voice = v; }
        else if (lang.startsWith('en') && !u.voice) { var e = voiceFor(u.lang); if (e) u.voice = e; }
      } catch (e) {}
      return orig(u);
    };
    speechSynthesis.__s8patched = true;
  }
  window.S8VOICE = { voiceFor: voiceFor, hasFrance: function () { var v = voiceFor('fr-FR'); return !!(v && /fr[-_]fr|^fr$/i.test(v.lang)); }, name: function (l) { var v = voiceFor(l); return v ? v.name + ' (' + v.lang + ')' : 'default'; } };
})();

/* France-French audio voice: plays a real fr-FR recording-quality voice on every device
   (independent of which voices the phone has installed). Falls back to the device voice if offline. */
(function () {
  var cur = null, seq = 0;
  function chunks(t) {
    var out = [], parts = String(t).replace(/\s+/g, ' ').trim().match(/[^.!?;:]+[.!?;:]*/g) || [String(t)];
    parts.forEach(function (p) { p = p.trim(); while (p.length > 180) { var i = p.lastIndexOf(' ', 180); if (i < 40) i = 180; out.push(p.slice(0, i)); p = p.slice(i).trim(); } if (p) out.push(p); });
    return out;
  }
  function url(t, slow) { return 'https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=fr-FR&ttsspeed=' + (slow ? '0.5' : '0.9') + '&q=' + encodeURIComponent(t); }
  function stop() { seq++; if (cur) { try { cur.pause(); } catch (e) {} cur = null; } }
  function deviceSay(text, rate, onend) {
    if (!window.speechSynthesis) { onend && onend(); return; }
    var u = new SpeechSynthesisUtterance(text); u.lang = 'fr-FR'; u.rate = rate || 0.85; var v = window.S8VOICE && S8VOICE.voiceFor('fr-FR'); if (v) u.voice = v; u.onend = function () { onend && onend(); }; u.onerror = function () { onend && onend(); }; speechSynthesis.speak(u);
  }
  function say(text, opts) {
    opts = opts || {}; stop(); if (window.speechSynthesis) speechSynthesis.cancel();
    var my = ++seq, list = chunks(text), i = 0, failed = false;
    var next = function () {
      if (my !== seq) return;
      if (i >= list.length) { cur = null; opts.onend && opts.onend(); return; }
      var a = new Audio(url(list[i++], opts.slow)); a.preload = 'auto'; cur = a;
      a.onended = function () { setTimeout(next, 120); };
      a.onerror = function () { if (my !== seq) return; failed = true; cur = null; deviceSay(list.slice(i - 1).join(' '), opts.slow ? 0.55 : opts.rate, opts.onend); };
      var p = a.play(); if (p && p.catch) p.catch(function () { if (my !== seq || failed) return; failed = true; cur = null; deviceSay(list.slice(i - 1).join(' '), opts.slow ? 0.55 : opts.rate, opts.onend); });
    };
    next();
    return { stop: stop };
  }
  window.FRVOICE = { say: say, stop: stop };
})();
