/* Liquids & gases models: particles, pressure, hydraulics, purity, balloon, diffusion, gas piston */

const LIQS = { water: ['Water', 1, 'oklch(0.72 0.1 230)'], oil: ['Cooking oil', 0.9, 'oklch(0.85 0.12 90)'], salt: ['Salt water', 1.2, 'oklch(0.68 0.09 210)'], honey: ['Honey', 1.4, 'oklch(0.75 0.14 70)'] };

/* Liquid particles + pressure probe */
W.liqparticles = function ({ cfg, onState }) {
  const [depth, setDepth] = uSt(0.3), [liq, setLiq] = uSt('water');
  const [d0, rho, col] = [LIQS[liq][0], LIQS[liq][1], LIQS[liq][2]];
  const top = 40, bot = 250, px = 150, py = top + 14 + depth * (bot - top - 28);
  const parts = uMm(() => { const r = wxRng(5), out = []; for (let y = top + 9; y < bot - 6; y += 15) for (let x = 30; x < 290; x += 15) out.push([x + (r() - 0.5) * 4, y + (r() - 0.5) * 4]); return out; }, []);
  const above = parts.filter(([x, y]) => Math.abs(x - px) < 16 && y < py - 10).length;
  const P = depth * rho;
  const band = depth < 0.3 ? 'low' : depth > 0.7 ? 'high' : 'mid';
  useRep(onState, { depth, liquid: liq, depthBand: band, P }, [depth, liq]);
  const L = 10 + P * 26;
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 320 270" className="wsvg">
          <rect x="20" y="20" width="280" height="235" rx="6" fill="none" stroke="var(--ink-3)" strokeWidth="3" />
          <rect x="22" y={top} width="276" height={bot - top + 3} style={{ fill: col, opacity: .25 }} />
          {parts.map(([x, y], i) => { const inCol = Math.abs(x - px) < 16 && y < py - 10; return <circle key={i} cx={x} cy={y} r="6.3" className="w-lpart" style={{ fill: inCol ? 'var(--acc)' : col, animationDelay: (i % 7) * 0.13 + 's' }} />; })}
          <rect x={px - 16} y={top} width="32" height={Math.max(0, py - top - 12)} fill="none" stroke="var(--acc)" strokeDasharray="4 3" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = a * Math.PI / 180; return <line key={a} x1={px + Math.cos(r) * (14 + L)} y1={py + Math.sin(r) * (14 + L)} x2={px + Math.cos(r) * 15} y2={py + Math.sin(r) * 15} stroke="var(--bad)" strokeWidth="3" markerEnd="url(#lpa)" />; })}
          <circle cx={px} cy={py} r="11" fill="#fff" stroke="var(--ink)" strokeWidth="2.5" />
          <defs><marker id="lpa" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="var(--bad)" /></marker></defs>
          <text x="160" y="14" textAnchor="middle" style={{ fontSize: 11 }}>surface</text>
        </svg>
        <div className="wlist">
          <div className="wbig">{d0}</div>
          <WRead items={[['Depth', Math.round(depth * 100) + ' cm'], ['Particles above probe', above], ['Pressure (relative)', wxFmt(P * 10, 1)]]} />
          <div className="wpb"><span className="mono">Pressure on the probe</span><div className="wpb-t"><i style={{ width: Math.min(100, P / 1.4 * 100) + '%' }} /><span>{band === 'high' ? 'High' : band === 'mid' ? 'Medium' : 'Low'}</span></div></div>
          <div className="wnote">Red arrows show that pressure acts in <b>every direction</b>. The deeper the probe, the more particles are above it pushing down, so the pressure gets bigger.</div>
        </div>
      </div>
      <WCtl><WSl label="Probe depth" v={depth} set={setDepth} min={0} max={1} step={0.02} fmt={v => Math.round(v * 100) + ' cm'} /><WSeg label="Liquid" opts={Object.entries(LIQS).map(([k, v]) => [k, v[0]])} v={liq} set={setLiq} /></WCtl>
    </div>
  );
};

