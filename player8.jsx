/* Game-style chapter player: Level map → (Learn → Play → Quiz) per topic → Practice → Boss → Treasure */

const STRAND_CLS = { Biology: 'bio-c', Chemistry: 'chem-c', Physics: 'phys-c', 'Earth and space': 'es-c' };
function bookCls(ch) { return 'subj-' + ch.subj + ' ' + (STRAND_CLS[ch.strand] || ''); }
const SUBJ_NAME = { maths: 'Maths', science: 'Science', computing: 'Computing', english: 'English', french: 'French' };
const CARD_EMO = ['', '', '', '', '', ''];
const BOSSES = ['ghost', 'alien', 'skull', 'robot', 'bug', 'fire', 'lightning', 'shooting-star'];
const BOSS_NAMES = ['The Phantom', 'Zorg the Alien', 'Skull King', 'Mega-Bot', 'The Glitch', 'Inferno', 'Thunderclap', 'Comet Crusher'];
const bossIdx = ch => (String(ch.id).charCodeAt(1) + String(ch.id).length) % BOSSES.length;
const secStars = v => v === true ? 1 : (v || 0);

function StarRow({ n, of = 3, size }) { return <span className="g-stars" style={size ? { fontSize: size } : null}>{Array.from({ length: of }, (_, i) => <span key={i} className={i < n ? 'on' : ''}>★</span>)}</span>; }
window.Stars = window.Stars || (({ n }) => <StarRow n={n} />);

window.MedalIc = window.MedalIc || (({ m }) => m ? <span className={'md-ic m' + m}><span></span></span> : null);
/* ---------- Game question ---------- */
function norm8(s) { return String(s).trim().toLowerCase().replace(/\s+/g, '').replace(/%$/, '').replace(/°$/, ''); }
function GQ({ q, onResult, allowHint = true }) {
  const g = useGame();
  const [sel, setSel] = React.useState(null), [val, setVal] = React.useState(''), [st, setSt] = React.useState(null);
  const [order, setOrder] = React.useState(() => q.items ? q.items.map((_, i) => i) : []);
  const [cut, setCut] = React.useState([]);
  const [hl, setHl] = React.useState(0);
  const submit = () => {
    let ok = false;
    if (q.type === 'mc') ok = sel === q.a;
    if (q.type === 'input') ok = q.accept.some(a => norm8(a) === norm8(val));
    if (q.type === 'order') ok = order.every((v, i) => v === q.order[i]);
    setSt(ok ? 'right' : 'wrong'); if (window.SR && !q.noSR) SR.record(q, ok, hl); onResult(ok, hl);
  };
  const hintTxt = n => {
    if (n === 1) {
      if (q.h1) return q.h1;
      if (q.type === 'mc') { const w = q.opts.map((_, i) => i).filter(i => i !== q.a && !cut.includes(i)); return w.length ? `Cross this one out: “${q.opts[w[w.length - 1]]}” is not the answer.` : 'Read each option carefully.'; }
      if (q.type === 'input') { const a = String(q.accept[0]); return `The answer is ${a.length} character${a.length > 1 ? 's' : ''} long${/^-?\d/.test(a) ? ' (it is a number)' : ` and starts with “${a[0]}”`}.`; }
      if (q.type === 'order') return `The first item is: “${q.items[q.order[0]]}”.`;
    }
    if (n === 2) {
      if (q.h2) return q.h2;
      const f = window.SR ? SR.formulasFor(q) : [];
      if (f.length) return <>Use this: <b>{f[0].n}</b>: <span className="fm-eq">{f[0].e}</span></>;
      const w = String(q.why || '').split(/(?<=[.!?])\s/)[0];
      return w ? 'Think about this: ' + w : 'Look back at the Learn cards for this topic.';
    }
    const ans = q.type === 'mc' ? q.opts[q.a] : q.type === 'input' ? q.accept[0] : q.order.map(i => q.items[i]).join(' → ');
    return <><b>Worked solution:</b> {q.why} <br /><b>Answer:</b> {ans}</>;
  };
  const hintLbl = [' Hint 1: a nudge', ' Hint 2: the method', ' Hint 3: full solution'];
  const can = q.type === 'mc' ? sel != null : q.type === 'input' ? val.trim() !== '' : true;
  const fifty = () => { if (!GAME.use('hint')) return; const wrong = q.opts.map((_, i) => i).filter(i => i !== q.a); setCut(wxShuffle(wrong, Date.now() % 97).slice(0, Math.min(2, wrong.length - 1))); };
  const mv = (i, d) => setOrder(o => { const n = o.slice(); [n[i], n[i + d]] = [n[i + d], n[i]]; return n; });
  return (
    <div className="gq">
      <div className="gq-text">{q.q}</div>
      {q.quote && <div className="quote">{q.quote}</div>}
      {q.type === 'mc' && <div className="gq-opts">{q.opts.map((o, i) => {
        if (cut.includes(i)) return <button key={i} className="gq-opt cut" disabled></button>;
        let c = 'gq-opt c' + i; if (st && i === q.a) c += ' right'; else if (st && i === sel) c += ' wrong'; else if (i === sel) c += ' sel';
        return <button key={i} className={c} disabled={!!st} onClick={() => setSel(i)}><span className="k">{'ABCD'[i]}</span><span>{o}</span></button>;
      })}</div>}
      {q.type === 'input' && <div className="inp-row"><input autoFocus className={'inp gq-inp' + (st ? ' ' + st : '')} value={val} disabled={!!st} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && can && !st && submit()} placeholder="Type your answer" />{q.suffix && <span className="inp-suffix">{q.suffix}</span>}</div>}
      {q.type === 'order' && <ol className={'order-list' + (st ? ' ' + st : '')}>{order.map((idx, i) => <li key={idx} className="order-item"><span className="pos">{i + 1}</span>{q.items[idx]}{!st && <span className="mv"><button onClick={() => mv(i, -1)} disabled={i === 0}>↑</button><button onClick={() => mv(i, 1)} disabled={i === order.length - 1}>↓</button></span>}</li>)}</ol>}
      {hl > 0 && <div className="gq-hints">{Array.from({ length: hl }, (_, i) => <div key={i} className={'gq-hint h' + (i + 1)}><span className="gq-hl">{hintLbl[i].split(':')[0]}</span><span>{hintTxt(i + 1)}</span></div>)}</div>}
      {st && <div className={'gq-fb ' + st}><b>{st === 'right' ? ['Awesome!', 'Nailed it!', 'Correct!', 'Brilliant!'][Math.floor(Math.random() * 4)] : 'Not quite…'}</b><span>{q.why}</span></div>}
      {!st && <div className="g-row">
        <button className="btn g-btn" disabled={!can} onClick={submit}>Check</button>
        {allowHint && hl < 3 && <button className="btn g-btn ghost" onClick={() => setHl(hl + 1)}>{hintLbl[hl]}{hl === 0 ? '' : hl === 1 ? ' (−½★)' : ' (−1★)'}</button>}
        {allowHint && q.type === 'mc' && q.opts.length > 2 && !cut.length && <button className="btn g-btn ghost" disabled={!g.power.hint} onClick={fifty}> 50:50 ({g.power.hint})</button>}
        <button className="btn g-btn ghost" onClick={() => window.openCompanion && window.openCompanion({ topic: typeof q.q === 'string' ? q.q.slice(0, 60) : 'this question', seed: typeof q.q === 'string' ? `Can you give me a hint (not the answer) for: "${q.q}"` : '' })}> Hint from buddy</button>
      </div>}
    </div>
  );
}

