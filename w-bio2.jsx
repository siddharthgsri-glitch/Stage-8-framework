/* Extra biology models */

/* Balanced diet plate (eatwell-style) */
W.plate = function ({ cfg, onState }) {
  const groups = [['Fruit & vegetables', 39, 'oklch(0.7 0.14 140)', 'vitamins, minerals, fibre'], ['Starchy carbohydrates', 37, 'oklch(0.8 0.1 85)', 'energy'], ['Protein', 12, 'oklch(0.65 0.13 30)', 'growth & repair'], ['Dairy', 8, 'oklch(0.75 0.07 240)', 'calcium, protein'], ['Fats & oils', 1, 'oklch(0.75 0.13 60)', 'energy store (small amounts)'], ['Sugary & fatty snacks', 3, 'oklch(0.62 0.15 330)', 'eat less often']];
  const [v, setV] = uSt([20, 20, 20, 20, 10, 10]), [sel, setSel] = uSt(0), [show, setShow] = uSt(false);
  const tot = v.reduce((a, b) => a + b, 0) || 1;
  const err = groups.reduce((a, g, i) => a + Math.abs(v[i] / tot * 100 - g[1]), 0);
  useRep(onState, { err, show }, [Math.round(err), show]);
  let a0 = 90; const wedges = v.map((x, i) => { const a = x / tot * 360; const d = wxWedge(110, 110, 96, a0 - a, a0); a0 -= a; return <path key={i} d={d} style={{ fill: groups[i][2], stroke: sel === i ? 'var(--ink)' : 'var(--paper)', strokeWidth: sel === i ? 3 : 2, cursor: 'pointer' }} onClick={() => setSel(i)} />; });
  let b0 = 90; const ideal = groups.map((g, i) => { const a = g[1] * 3.6; const d = wxWedge(110, 110, 96, b0 - a, b0); b0 -= a; return <path key={i} d={d} style={{ fill: g[2], stroke: 'var(--paper)', strokeWidth: 2 }} />; });
  return (
    <div className="wbox">
      <div className="wsplit">
        <div><svg viewBox="0 0 220 220" className="wsvg" style={{ maxWidth: 240 }}><circle cx="110" cy="110" r="104" fill="var(--card)" stroke="var(--rule)" strokeWidth="4" />{wedges}</svg><div className="cap" style={{ textAlign: 'center' }}>Your plate</div></div>
        {show ? <div><svg viewBox="0 0 220 220" className="wsvg" style={{ maxWidth: 240 }}><circle cx="110" cy="110" r="104" fill="var(--card)" stroke="var(--rule)" strokeWidth="4" />{ideal}</svg><div className="cap" style={{ textAlign: 'center' }}>Recommended plate</div></div>
          : <div className="wlist">{groups.map((g, i) => <div key={i} onClick={() => setSel(i)} style={{ cursor: 'pointer', fontWeight: sel === i ? 700 : 400 }}><i className="wkey" style={{ background: g[2] }} />{g[0]} · {Math.round(v[i] / tot * 100)}%<div className="wnote" style={{ marginLeft: 16 }}>{g[3]}</div></div>)}</div>}
      </div>
      <div className="wpb"><span className="mono">How balanced? (closer to the recommended plate = fuller bar)</span><div className="wpb-t"><i style={{ width: Math.max(0, 100 - err) + '%', background: err < 20 ? 'var(--ok)' : undefined }} /><span>{err < 20 ? 'Well balanced ✓' : 'Keep adjusting'}</span></div></div>
      <WCtl><WSeg label="Food group" opts={groups.map((g, i) => [i, g[0]])} v={sel} set={setSel} /><WSl label={groups[sel][0] + ' portions'} v={v[sel]} set={x => setV(v.map((y, j) => j === sel ? x : y))} min={0} max={40} /><button className="chip" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Compare with'} recommended plate</button></WCtl>
    </div>
  );
};

