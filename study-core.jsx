/* Study core: spaced repetition + mistake notebook, time tracking, accessibility,
   class challenge, homework, teacher PIN, collectable cards. */
(() => {
const LS = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
};
window.LS8 = LS;
const DAY = 864e5;
const todayS = () => new Date().toISOString().slice(0, 10);

/* ---------- question index + spaced repetition ---------- */
let IDX = null; // key -> {q, ch, sec, kind}
let REV = null; // WeakMap q -> key
function build() {
  if (IDX) return;
  IDX = {}; REV = new WeakMap();
  (window.BOOK || []).forEach(ch => {
    (ch.secs || []).forEach((s, si) => (s.check || []).forEach((q, qi) => { const k = `${ch.id}|c|${si}|${qi}`; IDX[k] = { q, ch, sec: s, kind: 'topic' }; REV.set(q, k); }));
    (ch.practice || []).forEach((q, qi) => { const k = `${ch.id}|p|${qi}`; IDX[k] = { q, ch, sec: null, kind: 'practice' }; REV.set(q, k); });
    (ch.challenge || []).forEach((q, qi) => { const k = `${ch.id}|x|${qi}`; IDX[k] = { q, ch, sec: null, kind: 'challenge' }; REV.set(q, k); });
  });
}
const BOXD = [0, 1, 2, 4, 8, 16, 32];
const SR = {
  key(q) { build(); return REV.get(q) || null; },
  info(k) { build(); return IDX[k] || null; },
  all() { build(); return IDX; },
  store() { return LS.get('s8f-sr', {}); },
  record(q, ok, hints = 0) {
    const k = SR.key(q); if (!k) return;
    const st = SR.store(); const r = st[k] || { b: 0, w: 0, r: 0, s: 0, m: false, due: 0 };
    const clean = ok && hints < 2;
    r.last = Date.now();
    if (clean) {
      r.r++; r.s++; r.b = Math.min(6, r.b + 1); r.due = Date.now() + BOXD[r.b] * DAY;
      if (r.m && r.s >= 2) { r.m = false; r.fixed = Date.now(); GAME.toast(' Mistake cleared from your notebook!', true); GAME.event('fix'); GAME.award(15, 5, 'Mistake fixed'); }
    } else if (!ok) { r.w++; r.s = 0; r.b = 0; r.m = true; r.due = Date.now(); }
    else { r.s = 0; r.due = Date.now() + DAY; }
    st[k] = r; LS.set('s8f-sr', st);
  },
  mistakes() { const st = SR.store(); build(); return Object.entries(st).filter(([k, r]) => r.m && IDX[k]).map(([k, r]) => ({ k, r, ...IDX[k] })).sort((a, b) => b.r.last - a.r.last); },
  due() { const st = SR.store(); build(); const now = Date.now(); return Object.entries(st).filter(([k, r]) => IDX[k] && r.due <= now).map(([k, r]) => ({ k, r, ...IDX[k] })).sort((a, b) => a.r.due - b.r.due); },
  fixedCount() { return Object.values(SR.store()).filter(r => r.fixed).length; },
  // formulas relevant to a question
  formulasFor(q) {
    const k = SR.key(q); if (!k) return [];
    const [cid, kind, si] = k.split('|'); const F = (window.FORMULAS || {})[cid] || [];
    if (kind === 'c') { const ch = IDX[k].ch; const n = ch.secs[+si].n; const ix = ((window.FSEC || {})[cid] || {})[n]; if (ix) return ix.map(i => F[i]).filter(Boolean); }
    return F.slice(0, 2);
  },
};
window.SR = SR;

/* daily mix builder */
function chPct(ch, prog) { const p = (prog.book || {})[ch.id] || {}; const sd = p.secDone || {}; const s = ch.secs.reduce((a, x) => a + (sd[x.n] === true ? 1 : (sd[x.n] || 0)), 0) + (p.stars || 0); return s / (ch.secs.length * 3 + 3); }
window.chPct8 = chPct;
SR.buildMix = function (n = 10) {
  build();
  const prog = LS.get('s8f-progress', {});
  const out = [], used = new Set();
  const add = k => { if (k && !used.has(k) && IDX[k] && out.length < n) { used.add(k); out.push(k); } };
  SR.mistakes().slice(0, 4).forEach(x => add(x.k));
  SR.due().slice(0, 4).forEach(x => add(x.k));
  // chapters the student has started, weakest first
  const started = BOOK.filter(c => !c.review && chPct(c, prog) > 0).sort((a, b) => chPct(a, prog) - chPct(b, prog));
  const pool = (started.length ? started : BOOK.filter(c => !c.review && c.n === 1 || c.n === '8.1'));
  const keys = Object.keys(IDX);
  let guard = 0;
  while (out.length < n && guard++ < 400) {
    const ch = pool[guard % pool.length]; if (!ch) break;
    const ks = keys.filter(k => k.startsWith(ch.id + '|') && !used.has(k));
    if (ks.length) add(ks[(Date.now() / 1000 + guard * 7) % ks.length | 0]);
  }
  while (out.length < n && guard++ < 800) add(keys[(Math.random() * keys.length) | 0]);
  return out;
};

/* ---------- time tracking ---------- */
function curSubj() {
  const r = localStorage.getItem('s8f-route') || '';
  const [k, a] = r.split(':');
  if (k === 'book') { const c = (window.BOOK || []).find(x => x.id === a); return c ? c.subj : 'other'; }
  if (k === 'subject') return a;
  if (k === 'speak') return 'french';
  return 'other';
}
setInterval(() => {
  if (document.hidden || !window.S8AUTH || !S8AUTH.current()) return;
  const t = LS.get('s8f-time', { total: 0, by: {}, days: {} });
  const s = curSubj(), d = todayS();
  t.total += 15; t.by[s] = (t.by[s] || 0) + 15; t.days[d] = (t.days[d] || 0) + 15;
  LS.set('s8f-time', t);
}, 15000);

/* ---------- accessibility ---------- */
const A11Y_DEF = { font: 'default', size: 1, read: false, motion: false, contrast: false };
const A11Y = {
  get() { return { ...A11Y_DEF, ...LS.get('s8f-a11y', {}) }; },
  set(p) { const v = { ...A11Y.get(), ...p }; LS.set('s8f-a11y', v); A11Y.apply(); A11Y.subs.forEach(f => f(v)); },
  subs: new Set(),
  apply() {
    const v = A11Y.get(), b = document.body; if (!b) return;
    if (v.font !== 'default' && !document.getElementById('a11y-font')) { const l = document.createElement('link'); l.id = 'a11y-font'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Lexend:wght@400;600;700&display=swap'; document.head.appendChild(l); }
    b.classList.toggle('a11y-lexend', v.font === 'lexend');
    b.classList.toggle('a11y-atkinson', v.font === 'atkinson');
    b.classList.toggle('a11y-motion', !!v.motion);
    b.classList.toggle('a11y-contrast', !!v.contrast);
    b.classList.toggle('a11y-read', !!v.read);
    document.documentElement.style.zoom = v.size;
  },
};
window.A11Y = A11Y;
document.addEventListener('DOMContentLoaded', () => A11Y.apply());
setTimeout(() => A11Y.apply(), 0);
// tap-to-read
document.addEventListener('click', e => {
  if (!A11Y.get().read || !window.speechSynthesis) return;
  if (e.target.closest('.a11y-panel,.a11y-fab,input,textarea,select')) return;
  const el = e.target.closest('.gq-text,.gq-opt,.gq-fb,p,li,h1,h2,h3,.wnote,.fr-sent,.en-passage,.en-quote,.lc-body,.notice-i,.g-learn-card,.fm-eq,.wprompt,.en-why,td,label,button,b,span');
  if (!el) return;
  const t = (el.innerText || '').trim(); if (!t || t.length > 600) return;
  speechSynthesis.cancel();
  const fr = /[àâçéèêëîïôûùüÿœ]/i.test(t) && /\b(je|tu|il|nous|vous|le|la|les|est|et|une|un|des)\b/i.test(t);
  const u = new SpeechSynthesisUtterance(t.replace(/[✓✗]/gu, '')); u.lang = fr ? 'fr-FR' : 'en-GB'; u.rate = 0.95; speechSynthesis.speak(u);
  document.querySelectorAll('.a11y-reading').forEach(x => x.classList.remove('a11y-reading'));
  el.classList.add('a11y-reading'); u.onend = () => el.classList.remove('a11y-reading');
}, true);

/* ---------- device-wide records (shared by everyone on this device) ---------- */
function db() { return LS.get('S8DB', { users: {} }); }
function userData(u) { // live data for current user, stored data for others
  if (u === (window.S8AUTH && S8AUTH.current())) { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('s8f-')) o[k] = localStorage.getItem(k); } return o; }
  return ((db().users || {})[u] || {}).data || {};
}
function parseD(data, k, d) { try { return JSON.parse(data[k]) || d; } catch (e) { return d; } }
window.S8DATA = { db, userData, parseD };