/* Hydraulic jack: pressure transmitted through a liquid */
W.hydraulic = function ({ cfg, onState }) {
  const [F1, setF1] = uSt(150), [A1, setA1] = uSt(5), [A2, setA2] = uSt(100);
  const p = F1 / A1, F2 = p * A2, car = 8000, lifted = F2 >= car;
  const lift = Math.min(1, F2 / car);
  useRep(onState, { F1, A1, A2, p, F2, lifted }, [F1, A1, A2]);
  const w1 = 20 + A1 * 4, w2 = 40 + A2 * 0.9;
  const ly = 120 - (lifted ? 30 : lift * 10);
  return (
    <div className="wbox">
      <svg viewBox="0 0 420 240" className="wsvg">
        <path d={`M${80 - w1 / 2},60 L${80 - w1 / 2},200 L${300 + w2 / 2},200 L${300 + w2 / 2},${ly + 20} M${300 - w2 / 2},${ly + 20} L${300 - w2 / 2},180 L${80 + w1 / 2},180 L${80 + w1 / 2},60`} fill="none" stroke="var(--ink-3)" strokeWidth="3" />
        <rect x={80 - w1 / 2 + 2} y={90 + (lifted ? 20 : 0)} width={w1 - 4} height={110 - (lifted ? 20 : 0)} fill="oklch(0.75 0.1 230 / .6)" />
        <rect x={80 + w1 / 2} y="182" width={220 - w1 / 2 - w2 / 2} height="16" fill="oklch(0.75 0.1 230 / .6)" />
        <rect x={300 - w2 / 2 + 2} y={ly + 26} width={w2 - 4} height={174 - ly - 26} fill="oklch(0.75 0.1 230 / .6)" />
        <rect x={80 - w1 / 2 + 2} y={80 + (lifted ? 20 : 0)} width={w1 - 4} height="10" fill="var(--ink-2)" />
        <rect x={300 - w2 / 2 + 2} y={ly + 16} width={w2 - 4} height="10" fill="var(--ink-2)" />
        <line x1="80" y1={20 + (lifted ? 20 : 0)} x2="80" y2={74 + (lifted ? 20 : 0)} stroke="var(--acc)" strokeWidth="4" markerEnd="url(#hya)" />
        <text x="80" y={14 + (lifted ? 20 : 0)} textAnchor="middle" className="w-lab">{F1} N</text>
        <text x="300" y={ly + 8} textAnchor="middle" style={{ fontSize: 40 }}></text>
        {[110, 160, 220, 260].map((x, i) => <g key={i}><line x1={x} y1="190" x2={x + 14} y2="190" stroke="var(--bad)" strokeWidth="2" markerEnd="url(#hyb)" /></g>)}
        <defs><marker id="hya" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="var(--acc)" /></marker><marker id="hyb" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--bad)" /></marker></defs>
      </svg>
      <WRead items={[['Pressure p = F ÷ A', `${F1} ÷ ${A1} = ${wxFmt(p, 1)} N/cm²`], ['Force on big piston = p × A', `${wxFmt(p, 1)} × ${A2} = ${wxFmt(F2, 0)} N`], ['Car (8000 N)', lifted ? 'LIFTED! ' : 'too heavy']]} />
      <div className="wnote">Liquid particles are touching, so a liquid can't be squashed. When you push the small piston, the <b>same pressure</b> is passed through the whole liquid. On the big piston that pressure acts on a large area, making a much <b>bigger force</b>. Car brakes and jacks work this way.</div>
      <WCtl><WSl label="Push force F (small piston)" v={F1} set={setF1} min={10} max={300} step={10} fmt={v => v + ' N'} /><WSl label="Small piston area" v={A1} set={setA1} min={1} max={10} step={1} fmt={v => v + ' cm²'} /><WSl label="Big piston area" v={A2} set={setA2} min={20} max={200} step={10} fmt={v => v + ' cm²'} /></WCtl>
    </div>
  );
};

