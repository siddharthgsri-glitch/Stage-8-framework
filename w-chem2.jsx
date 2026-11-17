/* Extra chemistry models */

/* Atomic models timeline */
W.atomhist = function ({ cfg, onState }) {
  const M = [['Dalton (1803)', 'Atoms are tiny solid spheres that cannot be divided.'], ['Thomson (1897)', '"Plum pudding": a ball of positive charge with negative electrons dotted through it. He discovered the electron.'], ['Rutherford (1911)', 'A tiny, dense, positive nucleus with electrons around it. The atom is mostly empty space. Based on the gold foil evidence.'], ['Modern', 'The nucleus contains protons (+) and neutrons (0); electrons (−) are in shells. Scientists improve models as new evidence appears.']];
  const [i, setI] = uSt(0), [seen, setSeen] = uSt([0]);
  uEf(() => { if (!seen.includes(i)) setSeen([...seen, i]); }, [i]);
  useRep(onState, { seen: seen.length }, [seen.length]);
  const art = [
    <circle cx="110" cy="100" r="70" fill="oklch(0.7 0.03 250)" />,
    <g><circle cx="110" cy="100" r="70" fill="oklch(0.85 0.08 25)" />{[[80, 70], [130, 60], [100, 110], [145, 120], [70, 130], [115, 145]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r="7" fill="var(--acc)" />)}</g>,
    <g><circle cx="110" cy="100" r="70" fill="none" stroke="var(--rule)" strokeDasharray="3 4" /><circle cx="110" cy="100" r="6" fill="var(--bad)" />{[0, 1, 2].map(k => <circle key={k} cx={110 + 55 * Math.cos(k * 2.1)} cy={100 + 55 * Math.sin(k * 2.1)} r="5" fill="var(--acc)" />)}</g>,
    <g>{[35, 65].map(r => <circle key={r} cx="110" cy="100" r={r} fill="none" stroke="var(--rule)" strokeWidth="1.5" />)}<circle cx="104" cy="96" r="6" fill="var(--bad)" /><circle cx="116" cy="96" r="6" fill="var(--ink-3)" /><circle cx="110" cy="106" r="6" fill="var(--bad)" /><circle cx="116" cy="108" r="6" fill="var(--ink-3)" />{[0, 3.14].map((a, k) => <circle key={k} cx={110 + 35 * Math.cos(a)} cy={100 + 35 * Math.sin(a)} r="5" fill="var(--acc)" />)}<circle cx="110" cy="35" r="5" fill="var(--acc)" /></g>,
  ];
  return (
    <div className="wbox">
      <div className="wsplit"><svg viewBox="0 0 220 200" className="wsvg" style={{ maxWidth: 240 }}>{art[i]}</svg><div className="wlist"><div className="wbig">{M[i][0]}</div><p>{M[i][1]}</p></div></div>
      <div className="wtimeline">{M.map((m, k) => <button key={k} className={'chip' + (k === i ? ' on' : '')} onClick={() => setI(k)}>{m[0]}</button>)}</div>
      <div className="wnote">Scientific knowledge develops through collective understanding and scrutiny over time: each model was replaced when new evidence did not fit.</div>
    </div>
  );
};

