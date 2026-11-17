/* Physics + Earth & space widgets */

/* 7.1 measuring distance & time: reaction timer */
W.timer = function ({ cfg, onState }) {
  const [st, setSt] = uSt('idle'), [t0, setT0] = uSt(0), [res, setRes] = uSt([]);
  const tm = uRf(null);
  const go = () => { setSt('wait'); tm.current = setTimeout(() => { setSt('go'); setT0(performance.now()); }, 1200 + Math.random() * 2000); };
  const tap = () => { if (st === 'wait') { clearTimeout(tm.current); setSt('early'); } else if (st === 'go') { setRes(r => [...r, Math.round(performance.now() - t0)]); setSt('idle'); } else go(); };
  uEf(() => () => clearTimeout(tm.current), []);
  const mean = res.length ? res.reduce((a, b) => a + b, 0) / res.length : 0;
  useRep(onState, { n: res.length }, [res.length]);
  return (
    <div className="wbox">
      <button className={'wreact-pad ' + st} onClick={tap}>{{ idle: res.length ? 'Tap to try again' : 'Tap to start', wait: 'Wait for green…', go: 'TAP NOW!', early: 'Too early! Tap to retry' }[st]}</button>
      <WRead items={[['Trials', res.length], ['Last', res.length ? res[res.length - 1] + ' ms' : '–'], ['Mean', res.length ? Math.round(mean) + ' ms' : '–']]} />
      <div className="wnote">Human reaction time (about 0.2 s) adds error when timing with a stopwatch. That is why we repeat measurements and take a mean, or use light gates for short times.</div>
    </div>
  );
};

/* 7.2 speed */
W.speed = function ({ cfg, onState }) {
  const [d, setD] = uSt(100), [t, setT] = uSt(20), [run, setRun] = uSt(0), [go, setGo] = uSt(0);
  const s = d / t;
  useRep(onState, { d, t, s, run }, [d, t, run]);
  uEf(() => { if (!go) return; let raf, st = performance.now(); const tick = n => { const p = Math.min(1, (n - st) / (t * 100)); setRun(Math.max(0.001, p)); if (p < 1) raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf); }, [go]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 420 80" className="wsvg">
        <line x1="20" x2="400" y1="55" y2="55" className="w-ax" />
        {[0, 0.25, 0.5, 0.75, 1].map(f => <g key={f}><line x1={20 + f * 380} x2={20 + f * 380} y1="50" y2="60" className="w-ax" /><text x={20 + f * 380} y="74" textAnchor="middle">{Math.round(f * d)} m</text></g>)}
        <circle cx={20 + (run || 0) * 380} cy="42" r="10" className="w-pt" />
      </svg>
      <div className="wbig" style={{ textAlign: 'center' }}>speed = {d} m ÷ {t} s = <b>{wxFmt(s, 2)} m/s</b></div>
      <WRead items={[['km/h', wxFmt(s * 3.6, 1)], ['Time shown', run ? wxFmt(run * t, 1) + ' s' : '0 s'], ['Distance', run ? wxFmt(run * d, 0) + ' m' : '0 m']]} />
      <div className="wnote">Average speed = total distance ÷ total time. Rearranged: distance = speed × time, time = distance ÷ speed.</div>
      <WCtl><WSl label="Distance" v={d} set={setD} min={50} max={400} step={50} fmt={v => v + ' m'} /><WSl label="Time" v={t} set={setT} min={5} max={60} step={5} fmt={v => v + ' s'} /><button className="btn small" onClick={() => { setRun(0.001); setGo(g => g + 1); }}> Run (10× speed)</button></WCtl>
    </div>
  );
};

/* 7.3 distance-time graph builder */
W.dtgraph = function ({ cfg, onState }) {
  const [segs, setSegs] = uSt([[2, 4], [0, 3], [1, 3]]);
  const [sel, setSel] = uSt(0);
  let tt = 0, dd = 0; const pts = [[0, 0]]; segs.forEach(([v, dur]) => { tt += dur; dd += v * dur; pts.push([tt, dd]); });
  const P = wxPlane(380, 220, 0, 12, 0, 24, 26);
  useRep(onState, { segs }, [JSON.stringify(segs)]);
  const desc = v => v === 0 ? 'stationary (flat line)' : v >= 3 ? 'moving fast (steep)' : 'moving slowly (gentle slope)';
  return (
    <div className="wbox">
      <svg viewBox="0 0 380 230" className="wsvg">
        <WAxes P={P} step={1} lab={2} />
        <text x={P.X(12)} y={P.Y(0) - 4} textAnchor="end">time (s)</text><text x={P.X(0) + 4} y={P.Y(24) + 10}>distance (m)</text>
        <polyline points={pts.filter(p => p[0] <= 12).map(([x, y]) => P.X(x) + ',' + P.Y(Math.min(24, y))).join(' ')} className="w-line" fill="none" />
        {segs.map((s, i) => <line key={i} x1={P.X(pts[i][0])} y1={P.Y(Math.min(24, pts[i][1]))} x2={P.X(pts[i + 1][0])} y2={P.Y(Math.min(24, pts[i + 1][1]))} className={i === sel ? 'w-line2' : ''} style={{ strokeWidth: 6, stroke: i === sel ? 'var(--gold)' : 'transparent' }} onClick={() => setSel(i)} />)}
      </svg>
      <div className="wnote">Section {sel + 1}: {desc(segs[sel][0])}. Gradient = speed = {segs[sel][0]} m/s.</div>
      <WCtl><WSeg label="Section" opts={segs.map((_, i) => [i, 'Section ' + (i + 1)])} v={sel} set={setSel} /><WSl label="Speed" v={segs[sel][0]} set={v => setSegs(segs.map((s, i) => i === sel ? [v, s[1]] : s))} min={0} max={4} step={0.5} fmt={v => v + ' m/s'} /><WSl label="Duration" v={segs[sel][1]} set={v => setSegs(segs.map((s, i) => i === sel ? [s[0], v] : s))} min={1} max={6} fmt={v => v + ' s'} /></WCtl>
    </div>
  );
};

