/* Stage 8 framework: user accounts + per-user progress database (stored in this browser).
   Runs BEFORE the app so the signed-in user's saved progress is loaded first. */
(function () {
  var DBK = 'S8DB', SK = 'S8SESSION', OK = 'S8OWNER';
  var STARTERS = ['fox', 'owl', 'panda', 'tiger', 'octopus', 'penguin', 'unicorn', 'robot'];
  function isApp(k) { return !!k && (k.indexOf('s8f-') === 0 || k.indexOf('margin-') === 0); }
  function db() { try { var d = JSON.parse(localStorage.getItem(DBK)); if (d && d.users) return d; } catch (e) {} return { v: 1, users: {} }; }
  function saveDb(d) { localStorage.setItem(DBK, JSON.stringify(d)); }
  function snap() { var o = {}; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (isApp(k)) o[k] = localStorage.getItem(k); } return o; }
  function clearApp() { var ks = []; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (isApp(k)) ks.push(k); } ks.forEach(function (k) { localStorage.removeItem(k); }); }
  function restore(o) { clearApp(); for (var k in (o || {})) localStorage.setItem(k, o[k]); }
  function norm(u) { return String(u || '').trim().toLowerCase(); }

  var sess = localStorage.getItem(SK), d = db();
  if (sess && !d.users[sess]) { localStorage.removeItem(SK); sess = null; }
  if (sess && localStorage.getItem(OK) !== sess) { restore(d.users[sess].data); localStorage.setItem(OK, sess); }

  function persist() {
    var s = localStorage.getItem(SK); if (!s || localStorage.getItem(OK) !== s) return;
    var D = db(); if (!D.users[s]) return;
    D.users[s].data = snap(); D.users[s].last = Date.now(); saveDb(D);
  }
  if (sess) { setInterval(persist, 2000); window.addEventListener('beforeunload', persist); document.addEventListener('visibilitychange', persist); }

  async function hash(pw, salt) {
    if (window.crypto && crypto.subtle) {
      var enc = new TextEncoder();
      var key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
      var bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
      return Array.from(new Uint8Array(bits)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }
    var h = 0, s = salt + '|' + pw; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return 'x' + h;
  }
  function salt() { var a = new Uint8Array(12); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.random() * 256; }); return Array.from(a).map(function (b) { return b.toString(16).padStart(2, '0'); }).join(''); }

  function summary(data) {
    var g = {}, p = {};
    try { g = JSON.parse(data['s8f-game'] || '{}'); } catch (e) {}
    try { p = JSON.parse(data['s8f-progress'] || '{}'); } catch (e) {}
    var stars = 0, medals = 0, golds = 0, topics = 0;
    var book = p.book || {};
    Object.keys(book).forEach(function (id) { var b = book[id] || {}; stars += b.stars || 0; var sd = b.secDone || {}; Object.keys(sd).forEach(function (n) { var v = sd[n]; stars += v === true ? 1 : (v || 0); if (v) topics++; }); if (b.medal) medals++; if (b.medal === 3) golds++; });
    return { xp: g.xp || 0, coins: g.coins || 0, streak: (g.streak || {}).count || 0, best: (g.streak || {}).best || 0, badges: Object.keys(g.badges || {}).length, avatar: g.avatar || 'fox', frame: g.frame || 'none', correct: (g.stats || {}).correct || 0, stars: stars, medals: medals, golds: golds, topics: topics };
  }

  function seedGame(data, name, avatar) {
    var g = {}; try { g = JSON.parse(data['s8f-game'] || '{}'); } catch (e) {}
    g.name = name; g.avatar = avatar;
    var owned = g.owned || ['fox', 'owl', 'sunny', 'none'];
    if (owned.indexOf(avatar) < 0) owned.push(avatar);
    g.owned = owned;
    data['s8f-game'] = JSON.stringify(g);
    return data;
  }

  window.S8AUTH = {
    STARTERS: STARTERS,
    avatarOf: function (u) { return (summary((db().users[u] || {}).data || {})).avatar; },
    current: function () { return localStorage.getItem(SK); },
    user: function () { var s = localStorage.getItem(SK); return s ? db().users[s] || null : null; },
    hasOrphan: function () { return !localStorage.getItem(OK) && Object.keys(snap()).some(function (k) { return k === 's8f-game' || k === 's8f-progress'; }); },
    list: function () {
      var D = db(), cur = localStorage.getItem(SK);
      return Object.keys(D.users).map(function (u) { var r = D.users[u]; var data = u === cur ? snap() : r.data || {}; return { username: u, name: r.name, cls: r.cls || '', created: r.created, last: u === cur ? Date.now() : r.last, s: summary(data) }; });
    },
    summary: summary,
    register: async function (f) {
      if (!f.name || !f.name.trim()) throw new Error('Please type your name.');
      if (!/^\d{4}$/.test(f.pin || '')) throw new Error('Your secret code must be 4 numbers.');
      var D = db();
      var base = (f.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '') || 'player').slice(0, 12) + (f.cls ? '-' + String(f.cls).toLowerCase().replace(/[^a-z0-9]/g, '') : '');
      var u = base, k = 2; while (D.users[u]) u = base + k++;
      f.password = f.pin;
      var sl = salt();
      var data = (!localStorage.getItem(OK) && f.keepGuest) ? snap() : {};
      data = seedGame(data, f.name.trim().slice(0, 18), f.avatar || 'fox');
      D.users[u] = { name: f.name.trim().slice(0, 30), cls: (f.cls || '').trim().slice(0, 20), salt: sl, hash: await hash(f.password, sl), created: Date.now(), last: Date.now(), data: data };
      saveDb(D); restore(data); localStorage.setItem(SK, u); localStorage.setItem(OK, u);
      location.reload();
    },
    login: async function (username, pw) {
      var u = norm(username), D = db(), r = D.users[u];
      if (!r) throw new Error('Player not found.');
      var lock = (r.lockUntil || 0) - Date.now();
      if (lock > 0) throw new Error('Too many tries. Wait ' + Math.ceil(lock / 1000) + ' seconds.');
      if (await hash(pw, r.salt) !== r.hash) { r.fails = (r.fails || 0) + 1; if (r.fails >= 5) { r.fails = 0; r.lockUntil = Date.now() + 30000; } saveDb(D); throw new Error('Wrong code, try again!'); }
      r.fails = 0; r.lockUntil = 0; saveDb(D);
      localStorage.setItem(SK, u); localStorage.removeItem(OK);
      location.reload();
    },
    logout: function () { persist(); clearApp(); localStorage.removeItem(SK); localStorage.removeItem(OK); location.reload(); },
    updateProfile: function (p) { var s = localStorage.getItem(SK), D = db(); if (!s || !D.users[s]) return; if (p.name != null) D.users[s].name = String(p.name).trim().slice(0, 30) || D.users[s].name; if (p.cls != null) D.users[s].cls = String(p.cls).trim().slice(0, 20); saveDb(D); },
    changePassword: async function (oldPw, newPw) {
      var s = localStorage.getItem(SK), D = db(), r = D.users[s];
      if (await hash(oldPw, r.salt) !== r.hash) throw new Error('Your current code is wrong.');
      if (!/^\d{4}$/.test(newPw || '')) throw new Error('The new code must be 4 numbers.');
      r.salt = salt(); r.hash = await hash(newPw, r.salt); saveDb(D);
    },
    deleteAccount: async function (pw) {
      var s = localStorage.getItem(SK), D = db(), r = D.users[s];
      if (await hash(pw, r.salt) !== r.hash) throw new Error('Wrong code.');
      delete D.users[s]; saveDb(D); clearApp(); localStorage.removeItem(SK); localStorage.removeItem(OK); location.reload();
    },
    exportData: function () {
      persist(); var s = localStorage.getItem(SK), r = db().users[s];
      var blob = new Blob([JSON.stringify({ app: 'stage8-framework', v: 1, username: s, name: r.name, cls: r.cls, exported: new Date().toISOString(), data: snap() }, null, 1)], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'stage8-progress-' + s + '.json'; document.body.appendChild(a); a.click(); a.remove();
    },
    importData: function (obj) {
      if (!obj || obj.app !== 'stage8-framework' || !obj.data) throw new Error('This is not a Stage 8 framework progress file.');
      var s = localStorage.getItem(SK), D = db(); var r = D.users[s];
      var data = Object.assign({}, obj.data); var g = {}; try { g = JSON.parse(data['s8f-game'] || '{}'); } catch (e) {} g.name = (JSON.parse(snap()['s8f-game'] || '{}').name) || r.name; data['s8f-game'] = JSON.stringify(g);
      r.data = data; saveDb(D); restore(data); localStorage.setItem(OK, s); location.reload();
    },
    persist: persist,
  };
})();