/* Rf calculator */
W.rf = function ({ cfg, onState }) {
  const [sol, setSol] = uSt(8), [spot, setSpot] = uSt(3.6);
  const rf = spot / sol;
  const ref = [['Red E129', 0.25], ['Yellow E102', 0.45], ['Blue E133', 0.75]];
  const match = ref.find(r => Math.abs(r[1] - rf) < 0.03);
  useRep(onState, { rf, match: !!match }, [sol, spot]);
  const s = 22;
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 160 240" className="wsvg" style={{ maxWidth: 170 }}>
          <rect x="40" y="10" width="80" height="220" fill="oklch(0.99 0.004 90)" stroke="var(--rule)" />
          <line x1="40" x2="120" y1="210" y2="210" stroke="var(--ink-3)" /><line x1="40" x2="120" y1={210 - sol * s} y2={210 - sol * s} stroke="var(--acc)" strokeDasharray="4 3" />
          <ellipse cx="80" cy={210 - spot * s} rx="10" ry="7" fill="oklch(0.7 0.14 90)" />
          <line x1="130" x2="130" y1="210" y2={210 - sol * s} stroke="var(--acc)" /><text x="134" y={210 - sol * s / 2} style={{ fontSize: 10 }}>solvent</text>
          <line x1="25" x2="25" y1="210" y2={210 - spot * s} stroke="var(--ink)" /><text x="2" y={205 - spot * s / 2} style={{ fontSize: 10 }}>spot</text>
        </svg>
        <div className="wlist">
          <div className="wbig">R<sub>f</sub> = {wxFmt(spot, 1)} ÷ {wxFmt(sol, 1)} = <b>{wxFmt(rf, 2)}</b></div>
          <div className="wnote">R<sub>f</sub> = distance moved by the spot ÷ distance moved by the solvent front. It is always between 0 and 1.</div>
          <table className="wtable"><tbody>{ref.map(r => <tr key={r[0]} className={match === r ? 'w-ok' : ''}><td>{r[0]}</td><td>{r[1]}</td></tr>)}</tbody></table>
          <div className="wnote">{match ? `Matches ${match[0]}: the same substance in the same solvent.` : 'No match in the reference table.'}</div>
        </div>
      </div>
      <WCtl><WSl label="Solvent front (cm)" v={sol} set={x => { setSol(x); setSpot(Math.min(spot, x)); }} min={4} max={9} step={0.1} fmt={v => wxFmt(v, 1)} /><WSl label="Spot distance (cm)" v={spot} set={x => setSpot(Math.min(x, sol))} min={0.5} max={sol} step={0.1} fmt={v => wxFmt(v, 1)} /></WCtl>
    </div>
  );
};

/* Crystallisation on cooling */
W.crystal = function ({ cfg, onState }) {
  const sol = T => 13 + 0.6 * T + 0.0148 * T * T;
  const [T, setT] = uSt(70); const dissolved = 110;
  const crystals = Math.max(0, dissolved - sol(T));
  useRep(onState, { T, crystals }, [T]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 200 220" className="wsvg" style={{ maxWidth: 220 }}>
          <path d="M40,20 L40,200 L160,200 L160,20" fill="none" stroke="var(--ink-3)" strokeWidth="3" />
          <rect x="42" y="80" width="116" height="118" style={{ fill: `oklch(0.85 0.05 ${T > 40 ? 30 : 230})` }} />
          {Array.from({ length: Math.round(crystals / 3) }, (_, i) => <polygon key={i} points={`${50 + (i * 17) % 100},${195 - Math.floor(i / 6) * 9} ${56 + (i * 17) % 100},${187 - Math.floor(i / 6) * 9} ${62 + (i * 17) % 100},${195 - Math.floor(i / 6) * 9}`} fill="oklch(0.95 0.02 230)" stroke="oklch(0.6 0.05 230)" />)}
        </svg>
        <div className="wlist">
          <WRead items={[['Temperature', T + ' °C'], ['Can stay dissolved', wxFmt(Math.min(dissolved, sol(T)), 0) + ' g'], ['Crystals formed', wxFmt(crystals, 0) + ' g']]} />
          <div className="wnote">110 g of potassium nitrate is dissolved in 100 g of water at 70 °C. As it cools, its solubility falls and the extra solid crystallises out. This is how pure crystals are made.</div>
        </div>
      </div>
      <WCtl><WSl label="Cool the solution" v={T} set={setT} min={0} max={70} step={5} fmt={v => v + ' °C'} /></WCtl>
    </div>
  );
};

