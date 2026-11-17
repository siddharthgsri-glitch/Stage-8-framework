/* Science widgets: biology + chemistry */

/* 1.1 blood: centrifuged tube with tappable layers */
W.blood = function ({ cfg, onState }) {
  const layers = [['Plasma', 55, 'oklch(0.9 0.09 90)', 'A yellow liquid, mostly water. Carries dissolved food (glucose), carbon dioxide, hormones and the blood cells.'], ['White blood cells & platelets', 1, 'oklch(0.95 0.01 90)', 'White blood cells protect against pathogens: some engulf microbes, others make antibodies. Platelets help blood clot.'], ['Red blood cells', 44, 'oklch(0.5 0.17 25)', 'Red blood cells contain haemoglobin, which carries oxygen from the lungs to cells. They have no nucleus, leaving more room for haemoglobin.']];
  const [sel, setSel] = uSt(null), [spun, setSpun] = uSt(false), [seen, setSeen] = uSt([]);
  uEf(() => { if (sel != null && !seen.includes(sel)) setSeen([...seen, sel]); }, [sel]);
  useRep(onState, { spun, seen: seen.length }, [spun, seen.length]);
  let y = 30;
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 160 300" className="wsvg" style={{ maxWidth: 170 }}>
          <path d="M50,20 L50,260 Q50,290 80,290 Q110,290 110,260 L110,20" className="w-tube" />
          {spun ? layers.map((l, i) => { const h = Math.max(6, l[1] * 2.4); const el = <rect key={i} x="52" y={y} width="56" height={h} style={{ fill: l[2], cursor: 'pointer', stroke: sel === i ? 'var(--ink)' : 'none', strokeWidth: 2 }} onClick={() => setSel(i)} />; y += h; return el; })
            : <rect x="52" y="30" width="56" height="242" style={{ fill: 'oklch(0.45 0.16 25)' }} />}
        </svg>
        <div className="wlist">
          {!spun ? <><div className="wbig">Whole blood</div><div className="wnote">Spin the sample in a centrifuge to separate its parts.</div><button className="btn small" onClick={() => setSpun(true)}>Spin the tube</button></>
            : sel == null ? <div className="wnote">Tap each layer to find out what it does.</div>
              : <><div className="wbig">{layers[sel][0]}</div><div className="wnote">~{layers[sel][1]}% of blood</div><p>{layers[sel][3]}</p></>}
          {spun && <div className="mono">Explored {seen.length}/3</div>}
        </div>
      </div>
    </div>
  );
};

/* 1.2 breathing: diaphragm & intercostals + gas exchange */
W.lungs = function ({ cfg, onState }) {
  const [t, setT] = uSt(0), [mode, setMode] = uSt('breathe');
  const inh = t > 0.5;
  useRep(onState, { t, mode, inh }, [t, mode]);
  const dy = t * 26, rib = t * 14, lv = 1 + t * 0.25;
  return (
    <div className="wbox">
      {mode === 'breathe' ? <div className="wsplit">
        <svg viewBox="0 0 260 260" className="wsvg" style={{ maxWidth: 280 }}>
          <path d={`M${40 - rib},70 Q130,${10 - rib} ${220 + rib},70 L${220 + rib},${190 + dy * 0.2} L${40 - rib},${190 + dy * 0.2} Z`} className="w-chest" />
          {[0, 1, 2, 3].map(i => <path key={i} d={`M${44 - rib},${85 + i * 26} Q130,${70 + i * 26 - rib} ${216 + rib},${85 + i * 26}`} className="w-rib" />)}
          <line x1="130" y1="30" x2="130" y2="95" className="w-trach" />
          <g style={{ transform: `scale(${lv})`, transformOrigin: '130px 110px', transition: 'transform .3s' }}>
            <ellipse cx="95" cy="130" rx="32" ry="50" className="w-lung" /><ellipse cx="165" cy="130" rx="32" ry="50" className="w-lung" />
          </g>
          <path d={`M${40 - rib},${195 + dy * 0.2} Q130,${150 + dy} ${220 + rib},${195 + dy * 0.2}`} className="w-diaph" />
          <text x="130" y="250" textAnchor="middle" className="w-lab">{inh ? 'air in ↓' : 'air out ↑'}</text>
        </svg>
        <div className="wlist">
          <div className="wbig">{inh ? 'Inhaling' : 'Exhaling'}</div>
          <ul className="wprops">
            <li className={inh ? 'ok' : ''}>Diaphragm {inh ? 'contracts and flattens' : 'relaxes and domes upwards'}</li>
            <li className={inh ? 'ok' : ''}>Intercostal muscles {inh ? 'contract: ribs move up and out' : 'relax: ribs move down and in'}</li>
            <li className={inh ? 'ok' : ''}>Chest volume {inh ? 'increases → pressure falls → air rushes in' : 'decreases → pressure rises → air pushed out'}</li>
          </ul>
        </div>
      </div> : <div>
        <svg viewBox="0 0 400 200" className="wsvg">
          <circle cx="140" cy="100" r="80" className="w-alv" /><text x="140" y="40" textAnchor="middle" className="w-lab">alveolus (air)</text>
          <rect x="230" y="20" width="60" height="160" rx="30" className="w-cap" /><text x="260" y="196" textAnchor="middle" className="w-lab">capillary</text>
          {Array.from({ length: 10 }, (_, i) => { const p = (t + i / 10) % 1; return <circle key={'o' + i} cx={120 + p * 140} cy={60 + (i * 13) % 80} r="5" className="w-o2" />; })}
          {Array.from({ length: 6 }, (_, i) => { const p = (t + i / 6) % 1; return <circle key={'c' + i} cx={265 - p * 140} cy={80 + (i * 17) % 60} r="5" className="w-co2" />; })}
        </svg>
        <div className="wnote"><b style={{ color: 'var(--acc)' }}>● Oxygen</b> diffuses from the alveolus (high concentration) into the blood (low). <b style={{ color: 'var(--ink-3)' }}>● Carbon dioxide</b> diffuses the other way. Thin walls, a large surface area and a good blood supply make this fast.</div>
      </div>}
      <WCtl><WSeg opts={[['breathe', 'Breathing'], ['gas', 'Gas exchange']]} v={mode} set={setMode} /><WSl label={mode === 'breathe' ? 'Breathe in →' : 'Time'} v={t} set={setT} min={0} max={1} step={0.02} fmt={v => Math.round(v * 100) + '%'} /></WCtl>
      <div className="wnote">Breathing moves air in and out. Respiration is a chemical reaction in cells that releases energy. They are not the same thing!</div>
    </div>
  );
};