function weekId(d = new Date()) { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); return x.toISOString().slice(0, 10); }
const CLASS = {
  state() {
    const list = window.S8AUTH ? S8AUTH.list() : [];
    let r = LS.get('S8CLASS', null);
    const wk = weekId();
    if (!r || r.week !== wk) { r = { week: wk, base: {}, claimed: [], goal: Math.max(60, list.length * 40) }; list.forEach(u => r.base[u.username] = u.s.stars); LS.set('S8CLASS', r); }
    let changed = false;
    list.forEach(u => { if (r.base[u.username] == null) { r.base[u.username] = u.s.stars; changed = true; } });
    const goalNow = Math.max(60, list.length * 40); if (goalNow > r.goal) { r.goal = goalNow; changed = true; }
    if (changed) LS.set('S8CLASS', r);
    const contrib = list.map(u => ({ name: u.name, username: u.username, avatar: u.s.avatar, stars: Math.max(0, u.s.stars - (r.base[u.username] || 0)) })).sort((a, b) => b.stars - a.stars);
    const total = contrib.reduce((a, c) => a + c.stars, 0);
    const end = new Date(wk); end.setDate(end.getDate() + 7);
    return { ...r, contrib, total, done: total >= r.goal, daysLeft: Math.max(0, Math.ceil((end - Date.now()) / DAY)) };
  },
  claim() { const r = LS.get('S8CLASS', null), me = S8AUTH.current(); if (!r || r.claimed.includes(me)) return false; r.claimed.push(me); LS.set('S8CLASS', r); GAME.award(80, 100, 'Class challenge reward!'); GAME.modal({ kind: 'chest', reason: 'Your class beat the weekly challenge!' }); return true; },
};
window.CLASS8 = CLASS;