/* 8.1 balanced / unbalanced forces */
W.forces = function ({ cfg, onState }) {
  const [push, setPush] = uSt(40), [fric, setFric] = uSt(40);
  const net = push - fric;
  const [x, setX] = uSt(0.4), [v, setV] = uSt(0);
  const vr = uRf(0), nr = uRf(net); nr.current = net;
  uEf(() => { let raf; const tick = () => { vr.current = Math.max(-0.012, Math.min(0.012, vr.current + nr.current * 0.00006)); setV(vr.current); setX(xx => { let n = xx + vr.current; if (n > 0.9) n = 0.1; if (n < 0.05) n = 0.85; return n; }); raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf); }, []);
  useRep(onState, { push, fric, net }, [push, fric]);
  const cx = 30 + x * 360;
  return (
    <div className="wbox">
      <svg viewBox="0 0 420 140" className="wsvg">
        <line x1="10" x2="410" y1="110" y2="110" className="w-ax" />
        <rect x={cx - 30} y="70" width="60" height="40" rx="5" className="w-shape" />
        <line x1={cx + 30} y1="90" x2={cx + 30 + push * 1.2} y2="90" className="w-force" markerEnd="url(#wfa)" /><text x={cx + 34 + push * 0.6} y="82" className="w-lab">{push} N</text>
        <line x1={cx - 30} y1="90" x2={cx - 30 - fric * 1.2} y2="90" className="w-force2" markerEnd="url(#wfb)" /><text x={cx - 34 - fric * 0.6} y="82" textAnchor="end" className="w-lab">{fric} N</text>
        <defs><marker id="wfa" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="var(--acc)" /></marker><marker id="wfb" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="var(--ink-2)" /></marker></defs>
      </svg>
      <WRead items={[['Resultant force', (net > 0 ? '+' : '') + net + ' N'], ['Forces', net === 0 ? 'balanced' : 'unbalanced'], ['Motion', net === 0 ? (Math.abs(v) > 0.0005 ? 'constant speed' : 'stays still') : net > 0 ? 'speeding up →' : 'slowing / reversing']]} />
      <div className="wnote">Balanced forces: no change in motion: it stays still or keeps going at a steady speed. Unbalanced forces: the object speeds up, slows down or changes direction.</div>
      <WCtl><WSl label="Driving force" v={push} set={setPush} min={0} max={80} step={10} fmt={v => v + ' N'} /><WSl label="Friction / drag" v={fric} set={setFric} min={0} max={80} step={10} fmt={v => v + ' N'} /><button className="chip" onClick={() => { vr.current = 0; setV(0); setX(0.4); }}>Reset</button></WCtl>
    </div>
  );
};

/* 8.2 moments wrapper */
W.moments = function ({ cfg, onState }) { return <div className="wbox"><MomentsBeam onState={onState} /></div>; };

/* 8.3 pressure */
W.pressure = function ({ cfg, onState }) {
  const [F, setF] = uSt(600), [A, setA] = uSt(0.04), [obj, setObj] = uSt('feet');
  const presets = { feet: [600, 0.04, 'Standing on two feet'], heel: [600, 0.0002, 'Stiletto heel'], ski: [600, 0.4, 'Skis on snow'], knife: [50, 0.000005, 'Sharp knife edge'] };
  const p = F / A;
  useRep(onState, { F, A, p, obj }, [F, A, obj]);
  const sink = Math.min(60, Math.log10(p) * 8 - 20);
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 150" className="wsvg">
        <rect x="0" y="90" width="400" height="60" className="w-snow" />
        <rect x={200 - Math.min(170, Math.sqrt(A) * 380)} y={50 + Math.max(0, sink)} width={Math.min(340, Math.sqrt(A) * 760) + 4} height="40" className="w-shape" />
        <line x1="200" y1="10" x2="200" y2={46 + Math.max(0, sink)} className="w-force" markerEnd="url(#wfa)" /><text x="208" y="26" className="w-lab">{F} N</text>
      </svg>
      <div className="wbig" style={{ textAlign: 'center' }}>p = F ÷ A = {F} ÷ {wxFmt(A, 6)} = <b>{p >= 1e6 ? wxFmt(p / 1e6, 1) + ' million' : wxFmt(p, 0)} Pa</b></div>
      <div className="wnote">Same force on a smaller area gives a bigger pressure, which is why it sinks deeper. 1 Pa = 1 N/m².</div>
      <WCtl><WSeg opts={Object.entries(presets).map(([k, v]) => [k, v[2]])} v={obj} set={k => { setObj(k); setF(presets[k][0]); setA(presets[k][1]); }} /><WSl label="Force (N)" v={F} set={setF} min={50} max={1000} step={50} /></WCtl>
    </div>
  );
};

