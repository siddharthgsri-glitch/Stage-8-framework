/* Labelled-diagram engine (Explore + Label it): W.labeldiag, data in LDIAG */
const LDIAG = {};
window.LDIAG = LDIAG;

W.labeldiag = function ({ cfg, onState }) {
  const D = LDIAG[cfg.d];
  const [mode, setMode] = uSt('explore'), [sel, setSel] = uSt(null), [seen, setSeen] = uSt([]);
  const [lab, setLab] = uSt({}), [pick, setPick] = uSt(null), [bad, setBad] = uSt(null);
  const order = uMm(() => wxShuffle(D.parts.map((_, i) => i), D.parts.length + 3), []);
  const nl = Object.keys(lab).length;
  useRep(onState, { explored: seen.length, labelled: nl, total: D.parts.length, mode }, [seen.length, nl, mode]);
  const tap = i => {
    if (mode === 'explore') { setSel(i); if (!seen.includes(i)) setSeen([...seen, i]); return; }
    if (pick == null || lab[i]) return;
    if (pick === i) { setLab({ ...lab, [i]: true }); setPick(null); } else { setBad(i); setTimeout(() => setBad(null), 450); }
  };
  return (
    <div className="wbox">
      <div className="wdg">
        <svg viewBox={D.vb} className="wsvg wdg-svg">
          {D.art()}
          {D.parts.map(([id, l, info, x, y], i) => {
            const on = mode === 'explore' ? sel === i : lab[i];
            return <g key={id} className={'wdg-hot' + (on ? ' on' : '') + (bad === i ? ' shake' : '') + (seen.includes(i) && mode === 'explore' ? ' seen' : '')} onClick={() => tap(i)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r="11" /><text x={x} y={y + 4} textAnchor="middle">{mode === 'label' && lab[i] ? '✓' : i + 1}</text>
              {mode === 'label' && lab[i] && <text x={x + 15} y={y + 4} className="wdg-tag">{l}</text>}
            </g>;
          })}
        </svg>
        <div className="wlist">
          {mode === 'explore' ? (sel == null ? <div className="wnote">Tap a numbered point to find out what it is.</div>
            : <><div className="wbig">{D.parts[sel][1]}</div><p style={{ fontSize: 15.5 }}>{D.parts[sel][2]}</p></>)
            : <><div className="wnote">{pick == null ? 'Pick a label, then tap the point it belongs to.' : 'Now tap its point on the diagram.'}</div>
              <div className="chips">{order.filter(i => !lab[i]).map(i => <button key={i} className={'chip' + (pick === i ? ' on' : '')} onClick={() => setPick(i)}>{D.parts[i][1]}</button>)}</div>
              {nl === D.parts.length && <div className="wnote" style={{ color: 'var(--ok)' }}>All labelled ✓</div>}</>}
          <div className="mono">{mode === 'explore' ? `Explored ${seen.length}/${D.parts.length}` : `Labelled ${nl}/${D.parts.length}`}</div>
        </div>
      </div>
      <WCtl><WSeg opts={[['explore', 'Explore'], ['label', 'Label it']]} v={mode} set={m => { setMode(m); setPick(null); }} /></WCtl>
    </div>
  );
};

const LP = (d, c) => <path d={d} className={c} />;

LDIAG.bloodcells = { vb: '0 0 380 230', art: () => <>
  <rect x="0" y="0" width="380" height="230" rx="10" fill="oklch(0.93 0.07 90)" />
  {[[50, 50], [120, 40], [80, 120], [170, 150], [60, 190], [300, 60], [330, 160], [250, 200], [150, 210]].map(([x, y], i) => <g key={i}><ellipse cx={x} cy={y} rx="26" ry="20" fill="oklch(0.55 0.18 25)" /><ellipse cx={x} cy={y} rx="12" ry="8" fill="oklch(0.65 0.15 25)" /></g>)}
  <circle cx="230" cy="100" r="40" fill="oklch(0.95 0.02 270)" stroke="oklch(0.6 0.05 270)" strokeWidth="2" />
  {[[218, 92], [236, 86], [244, 104], [226, 110]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9" fill="oklch(0.55 0.12 290)" />)}
  {[[310, 110], [320, 120], [130, 95], [290, 205]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="oklch(0.6 0.12 330)" />)}
</>, parts: [
  ['rbc', 'Red blood cell', 'Biconcave disc with no nucleus, packed with haemoglobin to carry oxygen. The dip in the middle gives a large surface area.', 80, 120],
  ['wbc', 'White blood cell', 'Defends the body against pathogens. Some engulf microbes (phagocytes); others make antibodies.', 230, 145],
  ['nuc', 'Nucleus (white cell)', 'White blood cells have a nucleus, often lobed. Red cells do not.', 236, 86],
  ['plt', 'Platelets', 'Tiny cell fragments that help blood clot at a wound.', 315, 115],
  ['pla', 'Plasma', 'Straw-coloured liquid (about 55% of blood). Carries dissolved glucose, carbon dioxide, hormones and the blood cells.', 350, 25],
] };

LDIAG.resp = { vb: '0 0 300 320', art: () => <>
  <ellipse cx="150" cy="16" rx="26" ry="12" fill="oklch(0.85 0.05 30)" />
  <rect x="143" y="26" width="14" height="96" rx="5" fill="oklch(0.75 0.06 30)" />
  {LP('M150,120 L105,150 M150,120 L195,150', 'w-airway')}
  <ellipse cx="100" cy="195" rx="55" ry="82" fill="oklch(0.78 0.1 15)" opacity=".85" />
  <ellipse cx="200" cy="195" rx="55" ry="82" fill="oklch(0.78 0.1 15)" opacity=".85" />
  {LP('M105,150 L90,185 L75,215 M90,185 L105,225 M195,150 L210,185 L225,215 M210,185 L195,225', 'w-airway thin')}
  {[[84, 232], [92, 238], [82, 242], [90, 247]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill="oklch(0.9 0.05 15)" stroke="oklch(0.55 0.12 15)" />)}
  {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M30,${110 + i * 34} Q150,${80 + i * 34} 270,${110 + i * 34}`} fill="none" stroke="oklch(0.85 0.02 80)" strokeWidth="5" opacity=".7" />)}
  {LP('M30,300 Q150,250 270,300', 'w-diaph')}
</>, parts: [
  ['nose', 'Nose & mouth', 'Air enters here. The nose warms, moistens and filters the air.', 150, 16],
  ['tra', 'Trachea (windpipe)', 'A tube held open by rings of cartilage. It carries air to the lungs.', 150, 75],
  ['bro', 'Bronchus', 'The trachea splits into two bronchi, one to each lung.', 122, 137],
  ['brl', 'Bronchiole', 'Smaller and smaller branches carry air deep into the lung.', 90, 190],
  ['alv', 'Alveoli', 'Millions of tiny air sacs. Thin walls, a large surface area and many capillaries make gas exchange fast.', 104, 242],
  ['lung', 'Lung', 'Spongy organ where gas exchange happens.', 215, 205],
  ['rib', 'Ribs', 'Protect the lungs and heart, and move up and out when you breathe in.', 40, 150],
  ['ic', 'Intercostal muscles', 'Found between the ribs. They contract to lift the ribcage when you inhale.', 262, 128],
  ['dia', 'Diaphragm', 'A sheet of muscle under the lungs. It contracts and flattens to breathe in.', 150, 278],
] };

LDIAG.skeleton = { vb: '0 0 240 350', art: () => <>
  <circle cx="120" cy="32" r="22" className="w-bonef" />
  {LP('M120,56 L120,192', 'w-bonel')}
  <ellipse cx="120" cy="105" rx="40" ry="36" fill="none" stroke="oklch(0.8 0.03 80)" strokeWidth="6" />
  {LP('M82,68 L158,68', 'w-bonel')}
  {LP('M82,70 L68,140 L58,205 M158,70 L172,140 L182,205', 'w-bonel')}
  {LP('M92,192 Q120,215 148,192 L140,205 Q120,222 100,205 Z', 'w-bonef')}
  {LP('M104,210 L98,282 L96,338 M136,210 L142,282 L144,338', 'w-bonel')}
</>, parts: [
  ['sk', 'Skull', 'Protects the brain.', 120, 32],
  ['rc', 'Ribcage', 'Protects the heart and lungs, and moves during breathing.', 150, 112],
  ['sp', 'Spine (vertebral column)', 'Supports the body and protects the spinal cord. Made of many vertebrae.', 120, 160],
  ['sh', 'Shoulder', 'A ball-and-socket joint: movement in all directions.', 82, 68],
  ['hu', 'Humerus', 'The upper arm bone. Muscles attach to it with tendons.', 72, 110],
  ['el', 'Elbow', 'A hinge joint: it moves in one plane only.', 68, 140],
  ['pe', 'Pelvis', 'Supports the organs in the lower body; the legs attach here.', 120, 205],
  ['hip', 'Hip', 'A ball-and-socket joint.', 104, 214],
  ['fe', 'Femur', 'The thigh bone, the largest bone in the body.', 101, 248],
  ['kn', 'Knee', 'A hinge joint between the femur and the tibia.', 142, 282],
] };

LDIAG.nutribody = { vb: '0 0 220 340', art: () => <>
  <circle cx="110" cy="40" r="28" className="w-skin" />
  <rect x="70" y="72" width="80" height="120" rx="24" className="w-skin" />
  {LP('M74,85 L40,170 M146,85 L180,170 M90,190 L82,320 M130,190 L138,320', 'w-limb')}
  <circle cx="100" cy="36" r="4" fill="#333" /><circle cx="120" cy="36" r="4" fill="#333" />
  <path d="M95,140 q15,10 30,0 q-15,10 -30,22" fill="none" stroke="oklch(0.6 0.08 40)" strokeWidth="3" />
</>, parts: [
  ['eye', 'Vitamin A: eyes', 'Needed for good eyesight, especially in dim light. Found in carrots, liver and dairy. A lack of it causes night blindness.', 120, 36],
  ['gum', 'Vitamin C: skin & gums', 'Keeps skin and gums healthy and helps wounds heal. Found in citrus fruit. A lack of it causes scurvy.', 110, 56],
  ['bone', 'Calcium & vitamin D: bones', 'For strong bones and teeth. Calcium is found in milk and cheese; the skin makes vitamin D in sunlight. A lack of them causes rickets.', 84, 270],
  ['blood', 'Iron: blood', 'Needed to make haemoglobin in red blood cells. Found in red meat, spinach and beans. A lack of it causes anaemia (tiredness).', 150, 95],
  ['musc', 'Protein: muscles', 'For growth and repair of cells. Found in meat, fish, eggs and beans.', 40, 165],
  ['fat', 'Fats: energy store', 'A concentrated energy store; it also insulates and protects organs. Too much can lead to obesity.', 92, 120],
  ['gut', 'Fibre: intestines', 'Helps food move through the gut and prevents constipation. Found in wholegrains, fruit and vegetables.', 110, 155],
  ['carb', 'Carbohydrates: energy', 'The main source of energy for respiration. Starch and sugars.', 130, 175],
] };

LDIAG.pond = { vb: '0 0 400 260', art: () => <>
  <rect x="0" y="0" width="400" height="120" fill="oklch(0.94 0.03 230)" /><circle cx="350" cy="35" r="20" fill="oklch(0.88 0.14 90)" />
  <rect x="0" y="120" width="400" height="140" fill="oklch(0.75 0.08 120)" />
  <ellipse cx="190" cy="170" rx="130" ry="55" fill="oklch(0.7 0.08 230)" />
  <ellipse cx="190" cy="205" rx="100" ry="18" fill="oklch(0.5 0.05 70)" opacity=".6" />
  {[60, 70, 80, 300, 310].map((x, i) => <line key={i} x1={x} x2={x + 4} y1="160" y2="95" stroke="oklch(0.5 0.1 140)" strokeWidth="3" />)}
  <rect x="352" y="80" width="10" height="60" fill="oklch(0.45 0.06 60)" /><circle cx="357" cy="70" r="28" fill="oklch(0.55 0.12 140)" />
  <ellipse cx="45" cy="225" rx="24" ry="14" fill="oklch(0.6 0.01 250)" />
</>, parts: [
  ['water', 'Open water', 'A habitat for fish and water fleas. Oxygen and temperature are non-living (abiotic) factors.', 190, 160],
  ['mud', 'Muddy bottom', 'A habitat for worms and insect larvae that feed on dead material.', 190, 205],
  ['surf', 'Water surface', 'Pond skaters use surface tension to walk on the water.', 250, 122],
  ['reed', 'Reeds at the edge', 'Shelter for dragonfly nymphs; birds nest here.', 70, 115],
  ['tree', 'Tree', 'A habitat for birds and insects. Its fallen leaves feed decomposers.', 357, 70],
  ['rock', 'Under a rock', 'Damp and dark, so woodlice and beetles live here.', 45, 225],
  ['sun', 'Sunlight (abiotic)', 'A non-living factor. Plants need light to photosynthesise; it is the energy source for the whole ecosystem.', 350, 35],
  ['eco', 'The whole ecosystem', 'All the organisms (biotic) plus the non-living environment (abiotic), interacting together. It contains many habitats.', 300, 240],
] };

LDIAG.particles = { vb: '0 0 440 170', art: () => {
  const box = (x, label, dots) => <g key={x}><rect x={x} y="10" width="100" height="120" rx="6" fill="var(--card)" stroke="var(--rule)" />{dots}<text x={x + 50} y="152" textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ink-2)' }}>{label}</text></g>;
  const at = (x, y, c, k) => <circle key={k} cx={x} cy={y} r="8" fill={c} stroke="var(--paper)" />;
  const A = 'oklch(0.6 0.12 250)', B = 'oklch(0.62 0.15 30)', C = 'oklch(0.7 0.12 140)';
  return <>
    {box(5, 'element (atoms)', [[30, 40], [60, 40], [90, 40], [30, 75], [60, 75], [90, 75], [45, 108], [75, 108]].map(([x, y], i) => at(x, y, A, i)))}
    {box(115, 'element (molecules)', [[140, 40], [156, 40], [180, 75], [196, 75], [140, 105], [156, 105], [190, 32], [206, 32]].map(([x, y], i) => at(x, y, B, i)))}
    {box(225, 'compound', [[250, 40], [266, 40], [290, 80], [306, 80], [250, 110], [266, 110]].map(([x, y], i) => at(x, y, i % 2 ? C : A, i)))}
    {box(335, 'mixture', [[360, 35], [376, 35], [410, 50], [355, 80], [395, 95], [411, 95], [370, 115], [415, 120]].map(([x, y], i) => at(x, y, [B, B, A, A, C, B, A, A][i], i)))}
  </>;
}, parts: [
  ['el1', 'Element: atoms', 'Contains only one type of atom, e.g. iron. It cannot be split into simpler substances.', 55, 20],
  ['el2', 'Element: molecules', 'One type of atom joined in molecules, e.g. oxygen O₂.', 165, 20],
  ['cmp', 'Compound', 'Two or more different atoms chemically joined in a fixed ratio, e.g. water H₂O. It has different properties from its elements.', 275, 20],
  ['mix', 'Mixture', 'Different substances that are NOT chemically joined, e.g. air. They can be separated by physical methods. A mixture is impure.', 385, 20],
] };

LDIAG.bell = { vb: '0 0 400 240', art: () => <>
  <rect x="60" y="80" width="30" height="90" fill="oklch(0.6 0.01 250)" />
  {[0, 1, 2, 3, 4, 5, 6].map(i => <ellipse key={i} cx="75" cy={88 + i * 12} rx="22" ry="5" fill="none" stroke="oklch(0.62 0.13 50)" strokeWidth="3" />)}
  <rect x="110" y="70" width="120" height="10" fill="oklch(0.55 0.02 250)" transform="rotate(8 110 75)" />
  <line x1="230" y1="90" x2="290" y2="120" stroke="var(--ink-2)" strokeWidth="4" /><circle cx="296" cy="124" r="10" fill="var(--ink-2)" />
  <circle cx="330" cy="150" r="40" fill="none" stroke="oklch(0.7 0.13 85)" strokeWidth="8" />
  <line x1="170" y1="40" x2="170" y2="72" stroke="var(--ink)" strokeWidth="3" />
  <rect x="40" y="200" width="40" height="18" fill="var(--acc)" /><line x1="60" y1="170" x2="60" y2="200" stroke="var(--ink-2)" strokeWidth="2" />
  <line x1="80" y1="209" x2="170" y2="209" stroke="var(--ink-2)" strokeWidth="2" /><line x1="170" y1="209" x2="170" y2="40" stroke="var(--ink-2)" strokeWidth="2" />
</>, parts: [
  ['coil', 'Electromagnet', 'When current flows, the coil and iron core become magnetic and attract the armature.', 75, 125],
  ['arm', 'Iron armature', 'A springy iron strip, pulled towards the electromagnet.', 160, 80],
  ['ham', 'Hammer', 'Moves with the armature and strikes the gong.', 296, 124],
  ['gong', 'Gong', 'Makes the sound when it is hit.', 330, 150],
  ['con', 'Contact', 'When the armature moves, the circuit breaks here. The magnet switches off, the armature springs back, and the cycle repeats rapidly.', 170, 55],
  ['cell', 'Cell (power)', 'Supplies the current. Electromagnets only work while current flows.', 60, 209],
] };

LDIAG.carbon = { vb: '0 0 420 260', art: () => <>
  <rect x="0" y="0" width="420" height="70" fill="oklch(0.94 0.02 230)" /><text x="210" y="40" textAnchor="middle" style={{ fontSize: 14, fill: 'var(--ink-2)' }}>CO₂ in the atmosphere</text>
  <rect x="0" y="180" width="420" height="80" fill="oklch(0.6 0.07 70)" /><rect x="300" y="150" width="120" height="30" fill="oklch(0.65 0.08 230)" />
  <rect x="60" y="120" width="10" height="60" fill="oklch(0.45 0.06 60)" /><circle cx="65" cy="110" r="26" fill="oklch(0.55 0.12 140)" />
  <ellipse cx="160" cy="165" rx="22" ry="12" fill="oklch(0.6 0.05 60)" /><circle cx="182" cy="152" r="8" fill="oklch(0.6 0.05 60)" />
  <rect x="230" y="120" width="40" height="60" fill="var(--ink-3)" /><rect x="255" y="90" width="10" height="30" fill="var(--ink-3)" />
  <rect x="40" y="220" width="120" height="20" fill="oklch(0.25 0.02 60)" />
  {LP('M65,80 L65,72 M150,140 L150,72 M260,85 L260,72 M360,145 L360,72', 'w-carr')}
</>, parts: [
  ['ph', 'Photosynthesis', 'Plants take in CO₂ from the air and use light to make glucose. This removes carbon from the atmosphere.', 65, 90],
  ['re', 'Respiration', 'Animals and plants release CO₂ when they respire: glucose + oxygen → carbon dioxide + water.', 160, 120],
  ['co', 'Combustion', 'Burning fossil fuels releases CO₂ that was locked away for millions of years. This is the main human cause of the increase in CO₂.', 250, 100],
  ['ff', 'Fossil fuels', 'Coal, oil and gas formed from dead organisms over millions of years. They are non-renewable.', 100, 230],
  ['de', 'Decomposers', 'Microbes break down dead material, releasing CO₂ by respiration.', 200, 205],
  ['oc', 'Oceans', 'Absorb CO₂ from the atmosphere. More CO₂ makes the oceans more acidic.', 360, 165],
] };

LDIAG.galaxies = { vb: '0 0 420 200', art: () => {
  const r = wxRng(3);
  return <>
    <rect x="0" y="0" width="420" height="200" rx="8" fill="oklch(0.18 0.02 270)" />
    {Array.from({ length: 160 }, (_, i) => { const t = r() * 3.5, arm = i % 2; const a = t + arm * Math.PI; const d = 6 + t * 15; return <circle key={i} cx={75 + d * Math.cos(a)} cy={95 + d * Math.sin(a) * 0.7} r={r() + 0.4} fill="oklch(0.9 0.04 80)" />; })}
    <ellipse cx="210" cy="95" rx="50" ry="32" fill="oklch(0.85 0.06 60 / .55)" /><ellipse cx="210" cy="95" rx="24" ry="15" fill="oklch(0.92 0.06 70 / .8)" />
    {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={320 + (r() - 0.5) * 80 + (i % 3) * 10} cy={95 + (r() - 0.5) * 60} r={r() * 1.6 + 0.4} fill="oklch(0.85 0.06 220)" />)}
    <circle cx="96" cy="108" r="3" fill="oklch(0.85 0.17 90)" />
  </>;
}, parts: [
  ['sp', 'Spiral galaxy', 'Arms spiralling out from a bright central bulge. The Milky Way is a barred spiral galaxy.', 75, 30],
  ['el', 'Elliptical galaxy', 'A smooth oval of older stars with little dust or gas.', 210, 30],
  ['ir', 'Irregular galaxy', 'No definite shape, often with lots of gas and dust where new stars form.', 330, 30],
  ['sun', 'Our Sun', 'One of 100–400 billion stars in the Milky Way, about two-thirds of the way out along a spiral arm.', 96, 108],
  ['dust', 'Dust and gas', 'Galaxies contain stellar dust and gas as well as stars and planetary systems. New stars form in these clouds.', 330, 150],
] };

LDIAG.nethw = { vb: '0 0 440 270', art: () => <>
  <ellipse cx="220" cy="30" rx="70" ry="22" fill="oklch(0.94 0.02 230)" stroke="var(--rule)" /><text x="220" y="35" textAnchor="middle" style={{ fontSize: 12 }}>Internet</text>
  <rect x="190" y="68" width="60" height="22" rx="4" className="w-dev" /><rect x="190" y="104" width="60" height="22" rx="4" className="w-dev" />
  <rect x="180" y="146" width="80" height="20" rx="4" className="w-dev" />
  {[60, 130, 310, 380].map((x, i) => <g key={i}><rect x={x - 20} y="210" width="40" height="28" rx="3" className="w-dev" /><line x1={x} y1="210" x2="220" y2="166" className="w-cable" /></g>)}
  <rect x="300" y="100" width="40" height="40" rx="3" className="w-dev" /><line x1="300" y1="120" x2="260" y2="156" className="w-cable" />
  <circle cx="110" cy="120" r="8" className="w-dev" />{[16, 26, 36].map(r => <path key={r} d={wxArc(110, 120, r, 40, 140)} className="w-wifi" />)}<line x1="118" y1="124" x2="180" y2="156" className="w-cable" />
  <line x1="220" y1="52" x2="220" y2="68" className="w-cable" /><line x1="220" y1="90" x2="220" y2="104" className="w-cable" /><line x1="220" y1="126" x2="220" y2="146" className="w-cable" />
</>, parts: [
  ['rt', 'Router', 'Connects the local network to other networks such as the internet, and directs packets towards their destination.', 220, 79],
  ['fw', 'Firewall', 'Monitors traffic and blocks data that breaks its security rules. Can be hardware or software.', 220, 115],
  ['sw', 'Switch', 'Connects devices on a LAN and sends data only to the device it is addressed to.', 220, 156],
  ['wap', 'Wireless access point', 'Lets devices join the network by Wi-Fi.', 110, 120],
  ['srv', 'Server', 'A powerful computer that provides services (files, web pages, email) to clients.', 320, 120],
  ['nic', 'NIC (network interface card)', 'Every device needs a NIC to connect. Each has a unique MAC address.', 60, 224],
  ['cab', 'Cables / media', 'Copper (Ethernet) or fibre-optic cables carry data. Fibre is faster over long distances.', 95, 188],
] };

LDIAG.memory = { vb: '0 0 440 220', art: () => <>
  <rect x="20" y="40" width="130" height="140" rx="8" className="w-dev" /><text x="85" y="34" textAnchor="middle" style={{ fontSize: 12 }}>CPU</text>
  <rect x="35" y="60" width="100" height="26" rx="3" fill="var(--acc-t)" /><rect x="35" y="100" width="100" height="26" rx="3" fill="var(--acc-t)" />
  {[0, 1].map(i => <rect key={i} x={190} y={50 + i * 34} width="110" height="24" rx="3" className="w-dev" />)}
  <rect x="190" y="140" width="60" height="40" rx="4" className="w-dev" />
  <rect x="330" y="60" width="90" height="110" rx="8" className="w-dev" /><circle cx="375" cy="115" r="30" fill="none" stroke="var(--rule)" strokeWidth="3" />
  {LP('M150,80 L190,70 M150,110 L190,100 M300,85 L330,100 M250,160 L150,150', 'w-carr')}
</>, parts: [
  ['reg', 'Registers', 'Tiny, extremely fast stores inside the CPU that hold the data being processed right now.', 85, 73],
  ['cache', 'Cache', 'Small, very fast memory on or near the CPU. It stores frequently used instructions so the CPU waits less.', 85, 113],
  ['ram', 'RAM', 'Main memory: holds the programs and data in use. Volatile, so its contents are lost when the power goes off.', 245, 62],
  ['rom', 'ROM', 'Read-only, non-volatile memory holding the start-up (boot) instructions.', 220, 160],
  ['sec', 'Secondary storage', 'HDD or SSD: large, non-volatile storage for files and software. Slower than RAM.', 375, 115],
  ['vm', 'Virtual memory', 'When RAM is full, part of secondary storage is used as extra RAM. This is slow.', 300, 140],
] };

LDIAG.decomp = { vb: '0 0 440 250', art: () => {
  const bx = (x, y, w, t) => <g key={t}><rect x={x - w / 2} y={y - 14} width={w} height="28" rx="6" className="w-dev" /><text x={x} y={y + 4} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ink)' }}>{t}</text></g>;
  const kids = [[60, 'Player input'], [160, 'Game logic'], [270, 'Scoring'], [380, 'Display']];
  return <>{bx(220, 30, 140, 'Quiz game')}{kids.map(([x, t]) => <g key={t}><line x1="220" y1="44" x2={x} y2="96" className="w-cable" />{bx(x, 110, 96, t)}</g>)}
    {[[30, 'keys'], [90, 'answers'], [130, 'if correct'], [190, 'next level'], [245, '+1 point'], [300, 'high score'], [355, 'messages'], [410, 'images']].map(([x, t], i) => <g key={t}><line x1={kids[Math.floor(i / 2)][0]} y1="124" x2={x} y2="186" className="w-cable" />{bx(x, 200, 56, t)}</g>)}</>;
}, parts: [
  ['top', 'The whole problem', 'Decomposition starts with the big task: make a quiz game that meets the brief.', 220, 30],
  ['in', 'Sub-problem: input', 'How will the player respond? Break it down further: which keys, how answers are entered.', 60, 140],
  ['lg', 'Sub-problem: logic', 'Uses SELECTION (if / elif / else) to decide what happens after each answer.', 160, 140],
  ['sc', 'Sub-problem: scoring', 'A variable stores the score; it changes each time the player is correct.', 270, 140],
  ['dp', 'Sub-problem: display', 'What the player sees: messages, images, LEDs.', 380, 140],
  ['leaf', 'Small, solvable parts', 'Keep breaking down until each part is small enough to code and test on its own.', 130, 225],
] };

LDIAG.devcycle = { vb: '0 0 400 260', art: () => {
  const st = [['Analyse', 0], ['Design', 72], ['Code', 144], ['Test', 216], ['Evaluate', 288]];
  return <>{st.map(([t, a]) => { const r = (a - 90) * Math.PI / 180; const x = 200 + 95 * Math.cos(r), y = 130 + 95 * Math.sin(r); return <g key={t}><circle cx={x} cy={y} r="36" fill="var(--acc-t)" stroke="var(--acc)" strokeWidth="2" /><text x={x} y={y + 4} textAnchor="middle" style={{ fontSize: 12, fill: 'var(--ink)' }}>{t}</text></g>; })}
    <circle cx="200" cy="130" r="95" fill="none" stroke="var(--ink-3)" strokeDasharray="4 6" strokeWidth="2" /><text x="200" y="134" textAnchor="middle" style={{ fontSize: 13, fill: 'var(--ink-2)' }}>iterate ↻</text></>;
}, parts: [
  ['an', 'Analyse', 'Understand the problem and the brief: who is it for, and what must it do (the requirements)?', 200, 35],
  ['de', 'Design', 'Plan the algorithm with a flowchart or pseudocode, and plan the test data.', 290, 100],
  ['co', 'Code', 'Write the program in Python, a small part at a time.', 256, 207],
  ['te', 'Test', 'Run it with normal, boundary and erroneous test data. Record the results in a test table.', 144, 207],
  ['ev', 'Evaluate', 'Does it meet the requirements? What could be improved? Then go round again: that is iterative development.', 110, 100],
] };

LDIAG.formdes = { vb: '0 0 400 280', art: () => <>
  <rect x="20" y="10" width="360" height="260" rx="8" className="w-dev" />
  <text x="40" y="38" style={{ fontSize: 14, fill: 'var(--ink)' }}>Club membership form</text>
  {[['First name', 60], ['Date of birth (DD/MM/YYYY)', 110], ['Year group ▾', 160]].map(([t, y]) => <g key={t}><text x="40" y={y} style={{ fontSize: 10, fill: 'var(--ink-3)' }}>{t}</text><rect x="40" y={y + 6} width="200" height="22" rx="3" fill="var(--paper)" stroke="var(--rule)" /></g>)}
  <circle cx="48" cy="222" r="6" fill="none" stroke="var(--ink-2)" /><text x="60" y="226" style={{ fontSize: 10 }}>Yes</text><circle cx="98" cy="222" r="6" fill="none" stroke="var(--ink-2)" /><text x="110" y="226" style={{ fontSize: 10 }}>No</text>
  <rect x="280" y="226" width="80" height="28" rx="4" fill="var(--acc)" /><text x="320" y="244" textAnchor="middle" style={{ fontSize: 11, fill: '#fff' }}>Submit</text>
</>, parts: [
  ['title', 'Clear title', 'Tells the user what the form is for.', 220, 34],
  ['txt', 'Text box + presence check', 'Required fields use a presence check so they can\'t be left blank.', 250, 77],
  ['fmt', 'Format hint + format check', 'Showing DD/MM/YYYY reduces errors; a format check rejects wrong patterns.', 250, 127],
  ['dd', 'Drop-down list', 'Limits the choices to valid options, so the data is consistent and easy to analyse.', 250, 177],
  ['rad', 'Radio buttons', 'Only one option can be chosen, which suits yes/no data.', 140, 222],
  ['sub', 'Submit button', 'Validation runs when the form is submitted, and errors are shown next to the right field.', 320, 240],
] };

LDIAG.aitech = { vb: '0 0 420 230', art: () => <>
  <rect x="40" y="70" width="80" height="90" rx="10" className="w-dev" /><rect x="55" y="40" width="50" height="34" rx="6" className="w-dev" />
  <circle cx="70" cy="56" r="5" fill="var(--acc)" /><circle cx="90" cy="56" r="5" fill="var(--acc)" />
  <rect x="45" y="160" width="20" height="40" className="w-dev" /><rect x="95" y="160" width="20" height="40" className="w-dev" />
  <rect x="170" y="60" width="90" height="70" rx="10" fill="var(--acc-t)" stroke="var(--acc)" /><text x="215" y="100" textAnchor="middle" style={{ fontSize: 12 }}>AI model</text>
  <rect x="300" y="50" width="80" height="140" rx="12" className="w-dev" /><rect x="308" y="62" width="64" height="110" fill="oklch(0.9 0.03 140)" />
  <rect x="320" y="100" width="40" height="30" fill="none" stroke="var(--acc)" strokeWidth="2" strokeDasharray="3 2" /><text x="340" y="96" textAnchor="middle" style={{ fontSize: 9 }}>overlay</text>
</>, parts: [
  ['sens', 'Sensors (robot input)', 'Cameras, distance and touch sensors give the robot data about its surroundings.', 80, 56],
  ['act', 'Actuators (robot output)', 'Motors and grippers that make the robot move or act.', 55, 190],
  ['proc', 'Processor', 'Runs the program that decides what to do with the sensor data: input → process → output.', 80, 115],
  ['ai', 'Artificial intelligence', 'Software that learns patterns from large amounts of data to make predictions or decisions, e.g. recognising faces or speech.', 215, 95],
  ['ar', 'Augmented reality', 'Adds computer-generated images on top of a live camera view, e.g. a furniture app or games.', 340, 115],
] };