/* 1.3 antagonistic muscles at elbow */
W.arm = function ({ cfg, onState }) {
  const [a, setA] = uSt(150), [joint, setJoint] = uSt('hinge');
  const r = (180 - a) * Math.PI / 180;
  const sh = [60, 50], el = [60, 170];
  const hand = [el[0] + 120 * Math.sin(r), el[1] - 120 * Math.cos(r) * -1];
  const fx = el[0] + 120 * Math.sin(r), fy = el[1] + 120 * Math.cos(r) * -1 + 0;
  const H = [el[0] + 120 * Math.sin(r), el[1] - 120 * Math.cos(Math.PI - r)];
  const bend = a < 120;
  useRep(onState, { a, bend, joint }, [a, joint]);
  const ins = [el[0] + 22 * Math.sin(r), el[1] - 22 * Math.cos(Math.PI - r)];
  return (
    <div className="wbox">
      {joint === 'hinge' ? <div className="wsplit">
        <svg viewBox="0 0 220 260" className="wsvg" style={{ maxWidth: 240 }}>
          <line x1={sh[0]} y1={sh[1]} x2={el[0]} y2={el[1]} className="w-bone" />
          <line x1={el[0]} y1={el[1]} x2={H[0]} y2={H[1]} className="w-bone" />
          <path d={`M${sh[0] + 6},${sh[1] + 10} Q${sh[0] + (bend ? 46 : 22)},${(sh[1] + el[1]) / 2} ${ins[0] + 4},${ins[1]}`} className="w-musc" style={{ strokeWidth: bend ? 18 : 9 }} />
          <path d={`M${sh[0] - 6},${sh[1] + 10} Q${sh[0] - (bend ? 14 : 26)},${(sh[1] + el[1]) / 2} ${el[0] - 8},${el[1] + 6}`} className="w-musc2" style={{ strokeWidth: bend ? 8 : 16 }} />
          <circle cx={el[0]} cy={el[1]} r="9" className="w-joint" />
          <text x={sh[0] + 34} y="80" className="w-lab">biceps</text><text x="0" y="120" className="w-lab">triceps</text>
        </svg>
        <div className="wlist">
          <div className="wbig">{bend ? 'Arm bending' : 'Arm straightening'}</div>
          <ul className="wprops"><li className={bend ? 'ok' : ''}>Biceps {bend ? 'contracts (shorter, fatter)' : 'relaxes'}</li><li className={!bend ? 'ok' : ''}>Triceps {!bend ? 'contracts' : 'relaxes'}</li></ul>
          <div className="wnote">Muscles can only pull, not push, so they work in antagonistic pairs: when one contracts, the other relaxes. The elbow is a hinge joint: it moves in one plane, like a door.</div>
        </div>
      </div> : <div className="wsplit">
        <svg viewBox="0 0 220 220" className="wsvg" style={{ maxWidth: 240 }}>
          <circle cx="110" cy="90" r="34" className="w-joint" /><path d="M60,60 Q110,20 160,60" className="w-socket" />
          <line x1="110" y1="90" x2={110 + 100 * Math.sin((a - 90) * Math.PI / 90)} y2={90 + 100 * Math.cos((a - 90) * Math.PI / 90)} className="w-bone" />
        </svg>
        <div className="wlist"><div className="wbig">Ball-and-socket</div><div className="wnote">Found at the shoulder and hip. The ball fits in a cup, allowing movement in all directions and rotation.</div></div>
      </div>}
      <WCtl><WSeg opts={[['hinge', 'Elbow (hinge)'], ['ball', 'Shoulder (ball & socket)']]} v={joint} set={setJoint} /><WSl label={joint === 'hinge' ? 'Elbow angle' : 'Swing'} v={a} set={setA} min={40} max={175} fmt={v => v + '°'} /></WCtl>
    </div>
  );
};