/* Purity */
W.purity = function ({ cfg, onState }) {
  const [c, setC] = uSt(40), [imp, setImp] = uSt(10);
  const pur = c + imp ? c / (c + imp) * 100 : 0;
  const n = 64, nc = Math.round(n * pur / 100);
  const parts = uMm(() => { const r = wxRng(8); return Array.from({ length: n }, () => [50 + r() * 120, 95 + r() * 110]); }, []);
  const order = uMm(() => wxShuffle(Array.from({ length: n }, (_, i) => i), 11), []);
  const isC = new Set(order.slice(0, nc));
  const mp = pur >= 99.99 ? [801, 801] : [Math.round(801 - (100 - pur) * 3), Math.round(801 - (100 - pur) * 1.2)];
  const band = pur >= 99.99 ? 'pure' : 'impure';
  useRep(onState, { purity: pur, band }, [Math.round(pur * 100)]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 220 230" className="wsvg" style={{ maxWidth: 240 }}>
          <path d="M40,40 L40,215 L180,215 L180,40" fill="none" stroke="var(--ink-3)" strokeWidth="3" />
          {parts.map(([x, y], i) => isC.has(i) ? <rect key={i} x={x - 5} y={y - 5} width="10" height="10" rx="2" fill="var(--acc)" /> : <circle key={i} cx={x} cy={y} r="5.5" fill={['oklch(0.65 0.15 30)', 'oklch(0.7 0.13 90)', 'oklch(0.55 0.03 60)'][i % 3]} />)}
          <text x="110" y="28" textAnchor="middle" style={{ fontSize: 11 }}>■ salt  ● impurities</text>
        </svg>
        <div className="wlist">
          <div className="wbig">Purity = <b>{wxFmt(pur, 1)}%</b></div>
          <div className="wnote">% purity = mass of the chemical ÷ total mass × 100 = {c} ÷ {c + imp} × 100</div>
          <div className="wpb"><span className="mono">Purity meter</span><div className="wpb-t"><i style={{ width: pur + '%', background: pur >= 99.99 ? 'var(--ok)' : pur > 90 ? 'var(--gold)' : 'var(--bad)' }} /><span>{pur >= 99.99 ? 'PURE ✓' : pur > 90 ? 'Nearly pure' : 'Impure mixture'}</span></div></div>
          <WRead items={[['Melting point', mp[0] === mp[1] ? mp[0] + ' °C (sharp)' : `${mp[0]}–${mp[1]} °C (range)`]]} />
          <div className="wnote">A <b>pure</b> substance contains only one chemical and melts at one exact temperature. Impurities lower the melting point and make it melt over a <b>range</b>.</div>
        </div>
      </div>
      <WCtl><WSl label="Mass of salt (g)" v={c} set={setC} min={0} max={50} step={1} fmt={v => v + ' g'} /><WSl label="Mass of impurities (g)" v={imp} set={setImp} min={0} max={30} step={1} fmt={v => v + ' g'} />
        <div className="chips">{[['Lab grade', 50, 0], ['Table salt', 49, 1], ['Rock salt', 40, 10], ['Very impure', 20, 30]].map(([l, a, b]) => <button key={l} className="chip" onClick={() => { setC(a); setImp(b); }}>{l}</button>)}</div></WCtl>
    </div>
  );
};

/* particle canvas helper */
function useParts(cv, stRef, setup, frame, deps = []) {
  uEf(() => {
    const c = cv.current, ctx = c.getContext('2d'); const Wd = c.dataset.w * 1, Ht = c.dataset.h * 1; c.width = Wd * 2; c.height = Ht * 2; ctx.scale(2, 2);
    const acc = getComputedStyle(c).getPropertyValue('--acc').trim() || '#3a8';
    const world = setup(Wd, Ht); let raf, last = performance.now(), hits = 0;
    const tick = now => { ctx.clearRect(0, 0, Wd, Ht); hits += frame(ctx, world, stRef.current, Wd, Ht, acc, now) || 0; if (now - last > 1000) { world.onSec && world.onSec(hits, now); hits = 0; last = now; } raf = requestAnimationFrame(tick); };
    tick(performance.now()); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    const iv = setInterval(() => { if (document.hidden) tick(performance.now()); }, 120);
    return () => { cancelAnimationFrame(raf); clearInterval(iv); };
  }, deps);
}