/* 8.4 gas pressure & diffusion */
W.gasbox = function ({ cfg, onState }) {
  const [mode, setMode] = uSt('pressure'), [T, setT] = uSt(20), [V, setV] = uSt(1), [hits, setHits] = uSt(0);
  const cv = uRf(null), st = uRf({ T, V, mode }); st.current = { T, V, mode };
  uEf(() => {
    const c = cv.current, ctx = c.getContext('2d'); const Wd = 400, H = 220; c.width = Wd * 2; c.height = H * 2; ctx.scale(2, 2);
    const acc = getComputedStyle(c).getPropertyValue('--acc').trim();
    const ps = Array.from({ length: 50 }, (_, i) => ({ x: 20 + Math.random() * 160, y: 20 + Math.random() * 180, a: Math.random() * 6.28, k: i < 25 ? 0 : 1 }));
    let raf, h = 0, lastT = performance.now();
    const tick = now => {
      const { T, V, mode } = st.current; const right = mode === 'pressure' ? 20 + 360 * V / 1.5 * 0.8 + 40 : 390;
      const sp = 0.6 + (T + 20) / 50;
      ctx.clearRect(0, 0, Wd, H);
      ctx.strokeStyle = '#8a8478'; ctx.lineWidth = 2; ctx.strokeRect(10, 10, right - 10, H - 20);
      if (mode === 'diffusion' && now - lastT < 0) {}
      ps.forEach(p => {
        p.x += Math.cos(p.a) * sp; p.y += Math.sin(p.a) * sp;
        if (p.x < 15) { p.x = 15; p.a = Math.PI - p.a; h++; } if (p.x > right - 5) { p.x = right - 5; p.a = Math.PI - p.a; h++; }
        if (p.y < 15) { p.y = 15; p.a = -p.a; h++; } if (p.y > H - 15) { p.y = H - 15; p.a = -p.a; h++; }
        if (Math.random() < 0.02) p.a += (Math.random() - 0.5);
        ctx.beginPath(); ctx.arc(p.x, p.y, 4.5, 0, 6.28); ctx.fillStyle = mode === 'diffusion' ? (p.k ? '#c06040' : acc) : acc; ctx.fill();
      });
      if (now - lastT > 1000) { setHits(h); h = 0; lastT = now; }
      raf = requestAnimationFrame(tick);
    };
    if (mode === 'diffusion') ps.forEach(p => { p.x = p.k ? 300 + Math.random() * 80 : 20 + Math.random() * 80; });
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);
  useRep(onState, { mode, T, V }, [mode, T, V]);
  return (
    <div className="wbox">
      <canvas ref={cv} style={{ width: '100%', display: 'block' }} />
      {mode === 'pressure' ? <WRead items={[['Wall hits per second', hits], ['Temperature', T + ' °C'], ['Volume', wxFmt(V, 1) + ' L']]} /> : null}
      <div className="wnote">{mode === 'pressure' ? 'Gas pressure is caused by particles hitting the walls. Hotter means faster particles and more hits, so higher pressure. Smaller volume means more frequent hits, so higher pressure.' : 'Diffusion: particles move randomly and spread from high to low concentration until they are evenly mixed. It is faster in gases than in liquids, and faster when warmer.'}</div>
      <WCtl><WSeg opts={[['pressure', 'Gas pressure'], ['diffusion', 'Diffusion']]} v={mode} set={setMode} /><WSl label="Temperature" v={T} set={setT} min={-20} max={100} step={10} fmt={v => v + ' °C'} />{mode === 'pressure' && <WSl label="Volume" v={V} set={setV} min={0.5} max={1.5} step={0.1} fmt={v => wxFmt(v, 1) + ' L'} />}</WCtl>
    </div>
  );
};

/* 9.1 reflection */
W.reflect = function ({ cfg, onState }) {
  const [a, setA] = uSt(35), [rough, setRough] = uSt(false);
  const r = a * Math.PI / 180, cx = 200, cy = 180, L = 150;
  const I = [cx - L * Math.sin(r), cy - L * Math.cos(r)], R = [cx + L * Math.sin(r), cy - L * Math.cos(r)];
  useRep(onState, { a, rough }, [a, rough]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 200" className="wsvg">
        <line x1="30" x2="370" y1={cy} y2={cy} className="w-mirrorS" />{Array.from({ length: 22 }, (_, i) => <line key={i} x1={36 + i * 15} x2={28 + i * 15} y1={cy + 2} y2={cy + 10} className="w-ax" />)}
        <line x1={cx} x2={cx} y1="20" y2={cy} className="w-guide" /><text x={cx + 4} y="30" className="w-lab">normal</text>
        <line x1={I[0]} y1={I[1]} x2={cx} y2={cy} className="w-ray" markerEnd="url(#wra)" />
        {!rough ? <line x1={cx} y1={cy} x2={R[0]} y2={R[1]} className="w-ray" markerEnd="url(#wra)" /> : [-30, -12, 8, 25, 40].map((d, i) => <line key={i} x1={cx} y1={cy} x2={cx + L * Math.sin(r + d * Math.PI / 180)} y2={cy - L * Math.cos(r + d * Math.PI / 180)} className="w-ray" style={{ opacity: .6 }} />)}
        <path d={wxArc(cx, cy, 50, 90, 90 + a)} className="w-arcp" /><text x={cx - 30} y={cy - 56} className="w-lab">i = {a}°</text>
        {!rough && <><path d={wxArc(cx, cy, 44, 90 - a, 90)} className="w-arcp2" /><text x={cx + 12} y={cy - 56} className="w-lab">r = {a}°</text></>}
        <defs><marker id="wra" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="oklch(0.7 0.15 80)" /></marker></defs>
      </svg>
      <div className="wnote">{rough ? 'A rough surface scatters light in many directions (diffuse reflection), so you cannot see an image.' : 'Law of reflection: angle of incidence = angle of reflection, both measured from the normal.'}</div>
      <WCtl><WSl label="Angle of incidence" v={a} set={setA} min={0} max={80} fmt={v => v + '°'} /><WSeg opts={[[false, 'Smooth mirror'], [true, 'Rough surface']]} v={rough} set={setRough} /></WCtl>
    </div>
  );
};

/* 9.2 refraction */
W.refract = function ({ cfg, onState }) {
  const [a, setA] = uSt(40), [med, setMed] = uSt('glass');
  const n = med === 'glass' ? 1.5 : 1.33; const r = Math.asin(Math.sin(a * Math.PI / 180) / n) * 180 / Math.PI;
  const cx = 200, cy = 110, L = 110;
  const I = [cx - L * Math.sin(a * Math.PI / 180), cy - L * Math.cos(a * Math.PI / 180)], R = [cx + L * Math.sin(r * Math.PI / 180), cy + L * Math.cos(r * Math.PI / 180)];
  useRep(onState, { a, r, med }, [a, med]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 220" className="wsvg">
        <rect x="0" y={cy} width="400" height="110" className={med === 'glass' ? 'w-glass' : 'w-water'} />
        <line x1={cx} x2={cx} y1="10" y2="210" className="w-guide" />
        <line x1={I[0]} y1={I[1]} x2={cx} y2={cy} className="w-ray" /><line x1={cx} y1={cy} x2={R[0]} y2={R[1]} className="w-ray" />
        <line x1={cx} y1={cy} x2={cx + L * Math.sin(a * Math.PI / 180)} y2={cy + L * Math.cos(a * Math.PI / 180)} className="w-guide" style={{ opacity: .5 }} />
        <text x="10" y="20" className="w-lab">air</text><text x="10" y={cy + 20} className="w-lab">{med}</text>
        <text x={cx - 60} y={cy - 40} className="w-lab">{a}°</text><text x={cx + 12} y={cy + 50} className="w-lab">{wxFmt(r, 0)}°</text>
      </svg>
      <div className="wnote">Light slows down when it enters {med}, so it bends towards the normal ({a}° → {wxFmt(r, 0)}°). At 0° it slows but doesn't bend. Coming out, it speeds up and bends away from the normal.</div>
      <WCtl><WSl label="Angle in air" v={a} set={setA} min={0} max={80} fmt={v => v + '°'} /><WSeg opts={['glass', 'water']} v={med} set={setMed} /></WCtl>
    </div>
  );
};

/* 9.3 coloured light */
W.colour = function ({ cfg, onState }) {
  const [mode, setMode] = uSt('mix'), [rgb, setRgb] = uSt([1, 1, 0]), [filt, setFilt] = uSt('red'), [obj, setObj] = uSt('red');
  const name = c => ({ '111': 'white', '110': 'yellow', '101': 'magenta', '011': 'cyan', '100': 'red', '010': 'green', '001': 'blue', '000': 'black' })[c.join('')];
  const css = c => `rgb(${c[0] * 255},${c[1] * 255},${c[2] * 255})`;
  const F = { red: [1, 0, 0], green: [0, 1, 0], blue: [0, 0, 1], none: [1, 1, 1], yellow: [1, 1, 0], cyan: [0, 1, 1] };
  const O = { red: [1, 0, 0], green: [0, 1, 0], blue: [0, 0, 1], white: [1, 1, 1], yellow: [1, 1, 0], black: [0, 0, 0] };
  const seenC = F[filt].map((v, i) => v * O[obj][i]);
  useRep(onState, { mode, rgb: rgb.join(''), filt, obj }, [mode, rgb.join(''), filt, obj]);
  return (
    <div className="wbox">
      {mode === 'mix' ? <><svg viewBox="0 0 300 220" className="wsvg" style={{ maxWidth: 320, background: '#111', borderRadius: 6 }}>
        <g style={{ mixBlendMode: 'screen' }}>{rgb[0] ? <circle cx="120" cy="90" r="65" fill="#f00" style={{ mixBlendMode: 'screen' }} /> : null}{rgb[1] ? <circle cx="180" cy="90" r="65" fill="#0f0" style={{ mixBlendMode: 'screen' }} /> : null}{rgb[2] ? <circle cx="150" cy="140" r="65" fill="#00f" style={{ mixBlendMode: 'screen' }} /> : null}</g>
      </svg><div className="wbig" style={{ textAlign: 'center' }}>On: {['red', 'green', 'blue'].filter((_, i) => rgb[i]).join(' + ') || 'none'} = <b>{name(rgb)}</b></div>
        <div className="wnote">The primary colours of light are red, green and blue. Adding all three makes white. Adding two makes a secondary colour.</div></>
        : mode === 'prism' ? <><svg viewBox="0 0 400 200" className="wsvg" style={{ background: '#111', borderRadius: 6 }}>
          <line x1="10" y1="120" x2="160" y2="105" stroke="#fff" strokeWidth="4" />
          <polygon points="200,30 140,170 260,170" fill="rgba(200,220,255,.25)" stroke="#aac" />
          {['#f00', '#f80', '#ff0', '#0f0', '#00f', '#408', '#80f'].map((c, i) => <line key={i} x1="215" y1={110 + i * 2} x2="390" y2={60 + i * 16} stroke={c} strokeWidth="4" />)}
        </svg><div className="wnote">A prism disperses white light into a spectrum, red, orange, yellow, green, blue, indigo and violet, because each colour refracts by a different amount. Violet bends most.</div></>
          : <><div className="wsplit"><div className="wcolbox" style={{ background: css(F[filt]), opacity: filt === 'none' ? 0.1 : 0.9 }}><span>light through {filt === 'none' ? 'no' : filt} filter</span></div><div className="wcolbox" style={{ background: css(seenC) }}><span style={{ color: name(seenC) === 'black' ? '#fff' : '#000' }}>{obj} object looks <b>{name(seenC)}</b></span></div></div>
            <div className="wnote">A filter only lets its own colour through (it absorbs the rest). An object reflects its own colour and absorbs the others. If none of its colour reaches it, it looks black.</div></>}
      <WCtl><WSeg opts={[['mix', 'Adding light'], ['prism', 'Prism'], ['filter', 'Filters & objects']]} v={mode} set={setMode} />
        {mode === 'mix' && <div className="chips">{['Red', 'Green', 'Blue'].map((c, i) => <button key={c} className={'chip' + (rgb[i] ? ' on' : '')} onClick={() => setRgb(rgb.map((v, j) => j === i ? 1 - v : v))}>{c}</button>)}</div>}
        {mode === 'filter' && <><WSeg label="Filter" opts={Object.keys(F)} v={filt} set={setFilt} /><WSeg label="Object" opts={Object.keys(O)} v={obj} set={setObj} /></>}</WCtl>
    </div>
  );
};

/* 10.1 magnetic field */
W.magnet = function ({ cfg, onState }) {
  const [two, setTwo] = uSt(false), [flip, setFlip] = uSt(false), [probe, setProbe] = uSt([300, 60]);
  const ref = uRf(null);
  const [start, bind] = useDrag(ref, (i, [x, y]) => setProbe([Math.max(10, Math.min(390, x)), Math.max(10, Math.min(230, y))]));
  const poles = two ? [[90, 120, 1], [150, 120, -1], [250, 120, flip ? -1 : 1], [310, 120, flip ? 1 : -1]] : [[150, 120, 1], [250, 120, -1]];
  const field = (x, y) => { let fx = 0, fy = 0; poles.forEach(([px, py, q]) => { const dx = x - px, dy = y - py, d = Math.max(12, Math.hypot(dx, dy)); fx += q * dx / d ** 3; fy += q * dy / d ** 3; }); return [fx, fy]; };
  const arrows = []; for (let x = 20; x < 400; x += 26) for (let y = 16; y < 240; y += 26) { const [fx, fy] = field(x, y); const m = Math.hypot(fx, fy); if (!m) continue; const a = Math.atan2(fy, fx); arrows.push(<line key={x + '-' + y} x1={x - 7 * Math.cos(a)} y1={y - 7 * Math.sin(a)} x2={x + 7 * Math.cos(a)} y2={y + 7 * Math.sin(a)} className="w-farrow" style={{ opacity: Math.min(1, m * 4e4) }} markerEnd="url(#wma)" />); }
  const [px, py] = field(...probe), pa = Math.atan2(py, px) * 180 / Math.PI;
  useRep(onState, { two, flip }, [two, flip]);
  const bar = (x1, sN) => <g><rect x={x1} y="105" width="30" height="30" fill={sN ? 'oklch(0.55 0.15 25)' : 'oklch(0.55 0.1 250)'} /><text x={x1 + 15} y="125" textAnchor="middle" fill="#fff" style={{ fontSize: 13 }}>{sN ? 'N' : 'S'}</text></g>;
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 240" className="wsvg" ref={ref} {...bind} style={{ touchAction: 'none' }}>
        <defs><marker id="wma" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--ink-3)" /></marker></defs>
        {arrows}
        {two ? <>{bar(75, true)}{bar(135, false)}{bar(235, !flip)}{bar(295, flip)}</> : <>{bar(135, true)}{bar(235, false)}<rect x="165" y="105" width="70" height="30" fill="var(--paper-2)" /></>}
        <g transform={`translate(${probe[0]},${probe[1]}) rotate(${pa})`} onPointerDown={start(0)} style={{ cursor: 'grab' }}><circle r="16" className="w-compass" /><polygon points="13,0 -4,-5 -4,5" fill="oklch(0.55 0.15 25)" /><polygon points="-13,0 -4,-5 -4,5" fill="var(--ink-3)" /></g>
      </svg>
      <div className="wnote">Drag the compass. Field lines go from N to S. They are closest together (strongest field) near the poles. {two ? (flip ? 'N facing N: like poles repel, and the field lines push apart.' : 'N facing S: unlike poles attract, and the field lines join up.') : ''}</div>
      <WCtl><WSeg opts={[[false, 'One magnet'], [true, 'Two magnets']]} v={two} set={setTwo} />{two && <button className="chip" onClick={() => setFlip(!flip)}>Flip right magnet</button>}</WCtl>
    </div>
  );
};