/* Food tests */
W.foodtest = function ({ cfg, onState }) {
  const foods = { Bread: { starch: 1, sugar: 0, protein: 0, fat: 0 }, Milk: { starch: 0, sugar: 1, protein: 1, fat: 1 }, 'Egg white': { starch: 0, sugar: 0, protein: 1, fat: 0 }, 'Cooking oil': { starch: 0, sugar: 0, protein: 0, fat: 1 }, Apple: { starch: 0, sugar: 1, protein: 0, fat: 0 }, Peanuts: { starch: 1, sugar: 0, protein: 1, fat: 1 } };
  const tests = { starch: ['Iodine solution', 'oklch(0.85 0.12 70)', 'oklch(0.25 0.05 270)', 'orange-brown → blue-black'], sugar: ["Benedict's (heat)", 'oklch(0.65 0.12 250)', 'oklch(0.6 0.17 35)', 'blue → brick-red'], protein: ['Biuret', 'oklch(0.65 0.12 250)', 'oklch(0.55 0.15 310)', 'blue → purple'], fat: ['Ethanol emulsion', 'oklch(0.95 0.01 240)', 'oklch(0.93 0.01 90)', 'clear → cloudy white'] };
  const [f, setF] = uSt('Bread'), [done, setDone] = uSt({});
  const n = Object.keys(done).length;
  useRep(onState, { n }, [n]);
  return (
    <div className="wbox">
      <div className="wtubes">{Object.entries(tests).map(([k, [nm, c0, c1, desc]]) => { const k2 = f + ':' + k, d = done[k2]; const pos = foods[f][k]; return (
        <button key={k} className="wtube-b" onClick={() => setDone({ ...done, [k2]: true })}>
          <svg viewBox="0 0 60 150" style={{ width: 54 }}><path d="M12,10 L12,120 Q12,142 30,142 Q48,142 48,120 L48,10" fill="oklch(0.98 0.005 240 / .5)" stroke="var(--ink-3)" strokeWidth="2" /><rect x="14" y="60" width="32" height="70" rx="4" style={{ fill: d ? (pos ? c1 : c0) : c0, transition: 'fill .8s' }} /></svg>
          <span className="mono">{nm}</span><span className="wnote">{d ? (pos ? '✓ ' + k + ' present' : '✗ no ' + k) : 'tap to test'}</span>
        </button>); })}</div>
      <div className="wnote">Positive results: iodine {tests.starch[3]}; Benedict's {tests.sugar[3]}; biuret {tests.protein[3]}; ethanol {tests.fat[3]}.</div>
      <WCtl><WSeg label="Food sample" opts={Object.keys(foods)} v={f} set={setF} /></WCtl>
    </div>
  );
};

/* Energy balance */
W.energybal = function ({ cfg, onState }) {
  const [food, setFood] = uSt(10000), [act, setAct] = uSt('moderate'), [age, setAge] = uSt('teen');
  const need = { teen: 9500, adult: 9000, athlete: 15000 }[age] * { low: 0.85, moderate: 1, high: 1.25 }[act];
  const bal = food - need, wk = bal * 7 / 37000;
  useRep(onState, { bal, food, need }, [food, act, age]);
  const tilt = Math.max(-14, Math.min(14, bal / 300));
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 170" className="wsvg">
        <polygon points="200,150 185,170 215,170" fill="var(--ink-2)" />
        <g style={{ transform: `rotate(${tilt}deg)`, transformOrigin: '200px 120px', transition: 'transform .5s' }}>
          <rect x="60" y="116" width="280" height="8" rx="3" fill="oklch(0.65 0.06 70)" />
          <rect x="70" y={110 - food / 400} width="90" height={food / 400} rx="4" fill="oklch(0.75 0.12 60)" /><text x="115" y="104" textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ink)' }}>energy in</text>
          <rect x="240" y={110 - need / 400} width="90" height={need / 400} rx="4" fill="var(--acc)" /><text x="285" y="104" textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ink)' }}>energy used</text>
        </g>
      </svg>
      <WRead items={[['Energy in (food)', wxFmt(food, 0) + ' kJ'], ['Energy used', wxFmt(need, 0) + ' kJ'], ['Change per week', (wk > 0 ? '+' : '') + wxFmt(wk, 2) + ' kg body fat']]} />
      <div className="wnote">{Math.abs(bal) < 400 ? 'Balanced: body mass stays about the same.' : bal > 0 ? 'More energy in than used: the extra is stored as fat. Over time this can lead to obesity.' : 'Less energy in than used: fat stores are used up and body mass falls. Too little food can stop healthy growth.'} Animals eat food to obtain energy and nutrients, and carbohydrates and fats act as energy stores.</div>
      <WCtl><WSl label="Food energy per day" v={food} set={setFood} min={5000} max={18000} step={500} fmt={v => v + ' kJ'} /><WSeg label="Activity" opts={['low', 'moderate', 'high']} v={act} set={setAct} /><WSeg label="Person" opts={[['teen', '13-year-old'], ['adult', 'Adult'], ['athlete', 'Athlete']]} v={age} set={setAge} /></WCtl>
    </div>
  );
};