/* 2.1 balanced diet: build a meal */
W.diet = function ({ cfg, onState }) {
  const foods = [['Rice', { carb: 3, fat: 0, prot: 1 }], ['Chicken', { prot: 3, fat: 1 }], ['Lentils', { prot: 2, carb: 2, iron: 2 }], ['Spinach', { iron: 2, vitA: 2, vitC: 1 }], ['Orange', { vitC: 3, carb: 1 }], ['Milk', { calc: 3, prot: 1, fat: 1, vitD: 1 }], ['Butter', { fat: 3, vitA: 1 }], ['Carrot', { vitA: 3 }], ['Fish', { prot: 3, vitD: 2, fat: 1 }], ['Water', { water: 3 }], ['Bread', { carb: 3, prot: 1 }], ['Cheese', { calc: 2, prot: 2, fat: 2 }]];
  const nut = [['carb', 'Carbohydrate', 'energy'], ['prot', 'Protein', 'growth & repair'], ['fat', 'Fats & oils', 'stored energy, insulation'], ['vitA', 'Vitamin A', 'eyesight'], ['vitC', 'Vitamin C', 'healthy skin, gums'], ['vitD', 'Vitamin D', 'strong bones'], ['calc', 'Calcium', 'bones & teeth'], ['iron', 'Iron', 'red blood cells'], ['water', 'Water', 'every cell needs it']];
  const [plate, setPlate] = uSt([]);
  const tot = {}; nut.forEach(n => tot[n[0]] = 0); plate.forEach(f => Object.entries(foods.find(x => x[0] === f)[1]).forEach(([k, v]) => tot[k] += v));
  const covered = nut.filter(n => tot[n[0]] >= 2).length;
  useRep(onState, { covered, n: plate.length, all: covered === nut.length }, [plate.length, covered]);
  return (
    <div className="wbox">
      <div className="wsort-pool">{foods.map(([f]) => <button key={f} className={'wtile' + (plate.includes(f) ? ' sel' : '')} onClick={() => setPlate(plate.includes(f) ? plate.filter(x => x !== f) : [...plate, f])}>{f}</button>)}</div>
      <div className="wnutr">{nut.map(([k, l, use]) => <div key={k} className={tot[k] >= 2 ? 'ok' : ''}><span>{l}</span><div className="wpb-t"><i style={{ width: Math.min(100, tot[k] / 4 * 100) + '%' }} /></div><span className="mono">{use}</span></div>)}</div>
      <div className="wnote">{covered}/{nut.length} nutrients well covered. A balanced diet has every nutrient in the right amounts, plus fibre.</div>
    </div>
  );
};

/* 3.2 bioaccumulation */
W.bioacc = function ({ cfg, onState }) {
  const [c, setC] = uSt(0.02), [f, setF] = uSt(10);
  const lv = [['Water', 1], ['Plankton', f], ['Small fish', f * f], ['Large fish', f * f * f], ['Osprey', f * f * f * f]];
  useRep(onState, { c, f }, [c, f]);
  return (
    <div className="wbox">
      <div className="wbioc">{lv.map(([n, k], i) => <div key={n} className="wbio-l"><span className="mono">{n}</span><div className="wbio-dots">{Array.from({ length: Math.min(60, Math.ceil(Math.log10(k * 10 + 1) * 10)) }, (_, j) => <i key={j} />)}</div><b>{wxFmt(c * k, c * k < 1 ? 3 : 1)} ppm</b>{i < lv.length - 1 && <span className="wbio-ar">× {f} ↓</span>}</div>)}</div>
      <div className="wnote">Each organism eats many of the one below. The toxin (e.g. DDT, mercury) is not broken down or excreted, so it builds up at each level. Top predators get the highest dose and may be harmed even though the water seems safe.</div>
      <WCtl><WSl label="Toxin in water (ppm)" v={c} set={setC} min={0.01} max={0.1} step={0.01} fmt={v => wxFmt(v, 2)} /><WSl label="Concentrated ×" v={f} set={setF} min={2} max={10} /></WCtl>
    </div>
  );
};

