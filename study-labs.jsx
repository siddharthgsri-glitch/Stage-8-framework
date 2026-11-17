/* Subject labs: Maths step checker, Science practicals, English writing feedback,
   French AI conversation, Python runner */

async function llm(prompt) {
  const f = (window.genspark && window.genspark.complete) || (window.claude && window.claude.complete);
  if (!f) throw new Error('AI is not available');
  return await f(prompt);
}
function parseJSON(t) { const m = String(t).match(/\{[\s\S]*\}/); if (!m) throw new Error('bad'); return JSON.parse(m[0]); }
function LabShell({ ic, title, sub, grad, go, children }) {
  return <div className="wrap g-page" data-screen-label={title}><button className="btn g-btn ghost small" style={{ margin: '12px 0' }} onClick={() => go('study')}>← Study zone</button><PageHead ic={ic} title={title} sub={sub} grad={grad} />{children}</div>;
}

/* ================= MATHS: step-by-step working ================= */
function linForm(side) {
  let s = side.replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  if (!/^[0-9x+\-*/().]*$/.test(s) || !s) return null;
  s = s.replace(/(\d|\))(?=x|\()/g, '$1*').replace(/x(?=\d|\(|x)/g, 'x*').replace(/\)(?=\d)/g, ')*');
  try { const f = new Function('x', 'return (' + s + ');'); const a = f(0), b = f(1), c = f(2), d = f(7); if (![a, b, c, d].every(Number.isFinite)) return null; const m = b - a; if (Math.abs((c - a) - 2 * m) > 1e-6 || Math.abs((d - a) - 7 * m) > 1e-6) return 'nonlin'; return [m, a]; } catch (e) { return null; }
}
function solveLine(line) {
  const parts = line.split('='); if (parts.length !== 2) return { err: 'Each line needs exactly one = sign.' };
  const L = linForm(parts[0]), R = linForm(parts[1]);
  if (L === 'nonlin' || R === 'nonlin') return { err: 'This checker works with linear equations (no x², no x on the bottom of a fraction).' };
  if (!L || !R) return { err: "I can't read that line. Use numbers, x, + − × ÷ and brackets, e.g. 3(x + 2) = 18." };
  const m = L[0] - R[0], c = R[1] - L[1];
  if (Math.abs(m) < 1e-9) return { err: Math.abs(c) < 1e-9 ? 'Both sides are always equal: every x works.' : 'The x terms cancelled out and the sides are not equal: there is no solution.' };
  return { x: c / m, final: /^\s*x\s*=\s*-?[\d.]+(\/\d+)?\s*$/.test(line) || /^\s*-?[\d.]+(\/\d+)?\s*=\s*x\s*$/.test(line) };
}
const fmtN = v => Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : (Math.round(v * 1000) / 1000).toString();
const STEP_EQ = [['3(x + 2) = 18', 'Expand the brackets first, or divide both sides by 3.'], ['5x - 4 = 2x + 11', 'Get the x terms on one side: subtract 2x from both sides.'], ['(x + 3)/4 = 5', 'Multiply both sides by 4 to clear the fraction.'], ['2(3x - 1) = 4(x + 2)', 'Expand both brackets, then collect the x terms.'], ['7 - 2x = 3x - 8', 'Add 2x to both sides so the x term is positive.'], ['x/3 + 4 = 10', 'Subtract 4 first, then multiply by 3.']];
function MathsSteps({ go }) {
  const [qi, setQi] = React.useState(0), [own, setOwn] = React.useState(''), [start, setStart] = React.useState(STEP_EQ[0][0]);
  const [lines, setLines] = React.useState(['']), [chk, setChk] = React.useState(null);
  const base = solveLine(start);
  const reset = s => { setStart(s); setLines(['']); setChk(null); };
  const check = () => {
    const res = lines.filter(l => l.trim()).map(l => { const r = solveLine(l); if (r.err) return { ...r, ok: false }; const ok = Math.abs(r.x - base.x) < 1e-6; return { ...r, ok }; });
    setChk(res);
    const firstBad = res.findIndex(r => !r.ok);
    if (firstBad < 0 && res.length && res[res.length - 1].final) { GAME.answer(true); GAME.award(20, 10, 'Equation solved step by step!'); GAME.confetti(); }
    else if (firstBad >= 0) GAME.answer(false);
  };
  const solved = chk && chk.length && chk.every(r => r.ok) && chk[chk.length - 1].final;
  return (
    <LabShell go={go} ic="" title="Step-by-step working" sub="Type each line of your working. I check every step, so you can see exactly where a mistake happens, not just whether the final answer is right." grad="linear-gradient(135deg,#4facfe,#00c9a7)">
      <div className="g-card st-form">
        <label>Choose an equation<div className="chips">{STEP_EQ.map(([e], i) => <button key={i} className={'chip' + (start === e ? ' on' : '')} onClick={() => { setQi(i); reset(e); }}>{e}</button>)}</div></label>
        <label>…or type your own<div className="g-row"><input className="inp" value={own} placeholder="e.g. 4(x - 1) = 2x + 6" onChange={e => setOwn(e.target.value)} /><button className="btn g-btn small" disabled={!own.trim()} onClick={() => reset(own)}>Use it</button></div></label>
      </div>
      {base.err ? <div className="g-card st-err">{base.err}</div> :
        <div className="g-card ms-work">
          <div className="ms-line start"><span className="ms-n">Start</span><b>{start}</b></div>
          {lines.map((l, i) => { const r = chk && chk[i]; return <div key={i} className={'ms-line' + (r ? (r.ok ? ' ok' : ' bad') : '')}><span className="ms-n">Line {i + 1}</span><input className="inp" value={l} placeholder={i === 0 ? 'Your first step…' : 'Next step…'} onChange={e => { const n = [...lines]; n[i] = e.target.value; setLines(n); setChk(null); }} onKeyDown={e => { if (e.key === 'Enter') { if (i === lines.length - 1 && l.trim()) setLines([...lines, '']); else check(); } }} />{r && <span className="ms-fb">{r.err ? ' ' + r.err : r.ok ? (r.final ? ' Solved!' : '✓ Still balanced') : `✗ This line gives x = ${fmtN(r.x)}, not the same as before. Did you do the same thing to both sides?`}</span>}</div>; })}
          <div className="g-row"><button className="btn g-btn ghost small" onClick={() => setLines([...lines, ''])}>+ Add a line</button>{lines.length > 1 && <button className="btn g-btn ghost small" onClick={() => { setLines(lines.slice(0, -1)); setChk(null); }}>− Remove line</button>}<button className="btn g-btn" onClick={check} disabled={!lines.some(l => l.trim())}>Check my working</button></div>
          {chk && !solved && chk.every(r => r.ok) && <div className="gq-hint h1"><span className="gq-hl">Keep going</span><span>Every step so far is correct. Finish with a line like <b>x = …</b></span></div>}
          {solved && <div className="gq-fb right"><b>Brilliant!</b><span>Every step kept the equation balanced. x = {fmtN(base.x)}.</span></div>}
          <details className="fm-det"><summary> Need a hint?</summary><p className="g-sub">{STEP_EQ.find(e => e[0] === start) ? STEP_EQ.find(e => e[0] === start)[1] : 'Undo + and − first, then × and ÷. Whatever you do to one side, do to the other.'}</p></details>
        </div>}
    </LabShell>
  );
}