function ComboBar() { const g = useGame(); return g.combo >= 2 ? <div className={'g-combo' + (g.combo >= 5 ? ' hot' : '')}> {g.combo}× combo{g.combo >= 5 ? ' ' : ''}</div> : null; }

/* ---------- LEARN: explanation cards ---------- */
function Learn({ ch, sec, si, onDone }) {
  const ex = ch.practice[si % ch.practice.length];
  const exAns = ex.type === 'mc' ? ex.opts[ex.a] : ex.type === 'input' ? ex.accept[0] + (ex.suffix ? ' ' + ex.suffix : '') : ex.order.map(k => ex.items[k]).join(' → ');
  const cards = [
    { k: 'intro', emo: '', h: sec.t, body: <><p className="lc-big">In this topic you'll discover:</p><ul className="lc-list">{sec.notice.map((n, i) => <li key={i}>{CARD_EMO[i]} {n}</li>)}</ul></> },
    ...sec.notice.map((n, i) => ({ k: 'n' + i, emo: CARD_EMO[i], h: ['The big idea', 'Look closer', 'Remember this'][i] || 'Key point', body: <p className="lc-big">{n}</p>, txt: n })),
    { k: 'ex', emo: '', h: 'Worked example', body: <><p className="lc-q">{ex.q}</p>{ex.type === 'mc' && <div className="lc-opts">{ex.opts.map((o, i) => <span key={i} className={i === ex.a ? 'on' : ''}>{o}</span>)}</div>}<div className="lc-ans"><b>Answer: {exAns}</b><span>{ex.why}</span></div></> },
    ...((window.secFormulas ? secFormulas(ch, sec.n) : []).length ? [{ k: 'fm', emo: '', h: 'Formula' + (secFormulas(ch, sec.n).length > 1 ? 's' : '') + ' for this topic', body: <div className="lc-fm">{secFormulas(ch, sec.n).map((f, i) => <div key={i} className="lc-fmi"><b>{f.n}</b><span className="fm-eq">{f.e}</span><small> {f.ex}</small></div>)}</div> }] : []),
    { k: 'words', emo: '', h: 'Key words', body: <dl className="lc-words">{ch.recap.terms.map(([t, d]) => <React.Fragment key={t}><dt>{t}</dt><dd>{d}</dd></React.Fragment>)}</dl> },
  ];
  const [i, setI] = React.useState(0), [ai, setAi] = React.useState({}), [busy, setBusy] = React.useState(false), [speak, setSpeak] = React.useState(false);
  const c = cards[i]; const ref = React.useRef(null);
  const explain = async () => {
    setBusy(true);
    const topic = sec.t + ': ' + (ref.current ? ref.current.innerText.slice(0, 400) : '');
    try { const r = await window.genspark.complete(`Explain this to a 12-year-old in a fun, friendly way, in 3 short sentences, using an everyday analogy and one emoji. Do not use markdown. Topic: ${topic}`); setAi({ ...ai, [c.k]: r }); } catch (e) { setAi({ ...ai, [c.k]: 'The buddy is busy right now. Try again in a moment!' }); }
    setBusy(false);
  };
  const listen = () => { if (!window.speechSynthesis) return; if (speak) { speechSynthesis.cancel(); setSpeak(false); return; } const u = new SpeechSynthesisUtterance(ref.current.innerText + ' ' + (ai[c.k] || '')); u.rate = 0.95; u.onend = () => setSpeak(false); speechSynthesis.speak(u); setSpeak(true); };
  React.useEffect(() => () => window.speechSynthesis && speechSynthesis.cancel(), []);
  const next = () => { if (i < cards.length - 1) { setI(i + 1); setSpeak(false); window.speechSynthesis && speechSynthesis.cancel(); } else { GAME.event('learn'); GAME.award(10, 3, 'Learned it!'); onDone(); } };
  return (
    <div className="lc-wrap">
      <div className="lc-dots">{cards.map((_, k) => <i key={k} className={k < i ? 'done' : k === i ? 'cur' : ''} onClick={() => k <= i && setI(k)} />)}</div>
      <div key={c.k} className={'lc-card lc-' + (i % 4)}>
        <div className="lc-emo">{c.emo}</div>
        <div className="lc-h">{c.h}</div>
        <div ref={ref} className="lc-body">{c.body}</div>
        {ai[c.k] && <div className="lc-ai"><b> Buddy explains:</b> {ai[c.k]}</div>}
        <div className="g-row lc-tools">
          <button className="g-pill" onClick={listen}>{speak ? ' Stop' : ' Listen'}</button>
          {c.k !== 'words' && <button className="g-pill" onClick={explain} disabled={busy}>{busy ? ' Thinking…' : ' Explain it another way'}</button>}
        </div>
      </div>
      <div className="g-row" style={{ justifyContent: 'space-between' }}>
        <button className="btn g-btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}>← Back</button>
        <button className="btn g-btn" onClick={next}>{i < cards.length - 1 ? 'Next card →' : "Got it! Let's play "}</button>
      </div>
    </div>
  );
}

/* ---------- PLAY: models / diagrams ---------- */
function SecPlay({ ch, sec, onDone, startFig = 0 }) {
  const figs = [{ w: sec.w, cfg: sec.cfg, t: sec.ft || sec.t }, ...(sec.extra || []).map(([w, cfg, t]) => ({ w, cfg, t }))];
  const [fi, setFi] = React.useState(Math.min(startFig, (sec.extra || []).length));
  const [touched, setTouched] = React.useState({});
  const cnt = React.useRef({}), seenFig = React.useRef({});
  const tasks = [...sec.tasks, ...figs.slice(1).map((f, i) => ['Explore: ' + f.t, () => touched[i + 1]])];
  const Wd = W[figs[fi].w];
  const seen = React.useRef({});
  const [s, setS] = React.useState({});
  const doneRef = React.useRef(tasks.map(() => false));
  const H = (k, v) => { if (k.startsWith('__count_')) { const set = seen.current[k.slice(8)]; return !!set && set.size >= v; } const set = seen.current[k]; return !!set && set.has(v); };
  const onState = React.useCallback(st => { Object.entries(st).forEach(([k, v]) => { if (typeof v === 'object') return; (seen.current[k] = seen.current[k] || new Set()).add(v); }); setS(st); }, []);
  const onExtra = React.useCallback(() => { const k = fi; cnt.current[k] = (cnt.current[k] || 0) + 1; if (cnt.current[k] >= 2) setTouched(t => t[k] ? t : { ...t, [k]: true }); }, [fi]);
  const prevDone = doneRef.current.filter(Boolean).length;
  tasks.forEach(([, test], i) => { if (doneRef.current[i]) return; try { if (test(s, H)) doneRef.current[i] = true; } catch (e) {} });
  const done = doneRef.current, nDone = done.filter(Boolean).length, all = done.every(Boolean), cur = done.findIndex(d => !d);
  React.useEffect(() => { if (nDone > prevDone || nDone > (seenFig.current.n || 0)) { const add = nDone - (seenFig.current.n || 0); if (add > 0) { seenFig.current.n = nDone; GAME.event('figure', add); GAME.award(5 * add, add, ' Mission done'); } } }, [nDone]);
  return (
    <div className="gp-stage">
      <div className="gp-fig">
        {figs.length > 1 && <div className="fig-tabs">{figs.map((f, i) => <button key={i} className={'fig-tab' + (i === fi ? ' on' : '') + ((i === 0 ? done.slice(0, sec.tasks.length).every(Boolean) : touched[i]) ? ' done' : '')} onClick={() => setFi(i)}><span className="mono">{['', '', '', '', '', ''][i % 6]} Model {i + 1}</span>{f.t}</button>)}</div>}
        <div className="fig-head"><span className="t">{figs[fi].t}</span><span className="g-tag">{figs[fi].w === 'labeldiag' ? 'Diagram' : 'Model'}</span></div>
        {Wd ? <Wd key={fi} cfg={figs[fi].cfg} onState={fi === 0 ? onState : onExtra} /> : null}
      </div>
      <div className="gp-side">
        <div className="g-card">
          <div className="g-card-h"><h3> Missions</h3><span className="g-sub">{nDone}/{tasks.length}</span></div>
          <p className="g-sub" style={{ marginBottom: 10 }}>{sec.intro}</p>
          <ul className="g-missions">{tasks.map(([t], i) => <li key={i} className={(done[i] ? 'done' : '') + (i === cur ? ' cur' : '')} onClick={() => setFi(i >= sec.tasks.length ? i - sec.tasks.length + 1 : 0)}><span className="b">{done[i] ? '✓' : i + 1}</span><span>{t}</span>{done[i] && <span className="r">+5 XP</span>}</li>)}</ul>
          <div className="g-qbar big"><i style={{ width: (nDone / tasks.length * 100) + '%' }} /></div>
          {window.secFormulas && secFormulas(ch, sec.n).length > 0 && <div className="fm-side"><div className="mono"> Formula{secFormulas(ch, sec.n).length > 1 ? 's' : ''} to use</div>{secFormulas(ch, sec.n).map((x, i) => <div key={i} className="fm-side-i"><b>{x.n}</b><span className="fm-eq">{x.e}</span></div>)}</div>}
          <div className="g-row" style={{ marginTop: 12 }}>
            <button className="btn g-btn" disabled={!all} onClick={onDone}>{all ? 'Quiz time! ' : `${nDone} of ${tasks.length} missions`}</button>
            {!all && <button className="btn g-btn ghost small" onClick={onDone}>Skip</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- QUIZ (per topic) ---------- */
function Quiz({ sec, onDone, fs = [] }) {
  const [showF, setShowF] = React.useState(false);
  const [i, setI] = React.useState(0), [att, setAtt] = React.useState(0), [last, setLast] = React.useState(null), [miss, setMiss] = React.useState(0);
  const [end, setEnd] = React.useState(null);
  const qs = sec.check;
  const res = (ok, hl = 0) => { setLast(ok); GAME.answer(ok); if (!ok) setMiss(m => m + 1); else if (hl >= 3) setMiss(m => m + 1); else if (hl === 2) setMiss(m => m + 0.5); };
  const next = () => {
    if (!last) { setAtt(a => a + 1); setLast(null); return; }
    if (i + 1 >= qs.length) { const stars = miss === 0 ? 3 : miss <= 1 ? 2 : 1; setEnd(stars); GAME.award(stars * 10, stars * 5, `${stars}★ topic clear`); GAME.event('stars', stars); GAME.event('section'); if (stars === 3) GAME.confetti(); return; }
    setI(i + 1); setLast(null); setAtt(0);
  };
  if (end) return <div className="g-result"><div className="g-bigicon g-bounce">{end === 3 ? '' : end === 2 ? '' : ''}</div><h2>Topic cleared!</h2><StarRow n={end} size={54} /><p className="g-sub">{end === 3 ? 'Perfect: every answer right first time!' : end === 2 ? 'Great job, just one slip.' : 'You did it! Replay to win more stars.'}</p><button className="btn g-btn big" onClick={() => onDone(end)}>Continue →</button></div>;
  return (
    <div className="g-quizbox">
      <div className="g-quiz-top"><div className="g-qdots">{qs.map((_, k) => <i key={k} className={k < i ? 'on' : k === i ? 'cur' : ''} />)}</div><ComboBar />{fs.length > 0 && <button className="g-pill" onClick={() => setShowF(!showF)}> {showF ? 'Hide' : 'Show'} formula{fs.length > 1 ? 's' : ''}</button>}</div>
      {showF && <div className="fm-side" style={{ margin: 0 }}>{fs.map((x, k) => <div key={k} className="fm-side-i"><b>{x.n}</b><span className="fm-eq">{x.e}</span><small> {x.ex}</small></div>)}</div>}
      <GQ key={i + '-' + att} q={qs[i]} onResult={res} />
      {last != null && <button className="btn g-btn big" onClick={next}>{!last ? 'Try again ↺' : i + 1 >= qs.length ? 'Finish ' : 'Next →'}</button>}
    </div>
  );
}

/* ---------- PRACTICE (chapter) ---------- */
function Practice({ ch, onDone }) {
  const qs = ch.practice; const [i, setI] = React.useState(0), [last, setLast] = React.useState(null), [score, setScore] = React.useState(0), [end, setEnd] = React.useState(null), [k, setK] = React.useState(0);
  const res = (ok, hl = 0) => { setLast(ok); GAME.answer(ok); if (ok) setScore(s => s + (hl >= 3 ? 0 : hl === 2 ? 0.5 : 1)); };
  const next = () => { if (i + 1 >= qs.length) { const f = score / qs.length; const st = f === 1 ? 3 : f >= 0.66 ? 2 : f >= 0.4 ? 1 : 0; setEnd(st); if (st) { GAME.award(st * 15, st * 8, 'Practice stars'); GAME.event('stars', st); } return; } setI(i + 1); setLast(null); };
  if (end != null) return <div className="g-result"><div className="g-bigicon g-bounce">{end ? '' : ''}</div><h2>{Math.round(score * 10) / 10} / {qs.length}</h2><StarRow n={end} size={54} /><p className="g-sub">{end === 3 ? 'Perfect practice!' : end ? 'Nice! Ready to face the boss?' : 'Keep practising, then try again.'}</p><div className="g-row" style={{ justifyContent: 'center' }}><button className="btn g-btn ghost" onClick={() => { setI(0); setLast(null); setScore(0); setEnd(null); setK(k + 1); }}>Replay ↺</button>{end > 0 && <button className="btn g-btn big" onClick={() => onDone(end)}>Fight the boss </button>}</div></div>;
  const cf = (window.FORMULAS || {})[ch.id] || [];
  return <div className="g-quizbox"><div className="g-quiz-top"><span className="g-tag">Practice arena</span><div className="g-qdots">{qs.map((_, x) => <i key={x} className={x < i ? 'on' : x === i ? 'cur' : ''} />)}</div><ComboBar /></div>{cf.length > 0 && <details className="fm-det"><summary> Chapter formulas ({cf.length})</summary><div className="fm-side" style={{ margin: '8px 0 0' }}>{cf.map((x, k) => <div key={k} className="fm-side-i"><b>{x.n}</b><span className="fm-eq">{x.e}</span></div>)}</div></details>}<GQ key={k + '-' + i} q={qs[i]} onResult={res} />{last != null && <button className="btn g-btn big" onClick={next}>{i + 1 >= qs.length ? 'Finish ' : 'Next →'}</button>}</div>;
}

/* ---------- BOSS ---------- */
function Boss({ ch, onDone }) {
  const g = useGame();
  const qs = React.useMemo(() => [...ch.challenge, ...ch.practice.slice(-2)].slice(0, 5), [ch.id]);
  const boss = BOSSES[(String(ch.id).charCodeAt(1) + String(ch.id).length) % BOSSES.length];
  const [phase, setPhase] = React.useState('intro'), [hearts, setHearts] = React.useState(3), [hp, setHp] = React.useState(qs.length), [i, setI] = React.useState(0), [last, setLast] = React.useState(null), [hit, setHit] = React.useState(null), [k, setK] = React.useState(0);
  const start = (extra) => { if (extra && GAME.use('heart')) setHearts(4); else setHearts(3); setHp(qs.length); setI(0); setLast(null); setK(k + 1); setPhase('fight'); };
  const res = ok => { setLast(ok); GAME.answer(ok); setHit(ok ? 'boss' : 'you'); setTimeout(() => setHit(null), 600); if (ok) setHp(h => h - 1); else setHearts(h => h - 1); };
  const next = () => {
    if (hearts <= 0) { setPhase('lose'); return; }
    if (hp <= 0 || i + 1 >= qs.length) { const medal = hp > 0 ? 0 : hearts >= 3 ? 3 : hearts === 2 ? 2 : 1; if (!medal) { setPhase('lose'); return; } setPhase({ win: medal }); GAME.event('boss'); if (medal === 3) GAME.event('gold'); GAME.award(40 + medal * 20, 20 + medal * 15, ['', 'Bronze', 'Silver', 'Gold'][medal] + ' medal!'); GAME.confetti(); return; }
    setI(i + 1); setLast(null);
  };
  if (phase === 'intro') return <div className="g-boss-intro"><div className="g-boss-face g-float">{boss}</div><h2>Boss battle!</h2><p className="g-sub">The {ch.title} boss has {qs.length} HP. Each right answer is a hit. You have 3 . Lose them all and the boss wins!</p><div className="g-medal-key"><span> 3  left</span><span> 2 </span><span> 1 </span></div><div className="g-row" style={{ justifyContent: 'center' }}><button className="btn g-btn big" onClick={() => start(false)}> Fight!</button>{g.power.heart > 0 && <button className="btn g-btn ghost" onClick={() => start(true)}>Use  extra heart ({g.power.heart})</button>}</div></div>;
  if (phase === 'lose') return <div className="g-result"><div className="g-bigicon">{boss}</div><h2>The boss won this time!</h2><p className="g-sub">Review the Learn cards, then come back stronger.</p><button className="btn g-btn big" onClick={() => setPhase('intro')}>Rematch ↺</button></div>;
  if (phase.win) return <div className="g-result"><div className={'g-medal-big m' + phase.win + ' g-bounce'}><MedalIc m={phase.win} /></div><h2>{['', 'Bronze', 'Silver', 'Gold'][phase.win]} medal!</h2><p className="g-sub">You defeated the boss with {hearts}  left.</p><div className="g-row" style={{ justifyContent: 'center' }}>{phase.win < 3 && <button className="btn g-btn ghost" onClick={() => setPhase('intro')}>Try for gold ↺</button>}<button className="btn g-btn big" onClick={() => onDone(phase.win)}>Open treasure </button></div></div>;
  return (
    <div className="g-quizbox boss">
      <div className="g-arena">
        <div className={'g-you' + (hit === 'you' ? ' hurt' : '')}><Avatar g={g} size={64} /><div className="g-hearts">{Array.from({ length: Math.max(hearts, 0) }, (_, x) => <span key={x}></span>)}{Array.from({ length: Math.max(0, 3 - hearts) }, (_, x) => <span key={'e' + x} className="e"></span>)}</div></div>
        <div className="g-vs">VS</div>
        <div className={'g-bossbox' + (hit === 'boss' ? ' hurt' : '')}><span className="g-boss-face sm">{boss}</span><div className="g-hp"><i style={{ width: (hp / qs.length * 100) + '%' }} /></div><small>{hp}/{qs.length} HP</small></div>
      </div>
      <ComboBar />
      <GQ key={k + '-' + i} q={qs[i]} onResult={res} allowHint={false} />
      {last != null && <button className="btn g-btn big" onClick={next}>{hearts <= 0 ? 'Oh no…' : hp <= 0 ? 'Finish him! ' : 'Next attack →'}</button>}
    </div>
  );
}

/* ---------- TREASURE (recap) ---------- */
function Treasure({ ch, prog, setProg, onHome, onNext }) {
  const [opened, setOpened] = React.useState(!!prog.chest);
  const open = () => { setProg({ chest: true }); setOpened(true); GAME.modal({ kind: 'chest', reason: 'Chapter complete!' }); };
  return (
    <div className="g-treasure">
      <div className="g-card g-tre-h">
        <div className="g-bigicon">{opened ? '' : ''}</div>
        <div><h2>{ch.title}</h2><div className="g-row"><StarRow n={prog.stars || 0} />{prog.medal ? <span className="g-med-s"><MedalIc m={prog.medal} /></span> : null}</div></div>
        {!opened ? <button className="btn g-btn big" onClick={open}>Open chest!</button> : <span className="g-tag">Chest opened ✓</span>}
      </div>
      {opened && window.CardReveal && <CardReveal ch={ch} />}
      <h3 className="g-h3"> Power-up cards: remember these</h3>
      <div className="g-power-cards">{ch.recap.points.map((p, i) => <div key={i} className={'g-pcard lc-' + (i % 4)}><span className="n">{i + 1}</span>{p}</div>)}</div>
      {window.FormulaSheet && <FormulaSheet ch={ch} />}
      <h3 className="g-h3"> Word bank</h3>
      <div className="g-words">{ch.recap.terms.map(([t, d]) => <div key={t} className="g-word"><b>{t}</b><span>{d}</span></div>)}</div>
      <div className="g-row" style={{ justifyContent: 'center', margin: '28px 0 60px' }}>
        <button className="btn g-btn ghost" onClick={() => window.print()}> Print</button>
        <button className="btn g-btn ghost" onClick={onHome}> Back to map</button>
        {onNext && <button className="btn g-btn big" onClick={onNext}>Next chapter →</button>}
      </div>
    </div>
  );
}

/* ---------- CHAPTER: level select + routing ---------- */
function BookChapter({ ch, prog, setProg, onHome, onNext }) {
  const key = 's8f-pos2-' + ch.id;
  const [view, setView] = React.useState(() => { try { return JSON.parse(localStorage.getItem(key)) || { v: 'map' }; } catch (e) { return { v: 'map' }; } });
  React.useEffect(() => { localStorage.setItem(key, JSON.stringify(view)); window.scrollTo(0, 0); }, [view.v, view.si, view.sub]);
  const secDone = prog.secDone || {};
  const total = ch.secs.reduce((a, s) => a + secStars(secDone[s.n]), 0) + (prog.stars || 0);
  const max = ch.secs.length * 3 + 3;
  const allSecs = ch.secs.every(s => secDone[s.n]);
  const go = v => setView(v);
  const secFinish = (si, stars) => { const n = ch.secs[si].n; setProg({ secDone: { ...secDone, [n]: Math.max(secStars(secDone[n]), stars) } }); go(si + 1 < ch.secs.length ? { v: 'sec', si: si + 1, sub: 'learn' } : { v: 'map' }); };
  const header = (
    <div className="g-chbar">
      <div className="wrap g-chbar-in">
        <button className="g-back" onClick={() => view.v === 'map' ? onHome() : go({ v: 'map' })}>←</button>
        <div className="g-ch-t"><small>{SUBJ_NAME[ch.subj]} · {ch.review ? 'Review' : ch.subj === 'computing' ? 'Unit ' + ch.n : 'Chapter ' + ch.n}{ch.review ? '' : ' · ' + ch.strand}</small><b>{view.v === 'sec' ? ch.secs[view.si].n + ' ' + ch.secs[view.si].t : ch.title}</b></div>
        <div className="g-ch-stars"> {total}/{max}{prog.medal ? <> <MedalIc m={prog.medal} /></> : ''}</div>
      </div>
      <div className="g-chprog"><i style={{ width: (total / max * 100) + '%' }} /></div>
    </div>
  );
  let body;
  if (view.v === 'map') {
    const bossIc = ic(BOSSES[bossIdx(ch)]);
    const secsDone = ch.secs.filter(s => secDone[s.n]).length, bossOpen = allSecs, treOpen = !!prog.medal;
    const FIG_IC = ['', '', '', '', '', ''];
    body = (
      <div className="wrap g-levelmap">
        <div className="g-lm-intro"><h1 className="g-h1">{ch.title}</h1>{window.ChapterVideoCard && <ChapterVideoCard ch={ch} />}<p className="g-sub">{ch.secs.length ? `${ch.secs.length} topics · ${ch.secs.reduce((a, s) => a + 1 + (s.extra || []).length, 0)} models & diagrams · 1 boss` : 'Mixed review: practise, then beat the boss!'}</p></div>
        <div className="g-topics">
          {ch.secs.map((s, i) => { const st = secStars(secDone[s.n]); const figs = [s.ft || s.t, ...(s.extra || []).map(e => e[2])]; return (
            <div key={s.n} className={'g-topic' + (st ? ' done' : '')}>
              <div className="g-topic-h">
                <span className="g-topic-n">{s.n}</span>
                <div className="g-topic-t"><b>{s.t}</b><StarRow n={st} /></div>
              </div>
              <div className="g-topic-acts">
                <button className="g-act learn" onClick={() => go({ v: 'sec', si: i, sub: 'video' })}><span>{ic('book-open')}</span><b>Learn</b><i className="g-sm">{`1-min video + ${s.notice.length + 3} cards`}</i></button>
                <button className="g-act play" onClick={() => go({ v: 'sec', si: i, sub: 'play', fi: 0 })}><span></span><b>Models</b><i className="g-sm">{`${figs.length} to explore`}</i></button>
                <button className="g-act quiz" onClick={() => go({ v: 'sec', si: i, sub: 'quiz' })}><span></span><b>Quiz</b><i className="g-sm">win up to 3 </i></button>
              </div>
              {window.secFormulas && secFormulas(ch, s.n).length > 0 && <FormulaStrip fs={secFormulas(ch, s.n)} onOpen={() => go({ v: 'sec', si: i, sub: 'formulas' })} />}
              <div className="g-figlist">{figs.map((f, k) => <button key={k} className="g-figchip" onClick={() => go({ v: 'sec', si: i, sub: 'play', fi: k })}><span>{FIG_IC[k % 6]}</span>{f}</button>)}</div>
            </div>); })}
          {window.FormulaSheet && <FormulaSheet ch={ch} />}
          <div className="g-finale">
            <button className={'g-fin practice' + (prog.stars ? ' done' : '')} onClick={() => go({ v: 'practice' })}><span></span><b>Practice</b><StarRow n={prog.stars || 0} /></button>
            <button className={'g-fin boss' + (prog.medal ? ' done' : '') + (bossOpen ? '' : ' locked')} onClick={() => bossOpen ? go({ v: 'boss' }) : GAME.toast(`Finish all ${ch.secs.length} topics first (${secsDone}/${ch.secs.length} done)`)}><span>{!bossOpen ? ic('lock') : prog.medal ? <MedalIc m={prog.medal} /> : bossIc}</span><b>Boss battle</b><i className="g-sm">{!bossOpen ? `Unlocks after all topics · ${secsDone}/${ch.secs.length}` : prog.medal ? 'Medal won!' : 'Win a medal'}</i></button>
            <button className={'g-fin treasure' + (prog.chest ? ' done' : '') + (treOpen ? '' : ' locked')} onClick={() => treOpen ? go({ v: 'treasure' }) : GAME.toast('Beat the boss to unlock the treasure chest')}><span>{ic(!treOpen ? 'lock' : prog.chest ? 'key' : 'gift')}</span><b>Treasure</b><i className="g-sm">{treOpen ? 'Summary + chest' : 'Unlocks after the boss'}</i></button>
          </div>
        </div>
      </div>
    );
  } else if (view.v === 'sec') {
    const sec = ch.secs[view.si];
    const hasF = window.secFormulas && secFormulas(ch, sec.n).length > 0;
    const steps = [['video', ic('play-circle') + ' Video'], ['learn', ic('book-open') + ' Learn'], ...(hasF ? [['formulas', ic('calculator') + ' Formulas']] : []), ['play', ic('game-controller') + ' Play'], ['quiz', ic('lightning') + ' Quiz']];
    body = (
      <div className="wrap">
        <div className="g-steps">{steps.map(([k, l], i) => <button key={k} className={'g-step' + (view.sub === k ? ' on' : '') + (steps.findIndex(s => s[0] === view.sub) > i ? ' done' : '')} onClick={() => go({ ...view, sub: k })}>{l}</button>)}</div>
        {view.sub === 'video' && <TopicVideo key={sec.n} ch={ch} sec={sec} onNext={() => go({ ...view, sub: 'learn' })} />}
        {view.sub === 'learn' && <Learn key={sec.n} ch={ch} sec={sec} si={view.si} onDone={() => go({ ...view, sub: hasF ? 'formulas' : 'play' })} />}
        {view.sub === 'formulas' && <TopicFormulas ch={ch} sec={sec} onNext={() => go({ ...view, sub: 'play', fi: 0 })} />}
        {view.sub === 'play' && <SecPlay key={sec.n + '-' + (view.fi || 0)} ch={ch} sec={sec} startFig={view.fi || 0} onDone={() => go({ ...view, sub: 'quiz' })} />}
        {view.sub === 'quiz' && <Quiz key={sec.n} sec={sec} fs={hasF ? secFormulas(ch, sec.n) : []} onDone={st => secFinish(view.si, st)} />}
      </div>
    );
  } else if (view.v === 'practice') body = <div className="wrap"><Practice ch={ch} onDone={st => { setProg({ stars: Math.max(prog.stars || 0, st) }); go({ v: 'boss' }); }} /></div>;
  else if ((view.v === 'boss' && !allSecs) || (view.v === 'treasure' && !prog.medal)) body = <div className="wrap"><div className="g-result"><div className="g-bigicon">{ic('lock')}</div><h2>{view.v === 'boss' ? 'Boss locked' : 'Treasure locked'}</h2><p className="g-sub">{view.v === 'boss' ? `Finish all ${ch.secs.length} topics in this chapter to face the boss.` : 'Beat the chapter boss to open the treasure chest.'}</p><button className="btn g-btn big" onClick={() => go({ v: 'map' })}>Back to the chapter map</button></div></div>;
  else if (view.v === 'boss') body = <div className="wrap"><BossBattle ch={ch} onDone={m => { setProg({ medal: Math.max(prog.medal || 0, m), gold: !!(prog.gold || m === 3) }); go({ v: 'treasure' }); }} /></div>;
  else body = <div className="wrap"><TreasureRoom ch={ch} prog={prog} setProg={setProg} onHome={onHome} onNext={onNext} /></div>;
  return <div className={'g-chapter ' + bookCls(ch)} data-screen-label={'Book ' + ch.id + ' ' + view.v}>{header}{body}</div>;
}

/* ---------- World map of chapters ---------- */
function BookList({ chapters, prog, go }) {
  return (
    <div className="g-world">
      {chapters.map((c, i) => {
        const p = (prog.book || {})[c.id] || {}; const sd = p.secDone || {};
        const st = c.secs.reduce((a, s) => a + secStars(sd[s.n]), 0) + (p.stars || 0), mx = c.secs.length * 3 + 3;
        return (
          <button key={c.id} className={'g-wcard ' + bookCls(c) + ' wc' + (i % 6)} onClick={() => go('book:' + c.id)}>
            <span className="g-wnum">{c.n}</span>
            {p.medal ? <span className="g-wmedal"><MedalIc m={p.medal} /></span> : null}
            <b className="g-wt">{c.title}</b>
            <span className="g-ws">{c.review ? 'Boss review' : `${c.secs.length} topics · ${c.secs.reduce((a, s) => a + 1 + (s.extra || []).length, 0)} models`}{(window.FORMULAS || {})[c.id] ? ` ·  ${FORMULAS[c.id].length} formulas` : ''}</span>
            <span className="g-wbar"><i style={{ width: (st / mx * 100) + '%' }} /></span>
            {window.ChapterVideoBtn && <ChapterVideoBtn ch={c} />}
            <span className="g-wst"> {st}/{mx}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { BookChapter, BookList, bookCls, StarRow });