/* 3.3 invasive species population model */
W.invasive = function ({ cfg, onState }) {
  const [intro, setIntro] = uSt(true), [comp, setComp] = uSt(0.6), [pred, setPred] = uSt(0);
  const yrs = 20, nat = [], inv = [];
  let N = 80, I = intro ? 4 : 0;
  for (let y = 0; y <= yrs; y++) { nat.push(N); inv.push(I); const dN = 0.3 * N * (1 - (N + comp * 1.4 * I) / 100); const dI = 0.55 * I * (1 - (I + 0.2 * N) / 120) - pred * I * 0.06; N = Math.max(0, N + dN); I = Math.max(0, I + dI); }
  const P = wxPlane(400, 200, 0, yrs, 0, 130, 26);
  useRep(onState, { intro, comp, pred, endN: nat[yrs], endI: inv[yrs] }, [intro, comp, pred]);
  return (
    <div className="wbox">
      <div className="mono">Population over 20 years: <span style={{ color: 'var(--acc)' }}>native red squirrels</span> vs <span style={{ color: 'var(--ink-2)' }}>invasive grey squirrels</span></div>
      <svg viewBox="0 0 400 210" className="wsvg">
        <line x1={P.X(0)} x2={P.X(yrs)} y1={P.Y(0)} y2={P.Y(0)} className="w-ax" /><line x1={P.X(0)} x2={P.X(0)} y1={P.Y(0)} y2={P.Y(130)} className="w-ax" />
        {[0, 5, 10, 15, 20].map(v => <text key={v} x={P.X(v)} y="205" textAnchor="middle">{v}</text>)}
        <polyline points={nat.map((v, i) => P.X(i) + ',' + P.Y(v)).join(' ')} className="w-line" fill="none" />
        <polyline points={inv.map((v, i) => P.X(i) + ',' + P.Y(v)).join(' ')} className="w-line2" fill="none" />
      </svg>
      <WRead items={[['Native after 20 yrs', Math.round(nat[yrs])], ['Invasive after 20 yrs', Math.round(inv[yrs])]]} />
      <div className="wnote">Invasive species often have no natural predators and compete for the same food and space, so native populations fall. Removing or controlling them can help.</div>
      <WCtl><WSeg opts={[[true, 'Introduce invasive'], [false, 'No invasive']]} v={intro} set={setIntro} /><WSl label="Competition for food" v={comp} set={setComp} min={0} max={1} step={0.1} /><WSl label="Predators / control" v={pred} set={setPred} min={0} max={5} /></WCtl>
    </div>
  );
};

