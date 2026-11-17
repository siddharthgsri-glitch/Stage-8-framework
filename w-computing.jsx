/* Computing models */

/* Network topology builder */
W.topology = function ({ cfg, onState }) {
  const [topo, setTopo] = uSt('star'), [down, setDown] = uSt(null), [seen, setSeen] = uSt(['star']);
  uEf(() => { if (!seen.includes(topo)) setSeen([...seen, topo]); }, [topo]);
  useRep(onState, { seen: seen.length, down }, [seen.length, down]);
  const N = 6, cx = 200, cy = 115;
  const pos = Array.from({ length: N }, (_, i) => { const a = i / N * 6.28 - 1.57; return [cx + 95 * Math.cos(a), cy + 85 * Math.sin(a)]; });
  const links = topo === 'star' ? pos.map((_, i) => ['hub', i]) : topo === 'bus' ? pos.map((_, i) => ['bus', i]) : topo === 'mesh' ? pos.flatMap((_, i) => pos.map((_, j) => j > i ? [i, j] : null).filter(Boolean)) : pos.map((_, i) => [i, (i + 1) % N]);
  const P2 = k => k === 'hub' ? [cx, cy] : pos[k];
  const busY = 210, busPos = pos.map((_, i) => [50 + i * 60, 160]);
  const ok = i => { if (down == null) return true; if (topo === 'star') return down !== 'hub' && down !== i; if (topo === 'bus') return down !== 'bus' && down !== i; if (topo === 'ring') return down === i ? false : false || down === i; return down !== i; };
  const working = i => { if (down == null) return true; if (topo === 'star') return down !== 'hub' && down !== i; if (topo === 'bus') return down !== 'bus' && down !== i; if (topo === 'ring') return false; return down !== i; };
  const info = { star: ['Star', 'Every device connects to a central switch. If one cable fails, only that device is affected; if the switch fails, everything stops. Easy to add devices: scalable.'], bus: ['Bus', 'All devices share one backbone cable. Cheap, but if the backbone breaks the whole network fails, and data collisions slow it down.'], ring: ['Ring', 'Each device connects to two others in a loop. Data travels round the ring; one break can stop the whole network.'], mesh: ['Mesh', 'Devices connect to many others. If one link fails, data takes another route. Very reliable but needs lots of cabling. The internet is a partial mesh.'] }[topo];
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 230" className="wsvg">
        {topo === 'bus' ? <><line x1="30" x2="370" y1={busY} y2={busY} stroke={down === 'bus' ? 'var(--bad)' : 'var(--ink-2)'} strokeWidth="5" onClick={() => setDown(down === 'bus' ? null : 'bus')} style={{ cursor: 'pointer' }} />
          {busPos.map(([x, y], i) => <g key={i}><line x1={x} x2={x} y1={y + 14} y2={busY} className="w-cable" /><rect x={x - 18} y={y - 14} width="36" height="28" rx="4" className={'w-dev' + (working(i) ? '' : ' off')} onClick={() => setDown(down === i ? null : i)} style={{ cursor: 'pointer' }} /></g>)}</>
          : <>{links.map(([a, b], k) => { const [x1, y1] = P2(a), [x2, y2] = P2(b); return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} className="w-cable" />; })}
            {topo === 'star' && <rect x={cx - 24} y={cy - 14} width="48" height="28" rx="4" className={'w-dev' + (down === 'hub' ? ' off' : '')} onClick={() => setDown(down === 'hub' ? null : 'hub')} style={{ cursor: 'pointer' }} />}
            {pos.map(([x, y], i) => <rect key={i} x={x - 18} y={y - 14} width="36" height="28" rx="4" className={'w-dev' + (working(i) ? '' : ' off')} onClick={() => setDown(down === i ? null : i)} style={{ cursor: 'pointer' }} />)}</>}
      </svg>
      <div className="wbig">{info[0]} topology</div><p style={{ fontSize: 15 }}>{info[1]}</p>
      <div className="wnote">Tap a device{topo === 'star' ? ' or the central switch' : topo === 'bus' ? ' or the backbone' : ''} to make it fail. Grey = cannot communicate.</div>
      <WCtl><WSeg opts={['star', 'bus', 'ring', 'mesh']} v={topo} set={x => { setTopo(x); setDown(null); }} /></WCtl>
    </div>
  );
};