/* ================= SCIENCE: virtual practicals ================= */
const PRACS = [
  { id: 'dissolve', ic: '', t: 'Does temperature affect how fast sugar dissolves?', iv: 'Temperature of water', ivU: '°C', ivVals: [20, 30, 40, 50, 60, 70, 80], dv: 'Time to dissolve', dvU: 's', fn: x => 140 * Math.exp(-0.022 * (x - 20)) + 12,
    vars: { iv: 'Temperature of water', dv: 'Time to dissolve', cv: ['Mass of sugar', 'Volume of water', 'Stirring speed'] }, distract: ['Colour of the beaker', 'Time of day'],
    concl: ['As the temperature increases, the time to dissolve decreases.', 'As the temperature increases, the time to dissolve increases.', 'Temperature has no effect on dissolving.'], ci: 0, why: 'Hotter water particles move faster and collide with the sugar more often, so it dissolves faster.' },
  { id: 'ramp', ic: '', t: 'Does the height of a ramp affect the speed of a toy car?', iv: 'Height of ramp', ivU: 'cm', ivVals: [10, 20, 30, 40, 50, 60], dv: 'Speed at bottom', dvU: 'm/s', fn: x => Math.sqrt(2 * 9.8 * x / 100) * 0.85,
    vars: { iv: 'Height of ramp', dv: 'Speed at bottom', cv: ['Same car', 'Same ramp surface', 'Same starting point'] }, distract: ['Colour of the car', 'Name of the tester'],
    concl: ['As the height increases, the speed increases.', 'As the height increases, the speed decreases.', 'Height has no effect on speed.'], ci: 0, why: 'A higher ramp gives the car more gravitational potential energy, which changes into more kinetic energy.' },
  { id: 'marble', ic: '', t: 'Does surface area affect how fast marble chips react with acid?', iv: 'Size of marble chips', ivU: 'mm', ivVals: [2, 4, 6, 8, 10], dv: 'Time to collect 20 cm³ of gas', dvU: 's', fn: x => 18 * x + 8,
    vars: { iv: 'Size of marble chips', dv: 'Time to collect 20 cm³ of gas', cv: ['Mass of marble', 'Volume of acid', 'Concentration of acid'] }, distract: ['Shape of the flask label', 'Room colour'],
    concl: ['Smaller chips (bigger surface area) react faster.', 'Bigger chips react faster.', 'Chip size has no effect.'], ci: 0, why: 'Smaller chips have a larger surface area, so more acid particles can collide with them at once.' },
];
function Practicals({ go }) {
  const [pi, setPi] = React.useState(null);
  if (pi == null) return <LabShell go={go} ic="" title="Virtual practicals" sub="Plan a fair test, collect results, draw a graph and write a conclusion: the Thinking and Working Scientifically skills that Cambridge tests." grad="linear-gradient(135deg,#43c463,#00c9a7)"><div className="st-tools g-power-cards">{PRACS.map((p, i) => <button key={p.id} className={'g-pcard lc-' + i} onClick={() => setPi(i)}><div style={{ fontSize: 40 }}>{p.ic}</div><b>{p.t}</b><div>{p.iv} → {p.dv}</div></button>)}</div></LabShell>;
  return <Practical p={PRACS[pi]} back={() => setPi(null)} go={go} />;
}
function Practical({ p, back, go }) {
  const [step, setStep] = React.useState(0);
  const [vsel, setVsel] = React.useState({}), [vchk, setVchk] = React.useState(null);
  const [pred, setPred] = React.useState(null);
  const [rows, setRows] = React.useState({}); // x -> [r1,r2,r3]
  const anom = React.useMemo(() => p.ivVals[2 + Math.floor(Math.random() * (p.ivVals.length - 3))], [p.id]);
  const [anPick, setAnPick] = React.useState(null), [concl, setConcl] = React.useState(null);
  const steps = ['Plan', 'Predict', 'Experiment', 'Graph', 'Conclude'];
  const opts = React.useMemo(() => wxShuffle([p.vars.iv, p.vars.dv, ...p.vars.cv, ...p.distract], 3), [p.id]);
  const roles = [['iv', 'Independent (I change)'], ['dv', 'Dependent (I measure)'], ['cv', 'Control (keep the same)'], ['no', 'Not needed']];
  const right = o => o === p.vars.iv ? 'iv' : o === p.vars.dv ? 'dv' : p.vars.cv.includes(o) ? 'cv' : 'no';
  const checkVars = () => { const ok = opts.every(o => vsel[o] === right(o)); setVchk(ok); GAME.answer(ok); };
  const measure = x => { const base = p.fn(x); const r = [0, 1, 2].map(i => { let v = base * (1 + (Math.random() - 0.5) * 0.08); if (x === anom && i === 1) v = base * 1.45; return Math.round(v * 10) / 10; }); setRows({ ...rows, [x]: r }); };
  const mean = (r, x) => { const use = x === anom && anPick === x ? [r[0], r[2]] : r; return Math.round(use.reduce((a, b) => a + b, 0) / use.length * 10) / 10; };
  const done = p.ivVals.every(x => rows[x]);
  const pts = p.ivVals.filter(x => rows[x]).map(x => [x, mean(rows[x], x), rows[x]]);
  const W = 520, H = 280, P = 46; const xmax = Math.max(...p.ivVals) * 1.05, ymax = Math.max(1, ...p.ivVals.filter(x => rows[x]).flatMap(x => rows[x])) * 1.1;
  const sx = x => P + x / xmax * (W - P - 14), sy = y => H - P + 10 - y / ymax * (H - P - 10);
  return (
    <div className="wrap g-page" data-screen-label={'Practical ' + p.id}>
      <button className="btn g-btn ghost small" style={{ margin: '12px 0' }} onClick={back}>← All practicals</button>
      <div className="g-card pr-head"><span style={{ fontSize: 44 }}>{p.ic}</span><div><small className="g-tag">Investigation</small><h2>{p.t}</h2></div></div>
      <div className="pr-steps">{steps.map((s, i) => <button key={s} className={'pr-step' + (i === step ? ' on' : '') + (i < step ? ' done' : '')} onClick={() => i <= step && setStep(i)}><b>{i < step ? '✓' : i + 1}</b>{s}</button>)}</div>
      <div className="g-card pr-body">
        {step === 0 && <>
          <h3>1 · Plan a fair test</h3><p className="g-sub">Sort each variable. A fair test changes only <b>one</b> thing.</p>
          <div className="pr-vars">{opts.map(o => <div key={o} className={'pr-var' + (vchk === false && vsel[o] !== right(o) ? ' bad' : '')}><b>{o}</b><div className="chips">{roles.map(([k, l]) => <button key={k} className={'chip' + (vsel[o] === k ? ' on' : '')} onClick={() => { setVsel({ ...vsel, [o]: k }); setVchk(null); }}>{l}</button>)}</div></div>)}</div>
          {vchk != null && <div className={'gq-fb ' + (vchk ? 'right' : 'wrong')}><b>{vchk ? 'Fair test planned!' : 'Not quite'}</b><span>{vchk ? `You change the ${p.iv.toLowerCase()}, measure the ${p.dv.toLowerCase()}, and keep everything else the same.` : 'Check the red ones. Only ONE independent variable; things that do not matter are "Not needed".'}</span></div>}
          <div className="g-row"><button className="btn g-btn" disabled={Object.keys(vsel).length < opts.length} onClick={checkVars}>Check plan</button>{vchk && <button className="btn g-btn big" onClick={() => setStep(1)}>Next: Predict →</button>}</div>
        </>}
        {step === 1 && <>
          <h3>2 · Make a prediction</h3><p className="g-sub">What do you think will happen to the <b>{p.dv.toLowerCase()}</b> as the <b>{p.iv.toLowerCase()}</b> increases?</p>
          <div className="chips">{['It will increase', 'It will decrease', 'It will stay the same'].map(o => <button key={o} className={'chip' + (pred === o ? ' on' : '')} onClick={() => setPred(o)}>{o}</button>)}</div>
          {pred && <p className="st-note">“I predict that as the {p.iv.toLowerCase()} increases, the {p.dv.toLowerCase()} {pred.replace('It will ', 'will ')}.” You'll find out if you were right!</p>}
          <button className="btn g-btn big" disabled={!pred} onClick={() => setStep(2)}>Next: Experiment →</button>
        </>}
        {step === 2 && <>
          <h3>3 · Collect your results</h3><p className="g-sub">Press <b>Measure</b> for each value. Each test is repeated 3 times to make the results more reliable. Watch out for anomalies!</p>
          <table className="st-rt pr-table"><thead><tr><th>{p.iv} ({p.ivU})</th><th>Test 1</th><th>Test 2</th><th>Test 3</th><th>Mean ({p.dvU})</th><th></th></tr></thead><tbody>{p.ivVals.map(x => <tr key={x}><td><b>{x}</b></td>{[0, 1, 2].map(i => <td key={i}>{rows[x] ? rows[x][i] : '–'}</td>)}<td><b>{rows[x] ? mean(rows[x], x) : '–'}</b></td><td>{!rows[x] && <button className="btn g-btn small" onClick={() => measure(x)}> Measure</button>}</td></tr>)}</tbody></table>
          <div className="g-row"><button className="btn g-btn ghost small" onClick={() => { const n = { ...rows }; p.ivVals.forEach(x => { if (!n[x]) { const b = p.fn(x); n[x] = [0, 1, 2].map(i => Math.round((x === anom && i === 1 ? b * 1.45 : b * (1 + (Math.random() - 0.5) * 0.08)) * 10) / 10); } }); setRows(n); }}>Measure all</button><button className="btn g-btn big" disabled={!done} onClick={() => setStep(3)}>Next: Graph →</button></div>
        </>}
        {step === 3 && <>
          <h3>4 · Draw the graph & find the anomaly</h3><p className="g-sub">Every test result is a dot; the line goes through the means. One result doesn't fit the pattern. <b>Tap the anomalous dot.</b></p>
          <svg viewBox={`0 0 ${W} ${H}`} className="wsvg pr-graph">
            <line x1={P} y1={H - P + 10} x2={W - 10} y2={H - P + 10} stroke="#2b2140" strokeWidth="2" /><line x1={P} y1={10} x2={P} y2={H - P + 10} stroke="#2b2140" strokeWidth="2" />
            {p.ivVals.map(x => <text key={x} x={sx(x)} y={H - P + 28} textAnchor="middle" style={{ fontSize: 12 }}>{x}</text>)}
            <text x={(W + P) / 2} y={H - 4} textAnchor="middle" style={{ fontSize: 12, fontWeight: 700 }}>{p.iv} ({p.ivU})</text>
            <text x={14} y={H / 2} textAnchor="middle" transform={`rotate(-90 14 ${H / 2})`} style={{ fontSize: 12, fontWeight: 700 }}>{p.dv} ({p.dvU})</text>
            <polyline points={pts.map(([x, y]) => sx(x) + ',' + sy(y)).join(' ')} fill="none" stroke="var(--acc)" strokeWidth="3" strokeLinejoin="round" />
            {pts.map(([x, m, r]) => r.map((v, i) => <circle key={x + '-' + i} cx={sx(x) + (i - 1) * 5} cy={sy(v)} r={x === anPick && i === 1 ? 9 : 6} fill={anPick != null && x === anom && i === 1 ? '#ff6b6b' : '#fff'} stroke={anPick === x && i === 1 && x !== anom ? '#ff6b6b' : '#2b2140'} strokeWidth="2" style={{ cursor: 'pointer' }} onClick={() => { if (anPick === anom) return; setAnPick(x); const ok = x === anom && i === 1; GAME.answer(ok); if (!ok) setTimeout(() => setAnPick(null), 900); else setAnPick(x); }} />))}
          </svg>
          {anPick === anom ? <div className="gq-fb right"><b>Anomaly found!</b><span>Test 2 at {anom} {p.ivU} doesn't fit the pattern, so it is left out of the mean and the line is redrawn. Repeating tests helps you spot results like this.</span></div> : anPick != null ? <div className="gq-fb wrong"><b>Not that one</b><span>Look for the dot furthest from the others at the same value.</span></div> : null}
          <button className="btn g-btn big" disabled={anPick !== anom} onClick={() => setStep(4)}>Next: Conclude →</button>
        </>}
        {step === 4 && <>
          <h3>5 · Write your conclusion</h3><p className="g-sub">What pattern does your graph show?</p>
          <div className="en-opts">{p.concl.map((c, i) => <button key={i} className={'chip' + (concl === i ? i === p.ci ? ' on' : ' bad' : '')} onClick={() => { setConcl(i); GAME.answer(i === p.ci); if (i === p.ci) { GAME.award(40, 20, 'Practical complete!'); GAME.confetti(); } }}>{c}</button>)}</div>
          {concl === p.ci && <div className="pr-concl"><p><b>Conclusion:</b> {p.concl[p.ci]}</p><p><b>Scientific explanation:</b> {p.why}</p><p><b>My prediction was</b> {(p.concl[p.ci].includes('decreases') || p.concl[p.ci].includes('faster') && p.id === 'marble') === (pred === 'It will decrease') ? ' correct!' : ' not correct. That is fine: scientists learn from results!'}</p><p><b>Evaluation:</b> Repeating each test 3 times made the results more reliable and helped us spot the anomaly. To improve, we could take more readings between the values.</p><button className="btn g-btn" onClick={back}>Try another practical</button></div>}
        </>}
      </div>
    </div>
  );
}

/* ================= ENGLISH: AI writing feedback ================= */
const W_PROMPTS = [['', 'Persuade: Should mobile phones be banned in school?', 'persuasive'], ['', 'Describe: A walk through a forest at night', 'descriptive'], ['', 'Inform: Report on a school sports day', 'report'], ['', 'Analyse: How does a writer create tension in a scary story?', 'analysis']];
const CONN = ['however', 'furthermore', 'moreover', 'therefore', 'consequently', 'in addition', 'although', 'because', 'as a result', 'on the other hand', 'firstly', 'finally', 'nevertheless', 'for example', 'this shows', 'this suggests'];
function localCheck(t) {
  const words = (t.match(/[A-Za-z']+/g) || []); const sents = t.split(/[.!?]+/).filter(s => s.trim());
  const lc = t.toLowerCase(); const conns = CONN.filter(c => lc.includes(c));
  const caps = sents.filter(s => /^[a-z]/.test(s.trim())).length;
  const lens = sents.map(s => s.trim().split(/\s+/).length); const varied = lens.length > 2 && Math.max(...lens) - Math.min(...lens) >= 6;
  const tech = []; if (/\b(like|as)\s+(a|an|the)\b/i.test(t)) tech.push('simile'); if (/\?/.test(t)) tech.push('question'); if (/!/.test(t)) tech.push('exclamation'); if (/\b(\w)\w*\s+\1\w*\s+\1\w*/i.test(t)) tech.push('alliteration'); if (/\b(you|we|us|our)\b/i.test(t)) tech.push('direct address'); if (/\d+%|\d+ (per cent|percent|out of)/i.test(t)) tech.push('statistic');
  return { words: words.length, sents: sents.length, conns, caps, varied, tech, avg: Math.round(words.length / Math.max(1, sents.length)) };
}
function WritingLab({ go }) {
  const [pi, setPi] = React.useState(0), [txt, setTxt] = React.useState(''), [busy, setBusy] = React.useState(false), [fb, setFb] = React.useState(null), [hist, setHist] = React.useState(() => LS8.get('s8f-writing', []));
  const L = localCheck(txt);
  const submit = async () => {
    setBusy(true); setFb(null);
    let r = null;
    try {
      const out = await llm(`You are a kind, encouraging English teacher marking a Cambridge Lower Secondary Stage 8 (age 12-13) student's paragraph.\nTask: "${W_PROMPTS[pi][1]}"\nStudent writing:\n"""${txt.slice(0, 2500)}"""\nReturn ONLY JSON: {"scores":{"structure":0-5,"language":0-5,"accuracy":0-5,"purpose":0-5},"www":["what went well 1","2"],"ebi":["even better if 1","2"],"spelling":[{"wrong":"..","right":".."}],"techniques":["names of techniques used"],"rewrite":"one improved version of their weakest sentence","overall":"one encouraging sentence"}. Structure = PEE/paragraphing. Language = vocabulary and techniques. Accuracy = spelling, punctuation, grammar. Purpose = fits the task and audience. Keep each point under 20 words.`);
      r = parseJSON(out);
    } catch (e) {
      const sc = { structure: Math.min(5, 1 + L.conns.length + (L.sents >= 4 ? 1 : 0)), language: Math.min(5, 1 + L.tech.length + (L.varied ? 1 : 0)), accuracy: Math.max(1, 5 - L.caps), purpose: Math.min(5, Math.round(L.words / 40) + 1) };
      r = { scores: sc, www: [L.conns.length ? `You linked ideas with ${L.conns.slice(0, 2).join(' and ')}.` : 'You wrote a clear paragraph.', L.tech.length ? `You used ${L.tech[0]}.` : 'Your ideas are easy to follow.'], ebi: [L.conns.length < 2 ? 'Use more connectives (however, therefore, furthermore).' : 'Add a quotation or fact as evidence.', !L.varied ? 'Vary sentence length: try a short punchy sentence.' : 'Explain the effect on the reader in more detail.'], spelling: [], techniques: L.tech, rewrite: '', overall: '(AI feedback is unavailable right now, so this is an automatic check.)', offline: true };
    }
    const total = Object.values(r.scores || {}).reduce((a, b) => a + (+b || 0), 0);
    const rec = { date: Date.now(), prompt: pi, total, words: L.words };
    const h = [rec, ...hist].slice(0, 20); setHist(h); LS8.set('s8f-writing', h);
    const prev = hist.find(x => x.prompt === pi);
    if (prev && total > prev.total) GAME.toast(` Up from ${prev.total} to ${total}/20. Great improvement!`, true);
    GAME.award(20 + total, 10, 'Writing feedback'); setFb({ ...r, total }); setBusy(false);
  };
  const hl = t => { const parts = []; let rest = t; const re = new RegExp('\\b(' + CONN.join('|') + ')\\b', 'gi'); let last = 0, m; const out = []; while ((m = re.exec(t))) { out.push(t.slice(last, m.index)); out.push(<mark key={m.index} className="wl-conn">{m[0]}</mark>); last = m.index + m[0].length; } out.push(t.slice(last)); return out; };
  return (
    <LabShell go={go} ic="" title="Writing feedback" sub="Write a paragraph and get feedback on structure, language, accuracy and purpose. Then improve it and resubmit to beat your score!" grad="linear-gradient(135deg,#ff9671,#ff6f91)">
      <div className="g-card st-form">
        <label>Choose a task<div className="chips">{W_PROMPTS.map(([ic, t], i) => <button key={i} className={'chip' + (pi === i ? ' on' : '')} onClick={() => { setPi(i); setFb(null); }}>{ic} {t.split(':')[0]}</button>)}</div></label>
        <div className="wl-task">{W_PROMPTS[pi][0]} <b>{W_PROMPTS[pi][1]}</b></div>
        <textarea className="inp wl-ta" rows={9} value={txt} onChange={e => { setTxt(e.target.value); }} placeholder="Write at least 60 words. Remember: Point, Evidence, Explain, and use connectives and techniques!" />
        <div className="wl-live"><span> {L.words} words</span><span> {L.conns.length} connectives</span><span> {L.tech.length} techniques</span><span> avg {L.avg} words/sentence</span>{L.caps > 0 && <span className="bad"> {L.caps} sentence{L.caps > 1 ? 's' : ''} without a capital</span>}</div>
        <div className="g-row"><button className="btn g-btn big" disabled={L.words < 30 || busy} onClick={submit}>{busy ? ' Reading your work…' : fb ? ' Resubmit' : ' Get feedback'}</button>{L.words < 30 && <span className="g-sub">Write at least 30 words.</span>}</div>
      </div>
      {fb && <div className="g-card wl-fb">
        <div className="st-score"><div className="st-ring" style={{ '--p': fb.total / 20 * 100 }}><b>{fb.total}/20</b></div><div><h3>{fb.overall}</h3></div></div>
        <div className="wl-scores">{[['structure', ' Structure'], ['language', ' Language'], ['accuracy', ' Accuracy'], ['purpose', ' Purpose']].map(([k, l]) => <div key={k}><span>{l}</span><div className="wl-dots">{[1, 2, 3, 4, 5].map(n => <i key={n} className={n <= (fb.scores || {})[k] ? 'on' : ''} />)}</div></div>)}</div>
        <div className="st-sw"><div><h3> What went well</h3><ul>{(fb.www || []).map((x, i) => <li key={i}>{x}</li>)}</ul></div><div><h3> Even better if…</h3><ul>{(fb.ebi || []).map((x, i) => <li key={i}>{x}</li>)}</ul></div></div>
        {fb.spelling && fb.spelling.length > 0 && <div><h3> Spelling</h3><div className="chips">{fb.spelling.map((s, i) => <span key={i} className="st-pill bad">{s.wrong} → <b>{s.right}</b></span>)}</div></div>}
        {fb.techniques && fb.techniques.length > 0 && <div><h3> Techniques spotted</h3><div className="chips">{fb.techniques.map((s, i) => <span key={i} className="st-pill ok">{s}</span>)}</div></div>}
        {fb.rewrite && <div className="st-note"><b>Try this upgrade:</b> {fb.rewrite}</div>}
        <div><h3> Your connectives</h3><div className="wl-preview">{hl(txt)}</div></div>
      </div>}
      {hist.length > 1 && <div className="g-card"><h3> Your progress</h3><div className="st-week">{hist.slice(0, 10).reverse().map((h, i) => <div key={i}><i style={{ height: h.total / 20 * 90 + 'px' }} /><small>{W_PROMPTS[h.prompt][0]}</small><b>{h.total}</b></div>)}</div></div>}
    </LabShell>
  );
}

/* ================= FRENCH: AI conversation ================= */
const CONVOS = [
  { id: 'cafe', ic: '', t: 'Au café', who: 'Serveur', role: 'a friendly waiter in a Paris café. Take the student\'s order (drinks, snacks), tell them the price in euros, and say goodbye.', open: 'Bonjour ! Bienvenue au Café de Flore. Vous désirez ?', openE: 'Hello! Welcome to Café de Flore. What would you like?', ideas: ["Je voudrais un chocolat chaud, s'il vous plaît.", 'Avez-vous des croissants ?', "C'est combien ?"] },
  { id: 'penpal', ic: '', t: 'Mon correspondant', who: 'Lucas (12 ans, Lyon)', role: 'Lucas, a 12-year-old French pen-pal from Lyon. Ask the student about their family, school subjects, hobbies and town, and share yours.', open: "Salut ! Je m'appelle Lucas, j'ai douze ans et j'habite à Lyon. Et toi, comment tu t'appelles ?", openE: "Hi! I'm Lucas, I'm twelve and I live in Lyon. And you, what's your name?", ideas: ["Je m'appelle… J'ai douze ans.", "J'habite à…", "J'aime le foot parce que c'est amusant."] },
  { id: 'shop', ic: '', t: 'Au magasin', who: 'Vendeuse', role: 'a shop assistant in a French clothes shop. Help the student choose clothes, ask about colour and size, and tell them the price.', open: 'Bonjour ! Je peux vous aider ?', openE: 'Hello! Can I help you?', ideas: ['Je cherche un t-shirt.', 'En bleu, s\'il vous plaît.', 'Je peux essayer ?'] },
  { id: 'directions', ic: '', t: 'Dans la rue', who: 'Passant', role: 'a helpful person on a street in a French town. The student asks for directions; give simple directions (à gauche, à droite, tout droit) to places in town.', open: 'Bonjour ! Vous êtes perdu ?', openE: 'Hello! Are you lost?', ideas: ['Où est la gare, s\'il vous plaît ?', 'C\'est loin ?', 'Merci beaucoup !'] },
];
function FrConvo({ go }) {
  const [ci, setCi] = React.useState(null);
  if (ci == null) return <LabShell go={go} ic="" title="French conversations" sub="Have a real conversation in French by typing or speaking. Your partner replies out loud and gently corrects your mistakes." grad="linear-gradient(135deg,#a78bfa,#ff7eb3)"><div className="st-tools g-power-cards">{CONVOS.map((c, i) => <button key={c.id} className={'g-pcard lc-' + i} onClick={() => setCi(i)}><div style={{ fontSize: 40 }}>{c.ic}</div><b>{c.t}</b><div>Talk to: {c.who}</div></button>)}</div></LabShell>;
  return <Convo c={CONVOS[ci]} back={() => setCi(null)} />;
}
function Convo({ c, back }) {
  const [msgs, setMsgs] = React.useState([{ me: false, fr: c.open, en: c.openE }]), [txt, setTxt] = React.useState(''), [busy, setBusy] = React.useState(false), [rec, setRec] = React.useState(false), [showEn, setShowEn] = React.useState(true);
  const box = React.useRef(null);
  React.useEffect(() => { frSay(c.open); }, []);
  React.useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [msgs, busy]);
  const SRc = window.SpeechRecognition || window.webkitSpeechRecognition;
  const listen = () => { if (!SRc) return; const r = new SRc(); r.lang = 'fr-FR'; r.interimResults = false; r.onresult = e => { setTxt(e.results[0][0].transcript); }; r.onend = () => setRec(false); r.onerror = () => setRec(false); setRec(true); r.start(); };
  const send = async () => {
    const t = txt.trim(); if (!t || busy) return;
    const hist = [...msgs, { me: true, fr: t }]; setMsgs(hist); setTxt(''); setBusy(true);
    let r;
    try {
      const out = await llm(`You are ${c.role} You are talking with a 12-year-old beginner learner of French (Cambridge Stage 8). Keep replies SHORT (1-2 simple sentences), use only beginner vocabulary and the present tense mostly, and always end with a simple question to keep the conversation going.\nConversation so far:\n${hist.map(m => (m.me ? 'Student: ' : 'You: ') + m.fr).join('\n')}\nReturn ONLY JSON: {"reply":"your French reply","english":"English translation of your reply","correction":"if the student's LAST message had a mistake, the corrected French sentence, else empty string","tip":"if there was a correction, a 10-word English explanation, else empty string","good":true or false (was the student's French understandable?)}`);
      r = parseJSON(out);
    } catch (e) { r = { reply: 'Très bien ! Et après ?', english: 'Very good! And then?', correction: '', tip: '(The AI partner is offline right now.)', good: true }; }
    setMsgs(m => [...m.slice(0, -1), { ...m[m.length - 1], corr: r.correction, tip: r.tip, good: r.good }, { me: false, fr: r.reply, en: r.english }]);
    frSay(r.reply); GAME.event('speak'); if (r.good !== false) GAME.award(8, 3); setBusy(false);
  };
  const n = msgs.filter(m => m.me).length;
  return (
    <div className="wrap g-page" data-screen-label={'Convo ' + c.id}>
      <button className="btn g-btn ghost small" style={{ margin: '12px 0' }} onClick={back}>← All conversations</button>
      <div className="g-card cv-box">
        <div className="cv-head"><span style={{ fontSize: 36 }}>{c.ic}</span><div><b>{c.t}</b><small>Talking to {c.who} · {n} message{n !== 1 ? 's' : ''} sent</small></div><button className={'chip' + (showEn ? ' on' : '')} onClick={() => setShowEn(!showEn)}>EN English</button></div>
        <div className="fr-chat cv-chat" ref={box}>
          {msgs.map((m, i) => <div key={i} className={'fr-msg' + (m.me ? ' me' : '')}>{!m.me && <b>{c.who.split(' ')[0]}:</b>} {m.fr} {!m.me && <FrSay t={m.fr} sm />}{!m.me && showEn && m.en && <small>{m.en}</small>}{m.me && m.corr && <span className="cv-corr"> Better: <b>{m.corr}</b>{m.tip && <em> · {m.tip}</em>}</span>}{m.me && m.good && !m.corr && <span className="cv-ok">✓ Parfait !</span>}</div>)}
          {busy && <div className="fr-msg"><span className="cv-typing"><i /><i /><i /></span></div>}
        </div>
        <div className="cv-ideas"><span className="mono">Ideas:</span>{c.ideas.map(x => <button key={x} className="chip" onClick={() => setTxt(x)}>{x}</button>)}</div>
        <div className="cv-input">
          {SRc && <button className={'btn g-btn' + (rec ? ' cv-rec' : ' ghost')} onClick={listen} title="Speak in French">{rec ? ' Listening…' : ' Speak'}</button>}
          <input className="inp" value={txt} placeholder="Écris en français…" onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
          <div className="fr-acc">{['é', 'è', 'à', 'ç', 'ê'].map(a => <button key={a} className="chip" onClick={() => setTxt(txt + a)}>{a}</button>)}</div>
          <button className="btn g-btn" disabled={!txt.trim() || busy} onClick={send}>Envoyer ➤</button>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPUTING: run real Python ================= */
const PY_EX = [
  [' Hello', 'name = input("What is your name? ")\nprint("Hello, " + name + "!")\nprint("Welcome to Python.")'],
  [' Guessing game', 'import random\nsecret = random.randint(1, 10)\nguess = int(input("Guess a number 1-10: "))\nif guess == secret:\n    print("Correct! Well done.")\nelif guess < secret:\n    print("Too low! It was", secret)\nelse:\n    print("Too high! It was", secret)'],
  [' Recycling quiz', 'item = input("What is the item made of? (paper/plastic/food/glass) ")\nif item == "paper" or item == "glass":\n    print("Yes, recycle it!")\nelif item == "plastic":\n    clean = input("Is it clean? (yes/no) ")\n    if clean == "yes":\n        print("Recycle it.")\n    else:\n        print("Rinse it first, then recycle.")\nelse:\n    print("Put it in the compost or general waste.")'],
  [' Times table', 'n = int(input("Which times table? "))\nfor i in range(1, 11):\n    print(i, "x", n, "=", i * n)'],
  [' Binary converter', 'denary = int(input("Enter a number 0-255: "))\nbinary = ""\nfor bit in [128, 64, 32, 16, 8, 4, 2, 1]:\n    if denary >= bit:\n        binary = binary + "1"\n        denary = denary - bit\n    else:\n        binary = binary + "0"\nprint("In binary:", binary)'],
  [' Validation', 'age = int(input("Enter your age: "))\nwhile age < 5 or age > 18:\n    print("Range check failed! Must be 5-18.")\n    age = int(input("Enter your age: "))\nprint("Thank you. Age", age, "accepted.")'],
];
const PY_CH = [['Print your name and your favourite subject on two lines.', s => (s.match(/print/g) || []).length >= 2], ['Use an if / else to say "Pass" if a score is 50 or more, otherwise "Try again".', s => /if/.test(s) && /else/.test(s)], ['Use a for loop to print the numbers 1 to 5.', s => /for/.test(s) && /range/.test(s)], ['Ask for two numbers with input() and print their total.', s => (s.match(/input/g) || []).length >= 2 && /\+/.test(s)]];
let skulptP = null;
function loadSkulpt() {
  if (window.Sk) return Promise.resolve(); if (skulptP) return skulptP;
  const add = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  skulptP = add('https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js').then(() => add('https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js'));
  return skulptP;
}
function PythonLab({ go }) {
  const [code, setCode] = React.useState(() => LS8.get('s8f-py', PY_EX[0][1])), [out, setOut] = React.useState([]), [run, setRun] = React.useState(false), [ask, setAsk] = React.useState(null), [ans, setAns] = React.useState(''), [ready, setReady] = React.useState(!!window.Sk), [err, setErr] = React.useState(null), [chDone, setChDone] = React.useState(() => LS8.get('s8f-pych', []));
  const resolver = React.useRef(null), outRef = React.useRef(null);
  React.useEffect(() => { loadSkulpt().then(() => setReady(true)).catch(() => setErr('Could not load Python. Check your internet connection.')); }, []);
  React.useEffect(() => { LS8.set('s8f-py', code); }, [code]);
  React.useEffect(() => { if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight; }, [out, ask]);
  const exec = () => {
    if (!window.Sk) return; setOut([]); setRun(true); setErr(null);
    Sk.configure({ output: t => setOut(o => [...o, { t }]), read: x => { if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[x] === undefined) throw "File not found: '" + x + "'"; return Sk.builtinFiles.files[x]; }, inputfun: p => new Promise(res => { setOut(o => [...o, { t: p, p: true }]); setAsk(p); resolver.current = res; }), inputfunTakesPrompt: true, __future__: Sk.python3, execLimit: 10000 });
    Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true)).then(() => {
      setRun(false); GAME.award(5, 2);
      PY_CH.forEach(([t, f], i) => { if (!chDone.includes(i) && f(code)) { const n = [...chDone, i]; setChDone(n); LS8.set('s8f-pych', n); GAME.award(25, 15, 'Python challenge done!'); GAME.confetti(); } });
    }).catch(e => { setRun(false); setAsk(null); const m = String(e.toString ? e.toString() : e); setErr(m.replace(/ on line (\d+)/, ' on line $1')); });
  };
  const submitIn = () => { setOut(o => [...o, { t: ans + '\n', u: true }]); const r = resolver.current; resolver.current = null; setAsk(null); setAns(''); r && r(ans); };
  const lines = code.split('\n').length;
  return (
    <LabShell go={go} ic="" title="Python playground" sub="Write and run real Python code, including the programs from Units 8.2, 8.4 and 8.6. Your code is saved automatically." grad="linear-gradient(135deg,#2b2140,#4facfe)">
      <div className="chips" style={{ margin: '14px 0' }}>{PY_EX.map(([n, c]) => <button key={n} className="chip" onClick={() => { setCode(c); setOut([]); setErr(null); }}>{n}</button>)}</div>
      <div className="py-wrap">
        <div className="g-card py-ed"><div className="py-bar"><span>main.py</span><button className="btn g-btn" disabled={!ready || run} onClick={exec}>{!ready ? ' Loading Python…' : run ? ' Running…' : ' Run'}</button></div>
          <div className="py-code"><pre className="py-ln">{Array.from({ length: lines }, (_, i) => i + 1).join('\n')}</pre><textarea spellCheck={false} value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => { if (e.key === 'Tab') { e.preventDefault(); const t = e.target, s = t.selectionStart; const v = code.slice(0, s) + '    ' + code.slice(t.selectionEnd); setCode(v); setTimeout(() => { t.selectionStart = t.selectionEnd = s + 4; }); } }} /></div></div>
        <div className="g-card py-out"><div className="py-bar"><span>Output</span><button className="chip" onClick={() => { setOut([]); setErr(null); }}>Clear</button></div>
          <pre ref={outRef} className="py-term">{out.map((o, i) => <span key={i} className={o.u ? 'u' : o.p ? 'p' : ''}>{o.t}</span>)}{err && <span className="e"> {err}{'\n'} Check spelling, brackets, colons (:) and indentation (4 spaces).</span>}{!out.length && !err && !run && <span className="p">Press  Run to see your program's output here.</span>}</pre>
          {ask != null && <div className="py-in"><input className="inp" autoFocus value={ans} onChange={e => setAns(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitIn()} placeholder="Type your answer and press Enter" /><button className="btn g-btn small" onClick={submitIn}>Enter</button></div>}
        </div>
      </div>
      <div className="g-card"><h3> Challenges</h3><div className="py-ch">{PY_CH.map(([t], i) => <div key={i} className={'st-task' + (chDone.includes(i) ? ' done' : '')}><span className="st-ck">{chDone.includes(i) ? '✓' : i + 1}</span><span>{t}</span></div>)}</div></div>
    </LabShell>
  );
}

Object.assign(window, { MathsSteps, Practicals, WritingLab, FrConvo, PythonLab });