/* Lifestyle risk dashboard */
W.lifestyle = function ({ cfg, onState }) {
  const [ex, setEx] = uSt(2), [sugar, setSugar] = uSt(3), [fat, setFat] = uSt(2), [veg, setVeg] = uSt(2), [sleep, setSleep] = uSt(8), [smoke, setSmoke] = uSt(false);
  const heart = Math.min(100, 20 + fat * 10 + (smoke ? 30 : 0) - ex * 5 + (5 - veg) * 3);
  const teeth = Math.min(100, sugar * 16);
  const obes = Math.min(100, Math.max(0, sugar * 8 + fat * 8 - ex * 8 + 20));
  const lung = smoke ? 85 : 10;
  const growth = Math.max(0, 100 - (sleep < 8 ? (8 - sleep) * 12 : 0) - (veg < 2 ? 15 : 0) - (smoke ? 20 : 0));
  useRep(onState, { heart, teeth, obes, growth, smoke }, [heart, teeth, obes, growth, smoke]);
  const bar = (l, v, good) => <div className="wpb"><span className="mono">{l}</span><div className="wpb-t"><i style={{ width: v + '%', background: (good ? v > 70 : v < 35) ? 'var(--ok)' : (good ? v < 40 : v > 65) ? 'var(--bad)' : 'var(--gold)' }} /><span>{Math.round(v)}{good ? '' : '% risk'}</span></div></div>;
  return (
    <div className="wbox">
      <div className="wsplit">
        <div className="wlist">{bar('Heart disease risk', heart)}{bar('Tooth decay risk', teeth)}{bar('Obesity risk', obes)}{bar('Lung disease risk', lung)}{bar('Healthy growth & development', growth, true)}</div>
        <div className="wlist">
          <WSl label="Exercise (hours/week)" v={ex} set={setEx} min={0} max={8} />
          <WSl label="Sugary drinks/snacks per day" v={sugar} set={setSugar} min={0} max={6} />
          <WSl label="Fatty / fried meals per week" v={fat} set={setFat} min={0} max={7} />
          <WSl label="Fruit & veg portions per day" v={veg} set={setVeg} min={0} max={7} />
          <WSl label="Sleep (hours)" v={sleep} set={setSleep} min={5} max={10} />
          <button className={'chip' + (smoke ? ' on' : '')} onClick={() => setSmoke(!smoke)}>{smoke ? 'Smoker' : 'Non-smoker'}</button>
        </div>
      </div>
      <div className="wnote">Lifestyle choices affect growth, development and health. Risk is not certainty, but a good diet, exercise, sleep and not smoking all lower the chance of disease.</div>
    </div>
  );
};

/* Smoking effects */
W.smoking = function ({ cfg, onState }) {
  const [yrs, setYrs] = uSt(0), [sel, setSel] = uSt('tar');
  const chem = { tar: ['Tar', 'A sticky black substance that coats the lungs and alveoli. It contains carcinogens that cause lung cancer, and it damages the cilia so mucus builds up (smoker\'s cough).'], nic: ['Nicotine', 'An addictive drug. It raises heart rate and blood pressure and narrows blood vessels.'], co: ['Carbon monoxide', 'Binds to haemoglobin in place of oxygen, so the blood carries less oxygen. In pregnancy this slows the baby\'s growth.'], part: ['Smoke particles', 'Irritate the airways and can lead to bronchitis and emphysema (damaged alveoli, less surface area for gas exchange).'] };
  const k = yrs / 30;
  useRep(onState, { yrs, sel }, [yrs, sel]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 220 220" className="wsvg" style={{ maxWidth: 240 }}>
          <ellipse cx="70" cy="115" rx="50" ry="85" style={{ fill: `oklch(${0.78 - k * 0.42} ${0.1 - k * 0.08} ${15 + k * 40})` }} />
          <ellipse cx="150" cy="115" rx="50" ry="85" style={{ fill: `oklch(${0.78 - k * 0.42} ${0.1 - k * 0.08} ${15 + k * 40})` }} />
          {Array.from({ length: Math.round(k * 40) }, (_, i) => <circle key={i} cx={40 + (i * 37) % 140} cy={50 + (i * 53) % 130} r={2 + (i % 3)} fill="oklch(0.2 0.02 60)" opacity=".6" />)}
          <rect x="104" y="0" width="12" height="40" fill="oklch(0.75 0.06 30)" />
        </svg>
        <div className="wlist">
          <div className="wbig">{yrs} years of smoking</div>
          <div className="wbig" style={{ fontSize: 20 }}>{chem[sel][0]}</div><p style={{ fontSize: 15.5 }}>{chem[sel][1]}</p>
          <WRead items={[['Lung capacity', Math.round(100 - k * 35) + '%'], ['O₂ carried', Math.round(100 - k * 12) + '%']]} />
        </div>
      </div>
      <WCtl><WSl label="Years smoking" v={yrs} set={setYrs} min={0} max={30} /><WSeg label="Chemical in smoke" opts={Object.entries(chem).map(([k2, v]) => [k2, v[0]])} v={sel} set={setSel} /></WCtl>
    </div>
  );
};

