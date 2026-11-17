/* Statistics & probability widgets */
function wxStats(a) { const s = a.slice().sort((x, y) => x - y), n = s.length; const mean = s.reduce((p, q) => p + q, 0) / n; const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; const cnt = {}; s.forEach(v => cnt[v] = (cnt[v] || 0) + 1); const mx = Math.max(...Object.values(cnt)); const modes = Object.keys(cnt).filter(k => cnt[k] === mx).map(Number); return { mean, med, range: s[n - 1] - s[0], mode: mx > 1 ? modes.join(', ') : 'none', s }; }

/* 3.2 sampling methods */
W.sampling = function ({ cfg, onState }) {
  const pop = uMm(() => { const r = wxRng(42); return Array.from({ length: 120 }, (_, i) => ({ g: i < 72 ? 0 : 1, h: Math.round((i < 72 ? 148 : 156) + (r() - 0.5) * 22) })); }, []);
  const [method, setMethod] = uSt('random'), [n, setN] = uSt(12), [seed, setSeed] = uSt(1);
  const pick = uMm(() => {
    const r = wxRng(seed * 97 + n);
    if (method === 'random') return wxShuffle(pop.map((_, i) => i), seed * 13 + n).slice(0, n);
    if (method === 'systematic') { const k = Math.floor(120 / n), st = Math.floor(r() * k); return Array.from({ length: n }, (_, i) => st + i * k); }
    if (method === 'stratified') { const a = Math.round(n * 0.6); const g0 = wxShuffle(pop.map((p, i) => p.g === 0 ? i : -1).filter(i => i >= 0), seed).slice(0, a); const g1 = wxShuffle(pop.map((p, i) => p.g === 1 ? i : -1).filter(i => i >= 0), seed + 1).slice(0, n - a); return [...g0, ...g1]; }
    return Array.from({ length: n }, (_, i) => i);
  }, [method, n, seed]);
  const pm = pop.reduce((a, p) => a + p.h, 0) / 120, sm = pick.reduce((a, i) => a + pop[i].h, 0) / pick.length;
  const g1 = pick.filter(i => pop[i].g === 1).length;
  useRep(onState, { method, n, seed, err: Math.abs(sm - pm) }, [method, n, seed]);
  return (
    <div className="wbox">
      <div className="wdots">{pop.map((p, i) => <i key={i} className={(p.g ? 'g1' : 'g0') + (pick.includes(i) ? ' on' : '')} />)}</div>
      <div className="wnote mono">● Year 7 (60%) ● Year 8 (40%) · ringed = in the sample</div>
      <WRead items={[['Population mean height', wxFmt(pm, 1) + ' cm'], ['Sample mean', wxFmt(sm, 1) + ' cm'], ['Year 8 in sample', `${g1} of ${pick.length}`]]} />
      <div className="wnote">{{ random: 'Simple random: every person has an equal chance. Fair, but by luck it may over-pick one group.', systematic: `Systematic: pick every ${Math.floor(120 / n)}th person from a random start. Quick, but beware patterns in the list.`, stratified: 'Stratified: sample each group in proportion (60% : 40%). Represents groups fairly.', convenience: 'Convenience: the first people you find. Easy but likely biased (here all Year 7!).' }[method]}</div>
      <WCtl><WSeg opts={['random', 'systematic', 'stratified', 'convenience']} v={method} set={setMethod} /><WSl label="Sample size" v={n} set={setN} min={5} max={40} step={5} /><button className="btn small" onClick={() => setSeed(seed + 1)}>Take a new sample</button></WCtl>
    </div>
  );
};

