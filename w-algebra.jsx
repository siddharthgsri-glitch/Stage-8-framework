/* Algebra widgets */

/* 5.2 substitution */
W.subst = function ({ cfg, onState }) {
  const exprs = (cfg && cfg.exprs) || [
    ['3a + 2b', (a, b) => 3 * a + 2 * b, (a, b) => `3 × ${p(a)} + 2 × ${p(b)}`],
    ['a² − b', (a, b) => a * a - b, (a, b) => `${p(a)}² − ${p(b)}`],
    ['2(a − b)', (a, b) => 2 * (a - b), (a, b) => `2 × (${p(a)} − ${p(b)})`],
    ['ab + b³', (a, b) => a * b + b * b * b, (a, b) => `${p(a)} × ${p(b)} + ${p(b)}³`],
  ];
  function p(v) { return v < 0 ? `(${wxFmt(v, 0)})` : v; }
  const [ei, setEi] = uSt(0), [a, setA] = uSt(4), [b, setB] = uSt(-2);
  const E = exprs[ei]; const v = E[1](a, b);
  useRep(onState, { ei, a, b, v }, [ei, a, b]);
  return (
    <div className="wbox">
      <div className="wbig" style={{ textAlign: 'center' }}><span className="w-alg">{E[0]}</span></div>
      <div className="wsteps"><div className="wst-line"><span className="mono">substitute</span><span>{E[2](a, b)}</span></div><div className="wst-line"><span className="mono">evaluate</span><span><b>{wxFmt(v, 0)}</b></span></div></div>
      <div className="wnote">Put negative numbers in brackets so the signs are clear. Do powers before multiplying.</div>
      <WCtl><WSeg label="Expression" opts={exprs.map((e, i) => [i, e[0]])} v={ei} set={setEi} /><WSl label="a" v={a} set={setA} min={-5} max={6} fmt={x => wxFmt(x, 0)} /><WSl label="b" v={b} set={setB} min={-5} max={6} fmt={x => wxFmt(x, 0)} /></WCtl>
    </div>
  );
};

/* 5.3 expand & factorise: area model */
W.expand = function ({ cfg, onState }) {
  const [k, setK] = uSt(3), [m, setM] = uSt(2), [c, setC] = uSt(4), [mode, setMode] = uSt('expand');
  const g = wxG(k * m, k * c), out = `${k * m}x ${k * c < 0 ? '−' : '+'} ${Math.abs(k * c)}`;
  useRep(onState, { k, m, c, mode, g }, [k, m, c, mode]);
  const W_ = 380, h = 90, wx = 60 + m * 30, wc = 40 + Math.abs(c) * 14;
  const sc = (W_ - 70) / (wx + wc);
  return (
    <div className="wbox">
      <div className="wbig" style={{ textAlign: 'center' }}>{mode === 'expand' ? <>{k}({m === 1 ? '' : m}x {c < 0 ? '−' : '+'} {Math.abs(c)}) = <b>{out}</b></> : <>{out} = <b>{g}({k * m / g === 1 ? '' : k * m / g}x {c < 0 ? '−' : '+'} {Math.abs(k * c / g)})</b></>}</div>
      <svg viewBox={`0 0 ${W_} 140`} className="wsvg">
        <text x="30" y={30 + h / 2 + 5} textAnchor="middle" className="w-lab">{mode === 'expand' ? k : g}</text>
        <rect x="60" y="30" width={wx * sc} height={h} className="w-area" /><rect x={60 + wx * sc} y="30" width={wc * sc} height={h} className="w-area2" />
        <text x={60 + wx * sc / 2} y="22" textAnchor="middle" className="w-lab">{mode === 'expand' ? (m === 1 ? 'x' : m + 'x') : (k * m / g === 1 ? 'x' : k * m / g + 'x')}</text>
        <text x={60 + wx * sc + wc * sc / 2} y="22" textAnchor="middle" className="w-lab">{mode === 'expand' ? wxFmt(c, 0) : wxFmt(k * c / g, 0)}</text>
        <text x={60 + wx * sc / 2} y={30 + h / 2 + 6} textAnchor="middle" className="w-big">{k * m}x</text>
        <text x={60 + wx * sc + wc * sc / 2} y={30 + h / 2 + 6} textAnchor="middle" className="w-big">{wxFmt(k * c, 0)}</text>
      </svg>
      <div className="wnote">{mode === 'expand' ? 'Multiply the outside term by every term inside the bracket.' : `The highest common factor of ${k * m} and ${Math.abs(k * c)} is ${g}. Take it outside the bracket.`}</div>
      <WCtl><WSeg opts={[['expand', 'Expand'], ['fact', 'Factorise']]} v={mode} set={setMode} /><WNum label="Outside" v={k} set={setK} min={2} max={6} /><WNum label="x coefficient" v={m} set={setM} min={1} max={5} /><WNum label="Constant" v={c} set={x => setC(x || 1)} min={-6} max={8} /></WCtl>
    </div>
  );
};