/* 4.1 atom: Rutherford gold foil + build */
W.atom = function ({ cfg, onState }) {
  const [mode, setMode] = uSt('foil'), [p, setP] = uSt(3), [n, setN] = uSt(4), [e, setE] = uSt(3), [shots, setShots] = uSt([]);
  const fire = () => { const y = 20 + Math.random() * 160; const nucs = [60, 120, 180].map(cy => Math.abs(y - cy)); const d = Math.min(...nucs); const cy = [60, 120, 180][nucs.indexOf(d)]; const defl = d < 3 ? 'back' : d < 14 ? (y < cy ? 'up' : 'down') : 'through'; setShots(s => [...s.slice(-30), [y, defl, d]]); };
  const els = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'];
  useRep(onState, { mode, shots: shots.length, back: shots.filter(s => s[1] === 'back').length, p, n, e, neutral: p === e }, [mode, shots.length, p, n, e]);
  return (
    <div className="wbox">
      {mode === 'foil' ? <>
        <svg viewBox="0 0 400 200" className="wsvg">
          <rect x="196" y="5" width="8" height="190" className="w-foil" />
          {[60, 120, 180].map(cy => <circle key={cy} cx="200" cy={cy} r="3" className="w-nuc" />)}
          {shots.map(([y, d, dd], i) => { const end = d === 'through' ? [395, y] : d === 'back' ? [10, y + 12] : [395, y + (d === 'up' ? -60 : 60) * (1 - dd / 14)]; return <polyline key={i} points={`5,${y} 200,${y} ${end[0]},${end[1]}`} className={'w-alpha' + (d !== 'through' ? ' hit' : '')} fill="none" />; })}
        </svg>
        <WRead items={[['Fired', shots.length], ['Went straight', shots.filter(s => s[1] === 'through').length], ['Deflected / bounced', shots.filter(s => s[1] !== 'through').length]]} />
        <div className="wnote">Rutherford fired positive alpha particles at gold foil. Most went straight through, so the atom is mostly empty space. A few bounced back, so there must be a tiny, dense, positive nucleus.</div>
        <WCtl><button className="btn small" onClick={fire}>Fire 1</button><button className="btn small" onClick={() => { for (let i = 0; i < 20; i++) fire(); }}>Fire 20</button></WCtl>
      </> : <>
        <div className="wsplit">
          <svg viewBox="0 0 240 240" className="wsvg" style={{ maxWidth: 260 }}>
            <circle cx="120" cy="120" r="50" className="w-shell" /><circle cx="120" cy="120" r="90" className="w-shell" />
            {Array.from({ length: p }, (_, i) => <circle key={'p' + i} cx={120 + Math.cos(i * 2.4) * (4 + i * 1.6)} cy={120 + Math.sin(i * 2.4) * (4 + i * 1.6)} r="6" className="w-prot" />)}
            {Array.from({ length: n }, (_, i) => <circle key={'n' + i} cx={120 + Math.cos(i * 2.4 + 1.2) * (5 + i * 1.6)} cy={120 + Math.sin(i * 2.4 + 1.2) * (5 + i * 1.6)} r="6" className="w-neut" />)}
            {Array.from({ length: e }, (_, i) => { const sh = i < 2 ? 50 : 90, k = i < 2 ? i : i - 2, tot = i < 2 ? Math.min(e, 2) : e - 2; const a = k / tot * 2 * Math.PI; return <circle key={'e' + i} cx={120 + sh * Math.cos(a)} cy={120 + sh * Math.sin(a)} r="4.5" className="w-elec" />; })}
          </svg>
          <div className="wlist">
            <div className="wbig">{els[p] || '?'}{p !== e && <sup>{p > e ? (p - e > 1 ? p - e : '') + '+' : (e - p > 1 ? e - p : '') + '−'}</sup>}</div>
            <WRead items={[['Protons (+)', p], ['Neutrons (0)', n], ['Electrons (−)', e]]} />
            <div className="wnote">{p === e ? 'Neutral: the + and − charges balance.' : 'Charges don\'t balance, so this is an ion.'} The number of protons decides the element. Electrostatic attraction between the + nucleus and − electrons holds the atom together.</div>
          </div>
        </div>
        <WCtl><WNum label="Protons" v={p} set={setP} min={1} max={10} /><WNum label="Neutrons" v={n} set={setN} min={0} max={12} /><WNum label="Electrons" v={e} set={setE} min={0} max={10} /></WCtl>
      </>}
      <WCtl><WSeg opts={[['foil', 'Gold foil experiment'], ['build', 'Build an atom']]} v={mode} set={setMode} /></WCtl>
    </div>
  );
};

/* 4.2 paper chromatography */
W.chroma = function ({ cfg, onState }) {
  const [t, setT] = uSt(0), [solv, setSolv] = uSt('water');
  const inks = [['Black ink', [['oklch(0.55 0.15 280)', 0.75], ['oklch(0.7 0.14 90)', 0.45], ['oklch(0.55 0.17 25)', 0.25]]], ['Unknown X', [['oklch(0.7 0.14 90)', 0.45], ['oklch(0.55 0.17 25)', 0.25]]], ['Red dye', [['oklch(0.55 0.17 25)', 0.25]]], ['Yellow dye', [['oklch(0.7 0.14 90)', 0.45]]], ['Pencil line', []]];
  const k = solv === 'water' ? 1 : 0.7;
  const front = 30 + t * 180, base = 230;
  useRep(onState, { t, solv }, [t, solv]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 300 280" className="wsvg">
          <rect x="20" y="20" width="260" height="235" className="w-paper" />
          <rect x="20" y={base + 10} width="260" height="15" className="w-solvent" />
          <rect x="20" y={base + 10 - t * 200} width="260" height={t * 200} className="w-wet" />
          <line x1="20" x2="280" y1={base} y2={base} className="w-pencil" />
          {t > 0.05 && <line x1="20" x2="280" y1={base - t * 200} y2={base - t * 200} className="w-guide" />}
          {inks.map(([nm, spots], i) => <g key={i}>
            {spots.length === 0 ? null : spots.map(([c, rf], j) => <ellipse key={j} cx={45 + i * 55} cy={base - Math.min(t, 1) * 200 * rf * k} rx="10" ry={6 + t * 3} style={{ fill: c, opacity: 0.85 }} />)}
            <text x={45 + i * 55} y="272" textAnchor="middle" style={{ fontSize: 9 }}>{nm}</text>
          </g>)}
        </svg>
        <div className="wlist">
          <div className="wnote">The solvent soaks up the paper and carries the dyes. More soluble dyes travel further. Each dye separates into its own spot.</div>
          <div className="wnote">Unknown X has the same spots, at the same heights, as the <b>red</b> and <b>yellow</b> dyes, so it contains both.</div>
          <div className="wnote">The start line is drawn in pencil because pencil won't dissolve. It sits above the solvent so the dots don't wash away.</div>
          {t > 0.6 && <div className="wbig" style={{ fontSize: 20 }}>Rf (yellow) = distance by dye ÷ distance by solvent = {wxFmt(0.45 * k, 2)}</div>}
        </div>
      </div>
      <WCtl><WSl label="Time" v={t} set={setT} min={0} max={1} step={0.01} fmt={v => Math.round(v * 10) + ' min'} /><WSeg opts={[['water', 'Water'], ['ethanol', 'Ethanol']]} v={solv} set={setSolv} /></WCtl>
    </div>
  );
};

