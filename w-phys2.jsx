/* Extra physics + Earth & space models */

/* Ruler reading with parallax */
W.ruler = function ({ cfg, onState }) {
  const lens = [4.3, 7.8, 2.6, 9.1];
  const [i, setI] = uSt(0), [eye, setEye] = uSt(0), [g, setG] = uSt(5), [res, setRes] = uSt(null), [solved, setSolved] = uSt(0);
  const L = lens[i], err = eye * 0.25;
  useRep(onState, { solved, total: lens.length, done: solved === lens.length, eye }, [solved, eye]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 440 150" className="wsvg">
        <rect x="20" y="70" width="400" height="40" fill="oklch(0.95 0.05 90)" stroke="var(--ink-3)" />
        {Array.from({ length: 101 }, (_, k) => <line key={k} x1={30 + k * 3.8} x2={30 + k * 3.8} y1="70" y2={k % 10 === 0 ? 90 : k % 5 === 0 ? 84 : 78} stroke="var(--ink-2)" />)}
        {Array.from({ length: 11 }, (_, k) => <text key={k} x={30 + k * 38} y="104" textAnchor="middle">{k}</text>)}
        <rect x="30" y="50" width={L * 38} height="16" rx="3" fill="var(--acc)" />
        <circle cx={30 + L * 38 + eye * 40} cy="18" r="9" fill="var(--card)" stroke="var(--ink)" /><circle cx={30 + L * 38 + eye * 40} cy="18" r="3" fill="var(--ink)" />
        <line x1={30 + L * 38 + eye * 40} y1="27" x2={30 + (L + err) * 38} y2="90" stroke="var(--ink-3)" strokeDasharray="3 3" />
      </svg>
      <div className="wnote">{eye === 0 ? 'Eye directly above the end: no parallax error.' : `Eye at an angle: it looks like ${wxFmt(L + err, 1)} cm. That is a parallax error.`} Read from 0, to the nearest mm.</div>
      <WCtl>
        <WSl label="Move your eye" v={eye} set={setEye} min={-2} max={2} step={1} fmt={v => v === 0 ? 'directly above' : v < 0 ? 'left' : 'right'} />
        <WSl label="Your reading (cm)" v={g} set={x => { setG(x); setRes(null); }} min={0} max={10} step={0.1} fmt={v => wxFmt(v, 1)} />
        <button className="btn small" onClick={() => { const ok = Math.abs(g - L) < 0.01; setRes(ok); if (ok && i + 1 > solved) setSolved(i + 1); }}>Check</button>
        {res && i < lens.length - 1 && <button className="btn small" onClick={() => { setI(i + 1); setRes(null); }}>Next object →</button>}
        {res != null && <span className="wnote" style={{ color: res ? 'var(--ok)' : 'var(--bad)' }}>{res ? 'Correct ✓' : 'Not quite: look straight down at the end.'}</span>}
      </WCtl>
    </div>
  );
};