const HW = {
  get() { return LS.get('S8HW', { items: [], note: '' }); },
  set(v) { LS.set('S8HW', v); },
  doneFor(chId, prog) { const ch = BOOK.find(c => c.id === chId); if (!ch) return false; const sd = (((prog || {}).book || {})[chId] || {}).secDone || {}; return ch.secs.every(s => sd[s.n]); },
  topicsFor(chId, prog) { const ch = BOOK.find(c => c.id === chId); if (!ch) return [0, 0]; const sd = (((prog || {}).book || {})[chId] || {}).secDone || {}; return [ch.secs.filter(s => sd[s.n]).length, ch.secs.length]; },
};
window.HW8 = HW;

async function sha(s) { if (window.crypto && crypto.subtle) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('s8t|' + s)); return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''); } let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return 'x' + h; }
const TEACHER = {
  has() { return !!LS.get('S8TEACHER', null); },
  async setPin(p) { LS.set('S8TEACHER', { h: await sha(p) }); sessionStorage.setItem('s8t-ok', '1'); },
  async check(p) { const r = LS.get('S8TEACHER', null); const ok = r && r.h === await sha(p); if (ok) sessionStorage.setItem('s8t-ok', '1'); return ok; },
  unlocked() { return sessionStorage.getItem('s8t-ok') === '1'; },
  lock() { sessionStorage.removeItem('s8t-ok'); },
};
window.TEACHER8 = TEACHER;