/* 8.1 grouped frequency → frequency diagram */
W.freq = function ({ cfg, onState }) {
  const data = uMm(() => { const r = wxRng(5); return Array.from({ length: 40 }, () => Math.round(20 + r() * 25 + r() * 25)); }, []);
  const [w, setW] = uSt(10);
  const lo = 20, hi = 70, bins = []; for (let a = lo; a < hi; a += w) bins.push([a, a + w, data.filter(v => v >= a && v < a + w).length]);
  const mx = Math.max(...bins.map(b => b[2]));
  useRep(onState, { w }, [w]);
  return (
    <div className="wbox">
      <div className="mono">Time to run 200 m (s), 40 students</div>
      <div className="wsplit">
        <table className="wtable"><thead><tr><th>Time t (s)</th><th>Frequency</th></tr></thead><tbody>{bins.map(b => <tr key={b[0]}><td>{b[0]} ≤ t &lt; {b[1]}</td><td><b>{b[2]}</b></td></tr>)}</tbody></table>
        <svg viewBox="0 0 300 200" className="wsvg">
          <line x1="30" x2="290" y1="170" y2="170" className="w-ax" /><line x1="30" x2="30" y1="10" y2="170" className="w-ax" />
          {bins.map((b, i) => { const x = 30 + (b[0] - lo) / (hi - lo) * 260, bw = w / (hi - lo) * 260, bh = b[2] / mx * 150; return <g key={i}><rect x={x} y={170 - bh} width={bw} height={bh} className="w-bar" /><text x={x} y="184" textAnchor="middle">{b[0]}</text></g>; })}
          <text x="290" y="184" textAnchor="middle">{hi}</text>
        </svg>
      </div>
      <div className="wnote">Continuous data uses class intervals with no gaps between bars. Too wide hides the shape; too narrow looks spiky.</div>
      <WCtl><WSeg label="Class width" opts={[[5, '5 s'], [10, '10 s'], [25, '25 s']]} v={w} set={setW} /></WCtl>
    </div>
  );
};

/* 8.2 dual & compound bar charts */
W.bars = function ({ cfg, onState }) {
  const cats = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const [A, setA] = uSt([12, 15, 9, 14, 18]), [B, setB] = uSt([8, 10, 12, 6, 11]), [type, setType] = uSt('dual'), [sel, setSel] = uSt(0);
  const mx = type === 'dual' ? 20 : 32;
  useRep(onState, { type, A, B }, [type, JSON.stringify(A), JSON.stringify(B)]);
  return (
    <div className="wbox">
      <div className="mono">Lunches: <span style={{ color: 'var(--acc)' }}>■ hot</span> · <span style={{ color: 'var(--ink-3)' }}>■ packed</span></div>
      <svg viewBox="0 0 400 210" className="wsvg">
        <line x1="34" x2="390" y1="180" y2="180" className="w-ax" /><line x1="34" x2="34" y1="10" y2="180" className="w-ax" />
        {[0, 8, 16, 24, 32].filter(v => v <= mx).map(v => <text key={v} x="28" y={180 - v / mx * 165 + 3} textAnchor="end">{v}</text>)}
        {cats.map((c, i) => { const x = 50 + i * 68; const ha = A[i] / mx * 165, hb = B[i] / mx * 165; return <g key={c} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>
          {type === 'dual' ? <><rect x={x} y={180 - ha} width="24" height={ha} className="w-bar" /><rect x={x + 26} y={180 - hb} width="24" height={hb} className="w-bar2" /></>
            : <><rect x={x + 6} y={180 - ha} width="40" height={ha} className="w-bar" /><rect x={x + 6} y={180 - ha - hb} width="40" height={hb} className="w-bar2" /></>}
          <text x={x + 25} y="196" textAnchor="middle" style={{ fontWeight: sel === i ? 700 : 400 }}>{c}</text></g>; })}
      </svg>
      <WRead items={[[cats[sel] + ' hot', A[sel]], [cats[sel] + ' packed', B[sel]], [type === 'dual' ? 'Difference' : 'Total', type === 'dual' ? Math.abs(A[sel] - B[sel]) : A[sel] + B[sel]]]} />
      <div className="wnote">{type === 'dual' ? 'Dual bars sit side by side, which makes it easy to compare the two groups each day.' : 'Compound bars stack, which makes it easy to see the total each day and each part.'}</div>
      <WCtl><WSeg opts={[['dual', 'Dual'], ['compound', 'Compound']]} v={type} set={setType} /><WSl label={cats[sel] + ' hot'} v={A[sel]} set={v => setA(A.map((x, i) => i === sel ? v : x))} min={0} max={20} /><WSl label={cats[sel] + ' packed'} v={B[sel]} set={v => setB(B.map((x, i) => i === sel ? v : x))} min={0} max={12} /></WCtl>
    </div>
  );
};