/* 10.2 electromagnet */
W.electromag = function ({ cfg, onState }) {
  const [turns, setTurns] = uSt(20), [I, setI] = uSt(1), [core, setCore] = uSt('iron'), [on, setOn] = uSt(true);
  const k = core === 'iron' ? 1 : core === 'steel' ? 0.6 : 0.05;
  const str = on ? turns * I * k : 0, clips = Math.floor(str / 4);
  useRep(onState, { turns, I, core, on, clips }, [turns, I, core, on]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 200" className="wsvg">
        <rect x="80" y="60" width="180" height="30" rx="4" className={core === 'none' ? 'w-empty' : 'w-core'} />
        {Array.from({ length: Math.min(30, Math.round(turns / 2)) }, (_, i) => <ellipse key={i} cx={88 + i * (164 / Math.min(30, Math.round(turns / 2)))} cy="75" rx="4" ry="22" className="w-coil" style={{ stroke: on ? 'oklch(0.62 0.13 50)' : 'oklch(0.7 0.05 50)' }} />)}
        <line x1="80" y1="97" x2="40" y2="140" className="w-wire" /><line x1="260" y1="97" x2="300" y2="140" className="w-wire" /><rect x="140" y="132" width="60" height="16" className="w-cell" /><text x="170" y="164" textAnchor="middle" className="w-lab">{I} A</text>
        <line x1="40" y1="140" x2="140" y2="140" className="w-wire" /><line x1="200" y1="140" x2="300" y2="140" className="w-wire" />
        {Array.from({ length: Math.min(12, clips) }, (_, i) => <rect key={i} x={262 + (i % 3) * 14} y={50 + Math.floor(i / 3) * 14} width="10" height="18" rx="3" className="w-clip" />)}
        {Array.from({ length: Math.max(0, 8 - Math.min(8, clips)) }, (_, i) => <rect key={'f' + i} x={300 + i * 11} y="182" width="8" height="14" rx="3" className="w-clip" />)}
      </svg>
      <WRead items={[['Paperclips picked up', Math.min(12, clips)], ['Turns', turns], ['Current', I + ' A']]} />
      <div className="wnote">A current in a coil makes a magnetic field. Make it stronger with more turns, more current, or an iron core. Switch off and soft iron loses its magnetism, which is useful for scrapyard cranes, door locks and relays.</div>
      <WCtl><WSl label="Turns" v={turns} set={setTurns} min={5} max={60} step={5} /><WSl label="Current" v={I} set={setI} min={0.5} max={3} step={0.5} fmt={v => v + ' A'} /><WSeg opts={[['iron', 'Iron core'], ['steel', 'Steel core'], ['none', 'No core']]} v={core} set={setCore} /><button className={'chip' + (on ? ' on' : '')} onClick={() => setOn(!on)}>{on ? 'Switch off' : 'Switch on'}</button></WCtl>
    </div>
  );
};