/* Packet switching */
W.packets = function ({ cfg, onState }) {
  const msg = 'HELLO WORLD';
  const pk = msg.match(/.{1,3}/g);
  const [t, setT] = uSt(0), [broken, setBroken] = uSt(false);
  const routes = [[[40, 110], [140, 50], [260, 50], [360, 110]], [[40, 110], [140, 170], [260, 170], [360, 110]], [[40, 110], [140, 50], [260, 170], [360, 110]], [[40, 110], [140, 170], [260, 50], [360, 110]]];
  const at = (r, p) => { const seg = Math.min(2.999, p * 3), k = Math.floor(seg), f = seg - k; const a = r[k], b = r[k + 1]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; };
  const arrived = pk.map((_, i) => t > 0.4 + i * 0.12);
  const order = [2, 0, 3, 1];
  useRep(onState, { t, broken, done: t >= 1 }, [t, broken]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 220" className="wsvg">
        {[[140, 50], [140, 170], [260, 50], [260, 170]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="16" className="w-dev" style={broken && i === 2 ? { fill: 'oklch(0.85 0.08 25)' } : null} onClick={() => i === 2 && setBroken(!broken)} /><text x={x} y={y + 4} textAnchor="middle" style={{ fontSize: 9 }}>R{i + 1}</text></g>)}
        {[[40, 140, 50, 110, 50], [40, 140, 170, 110, 170]].map(() => null)}
        {[[[40, 110], [140, 50]], [[40, 110], [140, 170]], [[140, 50], [260, 50]], [[140, 170], [260, 170]], [[140, 50], [260, 170]], [[140, 170], [260, 50]], [[260, 50], [360, 110]], [[260, 170], [360, 110]]].map(([a, b], i) => <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className="w-cable" />)}
        <rect x="10" y="95" width="40" height="30" rx="4" className="w-dev" /><rect x="350" y="95" width="40" height="30" rx="4" className="w-dev" />
        {pk.map((p, i) => { const r = routes[(broken && [0, 2].includes(i)) ? 1 : i]; const pr = Math.max(0, Math.min(1, (t - i * 0.12) / 0.5)); const [x, y] = at(r, pr); return pr < 1 && <g key={i}><rect x={x - 16} y={y - 9} width="32" height="18" rx="3" fill="var(--acc)" /><text x={x} y={y + 4} textAnchor="middle" style={{ fontSize: 9, fill: '#fff' }}>{i + 1}:{p}</text></g>; })}
      </svg>
      <div className="wread"><div><div className="v">{pk.map((p, i) => arrived[i] ? p : '___').join('')}</div><div className="l">reassembled at destination</div></div></div>
      <div className="wnote">Data is split into numbered <b>packets</b>. Each packet can take a different route through the routers and may arrive out of order; the packet numbers let the receiver put them back together. Tap R3 to break a router, and packets re-route around it.</div>
      <WCtl><WSl label="Send" v={t} set={setT} min={0} max={1} step={0.02} fmt={v => Math.round(v * 100) + '%'} /></WCtl>
    </div>
  );
};

/* ASCII / micro:bit radio */
W.ascii = function ({ cfg, onState }) {
  const [msg, setMsg] = uSt('HI'), [sent, setSent] = uSt(0);
  const codes = msg.slice(0, 8).split('').map(c => [c, c.charCodeAt(0), c.charCodeAt(0).toString(2).padStart(8, '0')]);
  useRep(onState, { sent, len: msg.length }, [sent, msg]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <div className="wmb"><span className="mono">micro:bit A (sender)</span><div className="wmb-face">{codes.slice(0, 1).map(() => null)}<b>{msg.slice(0, 8)}</b></div></div>
        <div className="wmb"><span className="mono">micro:bit B (receiver)</span><div className="wmb-face"><b>{sent ? msg.slice(0, 8) : '…'}</b></div></div>
      </div>
      <table className="wtable"><thead><tr><th>Character</th><th>ASCII (denary)</th><th>Binary sent</th></tr></thead><tbody>{codes.map(([c, d, b], i) => <tr key={i}><td>{c === ' ' ? '␣' : c}</td><td>{d}</td><td className="mono" style={{ textTransform: 'none' }}>{b}</td></tr>)}</tbody></table>
      <pre className="wcode">{`from microbit import *\nimport radio\nradio.on()\nradio.config(group=1)\n\nif button_a.was_pressed():\n    radio.send("${msg.slice(0, 8)}")\n\nincoming = radio.receive()\nif incoming:\n    display.scroll(incoming)`}</pre>
      <div className="wnote">Each character is stored as an ASCII code, a number that is sent as binary over the radio. Both micro:bits must be on the same radio group.</div>
      <WCtl><input className="inp" value={msg} maxLength={8} onChange={e => { setMsg(e.target.value.toUpperCase()); setSent(0); }} style={{ width: 160, fontSize: 18 }} /><button className="btn small" onClick={() => setSent(s => s + 1)}>Press button A (send)</button></WCtl>
    </div>
  );
};