/* 8.3 stem-and-leaf */
W.stemleaf = function ({ cfg, onState }) {
  const data = (cfg && cfg.data) || [23, 31, 45, 27, 38, 42, 31, 29, 35, 51, 47, 33, 26, 39, 44];
  const [k, setK] = uSt(0);
  const placed = data.slice(0, k), s = placed.slice().sort((a, b) => a - b);
  const stems = [2, 3, 4, 5];
  const st = k ? wxStats(placed) : null;
  useRep(onState, { k, total: data.length, done: k === data.length }, [k]);
  return (
    <div className="wbox">
      <div className="wsl-data">{data.map((d, i) => <span key={i} className={i < k ? 'used' : i === k ? 'next' : ''}>{d}</span>)}</div>
      <div className="wstem">{stems.map(sv => <div key={sv} className="wst-row"><b>{sv}</b><span className="bar">|</span>{s.filter(v => Math.floor(v / 10) === sv).map((v, i) => <span key={i} className="leaf">{v % 10}</span>)}</div>)}</div>
      <div className="wnote mono">Key: 3 | 1 means 31 minutes</div>
      {st && <WRead items={[['Median', wxFmt(st.med, 1)], ['Mode', st.mode], ['Range', st.range]]} />}
      <WCtl><button className="btn small" disabled={k >= data.length} onClick={() => setK(k + 1)}>Place next value</button><button className="chip" disabled={k >= data.length} onClick={() => setK(data.length)}>Place all</button><button className="chip" onClick={() => setK(0)}>Reset</button></WCtl>
    </div>
  );
};

/* 12.1 complementary events: spinner */
W.spinner = function ({ cfg, onState }) {
  const [n, setN] = uSt(8), [red, setRed] = uSt(3), [ang, setAng] = uSt(0), [last, setLast] = uSt(null);
  const p = red / n;
  useRep(onState, { n, red, p, last }, [n, red, last]);
  const spin = () => { const t = ang + 720 + Math.random() * 360; setAng(t); const pos = ((360 - (t % 360)) % 360) / (360 / n); setTimeout(() => setLast(Math.floor(pos) < red ? 'red' : 'not red'), 900); };
  return (
    <div className="wbox">
      <div className="wsplit">
        <div style={{ position: 'relative', maxWidth: 240, margin: '0 auto' }}>
          <svg viewBox="0 0 220 220" className="wsvg">
            <g style={{ transform: `rotate(${ang}deg)`, transformOrigin: '110px 110px', transition: 'transform .9s cubic-bezier(.2,.8,.3,1)' }}>
              {Array.from({ length: n }, (_, i) => <path key={i} d={wxWedge(110, 110, 100, 90 - (i + 1) * 360 / n, 90 - i * 360 / n)} className={i < red ? 'w-sec1' : 'w-sec0'} />)}
            </g>
            <polygon points="110,4 102,20 118,20" fill="var(--ink)" />
          </svg>
        </div>
        <div className="wlist">
          <WRead items={[['P(red)', `${red}/${n}`], ['P(not red)', `${n - red}/${n}`], ['Sum', '1']]} />
          <div className="wpb"><div className="wpb-t"><i style={{ width: p * 100 + '%' }} /><span>{wxFmt(p, 3)} + {wxFmt(1 - p, 3)} = 1</span></div></div>
          <button className="btn small" onClick={spin}>Spin</button>
          {last && <div className="wbig">{last === 'red' ? 'Red!' : 'Not red'}</div>}
        </div>
      </div>
      <div className="wnote">"Red" and "not red" are complementary: one of them must happen, so P(not A) = 1 − P(A).</div>
      <WCtl><WSl label="Equal sections" v={n} set={x => { setN(x); setRed(Math.min(red, x)); }} min={2} max={12} /><WSl label="Red sections" v={red} set={setRed} min={0} max={n} /></WCtl>
    </div>
  );
};