/* 11.1 climate vs weather */
W.climate = function ({ cfg, onState }) {
  const days = uMm(() => { const r = wxRng(11); return Array.from({ length: 365 }, (_, d) => 14 + 9 * Math.sin((d - 110) / 365 * 6.28) + (r() - 0.5) * 10); }, []);
  const [view, setView] = uSt('week'), [start, setStart] = uSt(150);
  const P = wxPlane(400, 180, 0, view === 'week' ? 6 : 364, -2, 32, 20);
  const data = view === 'week' ? days.slice(start, start + 7) : days;
  const mon = Array.from({ length: 12 }, (_, m) => days.slice(m * 30, m * 30 + 30).reduce((a, b) => a + b, 0) / 30);
  useRep(onState, { view }, [view, start]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 190" className="wsvg">
        <line x1="20" x2="390" y1={P.Y(0)} y2={P.Y(0)} className="w-ax" />
        {[0, 10, 20, 30].map(v => <text key={v} x="14" y={P.Y(v) + 3} textAnchor="end">{v}</text>)}
        <polyline points={data.map((v, i) => P.X(i) + ',' + P.Y(v)).join(' ')} className="w-line3" fill="none" />
        {view === 'year' && <polyline points={mon.map((v, m) => P.X(m * 30 + 15) + ',' + P.Y(v)).join(' ')} className="w-line" fill="none" />}
        {view === 'week' && data.map((v, i) => <circle key={i} cx={P.X(i)} cy={P.Y(v)} r="4" className="w-pt" />)}
      </svg>
      <div className="wnote">{view === 'week' ? 'Weather: the conditions on a particular day, which change from day to day and are hard to predict far ahead.' : 'Climate: the average weather pattern over a long time (30+ years). The smooth line shows the typical temperature for each month.'}</div>
      <WCtl><WSeg opts={[['week', 'One week (weather)'], ['year', 'Long-term average (climate)']]} v={view} set={setView} />{view === 'week' && <WSl label="Start day" v={start} set={setStart} min={0} max={350} />}</WCtl>
    </div>
  );
};