/* Formula triangle */
W.triangle3 = function ({ cfg, onState }) {
  const F = (cfg && cfg.f) || { top: ['d', 'distance', 'm'], l: ['s', 'speed', 'm/s'], r: ['t', 'time', 's'], vals: { d: 120, s: 6, t: 20 } };
  const [hide, setHide] = uSt('top'), [seen, setSeen] = uSt(['top']);
  const v = F.vals, keys = { top: F.top, l: F.l, r: F.r };
  uEf(() => { if (!seen.includes(hide)) setSeen([...seen, hide]); }, [hide]);
  useRep(onState, { seen: seen.length }, [seen.length]);
  const eq = hide === 'top' ? `${F.top[0]} = ${F.l[0]} × ${F.r[0]} = ${v[F.l[0]]} × ${v[F.r[0]]} = ${v[F.top[0]]}` : hide === 'l' ? `${F.l[0]} = ${F.top[0]} ÷ ${F.r[0]} = ${v[F.top[0]]} ÷ ${v[F.r[0]]} = ${v[F.l[0]]}` : `${F.r[0]} = ${F.top[0]} ÷ ${F.l[0]} = ${v[F.top[0]]} ÷ ${v[F.l[0]]} = ${v[F.r[0]]}`;
  const cell = (k, x, y) => <g key={k} onClick={() => setHide(k)} style={{ cursor: 'pointer' }}><text x={x} y={y} textAnchor="middle" style={{ fontFamily: 'var(--serif)', fontSize: 34, fill: hide === k ? 'var(--rule)' : 'var(--ink)', fontStyle: 'italic' }}>{keys[k][0]}</text>{hide === k && <rect x={x - 26} y={y - 34} width="52" height="44" rx="6" fill="var(--acc)" opacity=".85" />}</g>;
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 220 190" className="wsvg" style={{ maxWidth: 240 }}>
          <polygon points="110,10 210,180 10,180" fill="var(--acc-t)" stroke="var(--acc)" strokeWidth="3" /><line x1="50" x2="170" y1="110" y2="110" stroke="var(--acc)" strokeWidth="2" /><line x1="110" x2="110" y1="110" y2="180" stroke="var(--acc)" strokeWidth="2" />
          {cell('top', 110, 90)}{cell('l', 68, 160)}{cell('r', 152, 160)}
        </svg>
        <div className="wlist"><div className="mono">Cover the one you want</div><div className="wbig">{eq}</div><div className="wnote">{keys[hide][1]} ({keys[hide][2]}). Side by side means ×; one above the other means ÷.</div></div>
      </div>
    </div>
  );
};

/* Walker: distance-time from motion */
W.walker = function ({ cfg, onState }) {
  const [plan, setPlan] = uSt([1, 1, 0, 0, 2, 2, 2, 0, 1, 1]);
  const [t, setT] = uSt(10);
  let d = 0; const pts = [[0, 0]]; plan.forEach((v, i) => { d += v; pts.push([i + 1, d]); });
  const P = wxPlane(380, 190, 0, 10, 0, 20, 26);
  useRep(onState, { plan: plan.join('') }, [plan.join('')]);
  const pos = pts[Math.min(t, 10)][1];
  return (
    <div className="wbox">
      <svg viewBox="0 0 380 50" className="wsvg"><line x1="20" x2="370" y1="40" y2="40" className="w-ax" /><circle cx={20 + pos * 17} cy="28" r="10" fill="var(--acc)" /><text x={20 + pos * 17} y="32" textAnchor="middle" style={{ fontSize: 10, fill: '#fff' }}></text></svg>
      <svg viewBox="0 0 380 200" className="wsvg">
        <WAxes P={P} step={1} lab={2} />
        <polyline points={pts.slice(0, t + 1).map(([x, y]) => P.X(x) + ',' + P.Y(y)).join(' ')} className="w-line" fill="none" />
      </svg>
      <div className="wbars">{plan.map((v, i) => <button key={i} className="wbar-s" onClick={() => setPlan(plan.map((x, j) => j === i ? (x + 1) % 3 : x))}><span className="mono">{i}–{i + 1}s</span><b>{['stop', 'walk', 'run'][v]}</b></button>)}</div>
      <div className="wnote">Tap each second to choose stop, walk (1 m/s) or run (2 m/s). The steeper the graph, the faster. Flat means stopped.</div>
      <WCtl><WSl label="Time" v={t} set={setT} min={0} max={10} fmt={v => v + ' s'} /></WCtl>
    </div>
  );
};