/* LED image designer (5x5) */
W.ledgrid = function ({ cfg, onState }) {
  const [g, setG] = uSt(() => '0000001010000001000101110'.split('').map(Number));
  const on = g.filter(Boolean).length;
  useRep(onState, { on }, [on]);
  const rows = [0, 1, 2, 3, 4].map(r => g.slice(r * 5, r * 5 + 5).map(v => v ? 9 : 0).join(''));
  return (
    <div className="wbox">
      <div className="wsplit">
        <div className="wled">{g.map((v, i) => <button key={i} className={v ? 'on' : ''} onClick={() => setG(g.map((x, j) => j === i ? 1 - x : x))} />)}</div>
        <pre className="wcode">{`from microbit import *\nimport radio\n\nmy_image = Image("${rows.join(':')}")\n\nradio.send("${rows.join(':')}")\ndisplay.show(my_image)`}</pre>
      </div>
      <div className="wnote">Tap the LEDs to design an image. Each row is 5 digits (0 = off, 9 = full brightness). The image is sent as a string of text, then rebuilt on the other micro:bit.</div>
    </div>
  );
};

/* Pseudocode  flowchart tracer */
W.pseudoflow = function ({ cfg, onState }) {
  const [n, setN] = uSt(7), [step, setStep] = uSt(0);
  const lines = ['INPUT number', 'IF number MOD 2 = 0 THEN', '    OUTPUT "even"', 'ELSE', '    OUTPUT "odd"', 'ENDIF'];
  const path = n % 2 === 0 ? [0, 1, 2, 5] : [0, 1, 3, 4, 5];
  const cur = path[Math.min(step, path.length - 1)];
  const fl = [['start', 'Start', 200, 18, 'oval'], [0, 'INPUT number', 200, 62, 'para'], [1, 'number MOD 2 = 0 ?', 200, 115, 'diam'], [2, 'OUTPUT "even"', 90, 175, 'para'], [4, 'OUTPUT "odd"', 310, 175, 'para'], [5, 'Stop', 200, 225, 'oval']];
  useRep(onState, { done: step >= path.length - 1, n }, [step, n]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <pre className="wcode">{lines.map((l, i) => <div key={i} className={i === cur ? 'hl' : ''}>{l}</div>)}</pre>
        <svg viewBox="0 0 400 245" className="wsvg">
          <line x1="200" y1="30" x2="200" y2="50" className="w-cable" /><line x1="200" y1="74" x2="200" y2="95" className="w-cable" />
          <line x1="160" y1="115" x2="90" y2="160" className="w-cable" /><line x1="240" y1="115" x2="310" y2="160" className="w-cable" />
          <line x1="90" y1="190" x2="200" y2="213" className="w-cable" /><line x1="310" y1="190" x2="200" y2="213" className="w-cable" />
          <text x="110" y="135" style={{ fontSize: 10 }}>yes</text><text x="275" y="135" style={{ fontSize: 10 }}>no</text>
          {fl.map(([k, t, x, y, s]) => { const hl = k === cur || (k === 5 && cur === 5); const cls = 'w-fl' + (hl ? ' hl' : ''); return <g key={t}>{s === 'oval' ? <rect x={x - 40} y={y - 12} width="80" height="24" rx="12" className={cls} /> : s === 'diam' ? <polygon points={`${x},${y - 22} ${x + 70},${y} ${x},${y + 22} ${x - 70},${y}`} className={cls} /> : <polygon points={`${x - 62},${y + 13} ${x - 52},${y - 13} ${x + 62},${y - 13} ${x + 52},${y + 13}`} className={cls} />}<text x={x} y={y + 4} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--ink)' }}>{t}</text></g>; })}
        </svg>
      </div>
      <div className="wnote">Pseudocode and flowcharts show the same algorithm. Ovals = start/stop, parallelograms = input/output, diamonds = decisions (selection).</div>
      <WCtl><WSl label="Input number" v={n} set={x => { setN(x); setStep(0); }} min={1} max={20} /><button className="btn small" disabled={step >= path.length - 1} onClick={() => setStep(step + 1)}>Step →</button><button className="chip" onClick={() => setStep(0)}>Restart</button></WCtl>
    </div>
  );
};

/* Binary  denary */
W.binary = function ({ cfg, onState }) {
  const [b, setB] = uSt([0, 0, 1, 0, 1, 1, 0, 1]), [target] = uSt(() => [77, 200, 15, 128]), [ti, setTi] = uSt(0);
  const pv = [128, 64, 32, 16, 8, 4, 2, 1], d = b.reduce((a, v, i) => a + v * pv[i], 0);
  const [solved, setSolved] = uSt(0);
  uEf(() => { if (d === target[ti] && ti + 1 > solved) setSolved(ti + 1); }, [d, ti]);
  useRep(onState, { d, solved, total: target.length, done: solved === target.length }, [d, solved]);
  return (
    <div className="wbox">
      <div className="wbits">{pv.map((p, i) => <button key={i} className={b[i] ? 'on' : ''} onClick={() => setB(b.map((x, j) => j === i ? 1 - x : x))}><span className="mono">{p}</span><b>{b[i]}</b></button>)}</div>
      <div className="wbig" style={{ textAlign: 'center' }}>{b.join('')}₂ = {pv.filter((_, i) => b[i]).join(' + ') || '0'} = <b>{d}</b>₁₀</div>
      <div className="wfoot"><span className="mono">Target: make {target[ti]} {d === target[ti] ? '✓' : ''} · {ti + 1}/{target.length}</span>{d === target[ti] && ti < target.length - 1 && <button className="btn small" onClick={() => setTi(ti + 1)}>Next target →</button>}</div>
      <div className="wnote">Computers store everything in binary (base 2). Each bit's place value doubles from right to left. 8 bits = 1 byte, which can store 0 to 255.</div>
    </div>
  );
};

/* Logic gates & truth tables */
W.logic = function ({ cfg, onState }) {
  const [gate, setGate] = uSt('AND'), [A, setA] = uSt(0), [B, setB] = uSt(1), [seen, setSeen] = uSt(['AND']);
  const f = { AND: (a, b) => a & b, OR: (a, b) => a | b, NOT: a => 1 - a }[gate];
  const Q = f(A, B);
  uEf(() => { if (!seen.includes(gate)) setSeen([...seen, gate]); }, [gate]);
  useRep(onState, { seen: seen.length, Q }, [seen.length, Q]);
  const rows = gate === 'NOT' ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 260 160" className="wsvg">
          <line x1="20" y1={gate === 'NOT' ? 80 : 55} x2="90" y2={gate === 'NOT' ? 80 : 55} stroke={A ? 'var(--acc)' : 'var(--rule)'} strokeWidth="4" />
          {gate !== 'NOT' && <line x1="20" y1="105" x2="90" y2="105" stroke={B ? 'var(--acc)' : 'var(--rule)'} strokeWidth="4" />}
          {gate === 'AND' && <path d="M90,40 L130,40 A40,40 0 0 1 130,120 L90,120 Z" className="w-gate" />}
          {gate === 'OR' && <path d="M85,40 Q150,40 175,80 Q150,120 85,120 Q110,80 85,40 Z" className="w-gate" />}
          {gate === 'NOT' && <><polygon points="90,45 160,80 90,115" className="w-gate" /><circle cx="167" cy="80" r="7" className="w-gate" /></>}
          <line x1={gate === 'AND' ? 170 : 175} y1="80" x2="240" y2="80" stroke={Q ? 'var(--acc)' : 'var(--rule)'} strokeWidth="4" />
          <circle cx="245" cy="80" r="10" fill={Q ? 'oklch(0.85 0.17 90)' : 'var(--paper-2)'} stroke="var(--ink-3)" />
          <text x="12" y={gate === 'NOT' ? 84 : 59} textAnchor="end" style={{ fontSize: 12 }}>A</text>{gate !== 'NOT' && <text x="12" y="109" textAnchor="end" style={{ fontSize: 12 }}>B</text>}
        </svg>
        <table className="wtable"><thead><tr><th>A</th>{gate !== 'NOT' && <th>B</th>}<th>Q</th></tr></thead><tbody>{rows.map((r, i) => { const on = r[0] === A && (gate === 'NOT' || r[1] === B); return <tr key={i} className={on ? 'w-ok' : ''}><td>{r[0]}</td>{gate !== 'NOT' && <td>{r[1]}</td>}<td>{f(r[0], r[1])}</td></tr>; })}</tbody></table>
      </div>
      <div className="wnote">{{ AND: 'AND: the output is 1 only if BOTH inputs are 1.', OR: 'OR: the output is 1 if EITHER input (or both) is 1.', NOT: 'NOT: the output is the opposite of the input.' }[gate]} 1 = on/true, 0 = off/false.</div>
      <WCtl><WSeg opts={['AND', 'OR', 'NOT']} v={gate} set={setGate} /><button className={'chip' + (A ? ' on' : '')} onClick={() => setA(1 - A)}>A = {A}</button>{gate !== 'NOT' && <button className={'chip' + (B ? ' on' : '')} onClick={() => setB(1 - B)}>B = {B}</button>}</WCtl>
    </div>
  );
};

/* Compression: run-length encoding */
W.compress = function ({ cfg, onState }) {
  const [g, setG] = uSt(() => { const a = Array(64).fill(0); [18, 19, 20, 21, 26, 29, 34, 37, 42, 43, 44, 45].forEach(i => a[i] = 1); return a; });
  const rows = [0, 1, 2, 3, 4, 5, 6, 7].map(r => g.slice(r * 8, r * 8 + 8));
  const rle = rows.map(r => { const o = []; let c = r[0], n = 0; r.forEach(v => { if (v === c) n++; else { o.push(n + (c ? 'B' : 'W')); c = v; n = 1; } }); o.push(n + (c ? 'B' : 'W')); return o; });
  const size = rle.reduce((a, r) => a + r.length * 2, 0);
  useRep(onState, { size }, [size]);
  return (
    <div className="wbox">
      <div className="wsplit">
        <div className="wpix">{g.map((v, i) => <button key={i} className={v ? 'on' : ''} onClick={() => setG(g.map((x, j) => j === i ? 1 - x : x))} />)}</div>
        <div className="wcode" style={{ fontSize: 12 }}>{rle.map((r, i) => <div key={i}>{r.join(' ')}</div>)}</div>
      </div>
      <WRead items={[['Uncompressed', '64 values'], ['Run-length encoded', size + ' values'], ['Saving', Math.round((1 - size / 64) * 100) + '%']]} />
      <div className="wnote">Compression makes files smaller so they store and send faster. Run-length encoding replaces repeats with a count, e.g. "8W". Lossless compression keeps every detail; lossy compression (JPEG, MP3) removes detail you won't notice.</div>
    </div>
  );
};

/* Python selection simulator (game) */
W.pygame = function ({ cfg, onState }) {
  const [secret] = uSt(7), [g, setG] = uSt(5), [log, setLog] = uSt([]), [lives, setLives] = uSt(3);
  const won = log.some(l => l[1] === 'eq');
  const guess = () => { if (won || lives <= 0) return; const r = g === secret ? 'eq' : g < secret ? 'lo' : 'hi'; setLog([...log, [g, r]]); if (r !== 'eq') setLives(lives - 1); };
  const last = log.length ? log[log.length - 1][1] : null;
  useRep(onState, { tries: log.length, won }, [log.length, won]);
  return (
    <div className="wbox">
      <pre className="wcode">{[
        ['secret = 7', null], ['lives = 3', null], ['guess = int(input("Guess 1-10: "))', null],
        ['if guess == secret:', 'eq'], ['    print("You win!")', 'eq'], ['elif guess < secret:', 'lo'], ['    print("Too low")', 'lo'], ['    lives = lives - 1', 'lo'], ['else:', 'hi'], ['    print("Too high")', 'hi'], ['    lives = lives - 1', 'hi'],
      ].map(([l, k], i) => <div key={i} className={k && k === last ? 'hl' : ''}>{l}</div>)}</pre>
      <div className="wterm">{log.map(([v, r], i) => <div key={i}>&gt; {v}<br />{r === 'eq' ? 'You win!' : r === 'lo' ? 'Too low' : 'Too high'}</div>)}{lives <= 0 && !won && <div>Game over</div>}</div>
      <div className="wnote">Selection (if / elif / else) lets the program choose what to do. Only ONE branch runs, and the highlighted lines show which. Lives left: {lives}.</div>
      <WCtl><WSl label="Your guess" v={g} set={setG} min={1} max={10} /><button className="btn small" onClick={guess} disabled={won || lives <= 0}>Run</button><button className="chip" onClick={() => { setLog([]); setLives(3); }}>Reset</button></WCtl>
    </div>
  );
};

/* Validation checks */
W.validate = function ({ cfg, onState }) {
  const fields = [['Age', 'range', '11–16', v => /^\d+$/.test(v) && +v >= 11 && +v <= 16], ['Name', 'presence', 'not blank', v => v.trim().length > 0], ['Phone', 'length', 'exactly 11 digits', v => /^\d{11}$/.test(v)], ['Date', 'format', 'DD/MM/YYYY', v => /^\d{2}\/\d{2}\/\d{4}$/.test(v)], ['Year group', 'lookup', '7, 8 or 9', v => ['7', '8', '9'].includes(v.trim())], ['Score', 'type', 'a whole number', v => /^-?\d+$/.test(v)]];
  const [vals, setVals] = uSt(['25', '', '0712345', '3/9/2026', '10', 'ten']);
  const okN = fields.filter((f, i) => f[3](vals[i])).length;
  useRep(onState, { okN, all: okN === fields.length }, [okN]);
  return (
    <div className="wbox">
      <table className="wtable"><thead><tr><th>Field</th><th>Check</th><th>Rule</th><th>Input</th><th></th></tr></thead><tbody>
        {fields.map(([f, c, r, fn], i) => { const ok = fn(vals[i]); return <tr key={f}><td>{f}</td><td>{c}</td><td>{r}</td><td><input className="inp" style={{ width: 130, fontSize: 15, padding: '6px 8px' }} value={vals[i]} onChange={e => setVals(vals.map((x, j) => j === i ? e.target.value : x))} /></td><td style={{ color: ok ? 'var(--ok)' : 'var(--bad)' }}>{ok ? '✓ accepted' : '✗ rejected'}</td></tr>; })}
      </tbody></table>
      <div className="wnote">Fix every input so it is accepted. Validation checks that data is SENSIBLE and follows the rules. It cannot check that data is correct: a valid age could still be the wrong age. Verification (double entry, proofreading) checks the data was copied accurately.</div>
    </div>
  );
};

/* Spreadsheet what-if */
W.whatif = function ({ cfg, onState }) {
  const [price, setPrice] = uSt(2), [sold, setSold] = uSt(120), [cost, setCost] = uSt(0.8), [fixed, setFixed] = uSt(50);
  const income = price * sold, costs = cost * sold + fixed, profit = income - costs;
  useRep(onState, { profit }, [Math.round(profit)]);
  const cell = (r, c, v, f) => <tr><td className="mono">{r}</td><td>{c}</td><td><b>{v}</b></td><td className="mono" style={{ textTransform: 'none', color: 'var(--ink-3)' }}>{f}</td></tr>;
  return (
    <div className="wbox">
      <div className="mono">Cake sale model</div>
      <table className="wtable"><thead><tr><th></th><th>A</th><th>B</th><th>formula</th></tr></thead><tbody>
        {cell(1, 'Price per cake', '$' + wxFmt(price), '')}{cell(2, 'Cakes sold', sold, '')}{cell(3, 'Cost per cake', '$' + wxFmt(cost), '')}{cell(4, 'Stall fee', '$' + fixed, '')}
        {cell(5, 'Income', '$' + wxFmt(income), '=B1*B2')}{cell(6, 'Total costs', '$' + wxFmt(costs), '=B3*B2+B4')}{cell(7, 'Profit', <span style={{ color: profit >= 0 ? 'var(--ok)' : 'var(--bad)' }}>${wxFmt(profit)}</span>, '=B5-B6')}
      </tbody></table>
      <div className="wnote">Formulae link the cells: change an input and every result updates. Asking "what if the price were $2.50?" lets you test predictions before the real event.</div>
      <WCtl><WSl label="Price (B1)" v={price} set={setPrice} min={0.5} max={4} step={0.25} fmt={v => '$' + wxFmt(v)} /><WSl label="Sold (B2)" v={sold} set={setSold} min={0} max={250} step={10} /><WSl label="Cost each (B3)" v={cost} set={setCost} min={0.2} max={2} step={0.1} fmt={v => '$' + wxFmt(v)} /><WSl label="Stall fee (B4)" v={fixed} set={setFixed} min={0} max={150} step={10} fmt={v => '$' + v} /></WCtl>
    </div>
  );
};

/* Recycling quiz decision tree */
W.recycle = function ({ cfg, onState }) {
  const items = { 'Plastic bottle': ['y', 'y', 'n'], 'Greasy pizza box': ['y', 'n', 'n'], 'Glass jar': ['y', 'y', 'n'], 'Crisp packet': ['n', null, null], 'Battery': ['y', 'y', 'y'], 'Clean cardboard': ['y', 'y', 'n'] };
  const Qs = ['Is it paper, card, glass, metal or hard plastic?', 'Is it clean and dry?', 'Is it hazardous (battery, electronics)?'];
  const [it, setIt] = uSt('Plastic bottle'), [k, setK] = uSt(0), [ans, setAns] = uSt([]), [seen, setSeen] = uSt([]);
  const ex = items[it];
  const outcome = ans[0] === 'n' ? 'General waste' : ans[1] === 'n' ? 'General waste (dirty items contaminate recycling)' : ans[2] === 'y' ? 'Special collection point' : ans.length === 3 ? 'Recycling bin ' : null;
  uEf(() => { if (outcome && !seen.includes(it)) setSeen([...seen, it]); }, [outcome]);
  useRep(onState, { seen: seen.length }, [seen.length]);
  const pick = a => { if (outcome) return; setAns([...ans, a]); setK(k + 1); };
  return (
    <div className="wbox">
      <div className="wbig">{it}</div>
      <div className="wsteps">{ans.map((a, i) => <div key={i} className="wst-line"><span className="mono">Q{i + 1}</span><span>{Qs[i]} → {a === 'y' ? 'yes' : 'no'}</span></div>)}</div>
      {!outcome ? <div><span className="mono">{Qs[k]}</span><div className="chips"><button className="chip" onClick={() => pick('y')}>Yes</button><button className="chip" onClick={() => pick('n')}>No</button></div><div className="wnote">Hint: for this item the answer is {ex[k] === 'y' ? 'yes' : 'no'}.</div></div>
        : <div className="wbig" style={{ color: 'var(--acc)' }}>→ {outcome}</div>}
      <pre className="wcode">{`material = input("Paper, card, glass, metal or hard plastic? ")\nif material == "no":\n    print("General waste")\nelif input("Clean and dry? ") == "no":\n    print("General waste")\nelif input("Hazardous? ") == "yes":\n    print("Special collection")\nelse:\n    print("Recycle it!")`}</pre>
      <WCtl><WSeg label="Item" opts={Object.keys(items)} v={it} set={x => { setIt(x); setK(0); setAns([]); }} /></WCtl>
    </div>
  );
};

/* Test table */
W.testtable = function ({ cfg, onState }) {
  const rows = [['15', 'normal', 'Accepted'], ['11', 'boundary', 'Accepted'], ['16', 'boundary', 'Accepted'], ['10', 'boundary (just outside)', 'Rejected'], ['abc', 'erroneous', 'Rejected'], ['-3', 'erroneous', 'Rejected']];
  const [res, setRes] = uSt({});
  const prog = v => /^\d+$/.test(v) && +v >= 11 && +v <= 16 ? 'Accepted' : 'Rejected';
  useRep(onState, { n: Object.keys(res).length, done: Object.keys(res).length === rows.length }, [Object.keys(res).length]);
  return (
    <div className="wbox">
      <div className="mono">Program: accept an age from 11 to 16</div>
      <table className="wtable"><thead><tr><th>Test data</th><th>Type</th><th>Expected</th><th>Actual</th><th>Pass?</th></tr></thead><tbody>
        {rows.map(([v, t, e], i) => <tr key={i}><td>{v}</td><td>{t}</td><td>{e}</td><td>{res[i] ? prog(v) : <button className="chip" onClick={() => setRes({ ...res, [i]: 1 })}>Run</button>}</td><td>{res[i] ? (prog(v) === e ? '✓' : '✗') : ''}</td></tr>)}
      </tbody></table>
      <div className="wnote">Test with <b>normal</b> data (should work), <b>boundary</b> data (at the edges of the range) and <b>erroneous</b> data (wrong type or out of range). Record the results, fix any errors, then test again: that is iteration.</div>
    </div>
  );
};
