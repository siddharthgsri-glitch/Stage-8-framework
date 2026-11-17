/* Geometry widgets */

/* 2.1 quadrilateral hierarchy: drag vertices of a shape, it classifies itself */
W.quad = function ({ cfg, onState }) {
  const presets = { square: [[80, 60], [220, 60], [220, 200], [80, 200]], kite: [[150, 40], [230, 110], [150, 230], [70, 110]], trap: [[100, 60], [200, 60], [250, 200], [50, 200]], para: [[100, 60], [250, 60], [200, 200], [50, 200]] };
  const [pts, setPts] = uSt(presets.square);
  const ref = uRf(null);
  const snap = v => Math.round(v / 10) * 10;
  const [start, bind] = useDrag(ref, (i, [x, y]) => setPts(p => p.map((q, k) => k === i ? [snap(Math.max(10, Math.min(290, x))), snap(Math.max(10, Math.min(250, y)))] : q)));
  const v = (a, b) => [b[0] - a[0], b[1] - a[1]], len = a => Math.hypot(a[0], a[1]);
  const S = [0, 1, 2, 3].map(i => v(pts[i], pts[(i + 1) % 4])), L = S.map(len);
  const par = (a, b) => Math.abs(a[0] * b[1] - a[1] * b[0]) < 1e-6 * len(a) * len(b) + 0.5;
  const eq = (a, b) => Math.abs(a - b) < 0.5;
  const perp = (a, b) => Math.abs(a[0] * b[0] + a[1] * b[1]) < 0.5;
  const p1 = par(S[0], S[2]), p2 = par(S[1], S[3]);
  const right = [0, 1, 2, 3].every(i => perp(S[i], S[(i + 1) % 4]));
  const allEq = L.every(l => eq(l, L[0]));
  const kite = (eq(L[0], L[1]) && eq(L[2], L[3])) || (eq(L[1], L[2]) && eq(L[3], L[0]));
  let name = 'Quadrilateral';
  if (p1 && p2) name = right ? (allEq ? 'Square' : 'Rectangle') : (allEq ? 'Rhombus' : 'Parallelogram');
  else if (p1 || p2) name = 'Trapezium';
  else if (kite) name = 'Kite';
  const props = [['Opposite sides parallel', p1 && p2], ['At least one pair parallel', p1 || p2], ['All sides equal', allEq], ['All angles 90°', right], ['Two pairs of adjacent sides equal', kite || allEq]];
  const [seen, setSeen] = uSt([]);
  uEf(() => { if (!seen.includes(name)) setSeen([...seen, name]); }, [name]);
  useRep(onState, { name, seen }, [name, seen.length]);
  const chain = { Square: 'Square → Rectangle & Rhombus → Parallelogram → Trapezium → Quadrilateral', Rectangle: 'Rectangle → Parallelogram → Trapezium → Quadrilateral', Rhombus: 'Rhombus → Parallelogram & Kite → Quadrilateral', Parallelogram: 'Parallelogram → Trapezium → Quadrilateral', Trapezium: 'Trapezium → Quadrilateral', Kite: 'Kite → Quadrilateral', Quadrilateral: 'Quadrilateral' };
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 300 260" className="wsvg" ref={ref} {...bind} style={{ touchAction: 'none' }}>
          {Array.from({ length: 29 }, (_, i) => <line key={'g' + i} x1={10 + i * 10} x2={10 + i * 10} y1="10" y2="250" className="w-gl" />)}
          {Array.from({ length: 25 }, (_, i) => <line key={'h' + i} y1={10 + i * 10} y2={10 + i * 10} x1="10" x2="290" className="w-gl" />)}
          <polygon points={pts.map(p => p.join(',')).join(' ')} className="w-shape" />
          {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="10" className="w-handle" onPointerDown={start(i)} />)}
        </svg>
        <div className="wlist">
          <div className="wbig">{name}</div>
          <div className="wnote">{chain[name]}</div>
          <ul className="wprops">{props.map(([l, ok]) => <li key={l} className={ok ? 'ok' : ''}>{ok ? '✓' : '·'} {l}</li>)}</ul>
          <div className="chips">{Object.keys(presets).map(k => <button key={k} className="chip" onClick={() => setPts(presets[k])}>{k}</button>)}</div>
        </div>
      </div>
      <div className="wnote">Drag the corners. Found so far: {seen.join(', ')}</div>
    </div>
  );
};

/* 2.2 regular polygon symmetry */
W.polysym = function ({ cfg, onState }) {
  const [n, setN] = uSt(5), [rot, setRot] = uSt(0), [showL, setShowL] = uSt(true);
  const R = 95, cx = 120, cy = 120;
  const pts = Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
  const lines = Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / n; return [cx + 110 * Math.cos(a), cy + 110 * Math.sin(a), cx - 110 * Math.cos(a), cy - 110 * Math.sin(a)]; });
  const turns = Math.round(rot / (360 / n));
  useRep(onState, { n, rot, turns }, [n, rot]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 240 240" className="wsvg" style={{ maxWidth: 280 }}>
          {showL && lines.map((l, i) => <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} className="w-mirror" />)}
          <polygon points={pts.map(p => p.join(',')).join(' ')} className="w-ghost" />
          <g style={{ transform: `rotate(${rot}deg)`, transformOrigin: '120px 120px', transition: 'transform .5s' }}>
            <polygon points={pts.map(p => p.join(',')).join(' ')} className="w-shape" />
            <circle cx={pts[0][0]} cy={pts[0][1]} r="6" className="w-pt2" />
          </g>
        </svg>
        <div className="wlist">
          <div className="wbig">Regular {['', '', '', 'triangle', 'square', 'pentagon', 'hexagon', 'heptagon', 'octagon', 'nonagon', 'decagon'][n]}</div>
          <WRead items={[['Sides', n], ['Lines of symmetry', n], ['Rotational order', n]]} />
          <div className="wnote">Rotated {rot}° = {turns} × {wxFmt(360 / n, 1)}°. It fits onto itself {n} times in a full turn.</div>
          <div className="row"><button className="btn small" onClick={() => setRot(rot + 360 / n)}>Rotate {wxFmt(360 / n, 1)}°</button><button className="chip" onClick={() => setShowL(!showL)}>{showL ? 'Hide' : 'Show'} mirror lines</button></div>
        </div>
      </div>
      <WCtl><WSl label="Number of sides" v={n} set={x => { setN(x); setRot(0); }} min={3} max={10} /></WCtl>
    </div>
  );
};