/* Balloon: gas pressure from collisions */
W.balloon = function ({ cfg, onState }) {
  const [n, setN] = uSt(20), [T, setT] = uSt(20), [hits, setHits] = uSt(0);
  const st = uRf({ n, T }); st.current = { n, T };
  const cv = uRf(null);
  useParts(cv, st, () => ({ ps: [], onSec: h => setHits(h) }), (ctx, w, s, Wd, Ht, acc) => {
    let h = 0; while (w.ps.length < s.n) { const a0 = Math.random() * 6.28, r0 = Math.random() * 40; w.ps.push({ x: 200 + Math.cos(a0) * r0, y: 120 + Math.sin(a0) * r0, a: Math.random() * 6.28 }); } w.ps.length = Math.min(w.ps.length, s.n);
    const R = 30 + Math.cbrt(s.n * (s.T + 273) / 293) * 22, sp = 0.7 + (s.T + 20) / 55, cx = 200, cy = 120;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.28); ctx.fillStyle = 'rgba(255,111,145,.13)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff6f91'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + R); ctx.lineTo(cx - 7, cy + R + 10); ctx.lineTo(cx + 7, cy + R + 10); ctx.closePath(); ctx.fillStyle = '#ff6f91'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx, cy + R + 10); ctx.quadraticCurveTo(cx + 10, cy + R + 30, cx - 5, Ht - 4); ctx.strokeStyle = '#8b84a0'; ctx.lineWidth = 1.5; ctx.stroke();
    w.ps.forEach(p => {
      p.x += Math.cos(p.a) * sp; p.y += Math.sin(p.a) * sp; p.a += (Math.random() - 0.5) * 0.1;
      const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy);
      if (d > R - 6) { const nx = dx / d, ny = dy / d, vx = Math.cos(p.a), vy = Math.sin(p.a), dot = vx * nx + vy * ny; p.a = Math.atan2(vy - 2 * dot * ny, vx - 2 * dot * nx); p.x = cx + nx * (R - 7); p.y = cy + ny * (R - 7); h++; ctx.beginPath(); ctx.arc(cx + nx * R, cy + ny * R, 4, 0, 6.28); ctx.fillStyle = 'rgba(255,190,0,.9)'; ctx.fill(); }
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 6.28); ctx.fillStyle = acc; ctx.fill();
    });
    return h;
  });
  useRep(onState, { n, T }, [n, T]);
  return (
    <div className="wbox">
      <canvas ref={cv} data-w="400" data-h="250" style={{ width: '100%', display: 'block' }} />
      <WRead items={[['Gas particles', n], ['Temperature', T + ' °C'], ['Wall hits per second', hits]]} />
      <div className="wnote">Every yellow flash is a particle <b>hitting the wall</b>. Those collisions push outwards, and that push is the gas pressure. Pump in more particles or heat the gas and there are more hits, so the pressure rises and the balloon gets bigger.</div>
      <WCtl><WSl label="Pump in gas (particles)" v={n} set={setN} min={5} max={60} step={5} /><WSl label="Temperature" v={T} set={setT} min={-20} max={100} step={10} fmt={v => v + ' °C'} /></WCtl>
    </div>
  );
};

/* Diffusion of two gases */
W.diffuse = function ({ cfg, onState }) {
  const [removed, setRemoved] = uSt(false), [T, setT] = uSt(20), [mix, setMix] = uSt(0), [secs, setSecs] = uSt(0), [run, setRun] = uSt(0);
  const st = uRf({ removed, T }); st.current = { removed, T };
  const cv = uRf(null);
  useParts(cv, st, (Wd, Ht) => {
    const ps = Array.from({ length: 70 }, (_, i) => ({ k: i < 35 ? 0 : 1, x: i < 35 ? 15 + Math.random() * (Wd / 2 - 30) : Wd / 2 + 15 + Math.random() * (Wd / 2 - 30), y: 15 + Math.random() * (Ht - 30), a: Math.random() * 6.28 }));
    const w = { ps, t0: null, onSec: () => { const left = ps.filter(p => p.k === 0); const inR = left.filter(p => p.x > Wd / 2).length; setMix(Math.min(100, Math.round(inR / (left.length / 2) * 100))); if (st.current.removed) { if (!w.t0) w.t0 = performance.now(); setSecs(Math.round((performance.now() - w.t0) / 1000)); } } };
    return w;
  }, (ctx, w, s, Wd, Ht) => {
    const sp = 0.5 + (s.T + 20) / 50;
    ctx.strokeStyle = '#8b84a0'; ctx.lineWidth = 2; ctx.strokeRect(5, 5, Wd - 10, Ht - 10);
    if (!s.removed) { ctx.fillStyle = '#5b5170'; ctx.fillRect(Wd / 2 - 3, 5, 6, Ht - 10); }
    w.ps.forEach(p => {
      p.x += Math.cos(p.a) * sp; p.y += Math.sin(p.a) * sp; if (Math.random() < 0.04) p.a += (Math.random() - 0.5) * 2;
      if (p.x < 10) { p.x = 10; p.a = Math.PI - p.a; } if (p.x > Wd - 10) { p.x = Wd - 10; p.a = Math.PI - p.a; }
      if (p.y < 10) { p.y = 10; p.a = -p.a; } if (p.y > Ht - 10) { p.y = Ht - 10; p.a = -p.a; }
      if (!s.removed) { if (p.k === 0 && p.x > Wd / 2 - 8) { p.x = Wd / 2 - 8; p.a = Math.PI - p.a; } if (p.k === 1 && p.x < Wd / 2 + 8) { p.x = Wd / 2 + 8; p.a = Math.PI - p.a; } }
      ctx.beginPath(); ctx.arc(p.x, p.y, 4.5, 0, 6.28); ctx.fillStyle = p.k ? '#4facfe' : '#ff6f61'; ctx.fill();
    });
  }, [run]);
  useRep(onState, { removed, T, mix }, [removed, T, mix]);
  return (
    <div className="wbox">
      <canvas ref={cv} data-w="400" data-h="200" style={{ width: '100%', display: 'block' }} />
      <WRead items={[['How mixed', mix + '%'], ['Time since barrier removed', removed ? secs + ' s' : '–'], ['Temperature', T + ' °C']]} />
      <div className="wpb"><div className="wpb-t"><i style={{ width: mix + '%', background: 'linear-gradient(90deg,#ff6f61,#a78bfa,#4facfe)' }} /><span>{mix >= 90 ? 'Evenly mixed ✓' : removed ? 'Diffusing…' : 'Separated'}</span></div></div>
      <div className="wnote"><b>Diffusion</b> is two substances intermingling because their particles move about randomly. Nobody stirs them! The particles spread from where there are many (high concentration) to where there are few (low concentration), and warmer particles move faster, so they mix sooner.</div>
      <WCtl>{!removed ? <button className="btn small" onClick={() => setRemoved(true)}>Remove the barrier</button> : <button className="chip" onClick={() => { setRemoved(false); setMix(0); setSecs(0); setRun(r => r + 1); }}>Reset</button>}<WSl label="Temperature" v={T} set={setT} min={-20} max={100} step={10} fmt={v => v + ' °C'} /></WCtl>
    </div>
  );
};