/* 9.1 function machine */
W.machine = function ({ cfg, onState }) {
  const ops = [['× 2', x => x * 2, '÷ 2'], ['× 3', x => x * 3, '÷ 3'], ['+ 4', x => x + 4, '− 4'], ['− 1', x => x - 1, '+ 1'], ['+ 5', x => x + 5, '− 5'], ['÷ 2', x => x / 2, '× 2']];
  const [o1, setO1] = uSt(1), [o2, setO2] = uSt(2), [x, setX] = uSt(3), [inv, setInv] = uSt(false);
  const y = ops[o2][1](ops[o1][1](x));
  const [log, setLog] = uSt([]);
  uEf(() => setLog(l => [...l.filter(r => r[0] !== x).slice(-4), [x, y]]), [x, o1, o2]);
  useRep(onState, { o1, o2, x, y, inv }, [o1, o2, x, inv]);
  const box = (lab, k) => <div className="wm-box" key={k}>{lab}</div>;
  return (
    <div className="wbox">
      <div className={'wmach' + (inv ? ' inv' : '')}>
        <div className="wm-io"><span className="mono">{inv ? 'output' : 'input'}</span><b>{inv ? wxFmt(y) : x}</b></div><span className="wm-ar">→</span>
        {inv ? [box(ops[o2][2], 'a'), <span key="r1" className="wm-ar">→</span>, box(ops[o1][2], 'b')] : [box(ops[o1][0], 'a'), <span key="r1" className="wm-ar">→</span>, box(ops[o2][0], 'b')]}
        <span className="wm-ar">→</span><div className="wm-io"><span className="mono">{inv ? 'input' : 'output'}</span><b>{inv ? x : wxFmt(y)}</b></div>
      </div>
      <table className="wtable"><thead><tr><th>input x</th>{log.map((r, i) => <td key={i}>{r[0]}</td>)}</tr></thead><tbody><tr><th>output y</th>{log.map((r, i) => <td key={i}>{wxFmt(r[1])}</td>)}</tr></tbody></table>
      <div className="wnote">{inv ? 'The inverse machine undoes each step in reverse order, so you can find the input from the output.' : 'Each input gives exactly one output. That is what makes it a function.'}</div>
      <WCtl><WSeg label="Step 1" opts={ops.map((o, i) => [i, o[0]])} v={o1} set={setO1} /><WSeg label="Step 2" opts={ops.map((o, i) => [i, o[0]])} v={o2} set={setO2} /><WSl label="Input" v={x} set={setX} min={-4} max={10} fmt={v => wxFmt(v, 0)} /><WSeg opts={[[false, 'Forwards'], [true, 'Inverse']]} v={inv} set={setInv} /></WCtl>
    </div>
  );
};

/* 9.2 formulae */
W.formula = function ({ cfg, onState }) {
  const F = (cfg && cfg.f) || { name: 'Taxi fare', f: 'C = 3 + 2d', vars: [['d', 'Distance (km)', 0, 20, 1]], calc: v => 3 + 2 * v.d, out: 'C', unit: '$' };
  const [v, setV] = uSt(() => Object.fromEntries(F.vars.map(x => [x[0], Math.round((x[2] + x[3]) / 2)])));
  const r = F.calc(v);
  useRep(onState, { v, r }, [JSON.stringify(v)]);
  return (
    <div className="wbox">
      <div className="mono">{F.name}</div>
      <div className="wbig" style={{ textAlign: 'center' }}><span className="w-alg">{F.f}</span></div>
      <WRead items={[...F.vars.map(x => [x[1], v[x[0]]]), [F.out, (F.unit === '$' ? '$' : '') + wxFmt(r) + (F.unit && F.unit !== '$' ? ' ' + F.unit : '')]]} />
      <WCtl>{F.vars.map(x => <WSl key={x[0]} label={x[1] + ' · ' + x[0]} v={v[x[0]]} set={n => setV({ ...v, [x[0]]: n })} min={x[2]} max={x[3]} step={x[4]} />)}</WCtl>
    </div>
  );
};