/* 2.3 3D shapes: Euler */
W.euler = function ({ cfg, onState }) {
  const solids = { 'Cube': [8, 6, 12], 'Triangular prism': [6, 5, 9], 'Square pyramid': [5, 5, 8], 'Tetrahedron': [4, 4, 6], 'Pentagonal prism': [10, 7, 15], 'Hexagonal pyramid': [7, 7, 12] };
  const [s, setS] = uSt('Cube'), [ang, setAng] = uSt(30);
  const [V, F, E] = solids[s];
  const [seen, setSeen] = uSt([]);
  uEf(() => { if (!seen.includes(s)) setSeen([...seen, s]); }, [s]);
  useRep(onState, { s, seen }, [s, seen.length]);
  const geo = (() => {
    const pr = (n, h) => { const b = Array.from({ length: n }, (_, i) => { const a = i * 2 * Math.PI / n; return [Math.cos(a), -h, Math.sin(a)]; }); return { v: [...b, ...b.map(p => [p[0], h, p[2]])], e: [...b.map((_, i) => [i, (i + 1) % n]), ...b.map((_, i) => [n + i, n + (i + 1) % n]), ...b.map((_, i) => [i, n + i])] }; };
    const py = n => { const b = Array.from({ length: n }, (_, i) => { const a = i * 2 * Math.PI / n + Math.PI / 4; return [Math.cos(a), 0.7, Math.sin(a)]; }); return { v: [...b, [0, -0.9, 0]], e: [...b.map((_, i) => [i, (i + 1) % n]), ...b.map((_, i) => [i, n])] }; };
    return { 'Cube': (() => { const g = pr(4, 0.7); g.v = g.v.map(p => { const a = Math.atan2(p[2], p[0]) + Math.PI / 4; return [Math.cos(a), p[1], Math.sin(a)]; }); return g; })(), 'Triangular prism': pr(3, 0.7), 'Square pyramid': py(4), 'Tetrahedron': py(3), 'Pentagonal prism': pr(5, 0.6), 'Hexagonal pyramid': py(6) }[s];
  })();
  const a = ang * Math.PI / 180, tilt = 0.45;
  const proj = p => { const x = p[0] * Math.cos(a) - p[2] * Math.sin(a), z = p[0] * Math.sin(a) + p[2] * Math.cos(a); const y = p[1] * Math.cos(tilt) - z * Math.sin(tilt); return [130 + x * 80, 120 + y * 80]; };
  const P = geo.v.map(proj);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 260 240" className="wsvg" style={{ maxWidth: 300 }}>
          {geo.e.map(([i, j], k) => <line key={k} x1={P[i][0]} y1={P[i][1]} x2={P[j][0]} y2={P[j][1]} className="w-edge" />)}
          {P.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" className="w-pt" />)}
        </svg>
        <div className="wlist">
          <WRead items={[['Vertices V', V], ['Faces F', F], ['Edges E', E]]} />
          <div className="wbig" style={{ textAlign: 'center' }}>{V} + {F} − {E} = <b>{V + F - E}</b></div>
          <div className="wnote">Euler's formula: V + F − E = 2, for every one of these solids.</div>
        </div>
      </div>
      <WCtl><WSeg opts={Object.keys(solids)} v={s} set={setS} /><WSl label="Turn" v={ang} set={setAng} min={0} max={360} fmt={v => v + '°'} /></WCtl>
    </div>
  );
};

/* 2.4 circumference */
W.circum = function ({ cfg, onState }) {
  const [d, setD] = uSt(4), [roll, setRoll] = uSt(0);
  const C = Math.PI * d, s = 26;
  useRep(onState, { d, C, roll }, [d, roll]);
  const r = d / 2 * s, cx = 30 + r + roll * C * s, cy = 140 - r;
  return (
    <div className="wbox">
      <svg viewBox="0 0 460 170" className="wsvg">
        <line x1="30" x2="450" y1="140" y2="140" className="w-ax" />
        <line x1="30" x2={30 + roll * C * s} y1="140" y2="140" className="w-int" />
        {Array.from({ length: 17 }, (_, i) => <g key={i}><line x1={30 + i * s} x2={30 + i * s} y1="136" y2="144" className="w-ax" />{i % 2 === 0 && <text x={30 + i * s} y="158" textAnchor="middle">{i}</text>}</g>)}
        <g style={{ transform: `translate(${cx}px, ${cy}px) rotate(${roll * 360}deg)` }}>
          <circle r={r} className="w-shape" /><line x1={-r} x2={r} y1="0" y2="0" className="w-line2" /><circle cx="0" cy={r} r="5" className="w-pt2" />
        </g>
      </svg>
      <WRead items={[['Diameter d', d + ' units'], ['Circumference C', wxFmt(C, 2)], ['C ÷ d', wxFmt(C / d, 5) + '…']]} />
      <div className="wnote">Roll the circle one full turn: the distance it travels is its circumference. C ÷ d is always π ≈ 3.14, so C = πd.</div>
      <WCtl><WSl label="Diameter" v={d} set={x => { setD(x); setRoll(0); }} min={1} max={4.5} step={0.5} /><WSl label="Roll" v={roll} set={setRoll} min={0} max={1} step={0.02} fmt={v => Math.round(v * 100) + '% of a turn'} /></WCtl>
    </div>
  );
};