/* 11.2 climate change: CO2 and ice-age cycles */
W.co2 = function ({ cfg, onState }) {
  const [mode, setMode] = uSt('cycle'), [co2, setCo2] = uSt(420);
  const T = 14 + (co2 - 280) * 0.012;
  const P = wxPlane(400, 180, 0, 400, -10, 4, 20);
  const cyc = Array.from({ length: 401 }, (_, k) => [k, -4 + 3.5 * Math.sin(k / 100 * 6.28 - 1.2) + 1.2 * Math.sin(k / 41 * 6.28)]);
  useRep(onState, { mode, co2 }, [mode, co2]);
  return (
    <div className="wbox">
      {mode === 'cycle' ? <><svg viewBox="0 0 400 190" className="wsvg"><line x1="20" x2="390" y1={P.Y(0)} y2={P.Y(0)} className="w-guide" /><polyline points={cyc.map(([x, y]) => P.X(x) + ',' + P.Y(y)).join(' ')} className="w-line" fill="none" /><text x={P.X(0)} y="186">400 000 years ago</text><text x={P.X(400)} y="186" textAnchor="end">now</text><text x="24" y={P.Y(0) - 4}>today's average</text></svg>
        <div className="wnote">Evidence from ice cores shows Earth's climate has cycled between ice ages (cold dips) and warm periods, about every 100 000 years, long before humans.</div></>
        : <><div className="wsplit"><svg viewBox="0 0 200 200" className="wsvg" style={{ maxWidth: 220 }}><circle cx="100" cy="110" r="50" className="w-earth" /><circle cx="100" cy="110" r={60 + (co2 - 280) / 30} className="w-atmos" style={{ opacity: 0.15 + (co2 - 280) / 900 }} />{[0, 1, 2].map(i => <line key={i} x1={30 + i * 50} y1="10" x2={70 + i * 20} y2="70" className="w-sunray" />)}{Array.from({ length: Math.round((co2 - 250) / 60) }, (_, i) => <path key={i} d={`M${80 + i * 10},${80} q 4,-10 0,-20`} className="w-heat" />)}</svg>
          <div className="wlist"><WRead items={[['CO₂ (ppm)', co2], ['Approx. global mean', wxFmt(T, 1) + ' °C']]} /><div className="wnote">Greenhouse gases (carbon dioxide, methane) trap heat in the atmosphere. Burning fossil fuels has raised CO₂ from about 280 ppm (1800) to over 420 ppm today. That atmospheric change is warming the climate.</div></div></div></>}
      <WCtl><WSeg opts={[['cycle', 'Natural cycles'], ['co2', 'Greenhouse effect']]} v={mode} set={setMode} />{mode === 'co2' && <WSl label="CO₂ in atmosphere" v={co2} set={setCo2} min={280} max={800} step={20} fmt={v => v + ' ppm'} />}</WCtl>
    </div>
  );
};