/* Bell jar model */
W.belljar = function ({ cfg, onState }) {
  const [pull, setPull] = uSt(0);
  const vol = 1 + pull * 0.45;
  useRep(onState, { pull }, [pull]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 240 280" className="wsvg" style={{ maxWidth: 260 }}>
          <path d="M60,40 Q60,20 120,20 Q180,20 180,40 L190,220 L50,220 Z" fill="oklch(0.96 0.01 230 / .6)" stroke="var(--ink-3)" strokeWidth="3" />
          <rect x="114" y="0" width="12" height="80" fill="var(--rule)" stroke="var(--ink-3)" />
          <line x1="120" y1="80" x2="95" y2="105" stroke="var(--ink-3)" strokeWidth="5" /><line x1="120" y1="80" x2="145" y2="105" stroke="var(--ink-3)" strokeWidth="5" />
          <ellipse cx="90" cy="135" rx={22 * vol} ry={30 * vol} fill="oklch(0.78 0.12 15)" style={{ transition: 'all .2s' }} />
          <ellipse cx="150" cy="135" rx={22 * vol} ry={30 * vol} fill="oklch(0.78 0.12 15)" style={{ transition: 'all .2s' }} />
          <path d={`M50,220 Q120,${220 + pull * 50} 190,220`} fill="oklch(0.7 0.08 40)" stroke="oklch(0.5 0.1 30)" strokeWidth="3" />
          <line x1="120" y1={220 + pull * 25} x2="120" y2={240 + pull * 40} stroke="var(--ink)" strokeWidth="3" />
        </svg>
        <div className="wlist">
          <div className="mono">Model  Body</div>
          <ul className="wprops"><li className="ok">Glass tube = trachea</li><li className="ok">Y-tube = bronchi</li><li className="ok">Balloons = lungs</li><li className="ok">Bell jar = ribcage / chest</li><li className="ok">Rubber sheet = diaphragm</li></ul>
          <div className="wbig">{pull > 0.3 ? 'Air rushes in ↓' : 'At rest'}</div>
          <div className="wnote">Pulling the sheet down increases the volume inside, so the pressure falls and air flows into the balloons. Limitation: real ribs move, and the jar can't.</div>
        </div>
      </div>
      <WCtl><WSl label="Pull the rubber sheet (diaphragm) down" v={pull} set={setPull} min={0} max={1} step={0.05} fmt={v => Math.round(v * 100) + '%'} /></WCtl>
    </div>
  );
};