/* 6.1 parallel lines angles */
W.parallel = function ({ cfg, onState }) {
  const [t, setT] = uSt(60), [pair, setPair] = uSt('corresponding');
  const cx = 200; const y1 = 70, y2 = 170; const k = 1 / Math.tan(t * Math.PI / 180);
  const X1 = cx - (y1 - 120) * k, X2 = cx - (y2 - 120) * k;
  const pairs = { corresponding: [[1, 'tr'], [2, 'tr']], alternate: [[1, 'br'], [2, 'tl']], 'co-interior': [[1, 'br'], [2, 'tr']], 'vertically opposite': [[1, 'tr'], [1, 'bl']] };
  const angOf = q => q === 'tr' || q === 'bl' ? t : 180 - t;
  const wedge = (X, Y, q) => { const map = { tr: [0, t], tl: [t, 180], bl: [180, 180 + t], br: [180 + t, 360] }; const [a0, a1] = map[q]; return wxWedge(X, Y, 26, a0, a1); };
  const pts = { 1: [X1, y1], 2: [X2, y2] };
  useRep(onState, { t, pair }, [t, pair]);
  const [A, B] = pairs[pair]; const eq = pair !== 'co-interior';
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 240" className="wsvg">
        <line x1="20" x2="380" y1={y1} y2={y1} className="w-edge" /><line x1="20" x2="380" y1={y2} y2={y2} className="w-edge" />
        <text x="370" y={y1 - 6} className="w-lab">›</text><text x="370" y={y2 - 6} className="w-lab">›</text>
        <line x1={cx - (10 - 120) * k} y1="10" x2={cx - (230 - 120) * k} y2="230" className="w-edge" />
        <path d={wedge(...pts[A[0]], A[1])} className="w-wedge" /><path d={wedge(...pts[B[0]], B[1])} className="w-wedge2" />
      </svg>
      <WRead items={[['Angle 1', angOf(A[1]) + '°'], ['Angle 2', angOf(B[1]) + '°'], ['Rule', eq ? 'equal' : 'add to 180°']]} />
      <div className="wnote">{{ corresponding: 'Corresponding angles are in matching positions (an F shape), so they are equal.', alternate: 'Alternate angles are on opposite sides of the transversal, inside the parallels (a Z shape), so they are equal.', 'co-interior': 'Co-interior angles are on the same side, between the parallels (a C shape), so they add to 180°.', 'vertically opposite': 'Vertically opposite angles are opposite each other at a crossing, so they are equal.' }[pair]}</div>
      <WCtl><WSeg opts={Object.keys(pairs)} v={pair} set={setPair} /><WSl label="Transversal angle" v={t} set={setT} min={30} max={150} fmt={v => v + '°'} /></WCtl>
    </div>
  );
};

/* 6.2 triangle angles + exterior */
W.triangle = function ({ cfg, onState }) {
  const [pts, setPts] = uSt([[60, 190], [300, 190], [170, 50]]);
  const ref = uRf(null);
  const [start, bind] = useDrag(ref, (i, [x, y]) => setPts(p => p.map((q, k) => k === i ? [Math.max(20, Math.min(300, x)), Math.max(20, Math.min(200, y))] : q)));
  const ang = (a, b, c) => { const v1 = [b[0] - a[0], b[1] - a[1]], v2 = [c[0] - a[0], c[1] - a[1]]; return Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2))))) * 180 / Math.PI; };
  const [A, B, C] = pts; const a = Math.round(ang(A, B, C)), b = Math.round(ang(B, A, C)), c = 180 - a - b;
  const ext = 180 - b;
  useRep(onState, { a, b, c, ext }, [a, b, c]);
  const dir = [B[0] - A[0], B[1] - A[1]], dl = Math.hypot(...dir); const E = [B[0] + dir[0] / dl * 80, B[1] + dir[1] / dl * 80];
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 220" className="wsvg" ref={ref} {...bind} style={{ touchAction: 'none' }}>
        <line x1={B[0]} y1={B[1]} x2={E[0]} y2={E[1]} className="w-guide" />
        <polygon points={pts.map(p => p.join(',')).join(' ')} className="w-shape" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="10" className="w-handle" onPointerDown={start(i)} />)}
        <text x={A[0] + 18} y={A[1] - 8} className="w-lab">{a}°</text><text x={B[0] - 38} y={B[1] - 8} className="w-lab">{b}°</text><text x={C[0] - 12} y={C[1] + 28} className="w-lab">{c}°</text>
        <text x={B[0] + 14} y={B[1] - 8} className="w-lab" style={{ fill: 'var(--acc)' }}>{ext}°</text>
      </svg>
      <WRead items={[['Interior sum', `${a} + ${b} + ${c} = 180°`], ['Exterior angle', ext + '°'], ['Opposite interiors', `${a} + ${c} = ${a + c}°`]]} />
      <div className="wnote">Drag the corners. The exterior angle always equals the sum of the two interior opposite angles.</div>
    </div>
  );
};