/* 12.1 asteroid formation */
W.asteroids = function ({ cfg, onState }) {
  const [t, setT] = uSt(0);
  const bits = uMm(() => { const r = wxRng(21); return Array.from({ length: 160 }, () => ({ a: r() * 6.28, d: 30 + r() * 150, s: 1 + r() * 2.5 })); }, []);
  const planets = [[55, 4], [85, 5], [115, 5], [148, 4]];
  useRep(onState, { t }, [t]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 400" className="wsvg" style={{ maxWidth: 420, background: 'oklch(0.2 0.02 270)', borderRadius: 6 }}>
        <circle cx="200" cy="200" r={8 + t * 6} fill="oklch(0.85 0.15 85)" />
        {bits.map((b, i) => { const belt = b.d > 165 && b.d < 185; const near = planets.find(([d]) => Math.abs(b.d - d) < 14); const k = Math.min(1, t * 1.2); const dd = near && !belt ? b.d + (near[0] - b.d) * k : belt ? 175 + (b.d - 175) * 0.3 : b.d; const op = near && !belt ? 1 - k * 0.9 : 1; const ang = b.a + t * (4 / Math.sqrt(dd)); return <circle key={i} cx={200 + dd * Math.cos(ang)} cy={200 + dd * Math.sin(ang)} r={b.s} fill="oklch(0.75 0.03 60)" opacity={op} />; })}
        {planets.map(([d, s], i) => <circle key={i} cx={200 + d * Math.cos(t * 4 / Math.sqrt(d) + i)} cy={200 + d * Math.sin(t * 4 / Math.sqrt(d) + i)} r={s * t * 1.4 + 0.1} fill={['#c9a', '#8ac', '#7b8', '#d86'][i]} />)}
      </svg>
      <div className="wnote">{t < 0.3 ? 'A young star surrounded by a disc of dust and rock.' : t < 0.8 ? 'Rocks collide and clump together, gradually growing into planets.' : 'Planets have formed. Leftover rocks that never joined a planet remain, mostly in the asteroid belt between Mars and Jupiter.'} Asteroids are rocky bodies smaller than planets.</div>
      <WCtl><WSl label="Time" v={t} set={setT} min={0} max={1} step={0.01} fmt={v => Math.round(v * 100) + ' million years'} /></WCtl>
    </div>
  );
};