/* 5.1 concentration */
W.conc = function ({ cfg, onState }) {
  const [s, setS] = uSt(20), [v, setV] = uSt(100);
  const c = s / v * 1000 / 10;
  useRep(onState, { s, v, c }, [s, v]);
  const h = 40 + v / 250 * 150;
  const dots = uMm(() => { const r = wxRng(9); return Array.from({ length: 80 }, () => [r(), r()]); }, []);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 220 230" className="wsvg" style={{ maxWidth: 240 }}>
          <path d="M40,20 L40,215 L180,215 L180,20" className="w-beaker" />
          <rect x="42" y={213 - h} width="136" height={h} className="w-liquid" style={{ opacity: 0.25 + Math.min(0.6, c / 60) }} />
          {dots.slice(0, s).map(([x, y], i) => <circle key={i} cx={48 + x * 124} cy={213 - y * (h - 8) - 4} r="3" className="w-solute" />)}
        </svg>
        <div className="wlist">
          <WRead items={[['Solute particles', s], ['Volume of solvent', v + ' cm³'], ['Concentration', wxFmt(s / v * 100, 1) + ' per 100 cm³']]} />
          <div className="wnote">Concentration = how many solute particles there are in a given volume. Add more solute → more concentrated. Add more water → more dilute (same particles, more spread out).</div>
        </div>
      </div>
      <WCtl><WSl label="Solute" v={s} set={setS} min={5} max={80} step={5} /><WSl label="Volume" v={v} set={setV} min={50} max={250} step={25} fmt={x => x + ' cm³'} /></WCtl>
    </div>
  );
};

/* 5.2 solubility curves */
W.solub = function ({ cfg, onState }) {
  const salts = [['Potassium nitrate', T => 13 + 0.6 * T + 0.0148 * T * T], ['Sodium chloride', T => 35.7 + 0.04 * T], ['Copper sulfate', T => 14 + 0.45 * T + 0.0025 * T * T]];
  const [T, setT] = uSt(40), [si, setSi] = uSt(0), [add, setAdd] = uSt(50);
  const sol = salts[si][1](T);
  const P = wxPlane(380, 220, 0, 100, 0, 200, 28);
  useRep(onState, { T, si, add, sol, sat: add >= sol }, [T, si, add]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 380 230" className="wsvg">
        <line x1={P.X(0)} x2={P.X(100)} y1={P.Y(0)} y2={P.Y(0)} className="w-ax" /><line x1={P.X(0)} x2={P.X(0)} y1={P.Y(0)} y2={P.Y(200)} className="w-ax" />
        {[0, 20, 40, 60, 80, 100].map(v => <text key={v} x={P.X(v)} y="226" textAnchor="middle">{v}°C</text>)}
        {[50, 100, 150, 200].map(v => <text key={v} x="24" y={P.Y(v) + 3} textAnchor="end">{v}</text>)}
        {salts.map((s, i) => <polyline key={i} points={Array.from({ length: 21 }, (_, k) => P.X(k * 5) + ',' + P.Y(Math.min(200, s[1](k * 5)))).join(' ')} className={i === si ? 'w-line' : 'w-line3'} fill="none" />)}
        <line x1={P.X(T)} x2={P.X(T)} y1={P.Y(0)} y2={P.Y(sol)} className="w-guide" />
        <circle cx={P.X(T)} cy={P.Y(Math.min(add, 200))} r="6" className={add > sol ? 'w-pt2' : 'w-pt'} />
      </svg>
      <WRead items={[['Solubility at ' + T + '°C', wxFmt(sol, 0) + ' g / 100 g water'], ['You added', add + ' g'], ['Result', add > sol ? `saturated: ${wxFmt(add - sol, 0)} g won't dissolve` : 'all dissolves']]} />
      <div className="wnote">For most salts, solubility rises with temperature, but by very different amounts. Cool a saturated solution and crystals form.</div>
      <WCtl><WSeg opts={salts.map((s, i) => [i, s[0]])} v={si} set={setSi} /><WSl label="Temperature" v={T} set={setT} min={0} max={100} step={5} fmt={v => v + '°C'} /><WSl label="Salt added" v={add} set={setAdd} min={10} max={180} step={5} fmt={v => v + ' g'} /></WCtl>
    </div>
  );
};