/* 6.3 bearings */
W.bearing = function ({ cfg, onState }) {
  const [b, setB] = uSt(70);
  const r = b * Math.PI / 180, cx = 150, cy = 130, L = 95;
  const Bx = cx + L * Math.sin(r), By = cy - L * Math.cos(r);
  useRep(onState, { b, back: (b + 180) % 360 }, [b]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 300 260" className="wsvg" style={{ maxWidth: 320 }}>
          <line x1={cx} x2={cx} y1="20" y2="240" className="w-guide" /><text x={cx} y="16" textAnchor="middle" className="w-lab">N</text>
          <path d={wxArc(cx, cy, 34, 90, 90 - b)} className="w-arcp" />
          <line x1={cx} y1={cy} x2={Bx} y2={By} className="w-line" /><circle cx={cx} cy={cy} r="5" className="w-pt" /><circle cx={Bx} cy={By} r="6" className="w-pt2" />
          <text x={cx - 14} y={cy + 18} className="w-lab">A</text><text x={Bx + 8} y={By - 6} className="w-lab">B</text>
          <line x1={Bx} x2={Bx} y1={By - 40} y2={By + 40} className="w-guide" style={{ opacity: .5 }} />
        </svg>
        <div className="wlist">
          <div className="wbig">Bearing of B from A: <b>{String(b).padStart(3, '0')}°</b></div>
          <div className="wnote">Measured clockwise from North, always written with 3 figures.</div>
          <div className="wbig" style={{ fontSize: 20 }}>Bearing of A from B: {String((b + 180) % 360).padStart(3, '0')}°</div>
          <div className="wnote">Back bearing = bearing ± 180°.</div>
        </div>
      </div>
      <WCtl><WSl label="Bearing" v={b} set={setB} min={0} max={359} fmt={v => String(v).padStart(3, '0') + '°'} /></WCtl>
    </div>
  );
};

/* 11.2 area of parallelogram / trapezium */
W.area = function ({ cfg, onState }) {
  const [shape, setShape] = uSt('para'), [a, setA] = uSt(4), [b, setB] = uSt(8), [h, setH] = uSt(5), [cut, setCut] = uSt(0);
  const s = 24, ox = 30, oy = 190;
  const area = shape === 'para' ? b * h : (a + b) / 2 * h;
  useRep(onState, { shape, a, b, h, cut, area }, [shape, a, b, h, cut]);
  const off = 2;
  let body;
  if (shape === 'para') {
    const dx = cut * (-off * s + b * s - b * s) ; // slide triangle
    body = <>
      <polygon points={`${ox + off * s},${oy - h * s} ${ox + off * s + b * s},${oy - h * s} ${ox + b * s},${oy} ${ox + off * s},${oy}`} className="w-shape" />
      <g style={{ transform: `translateX(${cut * b * s}px)`, transition: 'transform .4s' }}><polygon points={`${ox},${oy} ${ox + off * s},${oy - h * s} ${ox + off * s},${oy}`} className="w-shape2" /></g>
      <line x1={ox + off * s} x2={ox + off * s} y1={oy - h * s} y2={oy} className="w-guide" />
    </>;
  } else {
    const tx = ox + (b - a) / 2 * s;
    body = <>
      <polygon points={`${tx},${oy - h * s} ${tx + a * s},${oy - h * s} ${ox + b * s},${oy} ${ox},${oy}`} className="w-shape" />
      {cut > 0 && <g style={{ opacity: cut }}><polygon points={`${ox + b * s},${oy} ${tx + a * s},${oy - h * s} ${tx + a * s + b * s},${oy - h * s} ${ox + b * s + a * s},${oy}`} className="w-shape2" /></g>}
      <line x1={tx} x2={tx} y1={oy - h * s} y2={oy} className="w-guide" />
    </>;
  }
  return (
    <div className="wbox">
      <svg viewBox="0 0 460 210" className="wsvg">{body}</svg>
      <div className="wbig" style={{ textAlign: 'center' }}>{shape === 'para' ? <>A = b × h = {b} × {h} = <b>{area}</b></> : <>A = ½(a + b)h = ½({a} + {b}) × {h} = <b>{wxFmt(area)}</b></>}</div>
      <div className="wnote">{shape === 'para' ? 'Cut off the triangle and slide it across: the parallelogram becomes a rectangle with the same base and perpendicular height.' : 'Two copies of the trapezium make a parallelogram with base (a + b). Half of that is the trapezium.'}</div>
      <WCtl><WSeg opts={[['para', 'Parallelogram'], ['trap', 'Trapezium']]} v={shape} set={x => { setShape(x); setCut(0); }} />{shape === 'trap' && <WSl label="Top a" v={a} set={x => setA(Math.min(x, b))} min={1} max={b} />}<WSl label="Base b" v={b} set={setB} min={3} max={shape === 'trap' ? 8 : 12} /><WSl label="Height h" v={h} set={setH} min={2} max={7} /><button className="btn small" onClick={() => setCut(cut ? 0 : 1)}>{cut ? 'Reset' : shape === 'para' ? 'Cut & slide' : 'Add a copy'}</button></WCtl>
    </div>
  );
};

/* iso helpers */
function iso(x, y, z) { return [x * 0.87 - y * 0.87, -z + (x + y) * 0.5]; }

