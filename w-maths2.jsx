/* Extra maths models */

/* Tally & frequency table builder */
W.tally = function ({ cfg, onState }) {
  const cats = (cfg && cfg.cats) || ['Football', 'Cricket', 'Tennis', 'Swimming'];
  const stream = uMm(() => { const r = wxRng(17); return Array.from({ length: 24 }, () => Math.floor(r() * cats.length)); }, []);
  const [k, setK] = uSt(0);
  const cnt = cats.map((_, i) => stream.slice(0, k).filter(x => x === i).length);
  useRep(onState, { k, done: k === stream.length }, [k]);
  const marks = n => { const out = []; for (let g = 0; g < Math.floor(n / 5); g++) out.push(<span key={'g' + g} className="wtally five">||||</span>); if (n % 5) out.push(<span key="r" className="wtally">{'|'.repeat(n % 5)}</span>); return out; };
  return (
    <div className="wbox">
      <div className="wsl-data">{stream.map((x, i) => <span key={i} className={i < k ? 'used' : i === k ? 'next' : ''}>{cats[x]}</span>)}</div>
      <table className="wtable"><thead><tr><th>Sport</th><th>Tally</th><th>Frequency</th></tr></thead><tbody>{cats.map((c, i) => <tr key={c}><td>{c}</td><td style={{ textAlign: 'left' }}>{marks(cnt[i])}</td><td><b>{cnt[i]}</b></td></tr>)}<tr><td>Total</td><td></td><td><b>{k}</b></td></tr></tbody></table>
      <div className="wnote">Tally marks are grouped in fives (four strokes and a line across), so they are quick to count. This is a primary data collection sheet.</div>
      <WCtl><button className="btn small" disabled={k >= stream.length} onClick={() => setK(k + 1)}>Record next answer</button><button className="chip" onClick={() => setK(stream.length)}>Record all</button><button className="chip" onClick={() => setK(0)}>Reset</button></WCtl>
    </div>
  );
};

/* Number sets nested diagram */
W.numsets = function ({ cfg, onState }) {
  const nums = ['5', '−3', '0', '¾', '−2.5', '12', '0.3̇', '−7', '√9'];
  const where = { '5': 'N', '−3': 'Z', '0': 'Z', '¾': 'Q', '−2.5': 'Q', '12': 'N', '0.3̇': 'Q', '−7': 'Z', '√9': 'N' };
  const why = { '5': 'a counting number', '−3': 'a negative whole number', '0': 'a whole number but not a counting number', '¾': 'a fraction', '−2.5': '= −5/2', '12': 'a counting number', '0.3̇': '= 1/3, so recurring decimals are rational', '−7': 'a negative whole number', '√9': '= 3' };
  const [sel, setSel] = uSt(null), [seen, setSeen] = uSt([]);
  uEf(() => { if (sel && !seen.includes(sel)) setSeen([...seen, sel]); }, [sel]);
  useRep(onState, { seen: seen.length }, [seen.length]);
  const pos = { N: [[150, 140], [190, 140], [170, 160]], Z: [[90, 110], [110, 175], [250, 120]], Q: [[50, 70], [280, 60], [300, 190]] }; const used = { N: 0, Z: 0, Q: 0 };
  return (
    <div className="wbox">
      <svg viewBox="0 0 340 230" className="wsvg">
        <rect x="10" y="10" width="320" height="210" rx="16" fill="oklch(0.95 0.02 250)" stroke="var(--acc)" /><text x="24" y="32" style={{ fontSize: 13, fill: 'var(--acc)' }}>Rational numbers ℚ</text>
        <rect x="60" y="45" width="230" height="155" rx="14" fill="oklch(0.91 0.04 250)" stroke="var(--acc)" /><text x="72" y="64" style={{ fontSize: 13, fill: 'var(--acc)' }}>Integers ℤ</text>
        <rect x="120" y="85" width="120" height="95" rx="12" fill="oklch(0.86 0.06 250)" stroke="var(--acc)" /><text x="130" y="104" style={{ fontSize: 13, fill: 'var(--acc)' }}>Natural ℕ</text>
        {nums.map(n => { const s = where[n]; const [x, y] = pos[s][used[s]++ % 3]; return <g key={n} onClick={() => setSel(n)} style={{ cursor: 'pointer' }}><circle cx={x} cy={y} r="17" fill={sel === n ? 'var(--acc)' : 'var(--card)'} stroke="var(--acc)" /><text x={x} y={y + 5} textAnchor="middle" style={{ fontFamily: 'var(--serif)', fontSize: 14, fill: sel === n ? '#fff' : 'var(--ink)' }}>{n}</text></g>; })}
      </svg>
      <div className="wnote">{sel ? `${sel} is ${why[sel]}, so it sits in ${{ N: 'ℕ (and therefore ℤ and ℚ too)', Z: 'ℤ (and ℚ), but not ℕ', Q: 'ℚ but not ℤ' }[where[sel]]}.` : 'Tap a number to see why it sits in that set. Each set sits inside the next.'}</div>
    </div>
  );
};