/* Gas in a syringe: squash it, and pressure = force ÷ area */
W.gaspiston = function ({ cfg, onState }) {
  const [V, setV] = uSt(1), [F, setF] = uSt(100), [A, setA] = uSt(0.02), [hits, setHits] = uSt(0);
  const st = uRf({ V }); st.current = { V };
  const cv = uRf(null);
  useParts(cv, st, () => ({ ps: Array.from({ length: 30 }, () => ({ x: 40 + Math.random() * 200, y: 30 + Math.random() * 100, a: Math.random() * 6.28 })), onSec: h => setHits(h) }), (ctx, w, s, Wd, Ht, acc) => {
    let h = 0; const L = 20, R = 20 + s.V * 300, T = 20, B = 140;
    ctx.strokeStyle = '#5b5170'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(R + 300, T); ctx.lineTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R + 300, B); ctx.stroke();
    ctx.fillStyle = '#8b84a0'; ctx.fillRect(R, T + 3, 10, B - T - 6); ctx.fillRect(R + 10, (T + B) / 2 - 5, 60, 10);
    w.ps.forEach(p => {
      p.x += Math.cos(p.a) * 1.8; p.y += Math.sin(p.a) * 1.8;
      if (p.x < L + 5) { p.x = L + 5; p.a = Math.PI - p.a; h++; } if (p.x > R - 5) { p.x = R - 5; p.a = Math.PI - p.a; h++; ctx.fillStyle = 'rgba(255,190,0,.9)'; ctx.beginPath(); ctx.arc(R - 1, p.y, 4, 0, 6.28); ctx.fill(); }
      if (p.y < T + 5) { p.y = T + 5; p.a = -p.a; h++; } if (p.y > B - 5) { p.y = B - 5; p.a = -p.a; h++; }
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 6.28); ctx.fillStyle = acc; ctx.fill();
    });
    return h;
  });
  const p = F / A;
  useRep(onState, { V, F, A, p, Vband: V < 0.45 ? 'small' : V > 0.85 ? 'big' : 'mid' }, [V, F, A]);
  return (
    <div className="wbox">
      <canvas ref={cv} data-w="420" data-h="160" style={{ width: '100%', display: 'block' }} />
      <WRead items={[['Volume of gas', Math.round(V * 100) + ' cm³'], ['Wall hits per second', hits], ['Effect', V < 0.45 ? 'High pressure: hard to push' : V > 0.85 ? 'Low pressure' : 'Medium pressure']]} />
      <div className="wnote">Squash the gas into a smaller space and the particles hit the walls <b>more often</b>, so the pressure goes up and you need a bigger force to hold the piston.</div>
      <div className="fm-mini"><div className="mono">Calculate: pressure of the gas on the piston</div>
        <div className="wbig" style={{ textAlign: 'center' }}>p = F ÷ A = {F} ÷ {A} = <b>{wxFmt(p, 0)} Pa</b></div></div>
      <WCtl><WSl label="Push the piston (volume)" v={V} set={setV} min={0.3} max={1} step={0.05} fmt={v => Math.round(v * 100) + ' cm³'} /><WSl label="Force F" v={F} set={setF} min={10} max={500} step={10} fmt={v => v + ' N'} /><WSl label="Piston area A" v={A} set={setA} min={0.01} max={0.1} step={0.01} fmt={v => v + ' m²'} /></WCtl>
    </div>
  );
};