/* Free body diagram builder */
W.freebody = function ({ cfg, onState }) {
  const sc = { skydiver: ['Skydiver', [['Weight', 700, 'down'], ['Air resistance', 700, 'up']], 'Weight = air resistance: terminal velocity, a steady speed.'], car: ['Car accelerating', [['Driving force', 3000, 'right'], ['Friction & drag', 1200, 'left'], ['Weight', 10000, 'down'], ['Reaction', 10000, 'up']], 'Driving force > drag: unbalanced, so the car speeds up.'], book: ['Book on a table', [['Weight', 5, 'down'], ['Reaction force', 5, 'up']], 'Balanced: the book stays still.'], boat: ['Boat slowing down', [['Thrust', 200, 'right'], ['Water resistance', 600, 'left'], ['Weight', 5000, 'down'], ['Upthrust', 5000, 'up']], 'Resistance > thrust: the resultant is backwards, so the boat slows down.'] };
  const [k, setK] = uSt('skydiver'), [seen, setSeen] = uSt([]);
  uEf(() => { if (!seen.includes(k)) setSeen([...seen, k]); }, [k]);
  useRep(onState, { seen: seen.length }, [seen.length]);
  const [nm, fs, ex] = sc[k];
  const mx = Math.max(...fs.map(f => f[1]));
  const dir = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const rx = fs.reduce((a, f) => a + dir[f[2]][0] * f[1], 0), ry = fs.reduce((a, f) => a + dir[f[2]][1] * f[1], 0);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 240 240" className="wsvg" style={{ maxWidth: 260 }}>
          <defs><marker id="fba" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="var(--acc)" /></marker></defs>
          <rect x="95" y="95" width="50" height="50" rx="6" className="w-shape" />
          {fs.map(([l, v, d]) => { const L = 30 + v / mx * 60; const [dx, dy] = dir[d]; const x1 = 120 + dx * 25, y1 = 120 + dy * 25; return <g key={l}><line x1={x1} y1={y1} x2={x1 + dx * L} y2={y1 + dy * L} stroke="var(--acc)" strokeWidth="4" markerEnd="url(#fba)" /><text x={x1 + dx * (L + 14)} y={y1 + dy * (L + 14) + 4} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--ink)' }}>{l} {v} N</text></g>; })}
        </svg>
        <div className="wlist"><div className="wbig">{nm}</div><WRead items={[['Resultant →', wxFmt(rx, 0) + ' N'], ['Resultant ↓', wxFmt(ry, 0) + ' N']]} /><div className="wnote">{ex}</div><div className="wnote">The arrow length shows the size of the force; the direction shows where it acts.</div></div>
      </div>
      <WCtl><WSeg opts={Object.entries(sc).map(([a, b]) => [a, b[0]])} v={k} set={setK} /></WCtl>
    </div>
  );
};

/* Levers */
W.lever = function ({ cfg, onState }) {
  const [pv, setPv] = uSt(0.3);
  const load = 300, dl = pv * 4, de = (1 - pv) * 4, effort = load * dl / de;
  useRep(onState, { pv, effort }, [pv]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 420 160" className="wsvg">
        <rect x="20" y="96" width="380" height="10" rx="3" fill="oklch(0.65 0.06 70)" />
        <polygon points={`${20 + pv * 380},106 ${8 + pv * 380},140 ${32 + pv * 380},140`} fill="var(--ink-2)" />
        <rect x="22" y="56" width="40" height="40" rx="4" fill="var(--ink-3)" /><text x="42" y="80" textAnchor="middle" style={{ fontSize: 11, fill: '#fff' }}>{load} N</text>
        <line x1="392" y1="40" x2="392" y2="92" stroke="var(--acc)" strokeWidth="4" markerEnd="url(#fba2)" /><text x="392" y="34" textAnchor="middle" style={{ fontSize: 11 }}>{wxFmt(effort, 0)} N</text>
        <defs><marker id="fba2" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="var(--acc)" /></marker></defs>
      </svg>
      <WRead items={[['Load × distance', `${load} × ${wxFmt(dl, 1)} = ${wxFmt(load * dl, 0)} Nm`], ['Effort needed', wxFmt(effort, 0) + ' N']]} />
      <div className="wnote">Moving the pivot closer to the load makes the effort's distance bigger, so less force is needed. That is how crowbars, scissors and wheelbarrows act as force multipliers.</div>
      <WCtl><WSl label="Pivot position" v={pv} set={setPv} min={0.1} max={0.7} step={0.05} fmt={v => 'load distance ' + wxFmt(v * 4, 1) + ' m'} /></WCtl>
    </div>
  );
};

/* Pressure block faces */
W.pblock = function ({ cfg, onState }) {
  const faces = [['Large face', 0.4, 0.2], ['Side face', 0.4, 0.1], ['End face', 0.2, 0.1]];
  const [f, setF] = uSt(0), [seen, setSeen] = uSt([0]); const W8 = 80;
  uEf(() => { if (!seen.includes(f)) setSeen([...seen, f]); }, [f]);
  useRep(onState, { seen: seen.length }, [seen.length]);
  const [nm, a, b] = faces[f]; const A = a * b, p = W8 / A;
  const dims = [[0.4, 0.2, 0.1], [0.4, 0.1, 0.2], [0.2, 0.1, 0.4]][f];
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 220 200" className="wsvg" style={{ maxWidth: 240 }}>
          <rect x="0" y="170" width="220" height="30" fill="oklch(0.96 0.01 240)" />
          <g transform={`translate(${110 - dims[0] * 200},${170 - dims[2] * 300})`}><rect width={dims[0] * 400} height={dims[2] * 300} fill="var(--acc-t)" stroke="var(--acc)" strokeWidth="2" /></g>
          <rect x={110 - dims[0] * 200} y="170" width={dims[0] * 400} height={Math.min(28, p / 150)} fill="oklch(0.85 0.03 240)" />
        </svg>
        <div className="wlist"><div className="wbig">{nm} down</div><WRead items={[['Area', wxFmt(A, 2) + ' m²'], ['Weight', W8 + ' N'], ['Pressure', wxFmt(p, 0) + ' Pa']]} /><div className="wnote">Same block, same weight. The smallest area gives the greatest pressure, so it sinks deepest into the foam.</div></div>
      </div>
      <WCtl><WSeg opts={faces.map((x, i) => [i, x[0]])} v={f} set={setF} /></WCtl>
    </div>
  );
};