/* 12.2 experimental probability */
W.experiment = function ({ cfg, onState }) {
  const [kind, setKind] = uSt('dice'), [hits, setHits] = uSt(0), [tot, setTot] = uSt(0), [hist, setHist] = uSt([]);
  const th = kind === 'dice' ? 1 / 6 : kind === 'coin' ? 0.5 : 0.3;
  const label = kind === 'dice' ? 'rolling a 6' : kind === 'coin' ? 'heads' : 'drawing a red counter (3 red, 7 blue)';
  const run = k => { let h = hits, t = tot; const pts = hist.slice(); for (let i = 0; i < k; i++) { t++; if (Math.random() < th) h++; if (t <= 20 || t % Math.max(1, Math.floor(t / 40)) === 0) pts.push([t, h / t]); } setHits(h); setTot(t); setHist(pts.slice(-200)); };
  const reset = () => { setHits(0); setTot(0); setHist([]); };
  uEf(reset, [kind]);
  useRep(onState, { tot, rf: tot ? hits / tot : 0 }, [tot]);
  const maxT = Math.max(10, tot);
  const P = { X: t => 34 + Math.log10(t) / Math.log10(maxT) * 350, Y: v => 160 - v / Math.max(0.6, th * 2) * 150 };
  return (
    <div className="wbox">
      <div className="mono">Event: {label}</div>
      <svg viewBox="0 0 400 180" className="wsvg">
        <line x1="34" x2="390" y1="160" y2="160" className="w-ax" /><line x1="34" x2="34" y1="5" y2="160" className="w-ax" />
        <line x1="34" x2="390" y1={P.Y(th)} y2={P.Y(th)} className="w-guide" /><text x="388" y={P.Y(th) - 5} textAnchor="end">theoretical {wxFmt(th, 3)}</text>
        {hist.length > 1 && <polyline points={hist.map(([t, v]) => P.X(t) + ',' + P.Y(v)).join(' ')} className="w-line" fill="none" />}
        <text x="34" y="175">1</text><text x="388" y="175" textAnchor="end">{maxT} trials (log scale)</text>
      </svg>
      <WRead items={[['Trials', tot], ['Successes', hits], ['Relative frequency', tot ? wxFmt(hits / tot, 3) : '–']]} />
      <div className="wnote">With few trials the relative frequency jumps around. With many trials it settles close to the theoretical probability.</div>
      <WCtl><WSeg opts={[['dice', 'Dice'], ['coin', 'Coin'], ['bag', 'Bag']]} v={kind} set={setKind} /><button className="btn small" onClick={() => run(1)}>+1</button><button className="btn small" onClick={() => run(10)}>+10</button><button className="btn small" onClick={() => run(100)}>+100</button><button className="btn small" onClick={() => run(1000)}>+1000</button><button className="chip" onClick={reset}>Reset</button></WCtl>
    </div>
  );
};

/* 17.1 pie charts */
W.pie = function ({ cfg, onState }) {
  const cats = (cfg && cfg.cats) || ['Walk', 'Bus', 'Car', 'Cycle'];
  const [v, setV] = uSt((cfg && cfg.v) || [18, 12, 24, 6]);
  const tot = v.reduce((a, b) => a + b, 0) || 1;
  let a0 = 90;
  const cols = [0, 1, 2, 3].map(i => `oklch(${0.55 + i * 0.08} 0.1 ${250 + i * 40})`);
  useRep(onState, { v, tot }, [JSON.stringify(v)]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 220 220" className="wsvg" style={{ maxWidth: 240 }}>
          {v.map((x, i) => { const a = x / tot * 360; const d = a >= 359.9 ? null : wxWedge(110, 110, 100, a0 - a, a0); const el = d ? <path key={i} d={d} style={{ fill: cols[i] }} className="w-pie" /> : <circle key={i} cx="110" cy="110" r="100" style={{ fill: cols[i] }} />; a0 -= a; return el; })}
        </svg>
        <table className="wtable"><thead><tr><th></th><th>Freq.</th><th>Angle</th></tr></thead><tbody>{cats.map((c, i) => <tr key={c}><td><i className="wkey" style={{ background: cols[i] }} />{c}</td><td>{v[i]}</td><td>{wxFmt(v[i] / tot * 360, 1)}°</td></tr>)}<tr><td>Total</td><td>{tot}</td><td>360°</td></tr></tbody></table>
      </div>
      <div className="wnote">Each person gets 360 ÷ {tot} = {wxFmt(360 / tot, 2)}°. Multiply each frequency by that.</div>
      <WCtl>{cats.map((c, i) => <WSl key={c} label={c} v={v[i]} set={x => setV(v.map((y, j) => j === i ? x : y))} min={0} max={40} />)}</WCtl>
    </div>
  );
};