/* 14.1-14.3 balance scale equations */
W.balance = function ({ cfg, onState }) {
  const eqs = (cfg && cfg.eqs) || [[3, 5, 1, 13], [5, -3, 2, 9], [4, 1, 0, 17]];
  const [ei, setEi] = uSt(0), [solved, setSolved] = uSt(0);
  const [st, setSt] = uSt(() => ({ a: eqs[0][0], b: eqs[0][1], c: eqs[0][2], d: eqs[0][3] }));
  const [hist, setHist] = uSt([]);
  uEf(() => { const e = eqs[ei]; setSt({ a: e[0], b: e[1], c: e[2], d: e[3] }); setHist([]); }, [ei]);
  const { a, b, c, d } = st;
  const done = a === 1 && b === 0 && c === 0;
  uEf(() => { if (done && ei + 1 > solved) setSolved(ei + 1); }, [done]);
  useRep(onState, { solved, total: eqs.length, done: solved === eqs.length }, [solved]);
  const side = (k, n) => wxLin(k, n);
  const act = (lab, f) => { const ns = f(st); if (ns.a <= 0 && !(ns.a === 0 && ns.c === 0)) return; setSt(ns); setHist([...hist, [lab, `${side(ns.a, ns.b)} = ${side(ns.c, ns.d)}`]]); };
  const acts = [];
  if (c !== 0) acts.push([`− ${c === 1 ? '' : c}x`, s => ({ ...s, a: s.a - s.c, c: 0 })]);
  if (b !== 0) acts.push([b > 0 ? `− ${b}` : `+ ${-b}`, s => ({ ...s, b: 0, d: s.d - s.b })]);
  if (c === 0 && b === 0 && a !== 1 && a !== 0) acts.push([`÷ ${a}`, s => ({ ...s, a: 1, d: s.d / s.a })]);
  const decoys = ['+ 2', '× 2', '− 1'].map(l => [l, null]);
  const tilt = Math.max(-8, Math.min(8, 0));
  const blocks = (k, n, side) => {
    const xs = Array.from({ length: Math.max(0, k) }, (_, i) => <span key={'x' + i} className="wb-x">x</span>);
    const ns = Math.abs(n) <= 12 && Number.isInteger(n) ? Array.from({ length: Math.abs(n) }, (_, i) => <span key={'n' + i} className={'wb-1' + (n < 0 ? ' neg' : '')}>{n < 0 ? '−' : '1'}</span>) : (n !== 0 ? [<span key="nn" className="wb-n">{wxRat(n)}</span>] : []);
    return <div className="wb-pan">{xs}{ns}{!xs.length && !ns.length && <span className="wb-n">0</span>}</div>;
  };
  return (
    <div className="wbox">
      <div className="wbal">
        <div className="wb-beam" style={{ transform: `rotate(${tilt}deg)` }}>{blocks(a, b)}{blocks(c, d)}</div>
        <div className="wb-post" />
      </div>
      <div className="wbig" style={{ textAlign: 'center' }}>{side(a, b)} = {side(c, d)}</div>
      {hist.length > 0 && <div className="wsteps">{hist.map((h, i) => <div key={i} className="wst-line"><span className="mono">{h[0]} both sides</span><span>{h[1]}</span></div>)}</div>}
      {!done ? <div><span className="mono">Do the same to both sides:</span><div className="chips">{wxShuffle([...acts, ...decoys.slice(0, 2)], ei + hist.length).map(([l, f]) => <button key={l} className="chip" onClick={() => f ? act(l, f) : null} title={f ? '' : 'That won\'t help isolate x'}>{l}</button>)}</div><div className="wnote">Aim: get x on its own on one side.</div></div>
        : <div className="wfoot"><span className="wnote" style={{ color: 'var(--ok)' }}>Solved: x = {wxRat(d)} ✓</span>{ei < eqs.length - 1 && <button className="btn small" onClick={() => setEi(ei + 1)}>Next equation →</button>}</div>}
    </div>
  );
};