/* Aerobic respiration in mitochondria */
W.mito = function ({ cfg, onState }) {
  const [g, setG] = uSt(3), [o, setO] = uSt(6), [run, setRun] = uSt(0);
  const react = Math.min(g, Math.floor(o / 6));
  useRep(onState, { run, react }, [run, react]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 420 180" className="wsvg">
        <ellipse cx="210" cy="90" rx="120" ry="60" fill="oklch(0.82 0.08 40)" stroke="oklch(0.55 0.1 40)" strokeWidth="3" />
        <path d="M110,90 q15,-30 30,0 q15,30 30,0 q15,-30 30,0 q15,30 30,0 q15,-30 30,0 q15,30 30,0" fill="none" stroke="oklch(0.55 0.1 40)" strokeWidth="3" />
        {Array.from({ length: run ? 0 : g }, (_, i) => <rect key={'g' + i} x={20 + i * 14} y="40" width="10" height="10" fill="oklch(0.8 0.13 85)" />)}
        {Array.from({ length: run ? 0 : Math.min(o, 18) }, (_, i) => <circle key={'o' + i} cx={20 + (i % 6) * 12} cy={120 + Math.floor(i / 6) * 12} r="4" fill="var(--acc)" />)}
        {run > 0 && <>{Array.from({ length: react * 6 }, (_, i) => <circle key={'c' + i} cx={350 + (i % 6) * 10} cy={40 + Math.floor(i / 6) * 10} r="4" fill="var(--ink-3)" />)}{Array.from({ length: react * 6 }, (_, i) => <circle key={'w' + i} cx={350 + (i % 6) * 10} cy={120 + Math.floor(i / 6) * 10} r="4" fill="oklch(0.7 0.1 230)" />)}
          <text x="210" y="95" textAnchor="middle" style={{ fontSize: 16, fill: 'oklch(0.5 0.17 40)' }}> energy released: {react * 2880} kJ</text></>}
      </svg>
      <div className="wbig" style={{ textAlign: 'center' }}>glucose + oxygen → carbon dioxide + water <span className="wdim">(+ energy)</span></div>
      <div className="wnote">Aerobic respiration happens in the <b>mitochondria</b> of plant and animal cells. It is a controlled release of energy, step by step, not all at once like burning. The energy is used for movement, growth and keeping warm. Breathing supplies the oxygen; respiration uses it.</div>
      <WCtl><WSl label="Glucose molecules" v={g} set={x => { setG(x); setRun(0); }} min={1} max={4} /><WSl label="Oxygen molecules" v={o} set={x => { setO(x); setRun(0); }} min={0} max={24} step={6} /><button className="btn small" onClick={() => setRun(r => r + 1)}>Respire</button></WCtl>
    </div>
  );
};

/* Food web with removal */
W.foodweb = function ({ cfg, onState }) {
  const N = { grass: [60, 200, 'Grass'], algae: [300, 200, 'Algae'], rabbit: [40, 130, 'Rabbit'], insect: [140, 140, 'Insect'], snail: [300, 130, 'Snail'], frog: [200, 80, 'Frog'], fox: [60, 30, 'Fox'], hawk: [230, 20, 'Hawk'] };
  const E = [['grass', 'rabbit'], ['grass', 'insect'], ['algae', 'snail'], ['insect', 'frog'], ['snail', 'frog'], ['rabbit', 'fox'], ['frog', 'hawk'], ['rabbit', 'hawk'], ['insect', 'hawk']];
  const [gone, setGone] = uSt(null);
  const eff = n => { if (!gone) return 0; if (n === gone) return -2; const prey = E.filter(e => e[1] === n).map(e => e[0]); const pred = E.filter(e => e[0] === n).map(e => e[1]); if (prey.includes(gone)) return -1; if (pred.includes(gone)) return 1; return 0; };
  useRep(onState, { gone }, [gone]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 360 230" className="wsvg">
        <defs><marker id="fwa" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="var(--ink-3)" /></marker></defs>
        {E.map(([a, b], i) => { if (gone === a || gone === b) return null; const [x1, y1] = N[a], [x2, y2] = N[b]; return <line key={i} x1={x1} y1={y1 - 12} x2={x2} y2={y2 + 14} stroke="var(--ink-3)" strokeWidth="1.6" markerEnd="url(#fwa)" />; })}
        {Object.entries(N).map(([k, [x, y, l]]) => { const e = eff(k); return <g key={k} onClick={() => setGone(gone === k ? null : k)} style={{ cursor: 'pointer', opacity: e === -2 ? 0.25 : 1 }}><rect x={x - 32} y={y - 12} width="64" height="26" rx="13" fill={e === 1 ? 'oklch(0.85 0.1 145)' : e === -1 ? 'oklch(0.85 0.08 25)' : 'var(--card)'} stroke="var(--ink-3)" /><text x={x} y={y + 5} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ink)' }}>{l}{e === 1 ? ' ↑' : e === -1 ? ' ↓' : ''}</text></g>; })}
      </svg>
      <div className="wnote">{gone ? `Without the ${N[gone][2].toLowerCase()}: its predators may decrease (↓, less food) and its prey may increase (↑, fewer eaten). One change ripples through the whole web.` : 'Arrows show the direction energy flows (eaten → eater). Tap an organism to remove it.'}</div>
    </div>
  );
};