/* 17.2 infographic: pictogram with key */
W.infographic = function ({ cfg, onState }) {
  const items = [['Plastic bottles', 1240], ['Cans', 860], ['Paper (kg)', 520], ['Glass jars', 310]];
  const [key, setKey] = uSt(100);
  useRep(onState, { key }, [key]);
  return (
    <div className="wbox">
      <div className="mono">School recycling this term · each  = {key}</div>
      <div className="winfo">{items.map(([n, v]) => { const full = Math.floor(v / key), part = v / key - full; return <div key={n} className="wi-row"><span className="wi-l">{n}</span><span className="wi-icons">{Array.from({ length: Math.min(full, 30) }, (_, i) => <i key={i} />)}{part > 0.05 && <i style={{ clipPath: `inset(0 ${100 - part * 100}% 0 0)` }} />}{full > 30 && '…'}</span><b>{v}</b></div>; })}</div>
      <div className="wnote">An infographic must have a clear key. A good key keeps the picture readable: not too many icons, and partial icons are easy to estimate.</div>
      <WCtl><WSeg label="Key: one icon =" opts={[50, 100, 200, 500]} v={key} set={setKey} /></WCtl>
    </div>
  );
};

/* 17.3 scatter graph & correlation */
W.scatter = function ({ cfg, onState }) {
  const [r, setR] = uSt(0.8), [fit, setFit] = uSt(false), [seed, setSeed] = uSt(3);
  const pts = uMm(() => { const g = wxRng(seed); return Array.from({ length: 24 }, () => { const x = g() * 10; const n = (g() + g() + g() - 1.5) * 2.2; return [x, 5 + r * (x - 5) + n * Math.sqrt(1 - r * r) * 1.6 + (r === 0 ? 0 : 0)]; }); }, [r, seed]);
  const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length, my = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  const m = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0);
  const P = wxPlane(320, 260, 0, 10, -2, 12, 24);
  const label = Math.abs(r) < 0.2 ? 'No correlation' : (r > 0 ? 'Positive' : 'Negative') + (Math.abs(r) > 0.7 ? ', strong' : ', weak');
  useRep(onState, { r, label }, [r]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 320 260" className="wsvg">
          <line x1={P.X(0)} x2={P.X(10)} y1={P.Y(-2)} y2={P.Y(-2)} className="w-ax" /><line x1={P.X(0)} x2={P.X(0)} y1={P.Y(-2)} y2={P.Y(12)} className="w-ax" />
          <text x={P.X(5)} y="256" textAnchor="middle">hours of revision</text><text x="10" y={P.Y(5)} transform={`rotate(-90 10 ${P.Y(5)})`} textAnchor="middle">test score</text>
          {fit && <line x1={P.X(0)} y1={P.Y(my - m * mx)} x2={P.X(10)} y2={P.Y(my + m * (10 - mx))} className="w-line" />}
          {pts.map((p, i) => <circle key={i} cx={P.X(p[0])} cy={P.Y(p[1])} r="4.5" className="w-pt" />)}
        </svg>
        <div className="wlist"><div className="wbig">{label}</div><div className="wnote">{r > 0.2 ? 'As one variable increases, the other tends to increase.' : r < -0.2 ? 'As one variable increases, the other tends to decrease.' : 'No clear relationship.'} Correlation does not prove that one causes the other.</div></div>
      </div>
      <WCtl><WSl label="Relationship" v={r} set={setR} min={-1} max={1} step={0.1} fmt={v => wxFmt(v, 1)} /><button className="chip" onClick={() => setFit(!fit)}>{fit ? 'Hide' : 'Show'} line of best fit</button><button className="chip" onClick={() => setSeed(seed + 1)}>New data</button></WCtl>
    </div>
  );
};