/* 14.4 inequalities on a number line */
W.ineq = function ({ cfg, onState }) {
  const [a, setA] = uSt(-2), [b, setB] = uSt(3), [la, setLa] = uSt('<'), [lb, setLb] = uSt('≤'), [both, setBoth] = uSt(true);
  const P = wxPlane(460, 80, -6, 6, 0, 1, 20);
  const ints = []; for (let n = -6; n <= 6; n++) { const okA = la === '<' ? n > a : n >= a; const okB = lb === '<' ? n < b : n <= b; if ((both ? okA : true) && okB && (both ? true : true)) ints.push(n); }
  useRep(onState, { a, b, la, lb, both, ints }, [a, b, la, lb, both]);
  const L = both ? a : -6.6;
  return (
    <div className="wbox">
      <div className="wbig" style={{ textAlign: 'center' }}>{both ? <>{a} {la} x {lb} {b}</> : <>x {lb} {b}</>}</div>
      <svg viewBox="0 0 460 80" className="wsvg">
        <line x1={P.X(-6)} x2={P.X(6)} y1="40" y2="40" className="w-ax" />
        {Array.from({ length: 13 }, (_, i) => i - 6).map(n => <g key={n}><line x1={P.X(n)} x2={P.X(n)} y1="35" y2="45" className="w-ax" /><text x={P.X(n)} y="66" textAnchor="middle">{n}</text></g>)}
        <line x1={P.X(Math.max(L, -6.4))} x2={P.X(b)} y1="40" y2="40" className="w-int" />
        {!both && <polygon points={`${P.X(-6.4)},40 ${P.X(-6.1)},33 ${P.X(-6.1)},47`} className="w-arrow" />}
        {both && <circle cx={P.X(a)} cy="40" r="7" className={la === '<' ? 'w-open' : 'w-closed'} />}
        <circle cx={P.X(b)} cy="40" r="7" className={lb === '<' ? 'w-open' : 'w-closed'} />
      </svg>
      <WRead items={[['Integers', ints.length > 9 ? ints.slice(0, 3).join(', ') + ', …' : ints.join(', ') || 'none'], ['Open circle ○', 'not included (< >)'], ['Filled circle ●', 'included (≤ ≥)']]} />
      <WCtl><WSeg opts={[[true, 'Two-sided'], [false, 'One-sided']]} v={both} set={setBoth} />{both && <WSl label="Lower" v={a} set={x => setA(Math.min(x, b - 1))} min={-6} max={5} />}{both && <WSeg opts={['<', '≤']} v={la} set={setLa} />}<WSl label="Upper" v={b} set={x => setB(Math.max(x, both ? a + 1 : -6))} min={-5} max={6} /><WSeg opts={['<', '≤']} v={lb} set={setLb} /></WCtl>
    </div>
  );
};

/* 20.1 sequences: term-to-term with patterns */
W.seqgen = function ({ cfg, onState }) {
  const [start, setStart] = uSt(3), [step, setStep] = uSt(4), [kind, setKind] = uSt('+');
  const terms = []; let t = start; for (let i = 0; i < 6; i++) { terms.push(t); t = kind === '+' ? t + step : kind === '×' ? t * step : t + step / 2; }
  useRep(onState, { start, step, kind, terms }, [start, step, kind]);
  return (
    <div className="wbox">
      <div className="wseq">{terms.map((x, i) => <React.Fragment key={i}><div className="wseq-t"><span className="mono">T{i + 1}</span><b>{wxRat(x)}</b>{kind === '+' && x > 0 && x <= 30 && <div className="wseq-dots">{Array.from({ length: Math.min(x, 30) }, (_, j) => <i key={j} />)}</div>}</div>{i < 5 && <span className="wseq-ar">{kind === '+' ? (step >= 0 ? '+' : '') + step : kind === '×' ? '×' + step : '+' + wxRat(step / 2)}</span>}</React.Fragment>)}</div>
      <div className="wnote">Term-to-term rule: start at {start}, then {kind === '+' ? `add ${step}` : kind === '×' ? `multiply by ${step}` : `add ${wxRat(step / 2)}`} each time. {kind === '×' ? 'This is not linear because the gaps grow.' : 'Equal gaps make a linear sequence.'}</div>
      <WCtl><WSeg opts={[['+', 'Add'], ['f', 'Add a fraction'], ['×', 'Multiply']]} v={kind} set={setKind} /><WSl label="First term" v={start} set={setStart} min={-5} max={10} /><WSl label={kind === '×' ? 'Multiplier' : 'Step'} v={step} set={setStep} min={kind === '×' ? 2 : -5} max={kind === '×' ? 3 : 8} /></WCtl>
    </div>
  );
};