/* Particle reaction animation */
W.reaction = function ({ cfg, onState }) {
  const R = { mgo: { name: 'magnesium + oxygen → magnesium oxide', r: [['Mg', 2, 'oklch(0.7 0.01 250)'], ['O₂', 1, 'var(--bad)']], p: [['MgO', 2]] }, h2o: { name: 'hydrogen + oxygen → water', r: [['H₂', 2, 'oklch(0.9 0.02 250)'], ['O₂', 1, 'var(--bad)']], p: [['H₂O', 2]] }, ch4: { name: 'methane + oxygen → carbon dioxide + water', r: [['CH₄', 1, 'var(--ink-3)'], ['O₂', 2, 'var(--bad)']], p: [['CO₂', 1], ['H₂O', 2]] } };
  const [k, setK] = uSt('mgo'), [t, setT] = uSt(0), [seen, setSeen] = uSt([]);
  uEf(() => { if (t > 0.9 && !seen.includes(k)) setSeen([...seen, k]); }, [t, k]);
  useRep(onState, { seen: seen.length }, [seen.length]);
  const r = R[k];
  return (
    <div className="wbox">
      <div className="wrx">
        <div>{r.r.map(([f, n, c]) => Array.from({ length: n }, (_, i) => <span key={f + i} className="wmol" style={{ background: c, opacity: 1 - t, transform: `translateX(${t * 60}px)` }}>{f}</span>))}</div>
        <span className="wm-ar">→</span>
        <div>{r.p.map(([f, n]) => Array.from({ length: n }, (_, i) => <span key={f + i} className="wmol prod" style={{ opacity: t, transform: `scale(${0.5 + t / 2})` }}>{f}</span>))}</div>
      </div>
      <div className="wbig" style={{ textAlign: 'center', fontSize: 20 }}>{r.name}</div>
      <div className="wnote">In a chemical reaction the atoms are rearranged to make new substances. No atoms are lost or created, so mass is conserved.</div>
      <WCtl><WSeg opts={Object.entries(R).map(([a, b]) => [a, b.name.split(' → ')[0]])} v={k} set={x => { setK(x); setT(0); }} /><WSl label="Reaction progress" v={t} set={setT} min={0} max={1} step={0.05} fmt={v => Math.round(v * 100) + '%'} /></WCtl>
    </div>
  );
};

/* Heating curve pure vs mixture */
W.heatcurve = function ({ cfg, onState }) {
  const [mix, setMix] = uSt(false), [t, setT] = uSt(0.5);
  const temp = x => { if (!mix) return x < 0.35 ? 20 + x / 0.35 * 80 : x < 0.7 ? 100 : 100 + (x - 0.7) * 60; return x < 0.35 ? 20 + x / 0.35 * 82 : x < 0.75 ? 102 + (x - 0.35) * 20 : 110 + (x - 0.75) * 60; };
  const P = wxPlane(380, 200, 0, 1, 0, 130, 28);
  useRep(onState, { mix }, [mix]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 380 210" className="wsvg">
        <line x1={P.X(0)} x2={P.X(1)} y1={P.Y(0)} y2={P.Y(0)} className="w-ax" /><line x1={P.X(0)} x2={P.X(0)} y1={P.Y(0)} y2={P.Y(130)} className="w-ax" />
        {[0, 50, 100].map(v => <text key={v} x="22" y={P.Y(v) + 3} textAnchor="end">{v}</text>)}<text x={P.X(1)} y="205" textAnchor="end">time heating →</text>
        <polyline points={Array.from({ length: 51 }, (_, i) => P.X(i / 50) + ',' + P.Y(temp(i / 50))).join(' ')} className="w-line" fill="none" />
        <circle cx={P.X(t)} cy={P.Y(temp(t))} r="6" className="w-pt2" />
      </svg>
      <div className="wnote">{mix ? 'Salt water boils over a RANGE of temperatures, above 100 °C. A mixture has no fixed boiling point.' : 'Pure water boils at exactly 100 °C: the line goes flat. A fixed melting or boiling point is a test of purity.'}</div>
      <WCtl><WSeg opts={[[false, 'Pure water'], [true, 'Salt water (mixture)']]} v={mix} set={setMix} /><WSl label="Time" v={t} set={setT} min={0} max={1} step={0.01} fmt={v => wxFmt(temp(v), 0) + ' °C'} /></WCtl>
    </div>
  );
};