/* 21.1 tree diagrams */
W.tree = function ({ cfg, onState }) {
  const [p, setP] = uSt(0.3), [q, setQ] = uSt(0.6), [hl, setHl] = uSt(null);
  const A = ['Rain', 'Dry'], B = ['Late', 'On time'];
  const pa = [p, 1 - p], pb = [q, 1 - q];
  const outs = []; pa.forEach((x, i) => pb.forEach((y, j) => outs.push([i, j, x * y])));
  useRep(onState, { p, q, hl }, [p, q, hl]);
  const yA = [70, 190], yB = [[40, 100], [160, 220]];
  return (
    <div className="wbox">
      <svg viewBox="0 0 440 250" className="wsvg">
        {pa.map((x, i) => <g key={i}><line x1="20" y1="130" x2="150" y2={yA[i]} className={'w-tree' + (hl && hl[0] === i ? ' on' : '')} /><text x="85" y={(130 + yA[i]) / 2 - 6} textAnchor="middle" className="w-lab">{wxFmt(x, 2)}</text><text x="158" y={yA[i] + 4} className="w-lab">{A[i]}</text>
          {pb.map((y, j) => <g key={j}><line x1="210" y1={yA[i]} x2="320" y2={yB[i][j]} className={'w-tree' + (hl && hl[0] === i && hl[1] === j ? ' on' : '')} /><text x="262" y={(yA[i] + yB[i][j]) / 2 - 5} textAnchor="middle" className="w-lab">{wxFmt(y, 2)}</text><text x="326" y={yB[i][j] + 4} className="w-lab" style={{ cursor: 'pointer' }} onClick={() => setHl([i, j])}>{B[j]} → {wxFmt(x * y, 3)}</text></g>)}</g>)}
      </svg>
      <div className="wnote">Tap an outcome. Multiply along the branches: P({hl ? `${A[hl[0]]} and ${B[hl[1]]}` : '…'}) = {hl ? `${wxFmt(pa[hl[0]], 2)} × ${wxFmt(pb[hl[1]], 2)} = ${wxFmt(pa[hl[0]] * pb[hl[1]], 3)}` : '…'}. All four outcomes add to {wxFmt(outs.reduce((a, o) => a + o[2], 0), 2)}.</div>
      <WCtl><WSl label="P(Rain)" v={p} set={setP} min={0.1} max={0.9} step={0.1} fmt={v => wxFmt(v, 1)} /><WSl label="P(Late)" v={q} set={setQ} min={0.1} max={0.9} step={0.1} fmt={v => wxFmt(v, 1)} /></WCtl>
    </div>
  );
};