/* 6.3 measuring temperature: thermometer reading */
W.thermo = function ({ cfg, onState }) {
  const readings = [21.5, 34, 18.5, 47.5];
  const [ri, setRi] = uSt(0), [g, setG] = uSt(20), [solved, setSolved] = uSt(0), [res, setRes] = uSt(null);
  const T = readings[ri];
  useRep(onState, { solved, total: readings.length, done: solved === readings.length }, [solved]);
  const P = v => 270 - (v - 10) * 5;
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 140 300" className="wsvg" style={{ maxWidth: 150 }}>
          <rect x="58" y="15" width="24" height="265" rx="12" className="w-therm" />
          <rect x="64" y={P(T)} width="12" height={275 - P(T)} className="w-merc" />
          <circle cx="70" cy="282" r="14" className="w-bulb" />
          {Array.from({ length: 51 }, (_, i) => 10 + i).map(v => <g key={v}><line x1={v % 5 ? 82 : 82} x2={v % 5 ? 88 : 96} y1={P(v)} y2={P(v)} className="w-ax" />{v % 10 === 0 && <text x="100" y={P(v) + 4}>{v}</text>}</g>)}
        </svg>
        <div className="wlist">
          <div className="wnote">Read the scale at eye level, level with the top of the liquid. Each small division is 1 °C, so you can read to the nearest 0.5 °C.</div>
          <WSl label="Your reading" v={g} set={x => { setG(x); setRes(null); }} min={10} max={60} step={0.5} fmt={v => wxFmt(v, 1) + ' °C'} />
          <button className="btn small" onClick={() => { const ok = Math.abs(g - T) < 0.01; setRes(ok); if (ok && ri + 1 > solved) setSolved(ri + 1); }}>Check reading</button>
          {res != null && <div className={'feedback ' + (res ? 'right' : 'wrong')}><span className="tag">{res ? 'Correct' : 'Not quite'}</span><span>{res ? 'Good: accurate to half a degree.' : 'Look again at where the liquid ends. Count the small divisions.'}</span></div>}
          {res && ri < readings.length - 1 && <button className="btn small" onClick={() => { setRi(ri + 1); setRes(null); }}>Next thermometer →</button>}
        </div>
      </div>
    </div>
  );
};

