/* Game layer: XP, levels, coins, streaks, combos, quests, badges, shop, chests, spin */
(() => {
const KEY = 's8f-game';
const today = () => new Date().toISOString().slice(0, 10);
const yest = () => new Date(Date.now() - 864e5).toISOString().slice(0, 10);

const QUEST_POOL = [
  { id: 'correct10', t: 'Answer 10 questions correctly', ev: 'correct', goal: 10, coins: 40 },
  { id: 'sections2', t: 'Complete 2 topics', ev: 'section', goal: 2, coins: 50 },
  { id: 'figs5', t: 'Explore 5 models or diagrams', ev: 'figure', goal: 5, coins: 40 },
  { id: 'combo5', t: 'Get a 5× combo', ev: 'combo', goal: 5, coins: 50, max: true },
  { id: 'stars3', t: 'Earn 3 stars', ev: 'stars', goal: 3, coins: 50 },
  { id: 'boss1', t: 'Defeat a boss', ev: 'boss', goal: 1, coins: 60 },
  { id: 'learn2', t: 'Finish 2 Learn decks', ev: 'learn', goal: 2, coins: 30 },
  { id: 'ask1', t: 'Ask the study buddy a question', ev: 'companion', goal: 1, coins: 25 },
  { id: 'speak3', t: 'Practise 3 phrases out loud', ev: 'speak', goal: 3, coins: 40 },
];

const BADGES = [
  ['first', '', 'First Hit', 'Answer your first question correctly', s => s.stats.correct >= 1],
  ['c5', '', 'On Fire', 'Get a 5× combo', s => s.stats.bestCombo >= 5],
  ['c10', '', 'Unstoppable', 'Get a 10× combo', s => s.stats.bestCombo >= 10],
  ['q50', '', 'Brain Power', 'Answer 50 questions correctly', s => s.stats.correct >= 50],
  ['q200', '', 'Rocket Brain', 'Answer 200 questions correctly', s => s.stats.correct >= 200],
  ['st3', '', 'Hat-trick', 'Keep a 3-day streak', s => s.streak.best >= 3],
  ['st7', '', 'Week Warrior', 'Keep a 7-day streak', s => s.streak.best >= 7],
  ['fig20', '', 'Explorer', 'Explore 20 models and diagrams', s => s.stats.figures >= 20],
  ['fig100', '', 'Mad Scientist', 'Explore 100 models and diagrams', s => s.stats.figures >= 100],
  ['sec10', '', 'Adventurer', 'Complete 10 topics', s => s.stats.sections >= 10],
  ['sec50', '', 'Summit', 'Complete 50 topics', s => s.stats.sections >= 50],
  ['boss1', '', 'Boss Slayer', 'Defeat your first boss', s => s.stats.bosses >= 1],
  ['gold1', '', 'Golden', 'Win a gold medal', s => s.stats.golds >= 1],
  ['gold10', '', 'Royalty', 'Win 10 gold medals', s => s.stats.golds >= 10],
  ['star30', '', 'Star Collector', 'Earn 30 stars', s => s.stats.stars >= 30],
  ['chest5', '', 'Treasure Hunter', 'Open 5 mystery chests', s => s.stats.chests >= 5],
  ['shop', '', 'Shopper', 'Buy something in the shop', s => s.owned.length > 3],
  ['ask', '', 'Curious', 'Ask the study buddy', s => s.stats.asked >= 1],
  ['speak', '', 'Speaker', 'Practise 10 phrases out loud', s => s.stats.spoken >= 10],
  ['lvl10', '', 'Level 10', 'Reach level 10', s => levelOf(s.xp).lvl >= 10],
];

const SHOP = {
  avatar: [['fox', '', 0], ['owl', '', 0], ['panda', '', 60], ['tiger', '', 80], ['octopus', '', 100], ['penguin', '', 100], ['robot', '', 150], ['alien', '', 150], ['unicorn', '', 200], ['dragon', '', 250], ['astronaut', '', 300], ['wizard', '', 350]],
  theme: [['sunny', 'Sunny', 0, ['#ffb347', '#ff6f91', '#fff7e6']], ['ocean', 'Ocean', 150, ['#4facfe', '#00c9a7', '#eefaff']], ['jungle', 'Jungle', 150, ['#43c463', '#c3e44a', '#f2fbe9']], ['candy', 'Candy', 200, ['#ff7eb3', '#a78bfa', '#fff0f7']], ['galaxy', 'Galaxy', 300, ['#7f5af0', '#2cb1ff', '#f1eeff']]],
  frame: [['none', 'No frame', 0], ['gold', 'Gold ring', 100], ['fire', 'Fire ring', 180], ['rainbow', 'Rainbow ring', 250]],
  power: [['hint', '', '50:50 cutter', 'Removes two wrong answers', 30], ['shield', '', 'Combo shield', 'Keeps your combo if you get one wrong', 40], ['freeze', '', 'Streak freeze', 'Saves your streak if you miss a day', 60], ['heart', '', 'Extra heart', 'Start a boss battle with 4 hearts', 50]],
};

const TITLES = [[1, 'Rookie'], [3, 'Explorer'], [5, 'Thinker'], [8, 'Scholar'], [12, 'Genius'], [16, 'Mastermind'], [20, 'Legend']];
function levelOf(xp) { let lvl = 1, need = 100, base = 0; while (xp >= base + need) { base += need; lvl++; need = 100 + (lvl - 1) * 40; } const title = TITLES.filter(t => lvl >= t[0]).pop()[1]; return { lvl, into: xp - base, need, title }; }

const DEF = { xp: 0, coins: 50, combo: 0, streak: { count: 0, best: 0, last: null }, daily: { date: null, quests: [], spun: false }, badges: {}, owned: ['fox', 'owl', 'sunny', 'none'], avatar: 'fox', theme: 'sunny', frame: 'none', name: '', power: { hint: 2, shield: 1, freeze: 0, heart: 0 }, stats: { correct: 0, answers: 0, bestCombo: 0, figures: 0, sections: 0, bosses: 0, golds: 0, stars: 0, chests: 0, asked: 0, spoken: 0, learn: 0 } };

let S;
try { S = { ...DEF, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; S.stats = { ...DEF.stats, ...S.stats }; S.power = { ...DEF.power, ...S.power }; } catch (e) { S = { ...DEF }; }
const subs = new Set(), bus = new Set();
function save() { localStorage.setItem(KEY, JSON.stringify(S)); subs.forEach(f => f(S)); }
function emit(m) { bus.forEach(f => f(m)); }

function rollDaily() {
  if (S.daily.date === today()) return;
  const pool = wxShuffle(QUEST_POOL, Date.now() % 997).slice(0, 3);
  S.daily = { date: today(), quests: pool.map(q => ({ id: q.id, prog: 0, claimed: false })), spun: false };
}
rollDaily();

function touchStreak() {
  const t = today(); if (S.streak.last === t) return;
  if (S.streak.last === yest()) S.streak.count++;
  else if (S.streak.last && S.power.freeze > 0 && S.streak.count > 0) { S.power.freeze--; S.streak.count++; emit({ t: 'toast', txt: ' Streak freeze used. Your streak is safe!' }); }
  else S.streak.count = 1;
  S.streak.last = t; S.streak.best = Math.max(S.streak.best, S.streak.count);
  if (S.streak.count > 1) emit({ t: 'toast', txt: ` ${S.streak.count}-day streak!`, big: true });
}

function checkBadges() {
  BADGES.forEach(([id, ic, nm, ds, fn]) => { if (!S.badges[id] && fn(S)) { S.badges[id] = today(); S.coins += 25; emit({ t: 'modal', kind: 'badge', badge: [id, ic, nm, ds] }); emit({ t: 'confetti' }); } });
}

const G = {
  get: () => S,
  sub: f => { subs.add(f); return () => subs.delete(f); },
  on: f => { bus.add(f); return () => bus.delete(f); },
  levelOf, SHOP, BADGES, QUEST_POOL, TITLES,
  award(xp, coins = 0, label) {
    const before = levelOf(S.xp).lvl;
    S.xp += xp; S.coins += coins;
    if (xp || coins) emit({ t: 'pop', xp, coins, label });
    const after = levelOf(S.xp).lvl;
    if (after > before) { S.coins += 50; emit({ t: 'modal', kind: 'level', lvl: after, title: levelOf(S.xp).title }); emit({ t: 'confetti' }); }
    checkBadges(); save();
  },
  event(ev, n = 1) {
    touchStreak(); rollDaily();
    const st = S.stats;
    if (ev === 'figure') st.figures += n; if (ev === 'section') st.sections += n; if (ev === 'stars') st.stars += n;
    if (ev === 'boss') st.bosses += n; if (ev === 'gold') st.golds += n; if (ev === 'companion') st.asked += n; if (ev === 'speak') st.spoken += n; if (ev === 'learn') st.learn += n; if (ev === 'chest') st.chests += n;
    S.daily.quests.forEach(q => { const def = QUEST_POOL.find(d => d.id === q.id); if (!def || def.ev !== ev || q.prog >= def.goal) return; q.prog = def.max ? Math.max(q.prog, n) : Math.min(def.goal, q.prog + n); if (q.prog >= def.goal) emit({ t: 'toast', txt: ` Quest complete: ${def.t}. Claim your reward!`, big: true }); });
    checkBadges(); save();
  },
  answer(ok) {
    touchStreak(); S.stats.answers++;
    if (ok) {
      S.combo++; S.stats.correct++; S.stats.bestCombo = Math.max(S.stats.bestCombo, S.combo);
      const bonus = Math.min(S.combo - 1, 5) * 2;
      G.event('correct'); if (S.combo >= 2) G.event('combo', S.combo);
      G.award(10 + bonus, 2, S.combo >= 3 ? `${S.combo}× combo!` : null);
    } else {
      if (S.combo >= 2 && S.power.shield > 0) { S.power.shield--; emit({ t: 'toast', txt: ` Shield saved your ${S.combo}× combo!` }); }
      else S.combo = 0;
      save();
    }
    return S.combo;
  },
  claim(qid) { const q = S.daily.quests.find(x => x.id === qid), def = QUEST_POOL.find(d => d.id === qid); if (!q || q.claimed || q.prog < def.goal) return; q.claimed = true; G.award(30, def.coins, 'Quest reward'); emit({ t: 'confetti' }); if (S.daily.quests.every(x => x.claimed)) { emit({ t: 'modal', kind: 'chest', reason: 'All daily quests done!' }); } },
  buy(cat, id, price) { if (S.owned.includes(id) && cat !== 'power') return false; if (S.coins < price) return false; S.coins -= price; if (cat === 'power') S.power[id] = (S.power[id] || 0) + 1; else S.owned.push(id); checkBadges(); save(); emit({ t: 'toast', txt: ' Bought!' }); return true; },
  equip(cat, id) { if (!S.owned.includes(id)) return; S[cat] = id; save(); applyTheme(); },
  use(p) { if ((S.power[p] || 0) <= 0) return false; S.power[p]--; save(); return true; },
  chest() {
    const r = Math.random(); let prize;
    const locked = SHOP.avatar.filter(a => !S.owned.includes(a[0]));
    if (r < 0.15 && locked.length) { const a = locked[Math.floor(Math.random() * locked.length)]; S.owned.push(a[0]); prize = { ic: a[1], txt: 'New avatar unlocked!' }; }
    else if (r < 0.3) { S.power.hint += 2; prize = { ic: '', txt: '2× 50:50 cutters' }; }
    else if (r < 0.42) { S.power.shield += 1; prize = { ic: '', txt: 'Combo shield' }; }
    else if (r < 0.5) { S.power.heart += 1; prize = { ic: '', txt: 'Extra heart' }; }
    else { const c = [30, 40, 50, 75, 100][Math.floor(Math.random() * 5)]; S.coins += c; prize = { ic: '', txt: `${c} coins` }; }
    G.event('chest'); save(); return prize;
  },
  spin(seg) { S.daily.spun = true; const p = SPIN[seg]; if (p[2] === 'coins') S.coins += p[1]; if (p[2] === 'xp') G.award(p[1], 0, 'Spin prize'); if (p[2] === 'hint') S.power.hint += p[1]; if (p[2] === 'shield') S.power.shield += p[1]; save(); },
  modal: m => emit({ t: 'modal', ...m }),
  confetti: () => emit({ t: 'confetti' }),
  toast: (txt, big) => emit({ t: 'toast', txt, big }),
  setName: n => { S.name = n; save(); },
};
const SPIN = [['10 ', 10, 'coins'], ['25 XP', 25, 'xp'], ['30 ', 30, 'coins'], [' ×2', 2, 'hint'], ['50 ', 50, 'coins'], ['50 XP', 50, 'xp'], ['', 1, 'shield'], ['100 ', 100, 'coins']];
G.SPIN = SPIN;
window.GAME = G;

function applyTheme() { const t = SHOP.theme.find(x => x[0] === S.theme) || SHOP.theme[0]; const r = document.documentElement.style; r.setProperty('--t1', t[3][0]); r.setProperty('--t2', t[3][1]); r.setProperty('--t3', t[3][2]); }
applyTheme();
})();

function useGame() { const [s, setS] = React.useState(() => ({ ...GAME.get() })); React.useEffect(() => GAME.sub(x => setS({ ...x })), []); return s; }

function Avatar({ g, size = 44 }) {
  const a = GAME.SHOP.avatar.find(x => x[0] === g.avatar) || GAME.SHOP.avatar[0];
  return <span className={'g-av av-' + a[0] + ' fr-' + g.frame} style={{ width: size, height: size, fontSize: size * 0.58 }}>{a[1]}</span>;
}

/* ---------- Confetti ---------- */
function Confetti() {
  const ref = React.useRef(null);
  React.useEffect(() => GAME.on(m => {
    if (m.t !== 'confetti') return;
    const c = ref.current, ctx = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
    const cols = ['#ff6f91', '#ffc75f', '#4facfe', '#43c463', '#a78bfa', '#ff9671'];
    const ps = Array.from({ length: 140 }, () => ({ x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 14 - 4, r: Math.random() * 6.28, s: 6 + Math.random() * 6, c: cols[Math.floor(Math.random() * cols.length)] }));
    let f = 0; const tick = () => { ctx.clearRect(0, 0, c.width, c.height); ps.forEach(p => { p.vy += 0.4; p.x += p.vx; p.y += p.vy; p.r += 0.2; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); }); if (++f < 120) requestAnimationFrame(tick); else ctx.clearRect(0, 0, c.width, c.height); }; tick();
  }), []);
  return <canvas ref={ref} className="g-confetti" />;
}