/* Algebra tiles: collecting like terms */
W.algtiles = function ({ cfg, onState }) {
  const [t, setT] = uSt({ x2: 1, x: 3, n: 2, nx: -1, nn: -5 });
  const sx2 = t.x2, sx = t.x + t.nx, sn = t.n + t.nn;
  const expr = [sx2 ? (sx2 === 1 ? 'x²' : sx2 + 'x²') : '', sx ? (sx > 0 && sx2 ? ' + ' : sx < 0 ? ' − ' : '') + (Math.abs(sx) === 1 ? 'x' : Math.abs(sx) + 'x') : '', sn ? (sn > 0 && (sx2 || sx) ? ' + ' : sn < 0 ? ' − ' : '') + Math.abs(sn) : ''].join('') || '0';
  useRep(onState, { expr }, [expr]);
  const tile = (cls, w, h, txt, k) => <span key={k} className={'wat ' + cls} style={{ width: w, height: h }}>{txt}</span>;
  return (
    <div className="wbox">
      <div className="watb">
        {Array.from({ length: t.x2 }, (_, i) => tile('x2', 60, 60, 'x²', 'a' + i))}
        {Array.from({ length: t.x }, (_, i) => tile('x', 20, 60, 'x', 'b' + i))}
        {Array.from({ length: -t.nx }, (_, i) => tile('x neg', 20, 60, '−x', 'c' + i))}
        {Array.from({ length: t.n }, (_, i) => tile('one', 20, 20, '1', 'd' + i))}
        {Array.from({ length: -t.nn }, (_, i) => tile('one neg', 20, 20, '−1', 'e' + i))}
      </div>
      <div className="wbig" style={{ textAlign: 'center' }}>{t.x2 ? (t.x2 > 1 ? t.x2 : '') + 'x² + ' : ''}{t.x}x {t.nx ? '− ' + (-t.nx) + 'x ' : ''}+ {t.n} {t.nn ? '− ' + (-t.nn) : ''} = <b>{expr}</b></div>
      <div className="wnote">Only like terms can be combined: x² tiles, x tiles and unit tiles are different shapes. A positive and a negative tile of the same kind cancel to make zero.</div>
      <WCtl><WNum label="x²" v={t.x2} set={v => setT({ ...t, x2: v })} min={0} max={3} /><WNum label="+x" v={t.x} set={v => setT({ ...t, x: v })} min={0} max={6} /><WNum label="−x" v={-t.nx} set={v => setT({ ...t, nx: -v })} min={0} max={6} /><WNum label="+1" v={t.n} set={v => setT({ ...t, n: v })} min={0} max={8} /><WNum label="−1" v={-t.nn} set={v => setT({ ...t, nn: -v })} min={0} max={8} /></WCtl>
    </div>
  );
};