/* Liquid pressure with depth */
W.liquidp = function ({ cfg, onState }) {
  const [open, setOpen] = uSt([true, true, true]);
  useRep(onState, { all: open.every(Boolean) }, [open.join()]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 260 240" className="wsvg">
          <rect x="30" y="20" width="70" height="200" fill="oklch(0.85 0.06 230)" stroke="var(--ink-3)" strokeWidth="3" />
          {[60, 120, 180].map((y, i) => open[i] && <path key={i} d={`M100,${y} Q${120 + i * 30},${y} ${130 + i * 45},220`} fill="none" stroke="oklch(0.6 0.1 230)" strokeWidth="5" strokeLinecap="round" />)}
          {[60, 120, 180].map((y, i) => <circle key={'h' + i} cx="100" cy={y} r="5" fill="var(--ink)" onClick={() => setOpen(open.map((o, j) => j === i ? !o : o))} style={{ cursor: 'pointer' }} />)}
        </svg>
        <div className="wlist"><div className="wnote">Water squirts furthest from the lowest hole.</div><div className="wnote">Pressure in a liquid increases with depth, because there is more liquid above pushing down. Liquid particles are close together, so the pressure acts in all directions.</div><div className="wnote">That is why dams are thicker at the bottom.</div></div>
      </div>
    </div>
  );
};

/* Plane mirror image */
W.mirrorimg = function ({ cfg, onState }) {
  const [x, setX] = uSt(80), [y, setY] = uSt(110);
  const mx = 200;
  useRep(onState, { d: mx - x }, [x]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 220" className="wsvg">
        <line x1={mx} x2={mx} y1="10" y2="210" stroke="var(--ink)" strokeWidth="4" />
        <text x={x} y={y} textAnchor="middle" style={{ fontSize: 40 }}></text>
        <text x={2 * mx - x} y={y} textAnchor="middle" style={{ fontSize: 40, opacity: 0.4 }}></text>
        <line x1={x} y1={y - 15} x2={2 * mx - x} y2={y - 15} className="w-guide" />
        <circle cx="330" cy="190" r="6" fill="var(--ink)" />
        <line x1={x} y1={y - 25} x2={mx} y2={(y - 25 + 190) / 2 + ((y - 25) - 190) * (mx - x - (mx - x)) / 600} className="w-ray" />
        <line x1={mx} y1={(y - 25 + 190) / 2} x2="330" y2="190" className="w-ray" />
        <line x1={mx} y1={(y - 25 + 190) / 2} x2={2 * mx - x} y2={y - 25} stroke="oklch(0.7 0.15 80)" strokeDasharray="4 4" />
      </svg>
      <WRead items={[['Object distance', (mx - x) / 20 + ' cm'], ['Image distance', (mx - x) / 20 + ' cm'], ['Image', 'virtual, upright, same size, laterally inverted']]} />
      <WCtl><WSl label="Move the candle" v={x} set={setX} min={30} max={180} step={10} fmt={v => (200 - v) / 20 + ' cm from mirror'} /></WCtl>
    </div>
  );
};