/* 11.3 volume of triangular prism */
W.prism = function ({ cfg, onState }) {
  const [b, setB] = uSt(4), [h, setH] = uSt(3), [l, setL] = uSt(6);
  const A = b * h / 2, V = A * l, s = 18;
  const P = (x, y, z) => { const [u, v] = iso(x * s, y * s, z * s); return [190 + u, 170 + v]; };
  const f = [[0, 0, 0], [b, 0, 0], [b / 2, 0, h]], back = f.map(([x, y, z]) => [x, l, z]);
  const F = f.map(p => P(...p)), B = back.map(p => P(...p));
  useRep(onState, { b, h, l, V }, [b, h, l]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 380 220" className="wsvg">
        {[0, 1, 2].map(i => <polygon key={i} points={[F[i], F[(i + 1) % 3], B[(i + 1) % 3], B[i]].map(p => p.join(',')).join(' ')} className="w-face" style={{ opacity: 0.35 + i * 0.15 }} />)}
        <polygon points={F.map(p => p.join(',')).join(' ')} className="w-shape" />
        <text x={(F[0][0] + F[1][0]) / 2} y={(F[0][1] + F[1][1]) / 2 + 16} textAnchor="middle" className="w-lab">b = {b}</text>
        <text x={(F[1][0] + B[1][0]) / 2 + 10} y={(F[1][1] + B[1][1]) / 2 + 14} className="w-lab">l = {l}</text>
      </svg>
      <WRead items={[['Cross-section area', `½ × ${b} × ${h} = ${wxFmt(A)}`], ['Length', l], ['Volume', `${wxFmt(A)} × ${l} = ${wxFmt(V)} cm³`]]} />
      <div className="wnote">Volume of any prism = area of cross-section × length.</div>
      <WCtl><WSl label="Base b" v={b} set={setB} min={2} max={8} /><WSl label="Height h" v={h} set={setH} min={2} max={7} /><WSl label="Length l" v={l} set={setL} min={2} max={9} /></WCtl>
    </div>
  );
};

/* 11.4 surface area: net unfolding of cuboid */
W.net = function ({ cfg, onState }) {
  const [a, setA] = uSt(4), [b, setB] = uSt(3), [c, setC] = uSt(2), [shape, setShape] = uSt('cuboid');
  const s = 16;
  const faces = shape === 'cuboid' ? [['top', a, b], ['bottom', a, b], ['front', a, c], ['back', a, c], ['left', b, c], ['right', b, c]] : [['base', a, a], ['side', a, c, 't'], ['side', a, c, 't'], ['side', a, c, 't'], ['side', a, c, 't']];
  const SA = shape === 'cuboid' ? 2 * (a * b + a * c + b * c) : a * a + 4 * (a * c / 2);
  useRep(onState, { a, b, c, shape, SA }, [a, b, c, shape]);
  const ox = 200, oy = 115;
  let rects;
  if (shape === 'cuboid') {
    rects = [[ox - a * s / 2, oy - b * s / 2, a * s, b * s, 0], [ox - a * s / 2, oy - b * s / 2 - c * s, a * s, c * s, 1], [ox - a * s / 2, oy + b * s / 2, a * s, c * s, 1], [ox - a * s / 2, oy + b * s / 2 + c * s, a * s, b * s, 0], [ox - a * s / 2 - c * s, oy - b * s / 2, c * s, b * s, 2], [ox + a * s / 2, oy - b * s / 2, c * s, b * s, 2]];
  }
  const cols = ['var(--acc-t)', 'color-mix(in oklab, var(--acc) 30%, var(--card))', 'color-mix(in oklab, var(--gold) 30%, var(--card))'];
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 250" className="wsvg">
        {shape === 'cuboid' ? rects.map(([x, y, w, h, k], i) => <rect key={i} x={x} y={y - 0} width={w} height={h} style={{ fill: cols[k] }} className="w-netf" />)
          : <g><rect x={ox - a * s / 2} y={oy - a * s / 2} width={a * s} height={a * s} style={{ fill: cols[0] }} className="w-netf" />
            {[0, 90, 180, 270].map(r => <polygon key={r} points={`${ox - a * s / 2},${oy - a * s / 2} ${ox + a * s / 2},${oy - a * s / 2} ${ox},${oy - a * s / 2 - c * s}`} style={{ fill: cols[1], transform: `rotate(${r}deg)`, transformOrigin: `${ox}px ${oy}px` }} className="w-netf" />)}</g>}
      </svg>
      <div className="wbig" style={{ textAlign: 'center' }}>{shape === 'cuboid' ? <>SA = 2({a}×{b} + {a}×{c} + {b}×{c}) = <b>{SA}</b></> : <>SA = {a}² + 4 × ½ × {a} × {c} = <b>{SA}</b></>} cm²</div>
      <div className="wnote">Surface area = total area of all faces in the net. Matching colours show faces that come in equal pairs.</div>
      <WCtl><WSeg opts={[['cuboid', 'Cuboid'], ['pyr', 'Square pyramid']]} v={shape} set={setShape} /><WSl label="Length a" v={a} set={setA} min={2} max={6} />{shape === 'cuboid' && <WSl label="Width b" v={b} set={setB} min={1} max={5} />}<WSl label={shape === 'cuboid' ? 'Height c' : 'Slant height'} v={c} set={setC} min={1} max={5} /></WCtl>
    </div>
  );
};