/* 6.4 exothermic / endothermic */
W.exoendo = function ({ cfg, onState }) {
  const rx = [['Magnesium + hydrochloric acid', 'exo', 14], ['Citric acid + sodium hydrogencarbonate', 'endo', -6], ['Dissolving ammonium nitrate', 'endo', -9], ['Burning methane', 'exo', 40], ['Neutralisation (acid + alkali)', 'exo', 7], ['Thermal decomposition of limestone', 'endo', 0]];
  const [ri, setRi] = uSt(0), [t, setT] = uSt(0), [seen, setSeen] = uSt([]);
  const [nm, kind, dT] = rx[ri];
  uEf(() => setT(0), [ri]);
  uEf(() => { if (t > 0.9 && !seen.includes(ri)) setSeen([...seen, ri]); }, [t]);
  const temp = 20 + dT * (1 - Math.exp(-t * 4));
  useRep(onState, { seen: seen.length, exo: seen.filter(i => rx[i][1] === 'exo').length, endo: seen.filter(i => rx[i][1] === 'endo').length }, [seen.length]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 220 230" className="wsvg" style={{ maxWidth: 240 }}>
          <path d="M50,40 L50,210 L170,210 L170,40" className="w-beaker" />
          <rect x="52" y="110" width="116" height="98" className="w-liquid" style={{ fill: kind === 'exo' ? `oklch(0.85 ${0.02 + t * 0.1} 40)` : `oklch(0.85 ${0.02 + t * 0.08} 240)` }} />
          {t > 0 && Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${70 + i * 12},105 l 0,-${10 + t * 30}`} className="w-heat" style={{ opacity: kind === 'exo' ? t : 0 }} />)}
          <rect x="140" y="20" width="10" height="170" rx="5" className="w-therm" /><rect x="142" y={190 - (temp - 0) * 3} width="6" height={(temp - 0) * 3} className="w-merc" />
        </svg>
        <div className="wlist">
          <div className="wbig">{wxFmt(temp, 1)} °C</div>
          <div className="wnote">{t < 0.3 ? 'Start the reaction and watch the thermometer.' : kind === 'exo' ? 'Temperature rises: energy is transferred to the surroundings. EXOTHERMIC.' : dT === 0 ? 'Needs continuous heating to happen: energy is taken in. ENDOTHERMIC.' : 'Temperature falls: energy is taken in from the surroundings. ENDOTHERMIC.'}</div>
          <div className="mono">Tested {seen.length}/{rx.length}</div>
        </div>
      </div>
      <WCtl><WSeg opts={rx.map((r, i) => [i, r[0]])} v={ri} set={setRi} /><WSl label="Time" v={t} set={setT} min={0} max={1} step={0.02} fmt={v => Math.round(v * 120) + ' s'} /></WCtl>
    </div>
  );
};

/* 6.5 reactivity series lab */
W.reactivity = function ({ cfg, onState }) {
  const metals = [['Potassium', 10], ['Sodium', 9], ['Calcium', 8], ['Magnesium', 7], ['Zinc', 5], ['Iron', 4], ['Copper', 2], ['Silver', 1], ['Gold', 0]];
  const [mi, setMi] = uSt(3), [with_, setWith] = uSt('acid'), [tested, setTested] = uSt({});
  const [nm, r] = metals[mi];
  const eff = with_ === 'water' ? (r >= 8 ? 3 : r === 7 ? 1 : 0) : with_ === 'acid' ? (r >= 8 ? 4 : r >= 4 ? Math.max(1, r - 4) : 0) : (r >= 8 ? 3 : r >= 4 ? 2 : r >= 2 ? 1 : 0);
  const desc = {
    water: ['No reaction.', 'Very slow: a few bubbles over days (reacts with steam).', '', 'Reacts vigorously: fizzes, moves around, gives hydrogen + metal hydroxide.'],
    acid: ['No reaction.', 'Slow bubbles of hydrogen.', 'Steady fizzing: hydrogen gas + a salt.', 'Rapid fizzing, gets hot.', 'DANGEROUS: explosive reaction, never done in school!'],
    oxygen: ['Does not react, stays shiny.', 'Slowly forms a dull oxide layer when heated.', 'Burns when heated, forming a metal oxide.', 'Reacts quickly, even tarnishing in air.'],
  }[with_][eff];
  uEf(() => setTested(t => ({ ...t, [nm]: true })), [mi]);
  useRep(onState, { tested: Object.keys(tested).length, with_ }, [Object.keys(tested).length, with_]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 200 240" className="wsvg" style={{ maxWidth: 220 }}>
          <path d="M70,20 L70,200 Q70,225 100,225 Q130,225 130,200 L130,20" className="w-tube" />
          {with_ !== 'oxygen' && <rect x="72" y="100" width="56" height="120" rx="4" className="w-liquid" />}
          <rect x="86" y={with_ === 'oxygen' ? 120 : 190} width="28" height="16" rx="3" className="w-metal" style={{ fill: nm === 'Gold' ? 'oklch(0.78 0.13 85)' : nm === 'Copper' ? 'oklch(0.62 0.12 45)' : 'oklch(0.72 0.01 250)' }} />
          {with_ !== 'oxygen' && Array.from({ length: eff * 6 }, (_, i) => <circle key={i} cx={80 + (i * 37) % 40} cy={190 - ((i * 53) % 90)} r={2 + (i % 3)} className="w-bubble" style={{ animationDelay: (i * 0.13) + 's' }} />)}
          {with_ === 'oxygen' && eff >= 2 && <path d="M100,115 q -14,-20 0,-40 q 14,20 0,40" className="w-flame" style={{ transform: `scale(${eff / 2})`, transformOrigin: '100px 115px' }} />}
          {with_ === 'oxygen' && <path d="M80,240 L120,240 L100,200 Z" className="w-burner" />}
        </svg>
        <div className="wlist">
          <div className="wbig">{nm} + {with_ === 'acid' ? 'dilute acid' : with_}</div>
          <p>{desc}</p>
          <div className="wreact">{metals.map(([m], i) => <span key={m} className={(i === mi ? 'on ' : '') + (tested[m] ? 'seen' : '')} onClick={() => setMi(i)}>{m}</span>)}</div>
          <div className="wnote">Most reactive at the top. Gold and silver are so unreactive they're found pure in nature.</div>
        </div>
      </div>
      <WCtl><WSeg opts={[['water', 'Cold water'], ['acid', 'Dilute acid'], ['oxygen', 'Heat in oxygen']]} v={with_} set={setWith} /></WCtl>
    </div>
  );
};