/* Temperature-time graph for a reaction */
W.tempgraph = function ({ cfg, onState }) {
  const [mass, setMass] = uSt(0.2), [k, setK] = uSt('exo'), [n, setN] = uSt(0);
  const peak = (k === 'exo' ? 1 : -0.5) * mass * 60;
  const T = t => t < 1 ? 20 : 20 + peak * (1 - Math.exp(-(t - 1) / 1.2)) * Math.exp(-(t - 1) / 12);
  const pts = Array.from({ length: n + 1 }, (_, i) => [i, T(i)]);
  const P = wxPlane(380, 200, 0, 10, 0, 40, 28);
  useRep(onState, { n, k, mass }, [n, k, mass]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 380 210" className="wsvg">
        <line x1={P.X(0)} x2={P.X(10)} y1={P.Y(0)} y2={P.Y(0)} className="w-ax" /><line x1={P.X(0)} x2={P.X(0)} y1={P.Y(0)} y2={P.Y(40)} className="w-ax" />
        {[0, 10, 20, 30, 40].map(v => <text key={v} x="22" y={P.Y(v) + 3} textAnchor="end">{v}</text>)}{[0, 2, 4, 6, 8, 10].map(v => <text key={v} x={P.X(v)} y="205" textAnchor="middle">{v}</text>)}
        {pts.length > 1 && <polyline points={pts.map(([x, y]) => P.X(x) + ',' + P.Y(y)).join(' ')} className="w-line" fill="none" />}
        {pts.map(([x, y]) => <circle key={x} cx={P.X(x)} cy={P.Y(y)} r="4" className="w-pt" />)}
      </svg>
      <table className="wtable"><tbody><tr><th>min</th>{pts.map(p => <td key={p[0]}>{p[0]}</td>)}</tr><tr><th>°C</th>{pts.map(p => <td key={p[0]}>{wxFmt(p[1], 1)}</td>)}</tr></tbody></table>
      <div className="wnote">Record the temperature every minute. The reactant is added at 1 minute. The biggest change shows how exo- or endothermic the reaction is, and more reactant gives a bigger change.</div>
      <WCtl><WSeg opts={[['exo', 'Magnesium + acid'], ['endo', 'Citric acid + bicarbonate']]} v={k} set={x => { setK(x); setN(0); }} /><WSl label="Mass of solid (g)" v={mass} set={x => { setMass(x); setN(0); }} min={0.1} max={0.5} step={0.1} fmt={v => wxFmt(v, 1)} /><button className="btn small" disabled={n >= 10} onClick={() => setN(n + 1)}>Take reading</button><button className="chip" onClick={() => setN(10)}>All readings</button></WCtl>
    </div>
  );
};