/* Glass block refraction */
W.glassblock = function ({ cfg, onState }) {
  const [a, setA] = uSt(40);
  const n = 1.5, r = Math.asin(Math.sin(a * Math.PI / 180) / n);
  const x0 = 120, y0 = 70, h = 90;
  const x1 = x0 + h * Math.tan(r);
  const I = [x0 - 80 * Math.sin(a * Math.PI / 180), y0 - 80 * Math.cos(a * Math.PI / 180)];
  const O = [x1 + 90 * Math.sin(a * Math.PI / 180), y0 + h + 90 * Math.cos(a * Math.PI / 180)];
  useRep(onState, { a }, [a]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 380 260" className="wsvg">
        <rect x="40" y={y0} width="300" height={h} fill="oklch(0.9 0.03 220 / .6)" stroke="var(--ink-3)" />
        <line x1={x0} x2={x0} y1={y0 - 50} y2={y0 + 30} className="w-guide" /><line x1={x1} x2={x1} y1={y0 + h - 30} y2={y0 + h + 50} className="w-guide" />
        <polyline points={`${I[0]},${I[1]} ${x0},${y0} ${x1},${y0 + h} ${O[0]},${O[1]}`} className="w-ray" fill="none" />
        <line x1={x0} y1={y0} x2={x0 + 200 * Math.sin(a * Math.PI / 180)} y2={y0 + 200 * Math.cos(a * Math.PI / 180)} stroke="oklch(0.7 0.15 80)" strokeDasharray="3 4" opacity=".5" />
      </svg>
      <div className="wnote">The ray bends towards the normal going in (it slows down) and away from the normal coming out (it speeds up). The emerging ray is parallel to the incoming ray, just shifted sideways.</div>
      <WCtl><WSl label="Angle of incidence" v={a} set={setA} min={0} max={70} fmt={v => v + '°'} /></WCtl>
    </div>
  );
};

/* Test magnetic materials */
W.magtest = function ({ cfg, onState }) {
  const mats = [['Iron nail', 1], ['Steel paperclip', 1], ['Nickel coin', 1], ['Cobalt', 1], ['Copper wire', 0], ['Aluminium can', 0], ['Gold ring', 0], ['Plastic', 0], ['Wood', 0]];
  const [t, setT] = uSt({});
  useRep(onState, { n: Object.keys(t).length, all: Object.keys(t).length === mats.length }, [Object.keys(t).length]);
  return (
    <div className="wbox">
      <div className="wmagt">{mats.map(([m, y]) => <button key={m} className={'wtile' + (t[m] != null ? (y ? ' wmag-y' : ' wmag-n') : '')} onClick={() => setT({ ...t, [m]: y })}>{m}{t[m] != null && <span> {y ? ' attracted' : '· not attracted'}</span>}</button>)}</div>
      <div className="wnote">Only iron, nickel, cobalt (and steel, which contains iron) are magnetic. Not all metals are magnetic! Only a magnet can REPEL another magnet, so repulsion is the true test for a magnet.</div>
    </div>
  );
};