/* 20.2 nth term an + b */
W.nthterm = function ({ cfg, onState }) {
  const [a, setA] = uSt(3), [b, setB] = uSt(2), [n, setN] = uSt(10);
  const T = k => a * k + b;
  useRep(onState, { a, b, n }, [a, b, n]);
  const P = wxPlane(300, 180, 0, 6, Math.min(0, T(1), T(5)) - 2, Math.max(T(5), T(1)) + 2, 18);
  return (
    <div className="wbox">
      <div className="wbig" style={{ textAlign: 'center' }}>nth term = <b>{wxLin(a, b, 'n')}</b></div>
      <div className="wsplit">
        <table className="wtable"><thead><tr><th>n</th><th>{a}n</th><th>term</th></tr></thead><tbody>{[1, 2, 3, 4, 5].map(k => <tr key={k}><td>{k}</td><td className="wdim">{a * k}</td><td><b>{T(k)}</b></td></tr>)}<tr><td>{n}</td><td className="wdim">{a * n}</td><td><b>{T(n)}</b></td></tr></tbody></table>
        <svg viewBox="0 0 300 180" className="wsvg"><WAxes P={P} lab={5} />{[1, 2, 3, 4, 5].map(k => <circle key={k} cx={P.X(k)} cy={P.Y(T(k))} r="5" className="w-pt" />)}</svg>
      </div>
      <div className="wnote">The difference between terms is {a}, so the sequence is linked to the {a} times table. Then adjust by {b >= 0 ? '+' : '−'}{Math.abs(b)}.</div>
      <WCtl><WSl label="a (difference)" v={a} set={setA} min={-4} max={6} /><WSl label="b" v={b} set={setB} min={-6} max={8} /><WSl label="Find term number" v={n} set={setN} min={6} max={100} /></WCtl>
    </div>
  );
};

/* 23.1 table → plot */
W.plotlin = function ({ cfg, onState }) {
  const fs = (cfg && cfg.fs) || [[2, 1], [-1, 4], [0.5, -2]];
  const [fi, setFi] = uSt(0), [solved, setSolved] = uSt(0);
  const [m, c] = fs[fi];
  const xs = [-2, -1, 0, 1, 2, 3];
  const [plotted, setPlotted] = uSt([]);
  uEf(() => setPlotted([]), [fi]);
  const P = wxPlane(320, 280, -4, 4, -6, 8, 10);
  const ref = uRf(null);
  const all = xs.every(x => plotted.includes(x));
  uEf(() => { if (all && fi + 1 > solved) setSolved(fi + 1); }, [all]);
  useRep(onState, { solved, total: fs.length, done: solved === fs.length, plotted: plotted.length }, [solved, plotted.length]);
  const click = e => {
    const s = ref.current, r = s.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width * 320, py = (e.clientY - r.top) / r.height * 280;
    const x = Math.round(P.ix(px)), y = P.iy(py);
    if (xs.includes(x) && Math.abs(y - (m * x + c)) < 0.6 && !plotted.includes(x)) setPlotted([...plotted, x]);
  };
  return (
    <div className="wbox">
      <div className="wbig" style={{ textAlign: 'center' }}>y = {wxLin(m, c)}</div>
      <table className="wtable"><tbody><tr><th>x</th>{xs.map(x => <td key={x}>{x}</td>)}</tr><tr><th>y</th>{xs.map(x => <td key={x} className={plotted.includes(x) ? 'w-ok' : ''}>{wxRat(m * x + c)}</td>)}</tr></tbody></table>
      <svg viewBox="0 0 320 280" className="wsvg" ref={ref} onClick={click} style={{ cursor: 'crosshair' }}>
        <WAxes P={P} />
        {all && <line x1={P.X(-4)} y1={P.Y(m * -4 + c)} x2={P.X(4)} y2={P.Y(m * 4 + c)} className="w-line" />}
        {plotted.map(x => <circle key={x} cx={P.X(x)} cy={P.Y(m * x + c)} r="5" className="w-pt" />)}
      </svg>
      <div className="wfoot"><span className="mono">{all ? 'All points plotted, joined with a ruler ✓' : `Tap the grid to plot each (x, y) pair · ${plotted.length}/${xs.length}`}</span>{all && fi < fs.length - 1 && <button className="btn small" onClick={() => setFi(fi + 1)}>Next function →</button>}</div>
    </div>
  );
};

/* 23.2 equation of a line wrapper */
W.linear = function ({ cfg, onState }) { return <div className="wbox"><LinearGraph onState={onState} target={cfg && cfg.target} /></div>; };