/* Expression tree (order of operations) */
W.exprtree = function ({ cfg, onState }) {
  const E = [{ e: '3 + 4 × 2²', tree: ['+', '3', ['×', '4', ['^', '2', '2']]] }, { e: '(8 − 2) ÷ 3 + 1', tree: ['+', ['÷', ['−', '8', '2'], '3'], '1'] }, { e: '10 − 6 ÷ 2 × 3', tree: ['−', '10', ['×', ['÷', '6', '2'], '3']] }];
  const [ei, setEi] = uSt(0), [steps, setSteps] = uSt(0);
  const ev = n => { if (!Array.isArray(n)) return +n; const [o, a, b] = n; const x = ev(a), y = ev(b); return { '+': x + y, '−': x - y, '×': x * y, '÷': x / y, '^': Math.pow(x, y) }[o]; };
  const depth = n => Array.isArray(n) ? 1 + Math.max(depth(n[1]), depth(n[2])) : 0;
  const D = depth(E[ei].tree);
  const nodes = [];
  const lay = (n, x, y, w) => { const id = nodes.length; const d = depth(n); const done = Array.isArray(n) && d <= steps; nodes.push({ x, y, t: done ? String(ev(n)) : Array.isArray(n) ? n[0] : n, op: Array.isArray(n), done }); if (Array.isArray(n) && !done) { const a = lay(n[1], x - w, y + 55, w / 2), b = lay(n[2], x + w, y + 55, w / 2); nodes[id].kids = [a, b]; } return id; };
  lay(E[ei].tree, 200, 30, 90);
  useRep(onState, { done: steps >= D, ei }, [steps, ei]);
  return (
    <div className="wbox">
      <div className="wbig" style={{ textAlign: 'center' }}>{E[ei].e} {steps >= D && <>= <b>{ev(E[ei].tree)}</b></>}</div>
      <svg viewBox="0 0 400 240" className="wsvg">
        {nodes.map((n, i) => n.kids && n.kids.map(k => <line key={i + '-' + k} x1={n.x} y1={n.y} x2={nodes[k].x} y2={nodes[k].y} className="w-cable" />))}
        {nodes.map((n, i) => <g key={i}><circle cx={n.x} cy={n.y} r="18" fill={n.done ? 'var(--acc)' : n.op ? 'var(--acc-t)' : 'var(--card)'} stroke="var(--acc)" /><text x={n.x} y={n.y + 5} textAnchor="middle" style={{ fontFamily: 'var(--serif)', fontSize: 16, fill: n.done ? '#fff' : 'var(--ink)' }}>{n.t === '^' ? 'x²' : n.t}</text></g>)}
      </svg>
      <div className="wnote">The deepest operation in the tree is worked out first; that is why BIDMAS works. Each step collapses one level.</div>
      <WCtl><WSeg opts={E.map((e, i) => [i, e.e])} v={ei} set={x => { setEi(x); setSteps(0); }} /><button className="btn small" disabled={steps >= D} onClick={() => setSteps(steps + 1)}>Evaluate next level</button><button className="chip" onClick={() => setSteps(0)}>Reset</button></WCtl>
    </div>
  );
};

/* Sign multiplication grid */
W.signgrid = function ({ cfg, onState }) {
  const [hl, setHl] = uSt(null), [seen, setSeen] = uSt(0);
  const v = [-3, -2, -1, 0, 1, 2, 3];
  useRep(onState, { seen }, [seen]);
  return (
    <div className="wbox">
      <div className="wsg">
        <b>×</b>{v.map(c => <b key={c}>{c}</b>)}
        {v.map(r => <React.Fragment key={r}><b>{r}</b>{v.map(c => { const p = r * c; return <span key={c} className={(p > 0 ? 'pos' : p < 0 ? 'neg' : '') + (hl && (hl[0] === r || hl[1] === c) ? ' hl' : '')} onClick={() => { setHl([r, c]); setSeen(s => s + 1); }}>{p}</span>; })}</React.Fragment>)}
      </div>
      <div className="wnote">{hl ? `${hl[0]} × ${hl[1]} = ${hl[0] * hl[1]}.` : 'Tap any cell.'} Look at the pattern: the top-left and bottom-right quarters (same signs) are positive, and the other two (different signs) are negative. Reading along each row, the numbers go up or down by the same amount, so the pattern continues past zero.</div>
    </div>
  );
};