/* Climate graph */
W.climgraph = function ({ cfg, onState }) {
  const places = { London: [[8, 9, 12, 15, 18, 22, 24, 23, 20, 15, 11, 8], [55, 40, 41, 43, 49, 45, 45, 50, 49, 69, 59, 55]], Mumbai: [[31, 32, 33, 33, 34, 32, 30, 29, 30, 33, 34, 32], [1, 1, 0, 1, 11, 537, 840, 529, 297, 88, 21, 2]], Cairo: [[19, 21, 24, 28, 32, 34, 35, 34, 33, 30, 25, 20], [5, 4, 4, 1, 0, 0, 0, 0, 0, 1, 3, 6]] };
  const [p, setP] = uSt('London');
  const [T, R] = places[p]; const mr = Math.max(100, ...R);
  useRep(onState, { p }, [p]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 220" className="wsvg">
        <line x1="30" x2="370" y1="190" y2="190" className="w-ax" />
        {R.map((r, i) => <rect key={i} x={36 + i * 28} y={190 - r / mr * 170} width="20" height={r / mr * 170} fill="oklch(0.7 0.08 240)" />)}
        <polyline points={T.map((t, i) => (46 + i * 28) + ',' + (190 - t / 40 * 170)).join(' ')} fill="none" stroke="var(--bad)" strokeWidth="3" />
        {'JFMAMJJASOND'.split('').map((m, i) => <text key={i} x={46 + i * 28} y="205" textAnchor="middle">{m}</text>)}
        <text x="26" y="20" textAnchor="end" style={{ fill: 'var(--bad)' }}>40°C</text><text x="374" y="20" style={{ fill: 'oklch(0.55 0.08 240)' }}>{mr}mm</text>
      </svg>
      <div className="wnote">A climate graph shows the average temperature (line) and rainfall (bars) for each month, taken over 30 years. {p === 'Mumbai' ? 'The monsoon brings huge rainfall from June to September.' : p === 'Cairo' ? 'A desert climate: hot and almost no rain.' : 'A temperate climate: mild, with rain all year.'}</div>
      <WCtl><WSeg opts={Object.keys(places)} v={p} set={setP} /></WCtl>
    </div>
  );
};

/* Solar system scale */
W.solarsys = function ({ cfg, onState }) {
  const pl = [['Mercury', 0.39, 3], ['Venus', 0.72, 5], ['Earth', 1, 5], ['Mars', 1.52, 4], ['Asteroid belt', 2.7, 0], ['Jupiter', 5.2, 12], ['Saturn', 9.5, 10], ['Uranus', 19.2, 7], ['Neptune', 30, 7]];
  const [sel, setSel] = uSt(2);
  const X = au => 30 + Math.log10(au * 10 + 1) / Math.log10(301) * 380;
  useRep(onState, { sel }, [sel]);
  const [nm, au] = pl[sel];
  return (
    <div className="wbox">
      <svg viewBox="0 0 420 120" className="wsvg" style={{ background: 'oklch(0.18 0.02 270)', borderRadius: 6 }}>
        <circle cx="10" cy="60" r="26" fill="oklch(0.85 0.16 80)" />
        {pl.map(([n, a, r], i) => n === 'Asteroid belt' ? <g key={n} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>{Array.from({ length: 20 }, (_, k) => <circle key={k} cx={X(a) + (k % 5) * 3 - 6} cy={30 + k * 3} r="1.2" fill="oklch(0.7 0.03 60)" />)}</g>
          : <circle key={n} cx={X(a)} cy="60" r={r} fill={i === sel ? 'oklch(0.85 0.12 200)' : 'oklch(0.75 0.05 60)'} onClick={() => setSel(i)} style={{ cursor: 'pointer' }} />)}
      </svg>
      <WRead items={[['Selected', nm], ['Distance from Sun', au + ' AU'], ['Light takes', wxFmt(au * 8.3, 0) + ' min']]} />
      <div className="wnote">1 AU = the Earth–Sun distance (150 million km). Tap a planet. The asteroid belt between Mars and Jupiter is made of rocks left over from when the planets formed. (Distances shown on a log scale.)</div>
    </div>
  );
};