/* 21.2 sample space + Venn */
W.samplespace = function ({ cfg, onState }) {
  const [mode, setMode] = uSt('grid');
  const evs = { 'sum = 7': (a, b) => a + b === 7, 'a double': (a, b) => a === b, 'sum ≥ 10': (a, b) => a + b >= 10, 'at least one 6': (a, b) => a === 6 || b === 6, 'product is even': (a, b) => (a * b) % 2 === 0 };
  const [ev, setEv] = uSt('sum = 7');
  const cnt = [1, 2, 3, 4, 5, 6].reduce((s, a) => s + [1, 2, 3, 4, 5, 6].filter(b => evs[ev](a, b)).length, 0);
  const sets = { A: n => n % 2 === 0, B: n => n % 3 === 0 };
  const nums = Array.from({ length: 20 }, (_, i) => i + 1);
  const [reg, setReg] = uSt('A∩B');
  const inR = n => ({ 'A∩B': sets.A(n) && sets.B(n), 'A∪B': sets.A(n) || sets.B(n), 'A only': sets.A(n) && !sets.B(n), "neither": !sets.A(n) && !sets.B(n) })[reg];
  useRep(onState, { mode, ev, reg }, [mode, ev, reg]);
  const zone = n => sets.A(n) && sets.B(n) ? 'c' : sets.A(n) ? 'a' : sets.B(n) ? 'b' : 'o';
  const zpos = { a: [95, 70], c: [200, 70], b: [300, 70], o: [30, 190] };
  const zc = { a: 0, b: 0, c: 0, o: 0 };
  return (
    <div className="wbox">
      {mode === 'grid' ? <>
        <div className="wss"><span />{[1, 2, 3, 4, 5, 6].map(b => <b key={b}>{b}</b>)}{[1, 2, 3, 4, 5, 6].map(a => <React.Fragment key={a}><b>{a}</b>{[1, 2, 3, 4, 5, 6].map(b => <span key={b} className={evs[ev](a, b) ? 'on' : ''}>{a + b}</span>)}</React.Fragment>)}</div>
        <div className="wbig" style={{ textAlign: 'center' }}>P({ev}) = {cnt}/36{wxG(cnt, 36) > 1 ? ` = ${cnt / wxG(cnt, 36)}/${36 / wxG(cnt, 36)}` : ''}</div>
        <div className="wnote">Two fair dice give 6 × 6 = 36 equally likely outcomes. Count the ones you want.</div>
      </> : <>
        <svg viewBox="0 0 400 230" className="wsvg">
          <rect x="4" y="4" width="392" height="222" rx="6" className={'w-uni' + (reg === 'neither' ? ' on' : '')} />
          <circle cx="150" cy="110" r="95" className={'w-venA' + (['A∪B', 'A only'].includes(reg) ? ' on' : '')} /><circle cx="250" cy="110" r="95" className={'w-venB' + (reg === 'A∪B' ? ' on' : '')} />
          <text x="80" y="30" className="w-lab">A: even</text><text x="290" y="30" className="w-lab">B: multiple of 3</text>
          {nums.map(n => { const z = zone(n); const k = zc[z]++; const [x0, y0] = zpos[z]; const cols = z === 'o' ? 10 : z === 'c' ? 2 : 3; return <text key={n} x={x0 + (k % cols) * (z === 'o' ? 36 : 26)} y={y0 + Math.floor(k / cols) * 26 + (z === 'o' ? 0 : 20)} className={'w-fac' + (inR(n) ? ' on' : '')}>{n}</text>; })}
        </svg>
        <div className="wbig" style={{ textAlign: 'center' }}>P({reg}) = {nums.filter(inR).length}/20</div>
      </>}
      <WCtl><WSeg opts={[['grid', 'Sample space'], ['venn', 'Venn diagram']]} v={mode} set={setMode} />{mode === 'grid' ? <WSeg opts={Object.keys(evs)} v={ev} set={setEv} /> : <WSeg opts={['A∩B', 'A∪B', 'A only', 'neither']} v={reg} set={setReg} />}</WCtl>
    </div>
  );
};

/* 24.1 comparing graphs: time series */
W.timeseries = function ({ cfg, onState }) {
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const A = [3, 4, 7, 10, 14, 17, 19, 19, 16, 12, 7, 4], B = [26, 27, 28, 29, 28, 26, 25, 25, 26, 27, 27, 26];
  const [type, setType] = uSt('line'), [show, setShow] = uSt('both');
  const P = wxPlane(400, 200, 0, 11, 0, 32, 26);
  useRep(onState, { type, show }, [type, show]);
  return (
    <div className="wbox">
      <div className="mono">Mean monthly temperature (°C): <span style={{ color: 'var(--acc)' }}>London</span> vs <span style={{ color: 'var(--ink-2)' }}>Mumbai</span></div>
      <svg viewBox="0 0 400 210" className="wsvg">
        <line x1={P.X(0) - 10} x2={P.X(11) + 10} y1={P.Y(0)} y2={P.Y(0)} className="w-ax" />
        {[0, 10, 20, 30].map(v => <g key={v}><line x1={P.X(0) - 10} x2={P.X(11) + 10} y1={P.Y(v)} y2={P.Y(v)} className="w-gl" /><text x="12" y={P.Y(v) + 3}>{v}</text></g>)}
        {months.map((m, i) => <text key={i} x={P.X(i)} y="205" textAnchor="middle">{m}</text>)}
        {type === 'line' ? <>{show !== 'B' && <polyline points={A.map((v, i) => P.X(i) + ',' + P.Y(v)).join(' ')} className="w-line" fill="none" />}{show !== 'A' && <polyline points={B.map((v, i) => P.X(i) + ',' + P.Y(v)).join(' ')} className="w-line2" fill="none" />}</>
          : months.map((m, i) => <g key={i}>{show !== 'B' && <rect x={P.X(i) - 12} y={P.Y(A[i])} width="11" height={P.Y(0) - P.Y(A[i])} className="w-bar" />}{show !== 'A' && <rect x={P.X(i) + 1} y={P.Y(B[i])} width="11" height={P.Y(0) - P.Y(B[i])} className="w-bar2" />}</g>)}
      </svg>
      <WRead items={[['London range', '16 °C'], ['Mumbai range', '4 °C'], ['Best for trend', type === 'line' ? 'line graph ✓' : 'bars show single values']]} />
      <div className="wnote">Time series data is usually shown with a line graph, because the line shows how the value changes over time. A large range means the temperature varies a lot through the year.</div>
      <WCtl><WSeg opts={[['line', 'Line graph'], ['bar', 'Dual bar']]} v={type} set={setType} /><WSeg opts={[['both', 'Both'], ['A', 'London'], ['B', 'Mumbai']]} v={show} set={setShow} /></WCtl>
    </div>
  );
};