/* 15.1 midpoint */
W.midpoint = function ({ cfg, onState }) {
  const [A, setA] = uSt([-3, 1]), [B, setB] = uSt([4, 5]);
  const P = wxPlane(320, 280, -6, 6, -4, 7, 10);
  const ref = uRf(null);
  const [start, bind] = useDrag(ref, (k, [x, y]) => { const p = [Math.round(P.ix(x)), Math.round(P.iy(y))]; if (p[0] < -6 || p[0] > 6 || p[1] < -4 || p[1] > 7) return; (k ? setB : setA)(p); });
  const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  useRep(onState, { A, B, M }, [A[0], A[1], B[0], B[1]]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 320 280" className="wsvg" ref={ref} {...bind} style={{ touchAction: 'none' }}>
          <WAxes P={P} />
          <line x1={P.X(A[0])} y1={P.Y(A[1])} x2={P.X(B[0])} y2={P.Y(B[1])} className="w-line" />
          <circle cx={P.X(M[0])} cy={P.Y(M[1])} r="6" className="w-pt2" />
          <circle cx={P.X(A[0])} cy={P.Y(A[1])} r="10" className="w-handle" onPointerDown={start(0)} />
          <circle cx={P.X(B[0])} cy={P.Y(B[1])} r="10" className="w-handle" onPointerDown={start(1)} />
        </svg>
        <div className="wlist">
          <div className="wbig">A({A.join(', ')})  B({B.join(', ')})</div>
          <div className="wsteps"><div className="wst-line"><span className="mono">x</span><span>({A[0]} + {B[0]}) ÷ 2 = {wxRat(M[0])}</span></div><div className="wst-line"><span className="mono">y</span><span>({A[1]} + {B[1]}) ÷ 2 = {wxRat(M[1])}</span></div></div>
          <div className="wbig">Midpoint <b>({wxRat(M[0])}, {wxRat(M[1])})</b></div>
          <div className="wnote">Drag A and B. The midpoint is the mean of the x-coordinates and the mean of the y-coordinates.</div>
        </div>
      </div>
    </div>
  );
};

/* 18 transformations */
const T_SHAPE = [[1, 1], [3, 1], [3, 2], [2, 2], [2, 4], [1, 4]];
W.transform = function ({ cfg, onState }) {
  const kind = (cfg && cfg.kind) || 'translate';
  const [vx, setVx] = uSt(3), [vy, setVy] = uSt(-2);
  const [mirror, setMirror] = uSt('y=0');
  const [ang, setAng] = uSt(90), [dirn, setDirn] = uSt('cw'), [cx, setCx] = uSt(0), [cy, setCy] = uSt(0);
  const [k, setK] = uSt(2), [ex, setEx] = uSt(0), [ey, setEy] = uSt(0);
  const P = wxPlane(320, 320, -8, 8, -8, 8, 8);
  const img = T_SHAPE.map(([x, y]) => {
    if (kind === 'translate') return [x + vx, y + vy];
    if (kind === 'reflect') return ({ 'y=0': [x, -y], 'x=0': [-x, y], 'y=x': [y, x], 'y=-x': [-y, -x], 'x=4': [8 - x, y], 'y=-1': [x, -2 - y] })[mirror];
    if (kind === 'rotate') { const a = (dirn === 'cw' ? -1 : 1) * ang * Math.PI / 180; const dx = x - cx, dy = y - cy; return [wxR(cx + dx * Math.cos(a) - dy * Math.sin(a), 6), wxR(cy + dx * Math.sin(a) + dy * Math.cos(a), 6)]; }
    return [ex + k * (x - ex), ey + k * (y - ey)];
  });
  const st = { kind, vx, vy, mirror, ang, dirn, cx, cy, k, ex, ey };
  useRep(onState, st, [kind, vx, vy, mirror, ang, dirn, cx, cy, k, ex, ey]);
  const poly = pts => pts.map(([x, y]) => P.X(x) + ',' + P.Y(y)).join(' ');
  const mline = { 'y=0': [[-8, 0], [8, 0]], 'x=0': [[0, -8], [0, 8]], 'y=x': [[-8, -8], [8, 8]], 'y=-x': [[-8, 8], [8, -8]], 'x=4': [[4, -8], [4, 8]], 'y=-1': [[-8, -1], [8, -1]] }[mirror];
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 320 320" className="wsvg">
          <WAxes P={P} />
          {kind === 'reflect' && <line x1={P.X(mline[0][0])} y1={P.Y(mline[0][1])} x2={P.X(mline[1][0])} y2={P.Y(mline[1][1])} className="w-mirror" />}
          {kind === 'enlarge' && T_SHAPE.map(([x, y], i) => <line key={i} x1={P.X(ex)} y1={P.Y(ey)} x2={P.X(img[i][0])} y2={P.Y(img[i][1])} className="w-ray" />)}
          <polygon points={poly(T_SHAPE)} className="w-obj" />
          <polygon points={poly(img)} className="w-img" style={{ transition: 'all .35s' }} />
          {kind === 'translate' && <line x1={P.X(1)} y1={P.Y(1)} x2={P.X(1 + vx)} y2={P.Y(1 + vy)} className="w-vec" markerEnd="url(#warr)" />}
          {(kind === 'rotate' || kind === 'enlarge') && <circle cx={P.X(kind === 'rotate' ? cx : ex)} cy={P.Y(kind === 'rotate' ? cy : ey)} r="5" className="w-pt2" />}
          <defs><marker id="warr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="var(--ink)" /></marker></defs>
        </svg>
        <div className="wlist">
          <div className="wbig">{kind === 'translate' ? <>Vector <span className="wvec"><span>{vx}</span><span>{vy}</span></span></> : kind === 'reflect' ? <>Reflect in {mirror.replace('-', '−')}</> : kind === 'rotate' ? <>Rotate {ang}° {dirn === 'cw' ? 'clockwise' : 'anticlockwise'} about ({cx}, {cy})</> : <>Enlarge ×{k}, centre ({ex}, {ey})</>}</div>
          <div className="wnote">{kind === 'translate' ? 'The top number moves right (+) or left (−); the bottom moves up (+) or down (−). The image is congruent.' : kind === 'reflect' ? 'Each point is the same perpendicular distance from the mirror line, on the other side. The image is congruent.' : kind === 'rotate' ? 'You need three facts: centre, angle and direction. The image is congruent.' : 'Each image point is k times as far from the centre. Lengths × k. The image is similar, not congruent.'}</div>
          <div className="wnote mono">Object ○ grey · Image ● colour</div>
        </div>
      </div>
      <WCtl>
        {kind === 'translate' && <><WSl label="Right / left" v={vx} set={setVx} min={-6} max={5} /><WSl label="Up / down" v={vy} set={setVy} min={-6} max={4} /></>}
        {kind === 'reflect' && <WSeg label="Mirror line" opts={['y=0', 'x=0', 'y=x', 'y=-x', 'x=4', 'y=-1'].map(m => [m, m.replace('-', '−')])} v={mirror} set={setMirror} />}
        {kind === 'rotate' && <><WSeg opts={[90, 180, 270].map(a => [a, a + '°'])} v={ang} set={setAng} /><WSeg opts={[['cw', 'Clockwise'], ['acw', 'Anticlockwise']]} v={dirn} set={setDirn} /><WSl label="Centre x" v={cx} set={setCx} min={-3} max={3} /><WSl label="Centre y" v={cy} set={setCy} min={-3} max={3} /></>}
        {kind === 'enlarge' && <><WSl label="Scale factor" v={k} set={setK} min={1} max={3} /><WSl label="Centre x" v={ex} set={setEx} min={-4} max={2} /><WSl label="Centre y" v={ey} set={setEy} min={-4} max={2} /></>}
      </WCtl>
    </div>
  );
};