/* 23.3 real-life graphs: mobile plans */
W.reallife = function ({ cfg, onState }) {
  const [f1, setF1] = uSt(10), [r1, setR1] = uSt(2), [f2, setF2] = uSt(25), [r2, setR2] = uSt(0.5), [x, setX] = uSt(6);
  const P = wxPlane(380, 240, 0, 20, 0, 60, 26);
  const y1 = f1 + r1 * x, y2 = f2 + r2 * x;
  const cross = r1 !== r2 ? (f2 - f1) / (r1 - r2) : null;
  useRep(onState, { f1, r1, f2, r2, x, cross }, [f1, r1, f2, r2, x]);
  return (
    <div className="wbox">
      <div className="mono">Cost of two phone plans: $ against GB of data used</div>
      <svg viewBox="0 0 380 240" className="wsvg">
        <WAxes P={P} step={2} lab={4} />
        {[10, 20, 30, 40, 50, 60].map(v => <text key={v} x={22} y={P.Y(v) + 3} textAnchor="end">{v}</text>)}
        <line x1={P.X(0)} y1={P.Y(f1)} x2={P.X(20)} y2={P.Y(f1 + r1 * 20)} className="w-line" />
        <line x1={P.X(0)} y1={P.Y(f2)} x2={P.X(20)} y2={P.Y(f2 + r2 * 20)} className="w-line2" />
        {cross != null && cross > 0 && cross < 20 && <circle cx={P.X(cross)} cy={P.Y(f1 + r1 * cross)} r="6" className="w-cross" />}
        <line x1={P.X(x)} x2={P.X(x)} y1={P.Y(0)} y2={P.Y(60)} className="w-guide" />
      </svg>
      <WRead items={[['Plan A: ' + f1 + ' + ' + r1 + 'g', '$' + wxFmt(y1)], ['Plan B: ' + f2 + ' + ' + r2 + 'g', '$' + wxFmt(y2)], ['Same cost at', cross != null && cross > 0 ? wxFmt(cross, 1) + ' GB' : 'never']]} />
      <div className="wnote">The y-intercept is the fixed monthly fee. The gradient is the cost per GB. Where the lines cross, both plans cost the same.</div>
      <WCtl><WSl label="GB used" v={x} set={setX} min={0} max={20} /><WSl label="A fee" v={f1} set={setF1} min={0} max={30} /><WSl label="A per GB" v={r1} set={setR1} min={0.5} max={3} step={0.5} /><WSl label="B fee" v={f2} set={setF2} min={0} max={40} /><WSl label="B per GB" v={r2} set={setR2} min={0} max={3} step={0.5} /></WCtl>
    </div>
  );
};

/* 23.4 compare two lines */
W.twolines = function ({ cfg, onState }) {
  const [m1, setM1] = uSt(2), [c1, setC1] = uSt(-1), [m2, setM2] = uSt(-1), [c2, setC2] = uSt(5);
  const P = wxPlane(320, 280, -5, 5, -6, 8, 10);
  const par = m1 === m2; const ix = !par ? (c2 - c1) / (m1 - m2) : null;
  useRep(onState, { m1, c1, m2, c2, par, ix }, [m1, c1, m2, c2]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 320 280" className="wsvg"><WAxes P={P} /><line x1={P.X(-5)} y1={P.Y(m1 * -5 + c1)} x2={P.X(5)} y2={P.Y(m1 * 5 + c1)} className="w-line" /><line x1={P.X(-5)} y1={P.Y(m2 * -5 + c2)} x2={P.X(5)} y2={P.Y(m2 * 5 + c2)} className="w-line2" />{ix != null && Math.abs(ix) <= 5 && <circle cx={P.X(ix)} cy={P.Y(m1 * ix + c1)} r="6" className="w-cross" />}</svg>
        <div className="wlist">
          <div className="wbig" style={{ color: 'var(--acc)' }}>y = {wxLin(m1, c1)}</div>
          <div className="wbig" style={{ color: 'var(--ink-2)' }}>y = {wxLin(m2, c2)}</div>
          <div className="wnote">{par ? (c1 === c2 ? 'Same line!' : 'Equal gradients: the lines are parallel and never meet.') : `They intersect at (${wxRat(ix)}, ${wxRat(m1 * ix + c1)}). That point satisfies both equations.`}</div>
        </div>
      </div>
      <WCtl><WSl label="m₁" v={m1} set={setM1} min={-3} max={3} step={0.5} /><WSl label="c₁" v={c1} set={setC1} min={-5} max={6} /><WSl label="m₂" v={m2} set={setM2} min={-3} max={3} step={0.5} /><WSl label="c₂" v={c2} set={setC2} min={-5} max={6} /></WCtl>
    </div>
  );
};