/* Energy level diagram */
W.energylevel = function ({ cfg, onState }) {
  const [k, setK] = uSt('exo');
  useRep(onState, { k }, [k]);
  const exo = k === 'exo';
  return (
    <div className="wbox">
      <svg viewBox="0 0 380 220" className="wsvg">
        <line x1="40" x2="40" y1="20" y2="200" className="w-ax" /><text x="30" y="110" transform="rotate(-90 30 110)" textAnchor="middle">energy</text>
        <line x1="60" x2="150" y1={exo ? 70 : 150} y2={exo ? 70 : 150} stroke="var(--ink)" strokeWidth="3" /><text x="105" y={exo ? 62 : 142} textAnchor="middle" style={{ fontSize: 12 }}>reactants</text>
        <line x1="240" x2="330" y1={exo ? 150 : 70} y2={exo ? 150 : 70} stroke="var(--ink)" strokeWidth="3" /><text x="285" y={exo ? 142 : 62} textAnchor="middle" style={{ fontSize: 12 }}>products</text>
        <path d={`M150,${exo ? 70 : 150} Q195,${exo ? 20 : 40} 240,${exo ? 150 : 70}`} fill="none" stroke="var(--ink-3)" strokeDasharray="4 4" />
        <line x1="200" x2="200" y1="70" y2="150" stroke={exo ? 'var(--bad)' : 'var(--acc)'} strokeWidth="3" markerEnd="url(#ela)" />
        <defs><marker id="ela" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={exo ? 'var(--bad)' : 'var(--acc)'} /></marker></defs>
        <text x="208" y="115" style={{ fontSize: 12 }}>{exo ? 'energy released' : 'energy taken in'}</text>
      </svg>
      <div className="wnote">{exo ? 'Exothermic: the products have less energy than the reactants. The difference is transferred to the surroundings, so they warm up.' : 'Endothermic: the products have more energy than the reactants. Energy is taken from the surroundings, so they cool down.'}</div>
      <WCtl><WSeg opts={[['exo', 'Exothermic'], ['endo', 'Endothermic']]} v={k} set={setK} /></WCtl>
    </div>
  );
};

/* Displacement */
W.displace = function ({ cfg, onState }) {
  const order = ['Magnesium', 'Zinc', 'Iron', 'Copper', 'Silver'];
  const salts = { Zinc: 'zinc sulfate', Iron: 'iron sulfate', Copper: 'copper sulfate', Silver: 'silver nitrate', Magnesium: 'magnesium sulfate' };
  const [m, setM] = uSt('Zinc'), [s, setS] = uSt('Copper'), [log, setLog] = uSt({});
  const yes = order.indexOf(m) < order.indexOf(s);
  uEf(() => { if (m !== s) setLog(l => ({ ...l, [m + s]: yes })); }, [m, s]);
  useRep(onState, { n: Object.keys(log).length, yes }, [Object.keys(log).length, yes]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 200 220" className="wsvg" style={{ maxWidth: 220 }}>
          <path d="M50,20 L50,200 L150,200 L150,20" fill="none" stroke="var(--ink-3)" strokeWidth="3" />
          <rect x="52" y="70" width="96" height="128" style={{ fill: s === 'Copper' ? (yes && m !== s ? 'oklch(0.9 0.03 230)' : 'oklch(0.7 0.12 230)') : 'oklch(0.94 0.01 230)', transition: 'fill 1s' }} />
          <rect x="88" y="10" width="24" height="150" rx="3" fill="oklch(0.72 0.01 250)" />
          {yes && m !== s && <rect x="86" y="80" width="28" height="80" rx="3" fill={s === 'Copper' ? 'oklch(0.6 0.13 45)' : 'oklch(0.85 0.01 250)'} opacity=".85" />}
        </svg>
        <div className="wlist">
          <div className="wbig">{m} + {salts[s]}</div>
          <p>{m === s ? 'Same metal: no reaction.' : yes ? `${m} is MORE reactive than ${s.toLowerCase()}, so it displaces it: ${m.toLowerCase()} + ${salts[s]} → ${salts[m]} + ${s.toLowerCase()}.` : `${m} is LESS reactive than ${s.toLowerCase()}, so there is no reaction.`}</p>
          <div className="wnote">A more reactive metal displaces a less reactive metal from a solution of its compound.</div>
        </div>
      </div>
      <WCtl><WSeg label="Metal strip" opts={order} v={m} set={setM} /><WSeg label="Solution of" opts={order.filter(x => x !== 'Magnesium')} v={s} set={setS} /></WCtl>
    </div>
  );
};