/* 25.1 / 25.2 constructions (step-through) */
W.construct = function ({ cfg, onState }) {
  const kind = (cfg && cfg.kind) || 'sss';
  const [step, setStep] = uSt(0), [r, setR] = uSt(70);
  const plans = {
    sss: { steps: ['Draw the base AB = 7 cm with a ruler.', 'Set compasses to 5 cm. Draw an arc from A.', 'Set compasses to 6 cm. Draw an arc from B.', 'Join A and B to where the arcs cross: that is C.'], title: 'Triangle from three sides (SSS)' },
    sas: { steps: ['Draw AB = 7 cm.', 'Place the protractor on A. Mark 50°.', 'Draw a line from A through the mark and measure 5 cm: point C.', 'Join C to B.'], title: 'Triangle from two sides and the angle between (SAS)' },
    perp: { steps: ['Draw the line segment AB.', 'Open compasses to more than half of AB. Arc above and below from A.', 'Keep the same radius. Arc above and below from B.', 'Join the two crossing points: the perpendicular bisector, through the midpoint at 90°.'], title: 'Perpendicular bisector of a line segment' },
    angle: { steps: ['Draw the angle at vertex O.', 'Arc from O cutting both arms at P and Q.', 'Same radius: arc from P and from Q so they cross at R.', 'Join O to R: it splits the angle into two equal halves.'], title: 'Bisector of an angle' },
  };
  const pl = plans[kind]; const n = pl.steps.length;
  useRep(onState, { step, done: step >= n - 1, kind }, [step]);
  const A = [80, 200], B = [300, 200];
  const svg = () => {
    if (kind === 'sss' || kind === 'sas') {
      const C = kind === 'sss' ? [80 + (49 - 36 + 25) / 14 * 31.4 * 0 + 160 * 0.55 - 15, 200 - 140 * 0.85] : [80 + 157 * Math.cos(50 * Math.PI / 180), 200 - 157 * Math.sin(50 * Math.PI / 180)];
      const ca = Math.hypot(C[0] - A[0], C[1] - A[1]), cb = Math.hypot(C[0] - B[0], C[1] - B[1]);
      return <>
        <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} className="w-edge" />
        {kind === 'sss' && step >= 1 && <path d={wxArc(A[0], A[1], ca, 30, 90)} className="w-arcc" />}
        {kind === 'sss' && step >= 2 && <path d={wxArc(B[0], B[1], cb, 100, 160)} className="w-arcc" />}
        {kind === 'sas' && step >= 1 && <><path d={wxArc(A[0], A[1], 40, 0, 50)} className="w-arcp" /><text x={A[0] + 48} y={A[1] - 14} className="w-lab">50°</text></>}
        {kind === 'sas' && step >= 2 && <line x1={A[0]} y1={A[1]} x2={C[0]} y2={C[1]} className="w-edge" />}
        {step >= 3 && <><line x1={A[0]} y1={A[1]} x2={C[0]} y2={C[1]} className="w-edge" /><line x1={B[0]} y1={B[1]} x2={C[0]} y2={C[1]} className="w-edge" /><circle cx={C[0]} cy={C[1]} r="4" className="w-pt2" /><text x={C[0] - 4} y={C[1] - 10} className="w-lab">C</text></>}
        <text x={A[0] - 14} y={A[1] + 4} className="w-lab">A</text><text x={B[0] + 6} y={B[1] + 4} className="w-lab">B</text>
      </>;
    }
    if (kind === 'perp') {
      const M = [(A[0] + B[0]) / 2, 140], half = 110, R = Math.max(r, half + 5); const h = Math.sqrt(R * R - half * half);
      return <>
        <line x1={A[0]} y1={140} x2={B[0]} y2={140} className="w-edge" />
        {step >= 1 && <><path d={wxArc(A[0], 140, R, 20, 80)} className="w-arcc" /><path d={wxArc(A[0], 140, R, -80, -20)} className="w-arcc" /></>}
        {step >= 2 && <><path d={wxArc(B[0], 140, R, 100, 160)} className="w-arcc" /><path d={wxArc(B[0], 140, R, 200, 260)} className="w-arcc" /></>}
        {step >= 3 && <><line x1={M[0]} y1={140 - h - 15} x2={M[0]} y2={140 + h + 15} className="w-line" /><rect x={M[0]} y={126} width="12" height="12" className="w-right" /></>}
        <text x={A[0] - 14} y={144} className="w-lab">A</text><text x={B[0] + 6} y={144} className="w-lab">B</text>
      </>;
    }
    const O = [80, 210], a2 = 64 * Math.PI / 180, L = 230; const P = [O[0] + 100, O[1]], Q = [O[0] + 100 * Math.cos(a2), O[1] - 100 * Math.sin(a2)];
    const Rr = [O[0] + 170 * Math.cos(a2 / 2), O[1] - 170 * Math.sin(a2 / 2)];
    return <>
      <line x1={O[0]} y1={O[1]} x2={O[0] + L} y2={O[1]} className="w-edge" /><line x1={O[0]} y1={O[1]} x2={O[0] + L * Math.cos(a2)} y2={O[1] - L * Math.sin(a2)} className="w-edge" />
      {step >= 1 && <path d={wxArc(O[0], O[1], 100, -5, 69)} className="w-arcc" />}
      {step >= 2 && <><path d={wxArc(P[0], P[1], 90, 50, 110)} className="w-arcc" /><path d={wxArc(Q[0], Q[1], 90, -40, 20)} className="w-arcc" /></>}
      {step >= 3 && <line x1={O[0]} y1={O[1]} x2={O[0] + L * Math.cos(a2 / 2)} y2={O[1] - L * Math.sin(a2 / 2)} className="w-line" />}
      <text x={O[0] - 16} y={O[1] + 4} className="w-lab">O</text>
    </>;
  };
  return (
    <div className="wbox">
      <div className="mono">{pl.title}</div>
      <svg viewBox="0 0 380 240" className="wsvg">{svg()}</svg>
      <div className="wsteps">{pl.steps.slice(0, step + 1).map((s, i) => <div key={i} className="wst-line"><span className="mono">step {i + 1}</span><span>{s}</span></div>)}</div>
      <div className="wfoot"><button className="btn ghost small" disabled={step === 0} onClick={() => setStep(step - 1)}>← Back</button>{step < n - 1 ? <button className="btn small" onClick={() => setStep(step + 1)}>Next step →</button> : <span className="wnote" style={{ color: 'var(--ok)' }}>Construction complete ✓. Leave the arcs showing!</span>}</div>
    </div>
  );
};