/* Probability scale */
W.probscale = function ({ cfg, onState }) {
  const ev = [['Rolling a 7 on a normal dice', 0], ['Flipping heads', 0.5], ['The sun rising tomorrow', 1], ['Rolling a number less than 3', 1 / 3], ['Picking a red card from a deck', 0.5], ['Not rolling a 6', 5 / 6]];
  const [i, setI] = uSt(0), [g, setG] = uSt(0.5), [res, setRes] = uSt({});
  const ok = Math.abs(g - ev[i][1]) < 0.09;
  useRep(onState, { n: Object.keys(res).length }, [Object.keys(res).length]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 420 90" className="wsvg">
        <line x1="20" x2="400" y1="50" y2="50" stroke="var(--ink-2)" strokeWidth="3" />
        {[[0, 'impossible'], [0.5, 'even chance'], [1, 'certain']].map(([p, l]) => <g key={p}><line x1={20 + p * 380} x2={20 + p * 380} y1="42" y2="58" stroke="var(--ink-2)" strokeWidth="2" /><text x={20 + p * 380} y="76" textAnchor="middle">{p} · {l}</text></g>)}
        <circle cx={20 + g * 380} cy="50" r="9" fill="var(--acc)" />
        {Object.keys(res).map(k => <circle key={k} cx={20 + ev[k][1] * 380} cy="30" r="5" fill="var(--ok)" />)}
      </svg>
      <div className="wbig" style={{ fontSize: 20 }}>{ev[i][0]}</div>
      <div className="wfoot"><span className="wnote">{res[i] != null ? (res[i] ? `✓ P = ${wxRat(ev[i][1])}` : `Not quite: P = ${wxRat(ev[i][1])}`) : 'Place it on the scale.'}</span>
        <div className="row"><button className="btn small" onClick={() => setRes({ ...res, [i]: ok })}>Place</button>{res[i] != null && i < ev.length - 1 && <button className="btn small" onClick={() => setI(i + 1)}>Next →</button>}</div></div>
      <WCtl><WSl label="Probability" v={g} set={setG} min={0} max={1} step={0.01} fmt={v => wxFmt(v, 2)} /></WCtl>
    </div>
  );
};

/* Angles on a line / around a point */
W.anglept = function ({ cfg, onState }) {
  const [a, setA] = uSt(70), [b, setB] = uSt(50), [mode, setMode] = uSt('line');
  const c = mode === 'line' ? 180 - a - b : 360 - a - b;
  useRep(onState, { mode, c }, [mode, a, b]);
  const cx = 200, cy = 130, L = 100, ray = d => [cx + L * Math.cos(d * Math.PI / 180), cy - L * Math.sin(d * Math.PI / 180)];
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 230" className="wsvg">
        {mode === 'line' ? <line x1="80" x2="320" y1={cy} y2={cy} className="w-edge" /> : <line x1={cx} y1={cy} x2={ray(0)[0]} y2={ray(0)[1]} className="w-edge" />}
        {[a, a + b].map((d, i) => { const [x, y] = ray(d); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="w-edge" />; })}
        <path d={wxWedge(cx, cy, 34, 0, a)} className="w-wedge" /><path d={wxWedge(cx, cy, 44, a, a + b)} className="w-wedge2" /><path d={wxWedge(cx, cy, 28, a + b, mode === 'line' ? 180 : 360)} fill="oklch(0.85 0.06 145 / .6)" />
        <text x={ray(a / 2)[0] * 0.5 + cx * 0.5 + 10} y={ray(a / 2)[1] * 0.5 + cy * 0.5} className="w-lab">{a}°</text>
        <text x={ray(a + b / 2)[0] * 0.55 + cx * 0.45} y={ray(a + b / 2)[1] * 0.55 + cy * 0.45} className="w-lab">{b}°</text>
        <text x={ray((a + b + (mode === 'line' ? 180 : 360)) / 2)[0] * 0.5 + cx * 0.5} y={ray((a + b + (mode === 'line' ? 180 : 360)) / 2)[1] * 0.5 + cy * 0.5 + 6} className="w-lab">{c}°</text>
      </svg>
      <div className="wbig" style={{ textAlign: 'center' }}>{a} + {b} + {c} = {mode === 'line' ? 180 : 360}°</div>
      <div className="wnote">Angles on a straight line add to 180°. Angles around a point add to 360°.</div>
      <WCtl><WSeg opts={[['line', 'On a straight line'], ['point', 'Around a point']]} v={mode} set={setMode} /><WSl label="a" v={a} set={x => setA(Math.min(x, (mode === 'line' ? 170 : 340) - b))} min={10} max={mode === 'line' ? 150 : 300} /><WSl label="b" v={b} set={x => setB(Math.min(x, (mode === 'line' ? 170 : 340) - a))} min={10} max={mode === 'line' ? 150 : 300} /></WCtl>
    </div>
  );
};