/* ---------- collectable cards ---------- */
const CARDS = {
  maths: [['', 'Pythagoras', 'Greece, c. 570 BC', 'His theorem links the three sides of every right-angled triangle.'], ['0️⃣', 'Brahmagupta', 'India, 598–668', 'First to write rules for calculating with zero and negative numbers.'], ['', 'Al-Khwarizmi', 'Persia, c. 780–850', 'The word "algebra" comes from his book, and "algorithm" from his name.'], ['', 'Fibonacci', 'Italy, 1170–1250', 'Brought Hindu-Arabic numerals to Europe; famous for his sequence.'], ['', 'René Descartes', 'France, 1596–1650', 'Invented the x–y coordinate grid we use for graphs.'], ['', 'Blaise Pascal', 'France, 1623–1662', 'Helped invent probability theory and built a calculating machine at 19.'], ['', 'Isaac Newton', 'England, 1643–1727', 'Co-invented calculus and described the laws of motion.'], ['', 'Leonhard Euler', 'Switzerland, 1707–1783', 'Gave us the symbols π, e and f(x) for functions.'], ['', 'Carl Gauss', 'Germany, 1777–1855', 'As a boy he added 1 to 100 in seconds by pairing numbers.'], ['', 'Ada Lovelace', 'England, 1815–1852', 'Wrote the first published computer algorithm.'], ['', 'Florence Nightingale', 'England, 1820–1910', 'Used pie-style charts to prove that hygiene saved lives.'], ['∞', 'Georg Cantor', 'Germany, 1845–1918', 'Showed that some infinities are bigger than others.'], ['', 'Srinivasa Ramanujan', 'India, 1887–1920', 'Self-taught genius who discovered thousands of formulas.'], ['', 'Emmy Noether', 'Germany, 1882–1935', 'Einstein called her the most important woman in maths history.'], ['', 'Alan Turing', 'England, 1912–1954', 'Broke wartime codes and imagined the modern computer.'], ['', 'Katherine Johnson', 'USA, 1918–2020', 'Calculated the flight paths that took astronauts to the Moon.'], ['', 'Edward Lorenz', 'USA, 1917–2008', 'Discovered the "butterfly effect" in weather maths.'], ['', 'John Tukey', 'USA, 1915–2000', 'Invented the stem-and-leaf diagram and the box plot.'], ['', 'M. C. Escher', 'Netherlands, 1898–1972', 'Artist who drew amazing tessellations and impossible shapes.'], ['', 'Maryam Mirzakhani', 'Iran, 1977–2017', 'First woman to win the Fields Medal, maths\' top prize.'], ['', 'Hypatia', 'Egypt, c. 360–415', 'Taught maths and astronomy in ancient Alexandria.'], ['', 'Gerardus Mercator', 'Flanders, 1512–1594', 'Made the famous world map used for navigation by bearings.'], ['', 'Pierre de Fermat', 'France, 1601–1665', 'His "last theorem" took 358 years to prove.'], ['', 'Archimedes', 'Greece, c. 287–212 BC', 'Estimated π and discovered the law of levers.'], ['', 'Shakuntala Devi', 'India, 1929–2013', 'The "human computer" who multiplied 13-digit numbers in her head.']],
  science: [['', 'William Harvey', 'England, 1578–1657', 'Discovered that the heart pumps blood around the body.'], ['', 'Casimir Funk', 'Poland, 1884–1967', 'Discovered vitamins and gave them their name.'], ['', 'Rachel Carson', 'USA, 1907–1964', 'Showed how pesticides build up in food chains.'], ['', 'Ernest Rutherford', 'New Zealand, 1871–1937', 'Discovered the nucleus at the centre of the atom.'], ['', 'Mikhail Tsvet', 'Russia, 1872–1919', 'Invented chromatography to separate plant pigments.'], ['', 'Antoine Lavoisier', 'France, 1743–1794', 'Proved that mass is conserved in chemical reactions.'], ['', 'Anders Celsius', 'Sweden, 1701–1744', 'Created the Celsius temperature scale.'], ['', 'Marie Curie', 'Poland/France, 1867–1934', 'Only person to win Nobel Prizes in two sciences.'], ['', 'Galileo Galilei', 'Italy, 1564–1642', 'Measured motion carefully and showed that objects fall at the same rate.'], ['', 'Isaac Newton', 'England, 1643–1727', 'Explained forces with his three laws of motion.'], ['', 'Ibn al-Haytham', 'Iraq, 965–1040', 'Father of optics; explained how we see light.'], ['', 'Michael Faraday', 'England, 1791–1867', 'Discovered electromagnetic induction.'], ['', 'Eunice Foote', 'USA, 1819–1888', 'First to show that CO₂ traps heat from the Sun.'], ['', 'Edwin Hubble', 'USA, 1889–1953', 'Proved that there are galaxies beyond the Milky Way.'], ['', 'Caroline Herschel', 'Germany/England, 1750–1848', 'Discovered eight comets.'], ['', 'Blaise Pascal', 'France, 1623–1662', 'The unit of pressure, the pascal, is named after him.'], ['', 'Archimedes', 'Greece, c. 287–212 BC', 'Explained why objects float: "Eureka!"'], ['', 'Dmitri Mendeleev', 'Russia, 1834–1907', 'Arranged the elements into the periodic table.']],
  computing: [['', 'Tim Berners-Lee', 'England, b. 1955', 'Invented the World Wide Web in 1989.'], ['', 'Grace Hopper', 'USA, 1906–1992', 'Built the first compiler; popularised the word "bug".'], ['', 'Claude Shannon', 'USA, 1916–2001', 'Showed how logic gates can do maths using 0s and 1s.'], ['', 'Jerry Lawson', 'USA, 1940–2011', 'Invented the video game cartridge.'], ['', 'Edgar Codd', 'England, 1923–2003', 'Invented the relational database.'], ['', 'Guido van Rossum', 'Netherlands, b. 1956', 'Created the Python programming language.']],
  english: [['', 'William Shakespeare', 'England, 1564–1616', 'Invented over 1,700 words still used today.'], ['', 'Jane Austen', 'England, 1775–1817', 'Master of irony and character in Pride and Prejudice.'], ['', 'C. S. Lewis', 'Ireland, 1898–1963', 'Wrote The Chronicles of Narnia.'], ['', 'Chinua Achebe', 'Nigeria, 1930–2013', 'Wrote Things Fall Apart, read around the world.'], ['', 'George Orwell', 'England, 1903–1950', 'Journalist and author who wrote about writing clearly.'], ['', 'Malala Yousafzai', 'Pakistan, b. 1997', 'Her powerful speeches fight for girls\' education.'], ['', 'Roald Dahl', 'Wales, 1916–1990', 'Invented hundreds of new words, like "scrumdiddlyumptious".'], ['', 'Maya Angelou', 'USA, 1928–2014', 'Poet and speaker famous for "Still I Rise".']],
  french: [['', 'Paris', 'France', 'The Eiffel Tower was built in 1889 and was meant to be temporary!'], ['', 'Québec City', 'Canada', 'The only walled city north of Mexico.'], ['', 'Brussels', 'Belgium', 'Home of the comic strip museum and great chocolate.'], ['', 'Geneva', 'Switzerland', 'Has a 140-metre-high water fountain on its lake.'], ['', 'Dakar', 'Senegal', 'The most westerly city on mainland Africa.'], ['', 'Marrakech', 'Morocco', 'Famous for its huge market square, Jemaa el-Fnaa.'], ['', 'Papeete', 'Tahiti', 'Capital of French Polynesia in the Pacific Ocean.'], ['', 'Antananarivo', 'Madagascar', 'Built on 12 sacred hills.']],
};
const CARD = {
  forChapter(ch) { const list = BOOK.filter(c => c.subj === ch.subj); const i = list.indexOf(ch); const pool = CARDS[ch.subj] || CARDS.maths; const c = pool[i % pool.length]; return { ic: c[0], name: c[1], sub: c[2], fact: c[3], subj: ch.subj, rare: ch.review ? 'rare' : (i % 5 === 4 ? 'shiny' : 'common') }; },
  owned(prog) { return BOOK.filter(c => (((prog || {}).book || {})[c.id] || {}).chest).map(c => c.id); },
};
window.CARD8 = CARD;

/* ---------- extra quests & badges ---------- */
GAME.QUEST_POOL.push({ id: 'mix1', t: 'Finish your daily mix', ev: 'mix', goal: 1, coins: 50 }, { id: 'fix2', t: 'Clear 2 mistakes from your notebook', ev: 'fix', goal: 2, coins: 50 });
GAME.BADGES.push(
  ['mix7', '', 'Habit Hero', 'Finish 7 daily mixes', () => (LS.get('s8f-mix', {}).count || 0) >= 7],
  ['fix10', '', 'Fixer', 'Clear 10 mistakes', () => SR.fixedCount() >= 10],
  ['exam1', '', 'Exam Ready', 'Finish a mock exam', () => (LS.get('s8f-exams', []).length) >= 1],
  ['exam80', '', 'Top Marks', 'Score 80% or more in a mock exam', () => LS.get('s8f-exams', []).some(e => e.pct >= 80)],
  ['cards10', '', 'Collector', 'Collect 10 cards', () => CARD.owned(LS.get('s8f-progress', {})).length >= 10],
);
})();