/* 25.3 plans and elevations: cube stacks */
W.views = function ({ cfg, onState }) {
  const [h, setH] = uSt([[2, 1, 0], [1, 1, 0], [1, 0, 0]]);
  const [seen, setSeen] = uSt([]);
  const tap = (i, j) => { const n = h.map(r => r.slice()); n[i][j] = (n[i][j] + 1) % 4; setH(n); };
  const s = 22;
  const cubes = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let z = 0; z < h[i][j]; z++) cubes.push([j, i, z]);
  cubes.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]) || a[2] - b[2]);
  const Pp = (x, y, z) => { const [u, v] = iso(x * s, y * s, z * s); return [130 + u, 140 + v]; };
  const cube = ([x, y, z], k) => {
    const t = [Pp(x, y, z + 1), Pp(x + 1, y, z + 1), Pp(x + 1, y + 1, z + 1), Pp(x, y + 1, z + 1)];
    const l = [Pp(x, y + 1, z + 1), Pp(x + 1, y + 1, z + 1), Pp(x + 1, y + 1, z), Pp(x, y + 1, z)];
    const r = [Pp(x + 1, y, z + 1), Pp(x + 1, y + 1, z + 1), Pp(x + 1, y + 1, z), Pp(x + 1, y, z)];
    const pg = (q, c) => <polygon points={q.map(p => p.join(',')).join(' ')} className={c} />;
    return <g key={k}>{pg(t, 'w-ct')}{pg(l, 'w-cl')}{pg(r, 'w-cr')}</g>;
  };
  const plan = h.map(r => r.map(v => v > 0));
  const front = [0, 1, 2].map(j => Math.max(...[0, 1, 2].map(i => h[i][j])));
  const side = [0, 1, 2].map(i => Math.max(...h[i]));
  const total = cubes.length;
  useRep(onState, { total, h }, [JSON.stringify(h)]);
  const grid = (cols, rows, fill, lab) => <div className="wview"><span className="mono">{lab}</span><svg viewBox={`0 0 ${cols * 20 + 2} ${rows * 20 + 2}`} style={{ width: cols * 22 }}>{Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => <rect key={r + '-' + c} x={1 + c * 20} y={1 + r * 20} width="20" height="20" className={fill(r, c) ? 'w-cell' : 'w-empty'} />))}</svg></div>;
  return (
    <div className="wbox">
      <div className="wsplit">
        <div>
          <svg viewBox="0 0 260 220" className="wsvg">{cubes.map(cube)}</svg>
          <div className="wnote">Tap the grid to add cubes (0–3 high).</div>
          <div className="wtapgrid">{h.map((r, i) => r.map((v, j) => <button key={i + '-' + j} onClick={() => tap(i, j)}>{v}</button>))}</div>
        </div>
        <div className="wlist">
          {grid(3, 3, (r, c) => plan[r][c], 'Plan (from above)')}
          {grid(3, 3, (r, c) => front[c] >= 3 - r, 'Front elevation')}
          {grid(3, 3, (r, c) => side[2 - c] >= 3 - r, 'Side elevation')}
          <div className="wnote">{total} cubes</div>
        </div>
      </div>
    </div>
  );
};