/* ---------- Pops & toasts ---------- */
function Toasts() {
  const [items, setItems] = React.useState([]);
  React.useEffect(() => GAME.on(m => {
    if (m.t !== 'pop' && m.t !== 'toast') return;
    const id = Math.random(); setItems(x => [...x.slice(-3), { ...m, id }]);
    setTimeout(() => setItems(x => x.filter(i => i.id !== id)), m.big ? 3200 : 1800);
  }), []);
  return <div className="g-toasts">{items.map(i => i.t === 'pop'
    ? <div key={i.id} className="g-pop">{i.label && <b>{i.label}</b>}{i.xp ? <span className="xp">+{i.xp} XP</span> : null}{i.coins ? <span className="co">+{i.coins} </span> : null}</div>
    : <div key={i.id} className={'g-toast' + (i.big ? ' big' : '')}>{i.txt}</div>)}</div>;
}

/* ---------- Modals ---------- */
function ChestOpen({ onClose, reason }) {
  const [st, setSt] = React.useState('closed'), [prize, setPrize] = React.useState(null);
  const open = () => { setSt('shake'); setTimeout(() => { setPrize(GAME.chest()); setSt('open'); GAME.confetti(); }, 900); };
  return <div className="g-modal-c">
    <div className="g-kicker">{reason || 'Mystery chest'}</div>
    <div className={'g-chest ' + st} onClick={st === 'closed' ? open : undefined}>{st === 'open' ? <span className="g-prize">{prize.ic}</span> : ''}</div>
    {st === 'open' ? <><h3>{prize.txt}</h3><button className="btn g-btn" onClick={onClose}>Awesome!</button></> : <><h3>Tap the chest to open it!</h3><p className="g-sub">What's inside?</p></>}
  </div>;
}

function SpinWheel({ onClose }) {
  const g = useGame();
  const [ang, setAng] = React.useState(0), [res, setRes] = React.useState(null), [busy, setBusy] = React.useState(false);
  const N = GAME.SPIN.length;
  const spin = () => { if (g.daily.spun || busy) return; setBusy(true); const seg = Math.floor(Math.random() * N); const target = 360 * 5 + (360 - seg * 360 / N - 180 / N); setAng(target); setTimeout(() => { GAME.spin(seg); setRes(GAME.SPIN[seg][0]); GAME.confetti(); setBusy(false); }, 3200); };
  const cols = ['#ff6f91', '#ffc75f', '#4facfe', '#43c463', '#a78bfa', '#ff9671', '#2ec4b6', '#f15bb5'];
  return <div className="g-modal-c">
    <div className="g-kicker">Daily spin</div>
    <div className="g-wheel-w">
      <div className="g-pointer">▼</div>
      <svg viewBox="0 0 220 220" className="g-wheel" style={{ transform: `rotate(${ang}deg)` }}>
        {GAME.SPIN.map((s, i) => { const a0 = i * 360 / N, a1 = (i + 1) * 360 / N; const m = (a0 + a1) / 2 * Math.PI / 180; return <g key={i}><path d={wxWedge(110, 110, 105, 90 - a1, 90 - a0)} fill={cols[i]} stroke="#fff" strokeWidth="3" /><text x={110 + 68 * Math.sin(m)} y={110 - 68 * Math.cos(m) + 5} textAnchor="middle" transform={`rotate(${(a0 + a1) / 2} ${110 + 68 * Math.sin(m)} ${110 - 68 * Math.cos(m)})`} style={{ fontSize: 13, fontWeight: 800, fill: '#fff', fontFamily: 'Fredoka' }}>{s[0]}</text></g>; })}
        <circle cx="110" cy="110" r="18" fill="#fff" />
      </svg>
    </div>
    {res ? <><h3>You won {res}!</h3><button className="btn g-btn" onClick={onClose}>Collect</button></>
      : g.daily.spun ? <><h3>Come back tomorrow for another spin!</h3><button className="btn g-btn" onClick={onClose}>OK</button></>
        : <button className="btn g-btn" onClick={spin} disabled={busy}>{busy ? 'Spinning…' : 'SPIN!'}</button>}
  </div>;
}

function GameLayer() {
  const [m, setM] = React.useState(null);
  React.useEffect(() => GAME.on(x => { if (x.t === 'modal') setM(x); }), []);
  const close = () => setM(null);
  return <>
    <Confetti /><Toasts />
    {m && <div className="g-modal" onClick={e => e.target === e.currentTarget && m.kind !== 'chest' && close()}>
      <div className="g-modal-box">
        {m.kind === 'level' && <div className="g-modal-c"><div className="g-kicker">Level up!</div><div className="g-bigicon g-bounce"></div><h3>Level {m.lvl}: {m.title}</h3><p className="g-sub">+50  bonus coins</p><button className="btn g-btn" onClick={close}>Let's go!</button></div>}
        {m.kind === 'badge' && <div className="g-modal-c"><div className="g-kicker">New badge!</div><div className="g-bigicon g-bounce">{m.badge[1]}</div><h3>{m.badge[2]}</h3><p className="g-sub">{m.badge[3]} · +25 </p><button className="btn g-btn" onClick={close}>Nice!</button></div>}
        {m.kind === 'chest' && <ChestOpen onClose={close} reason={m.reason} />}
        {m.kind === 'spin' && <SpinWheel onClose={close} />}
      </div>
    </div>}
  </>;
}

/* ---------- HUD ---------- */
function HUD({ go, openCmp }) {
  const g = useGame(); const L = GAME.levelOf(g.xp);
  return (
    <div className="g-hud">
      <button className="g-hud-me" onClick={() => go('profile')} title="My profile">
        <Avatar g={g} size={40} />
        <span className="g-lvl"><b>{window.S8AUTH && S8AUTH.user() ? S8AUTH.user().name.split(' ')[0].slice(0, 10) + ' · ' : ''}Lv {L.lvl}</b><span className="g-xpbar"><i style={{ width: (L.into / L.need * 100) + '%' }} /></span><small>{L.title}</small></span>
      </button>
      <span className="g-chip" title="Day streak"> {g.streak.count}</span>
      <span className="g-chip" title="Coins"> {g.coins}</span>
      <span className="g-chip hide-s" title="Combo"> {g.combo}×</span>
      <button className="g-ibtn" onClick={() => go('shop')} title="Shop"></button>
      <button className="g-ibtn" onClick={() => go('trophies')} title="Trophies"></button>
      <button className="g-ibtn hide-s" onClick={() => window.S8AUTH && S8AUTH.logout()} title="Sign out / switch player"></button>
      <button className="g-ibtn ask" onClick={() => openCmp({})} title="Study buddy"><span className="hide-s"> Ask</span></button>
    </div>
  );
}

/* ---------- Daily quests card ---------- */
function QuestCard() {
  const g = useGame();
  return (
    <div className="g-card g-quests">
      <div className="g-card-h"><h3>Daily quests</h3><span className="g-sub">New quests every day</span></div>
      {g.daily.quests.map(q => { const d = GAME.QUEST_POOL.find(x => x.id === q.id); if (!d) return null; const done = q.prog >= d.goal; return (
        <div key={q.id} className={'g-quest' + (q.claimed ? ' claimed' : done ? ' done' : '')}>
          <div className="g-q-main"><span>{d.t}</span><span className="g-qbar"><i style={{ width: Math.min(100, q.prog / d.goal * 100) + '%' }} /></span><small>{Math.min(q.prog, d.goal)}/{d.goal}</small></div>
          {q.claimed ? <span className="g-claimed">✓</span> : <button className="g-claim" disabled={!done} onClick={() => GAME.claim(q.id)}>{done ? 'Claim' : ''} {d.coins}</button>}
        </div>); })}
      <div className="g-row">
        <button className="btn g-btn alt" onClick={() => GAME.modal({ kind: 'spin' })} disabled={g.daily.spun}>{g.daily.spun ? 'Spun today ✓' : ' Daily spin'}</button>
      </div>
    </div>
  );
}

/* ---------- Trophy room ---------- */
function TrophyRoom({ go }) {
  const g = useGame(); const L = GAME.levelOf(g.xp);
  const [nm, setNm] = React.useState(g.name);
  const prog = (() => { try { return JSON.parse(localStorage.getItem('s8f-progress') || '{}'); } catch (e) { return {}; } })();
  const book = prog.book || {};
  const medals = Object.entries(book).filter(([, p]) => p.medal).map(([id, p]) => [BOOK.find(c => c.id === id), p.medal]).filter(x => x[0]);
  const stars = Object.values(book).reduce((a, p) => a + (p.stars || 0), 0);
  return (
    <div className="wrap g-page" data-screen-label="Trophy room">
      <div className="g-profile g-card">
        <Avatar g={g} size={96} />
        <div>
          <input className="g-name" value={nm} placeholder="Your nickname" onChange={e => setNm(e.target.value)} onBlur={() => { GAME.setName(nm); window.S8AUTH && S8AUTH.updateProfile({ name: nm }); }} maxLength={18} />
          <div className="g-sub">Level {L.lvl} · {L.title} · {g.xp} XP</div>
          <div className="g-xpbar big"><i style={{ width: (L.into / L.need * 100) + '%' }} /></div>
          <div className="g-sub">{L.need - L.into} XP to level {L.lvl + 1}</div>
        </div>
      </div>
      <div className="g-stats">
        {[['', g.streak.count, 'day streak'], ['', g.streak.best, 'best streak'], ['', g.stats.bestCombo, 'best combo'], ['', g.stats.correct, 'correct answers'], ['', stars, 'stars'], ['', medals.filter(m => m[1] === 3).length, 'gold medals'], ['', g.stats.figures, 'models explored'], ['', g.stats.sections, 'topics done']].map(([i, v, l]) => <div key={l} className="g-stat"><span>{i}</span><b>{v}</b><small>{l}</small></div>)}
      </div>
      <h2 className="g-h2">Badges <span className="g-sub">{Object.keys(g.badges).length}/{GAME.BADGES.length}</span></h2>
      <div className="g-badges">{GAME.BADGES.map(([id, ic, n, d]) => <div key={id} className={'g-badge' + (g.badges[id] ? ' got' : '')}><span>{g.badges[id] ? ic : ''}</span><b>{n}</b><small>{d}</small></div>)}</div>
      <h2 className="g-h2">Medal cabinet</h2>
      {medals.length ? <div className="g-medals">{medals.map(([c, m]) => <button key={c.id} className="g-medal-i" onClick={() => go('book:' + c.id)}><span className={'g-med m' + m}><MedalIc m={m} /></span><small>{c.title}</small></button>)}</div> : <p className="g-sub">Beat a chapter boss to win your first medal!</p>}
    </div>
  );
}

/* ---------- Shop ---------- */
function Shop() {
  const g = useGame(); const [tab, setTab] = React.useState('avatar');
  const Btn = ({ cat, id, price }) => {
    const own = g.owned.includes(id), eq = g[cat] === id;
    if (own) return <button className={'g-claim' + (eq ? ' eq' : '')} onClick={() => GAME.equip(cat, id)}>{eq ? 'Equipped' : 'Use'}</button>;
    return <button className="g-claim" disabled={g.coins < price} onClick={() => GAME.buy(cat, id, price)}>{price} </button>;
  };
  return (
    <div className="wrap g-page" data-screen-label="Shop">
      <div className="g-shop-h"><h1 className="g-h1">Prize shop</h1><span className="g-chip big"> {g.coins}</span></div>
      <p className="g-sub">Earn coins by answering questions, finishing topics, beating bosses and completing quests.</p>
      <div className="g-tabs">{[['avatar', 'Avatars'], ['theme', 'Colour themes'], ['frame', 'Frames'], ['power', 'Power-ups']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
      <div className="g-shop">
        {tab === 'avatar' && GAME.SHOP.avatar.map(([id, e, p]) => <div key={id} className="g-item"><span className="g-item-ic">{e}</span><b>{id}</b><Btn cat="avatar" id={id} price={p} /></div>)}
        {tab === 'theme' && GAME.SHOP.theme.map(([id, n, p, c]) => <div key={id} className="g-item"><span className="g-item-ic sw" style={{ background: `linear-gradient(135deg, ${c[0]}, ${c[1]})` }} /><b>{n}</b><Btn cat="theme" id={id} price={p} /></div>)}
        {tab === 'frame' && GAME.SHOP.frame.map(([id, n, p]) => <div key={id} className="g-item"><span className={'g-av fr-' + id} style={{ width: 64, height: 64, fontSize: 36 }}>{(GAME.SHOP.avatar.find(a => a[0] === g.avatar) || [0, ''])[1]}</span><b>{n}</b><Btn cat="frame" id={id} price={p} /></div>)}
        {tab === 'power' && GAME.SHOP.power.map(([id, e, n, d, p]) => <div key={id} className="g-item"><span className="g-item-ic">{e}</span><b>{n}</b><small>{d}</small><span className="g-sub">You have {g.power[id] || 0}</span><button className="g-claim" disabled={g.coins < p} onClick={() => GAME.buy('power', id, p)}>{p} </button></div>)}
      </div>
    </div>
  );
}

Object.assign(window, { useGame, Avatar, GameLayer, HUD, QuestCard, TrophyRoom, Shop });