/* 12.2 galaxy zoom */
W.galaxy = function ({ cfg, onState }) {
  const levels = [['Planetary system', 'A star with planets, moons, asteroids and comets orbiting it. Our solar system is one.'], ['Star', 'A huge ball of hot gas (mostly hydrogen and helium) producing light through nuclear fusion.'], ['Galaxy', 'Billions of stars and their planetary systems, plus clouds of dust and gas, held together by gravity. The Milky Way is a spiral galaxy.'], ['Universe', 'Billions of galaxies separated by vast distances.']];
  const [z, setZ] = uSt(2);
  const stars = uMm(() => { const r = wxRng(4); return Array.from({ length: 500 }, (_, i) => { const arm = i % 2, t = r() * 4; const a = t + arm * Math.PI + (r() - 0.5) * 0.6; const d = 10 + t * 40 + (r() - 0.5) * 20; return [200 + d * Math.cos(a), 200 + d * Math.sin(a) * 0.6, r()]; }); }, []);
  useRep(onState, { z }, [z]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 300" className="wsvg" style={{ background: 'oklch(0.18 0.02 270)', borderRadius: 6 }}>
        {z === 2 && <>{stars.map(([x, y, b], i) => <circle key={i} cx={x} cy={y - 50} r={b * 1.4 + 0.3} fill={`oklch(${0.7 + b * 0.3} 0.05 ${70 + b * 200})`} />)}<ellipse cx="200" cy="150" rx="150" ry="70" fill="oklch(0.6 0.05 300 / .12)" /></>}
        {z === 3 && Array.from({ length: 40 }, (_, i) => { const r = wxRng(i + 1); return <ellipse key={i} cx={r() * 400} cy={r() * 300} rx={3 + r() * 8} ry={1.5 + r() * 4} fill={`oklch(0.8 0.04 ${r() * 360} / .7)`} transform={`rotate(${r() * 180} ${0} ${0})`} />; })}
        {z === 1 && <><circle cx="200" cy="150" r="70" fill="oklch(0.85 0.16 80)" /><circle cx="200" cy="150" r="90" fill="oklch(0.85 0.16 80 / .15)" /></>}
        {z === 0 && <><circle cx="200" cy="150" r="14" fill="oklch(0.85 0.16 80)" />{[40, 65, 95, 130].map((d, i) => <g key={i}><circle cx="200" cy="150" r={d} fill="none" stroke="oklch(0.6 0.02 270)" /><circle cx={200 + d * Math.cos(i * 1.7)} cy={150 + d * Math.sin(i * 1.7)} r={3 + i} fill={['#c9a', '#8ac', '#7b8', '#d86'][i]} /></g>)}</>}
      </svg>
      <div className="wbig">{levels[z][0]}</div><p>{levels[z][1]}</p>
      <WCtl><WSl label="Zoom" v={z} set={setZ} min={0} max={3} fmt={v => levels[v][0]} /></WCtl>
    </div>
  );
};

/* 11.3 energy resources: power a town */
W.energymix = function ({ cfg, onState }) {
  const src = [['Coal', 'non', 30, 10], ['Gas', 'non', 25, 6], ['Oil', 'non', 25, 8], ['Wind', 'ren', 15, 0], ['Solar', 'ren', 12, 0], ['Tidal', 'ren', 10, 0], ['Hydro', 'ren', 15, 0]];
  const [use, setUse] = uSt({ Coal: 2, Gas: 1, Wind: 1 });
  const tot = src.reduce((a, s) => a + (use[s[0]] || 0) * s[2], 0), co2 = src.reduce((a, s) => a + (use[s[0]] || 0) * s[3], 0);
  const ren = src.filter(s => s[1] === 'ren').reduce((a, s) => a + (use[s[0]] || 0) * s[2], 0);
  useRep(onState, { tot, co2, renPct: tot ? ren / tot : 0 }, [tot, co2]);
  return (
    <div className="wbox">
      <div className="wmix">{src.map(([n, k, out, c]) => <div key={n} className={'wmix-r ' + k}><span>{n}</span><span className="mono">{k === 'ren' ? 'renewable' : 'non-renewable'}</span><WNum label="" v={use[n] || 0} set={v => setUse({ ...use, [n]: v })} min={0} max={4} /></div>)}</div>
      <div className="wpb"><span className="mono">Power for town (need 100)</span><div className="wpb-t"><i style={{ width: Math.min(100, tot) + '%', background: tot >= 100 ? 'var(--ok)' : undefined }} /><span>{tot}</span></div></div>
      <div className="wpb"><span className="mono">CO₂ emissions</span><div className="wpb-t"><i className="b" style={{ width: Math.min(100, co2 * 2) + '%' }} /><span>{co2}</span></div></div>
      <div className="wnote">Fossil fuels are non-renewable: they will run out, and burning them releases CO₂. Renewable sources (wind, solar, tidal, hydro, and bioplastics from plants) won't run out but can depend on the weather.</div>
    </div>
  );
};

/* Earth's magnetic field */
W.earthmag = function ({ cfg, onState }) {
  const [show, setShow] = uSt(true);
  useRep(onState, { show }, [show]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 260" className="wsvg">
        {show && [40, 70, 100, 130].map((r, i) => <g key={i}><ellipse cx="200" cy="130" rx={r * 1.5} ry={r} className="w-fline" transform="rotate(90 200 130)" /></g>)}
        <circle cx="200" cy="130" r="70" className="w-earth" /><circle cx="200" cy="130" r="26" fill="oklch(0.7 0.14 60)" />
        <rect x="192" y="95" width="16" height="70" fill="oklch(0.55 0.15 25)" opacity=".7" /><text x="200" y="92" textAnchor="middle" className="w-lab">S</text><text x="200" y="178" textAnchor="middle" className="w-lab">N</text>
        <text x="200" y="20" textAnchor="middle" className="w-lab">Geographic North Pole</text>
      </svg>
      <div className="wnote">Earth's iron-rich core behaves like a giant bar magnet, so Earth has a magnetic field. A compass's north pole points towards the Arctic, which means the magnet's south pole is actually there.</div>
      <WCtl><button className="chip" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'} field</button></WCtl>
    </div>
  );
};