/* 24.2 compare distributions */
W.distrib = function ({ cfg, onState }) {
  const base = [12, 14, 15, 15, 16, 17, 18, 18, 18, 20, 22];
  const [shift, setShift] = uSt(2), [spread, setSpread] = uSt(1.6), [stat, setStat] = uSt('median');
  const B = base.map(v => Math.round(17 + (v - 17) * spread + shift));
  const a = wxStats(base), b = wxStats(B);
  const P = { X: v => 20 + (v - 0) / 40 * 380 };
  useRep(onState, { shift, spread, stat }, [shift, spread, stat]);
  const dots = (arr, y, cls) => { const c = {}; return arr.map((v, i) => { c[v] = (c[v] || 0) + 1; return <circle key={i} cx={P.X(v)} cy={y - (c[v] - 1) * 10} r="4.5" className={cls} />; }); };
  const val = s => stat === 'mean' ? s.mean : s.med;
  return (
    <div className="wbox">
      <div className="mono">Plant heights (cm): ● Group A (no fertiliser) · ● Group B (fertiliser)</div>
      <svg viewBox="0 0 420 210" className="wsvg">
        <line x1="20" x2="400" y1="90" y2="90" className="w-ax" /><line x1="20" x2="400" y1="185" y2="185" className="w-ax" />
        {[0, 10, 20, 30, 40].map(v => <text key={v} x={P.X(v)} y="200" textAnchor="middle">{v}</text>)}
        {dots(base, 84, 'w-pt')}{dots(B, 179, 'w-pt2')}
        <line x1={P.X(val(a))} x2={P.X(val(a))} y1="20" y2="94" className="w-guide" /><line x1={P.X(val(b))} x2={P.X(val(b))} y1="115" y2="189" className="w-guide" />
        <line x1={P.X(a.s[0])} x2={P.X(a.s[a.s.length - 1])} y1="96" y2="96" className="w-rangebar" /><line x1={P.X(b.s[0])} x2={P.X(b.s[b.s.length - 1])} y1="191" y2="191" className="w-rangebar" />
      </svg>
      <table className="wtable"><thead><tr><th></th><th>Mean</th><th>Median</th><th>Mode</th><th>Range</th></tr></thead><tbody><tr><td>A</td><td>{wxFmt(a.mean, 1)}</td><td>{a.med}</td><td>{a.mode}</td><td>{a.range}</td></tr><tr><td>B</td><td>{wxFmt(b.mean, 1)}</td><td>{b.med}</td><td>{b.mode}</td><td>{b.range}</td></tr></tbody></table>
      <div className="wnote">Compare an average AND the spread: "On average B is {val(b) > val(a) ? 'taller' : val(b) < val(a) ? 'shorter' : 'the same'} ({stat} {wxFmt(val(b), 1)} vs {wxFmt(val(a), 1)}), and B's heights are {b.range > a.range ? 'more' : b.range < a.range ? 'less' : 'equally'} spread out (range {b.range} vs {a.range})."</div>
      <WCtl><WSl label="Shift B" v={shift} set={setShift} min={-6} max={10} /><WSl label="Spread of B" v={spread} set={setSpread} min={0.4} max={2.4} step={0.2} fmt={v => '×' + wxFmt(v, 1)} /><WSeg opts={['mean', 'median']} v={stat} set={setStat} /></WCtl>
    </div>
  );
};
