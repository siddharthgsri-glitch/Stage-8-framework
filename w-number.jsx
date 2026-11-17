/* Number widgets */

/* 1.1 integers × ÷ */
W.intmul = function ({ cfg, onState }) {
  const [a, setA] = uSt(-3), [b, setB] = uSt(4), [op, setOp] = uSt('×');
  const p = a * b;
  const res = op === '×' ? p : a; // division shown as p ÷ b = a
  useRep(onState, { a, b, op, res, p }, [a, b, op]);
  const P = wxPlane(460, 90, -30, 30, 0, 1, 14);
  const jumps = [];
  const n = Math.abs(b), step = b >= 0 ? a : -a;
  for (let i = 0; i < n; i++) { const x0 = step * i, x1 = step * (i + 1); const mx = (P.X(x0) + P.X(x1)) / 2; jumps.push(<path key={i} d={`M${P.X(x0)},50 Q${mx},${18} ${P.X(x1)},50`} className="w-jump" />); }
  const sign = (s1, s2) => (op === '×' ? (s1 * s2 >= 0 ? '+' : '−') : (s1 * s2 >= 0 ? '+' : '−'));
  return (
    <div className="wbox">
      <div className="wbig">{op === '×' ? <>{wxFmt(a, 0)} × {wxFmt(b, 0)} = <b>{wxFmt(p, 0)}</b></> : <>{wxFmt(p, 0)} ÷ {wxFmt(b, 0)} = <b>{wxFmt(a, 0)}</b></>}</div>
      <svg viewBox="0 0 460 90" className="wsvg">
        <line x1={P.X(-30)} x2={P.X(30)} y1="50" y2="50" className="w-ax" />
        {[-30, -20, -10, 0, 10, 20, 30].map(x => <g key={x}><line x1={P.X(x)} x2={P.X(x)} y1="45" y2="55" className="w-ax" /><text x={P.X(x)} y="72" textAnchor="middle">{x}</text></g>)}
        {op === '×' && jumps}
        <circle cx={P.X(op === '×' ? p : a)} cy="50" r="6" className="w-pt" />
      </svg>
      <div className="wnote">{op === '×' ? `${Math.abs(b)} jump${n === 1 ? '' : 's'} of ${wxFmt(a, 0)}${b < 0 ? ', then reversed because the multiplier is negative' : ''}.` : 'Division undoes multiplication: what times ' + wxFmt(b, 0) + ' gives ' + wxFmt(p, 0) + '?'}</div>
      <div className="wsigns">
        {[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([s1, s2], i) => {
          const on = Math.sign(op === '×' ? a : p) === s1 && Math.sign(b) === s2;
          return <span key={i} className={on ? 'on' : ''}>{s1 > 0 ? '+' : '−'} {op} {s2 > 0 ? '+' : '−'} = {sign(s1, s2)}</span>;
        })}
      </div>
      <WCtl>
        <WSeg opts={['×', '÷']} v={op} set={setOp} />
        <WSl label={op === '×' ? 'First number' : 'Answer'} v={a} set={x => setA(x || (a > 0 ? -1 : 1))} min={-6} max={6} fmt={v => wxFmt(v, 0)} />
        <WSl label={op === '×' ? 'Multiplier' : 'Divide by'} v={b} set={x => setB(x || (b > 0 ? -1 : 1))} min={-5} max={5} fmt={v => wxFmt(v, 0)} />
      </WCtl>
    </div>
  );
};

/* 1.2 squares, cubes, roots */
W.powers = function ({ cfg, onState }) {
  const [n, setN] = uSt(3), [mode, setMode] = uSt('square');
  const sq = n * n, cu = n * n * n;
  useRep(onState, { n, mode, sq, cu }, [n, mode]);
  const k = Math.abs(n) || 0, cell = Math.min(22, 200 / Math.max(k, 1));
  return (
    <div className="wbox">
      <div className="wsplit">
        <svg viewBox="0 0 220 220" className="wsvg" style={{ maxWidth: 240 }}>
          {mode === 'square' ? Array.from({ length: k * k }, (_, i) => <rect key={i} x={10 + (i % k) * cell} y={10 + Math.floor(i / k) * cell} width={cell - 2} height={cell - 2} className={n < 0 ? 'w-neg' : 'w-cell'} />)
            : Array.from({ length: k }, (_, z) => Array.from({ length: k * k }, (_, i) => { const c = Math.min(16, 120 / Math.max(k, 1)); const x = 20 + (i % k) * c + z * c * 0.5, y = 90 + Math.floor(i / k) * c - z * c * 0.5; return <rect key={z + '-' + i} x={x} y={y} width={c - 1.5} height={c - 1.5} className={n < 0 ? 'w-neg' : 'w-cell'} style={{ opacity: 0.35 + 0.65 * (z + 1) / k }} />; }))}
          {k === 0 && <text x="110" y="115" textAnchor="middle" style={{ fontSize: 16 }}>0</text>}
        </svg>
        <div className="wlist">
          <div><span className="mono">{mode === 'square' ? 'Square' : 'Cube'}</span><div className="wbig">{n < 0 ? `(${wxFmt(n, 0)})` : n}{mode === 'square' ? '²' : '³'} = <b>{wxFmt(mode === 'square' ? sq : cu, 0)}</b></div></div>
          <div><span className="mono">{mode === 'square' ? 'Square roots' : 'Cube root'}</span><div className="wbig">{mode === 'square' ? <>√{sq} = <b>{k === 0 ? 0 : '±' + k}</b></> : <>∛{wxFmt(cu, 0)} = <b>{wxFmt(n, 0)}</b></>}</div></div>
          <div className="wnote">{mode === 'square' ? 'A negative times a negative is positive, so every positive number has two square roots.' : 'A cube keeps the sign: negative × negative × negative is negative.'}</div>
        </div>
      </div>
      <WCtl><WSeg opts={[['square', 'Square n²'], ['cube', 'Cube n³']]} v={mode} set={setMode} /><WSl label="n" v={n} set={setN} min={-8} max={8} fmt={v => wxFmt(v, 0)} /></WCtl>
    </div>
  );
};

/* 1.3 index laws */
W.indices = function ({ cfg, onState }) {
  const [m, setM] = uSt(3), [n, setN] = uSt(2), [op, setOp] = uSt('×');
  const a = cfg && cfg.base || 2;
  const r = op === '×' ? m + n : m - n;
  useRep(onState, { m, n, op, r }, [m, n, op]);
  const top = Array.from({ length: m }, (_, i) => i), bot = Array.from({ length: n }, (_, i) => i);
  const cancel = op === '÷' ? Math.min(m, n) : 0;
  return (
    <div className="wbox">
      <div className="wbig">{a}<sup>{m}</sup> {op} {a}<sup>{n}</sup> = {a}<sup>{op === '×' ? `${m}+${n}` : `${m}−${n}`}</sup> = <b>{a}<sup>{r}</sup></b>{r >= 0 && <span className="wdim"> = {Math.pow(a, r)}</span>}</div>
      {op === '×' ? (
        <div className="wfactors">{top.map(i => <span key={'t' + i} className="wf a">{a}</span>)}<span className="wop">×</span>{bot.map(i => <span key={'b' + i} className="wf b">{a}</span>)}</div>
      ) : (
        <div className="wfrac-stack">
          <div className="wfactors">{top.map(i => <span key={i} className={'wf a' + (i < cancel ? ' x' : '')}>{a}</span>)}{m === 0 && <span className="wf">1</span>}</div>
          <div className="wfrac-line" />
          <div className="wfactors">{bot.map(i => <span key={i} className={'wf b' + (i < cancel ? ' x' : '')}>{a}</span>)}{n === 0 && <span className="wf">1</span>}</div>
        </div>
      )}
      <div className="wnote">{op === '×' ? `Count the ${a}s: ${m} + ${n} = ${m + n}.` : r === 0 ? `Everything cancels, leaving 1. So ${a}⁰ = 1.` : r > 0 ? `${cancel} pair${cancel === 1 ? '' : 's'} cancel, leaving ${r}.` : 'More on the bottom than the top. At Stage 8 we keep m ≥ n.'}</div>
      <WCtl><WSeg opts={['×', '÷']} v={op} set={setOp} /><WSl label="m" v={m} set={setM} min={0} max={6} /><WSl label="n" v={n} set={setN} min={0} max={6} /></WCtl>
    </div>
  );
};

/* 4.1 prime factors: division ladder */
W.factree = function ({ cfg, onState }) {
  const nums = (cfg && cfg.nums) || [60, 84, 126, 180];
  const [ni, setNi] = uSt(0), [solved, setSolved] = uSt(0);
  const N = nums[ni];
  const [cur, setCur] = uSt(N), [fs, setFs] = uSt([]), [bad, setBad] = uSt(null);
  uEf(() => { setCur(N); setFs([]); }, [ni]);
  const done = cur === 1;
  useRep(onState, { solved, total: nums.length, done: solved === nums.length }, [solved]);
  const pick = p => { if (done) return; if (cur % p === 0) { const c = cur / p; setCur(c); setFs([...fs, p]); if (c === 1 && ni + 1 > solved) setSolved(ni + 1); } else { setBad(p); setTimeout(() => setBad(null), 450); } };
  const idx = {}; fs.forEach(f => idx[f] = (idx[f] || 0) + 1);
  return (
    <div className="wbox">
      <div className="wsplit">
        <div className="wladder">
          {[N, ...fs.map((_, i) => fs.slice(0, i + 1).reduce((a, f) => a / f, N))].map((v, i) => (
            <div key={i} className="wl-row"><span className="wl-p">{fs[i] || ''}</span><span className={'wl-v' + (v === 1 ? ' one' : '')}>{v}</span></div>
          ))}
        </div>
        <div className="wlist">
          <span className="mono">Divide by a prime</span>
          <div className="chips">{[2, 3, 5, 7, 11].map(p => <button key={p} className={'chip' + (bad === p ? ' shake bad' : '')} disabled={done} onClick={() => pick(p)}>÷ {p}</button>)}</div>
          <span className="mono" style={{ marginTop: 14 }}>Product of primes</span>
          <div className="wbig">{N} = {fs.length ? Object.entries(idx).map(([p, c], i) => <span key={p}>{i ? ' × ' : ''}{p}{c > 1 && <sup>{c}</sup>}</span>) : '…'}{!done && fs.length > 0 && <span className="wdim"> × {cur}</span>}</div>
          {done && ni < nums.length - 1 && <button className="btn small" onClick={() => setNi(ni + 1)}>Next number →</button>}
          {done && ni === nums.length - 1 && <span className="wnote" style={{ color: 'var(--ok)' }}>All numbers done ✓</span>}
        </div>
      </div>
    </div>
  );
};

/* HCF / LCM from prime factors (Venn of factors) */
W.hcf = function ({ cfg, onState }) {
  const [a, setA] = uSt(24), [b, setB] = uSt(36);
  const pf = n => { const r = []; let m = n; for (let p = 2; m > 1; p++) while (m % p === 0) { r.push(p); m /= p; } return r; };
  const A = pf(a), B = pf(b), both = [], onlyA = [], onlyB = B.slice();
  A.forEach(p => { const k = onlyB.indexOf(p); if (k >= 0) { both.push(p); onlyB.splice(k, 1); } else onlyA.push(p); });
  const h = wxG(a, b), l = wxLcm(a, b);
  useRep(onState, { a, b, h, l }, [a, b]);
  return (
    <div className="wbox">
      <svg viewBox="0 0 440 200" className="wsvg">
        <circle cx="165" cy="100" r="88" className="w-venA" /><circle cx="275" cy="100" r="88" className="w-venB" />
        <text x="110" y="22" textAnchor="middle" className="w-lab">{a}</text><text x="330" y="22" textAnchor="middle" className="w-lab">{b}</text>
        {onlyA.map((p, i) => <text key={'a' + i} x={120 + (i % 2) * 26} y={80 + Math.floor(i / 2) * 26} className="w-fac">{p}</text>)}
        {both.map((p, i) => <text key={'c' + i} x={210 + (i % 2) * 20} y={70 + Math.floor(i / 2) * 26} className="w-fac">{p}</text>)}
        {onlyB.map((p, i) => <text key={'b' + i} x={290 + (i % 2) * 26} y={80 + Math.floor(i / 2) * 26} className="w-fac">{p}</text>)}
      </svg>
      <WRead items={[['HCF = middle', both.length ? both.join(' × ') + ' = ' + h : '1'], ['LCM = everything', [...onlyA, ...both, ...onlyB].join(' × ') + ' = ' + l]]} />
      <WCtl><WSl label="First number" v={a} set={setA} min={6} max={90} step={2} /><WSl label="Second number" v={b} set={setB} min={6} max={90} step={2} /></WCtl>
    </div>
  );
};

/* 7.1 place value × ÷ 0.1 / 0.01 */
W.placeval = function ({ cfg, onState }) {
  const start = (cfg && cfg.start) || 37.5;
  const [v, setV] = uSt(start), [hist, setHist] = uSt([]);
  const cols = ['1000', '100', '10', '1', '·', '0.1', '0.01', '0.001', '0.0001'];
  const str = v.toFixed(4); const [ip, fp] = str.split('.');
  const digits = {}; const ipad = ip.padStart(4, ' ');
  ['1000', '100', '10', '1'].forEach((c, i) => { const d = ipad[i]; digits[c] = d === ' ' ? '' : d; });
  ['0.1', '0.01', '0.001', '0.0001'].forEach((c, i) => digits[c] = fp[i]);
  let lastNZ = 3; for (let i = 3; i >= 0; i--) if (fp[i] !== '0') { lastNZ = i; break; } else lastNZ = i - 1;
  ['0.1', '0.01', '0.001', '0.0001'].forEach((c, i) => { if (i > lastNZ) digits[c] = ''; });
  let firstNZ = ipad.search(/[1-9]/); if (firstNZ < 0) firstNZ = 3; ['1000', '100', '10'].forEach((c, i) => { if (i < firstNZ) digits[c] = ''; });
  const ops = [['× 0.1', 0.1], ['× 0.01', 0.01], ['÷ 0.1', 10], ['÷ 0.01', 100]];
  useRep(onState, { v: wxR(v, 4), hist }, [v]);
  const apply = ([lab, f]) => { const nv = wxR(v * f, 6); if (nv > 9999 || nv < 0.0001) return; setV(nv); setHist([...hist, lab]); };
  return (
    <div className="wbox">
      <div className="wpv">{cols.map(c => c === '·' ? <div key={c} className="wpv-dot">·</div> : <div key={c} className="wpv-c"><span className="mono">{c}</span><b key={v + c}>{digits[c]}</b></div>)}</div>
      <div className="wbig" style={{ textAlign: 'center' }}>{wxFmt(v, 4)}</div>
      <div className="wnote" style={{ textAlign: 'center' }}>{hist.length ? 'Last: ' + hist[hist.length - 1] + ' · ' + ({ '× 0.1': 'same as ÷ 10, digits move 1 place right', '× 0.01': 'same as ÷ 100, digits move 2 places right', '÷ 0.1': 'same as × 10, digits move 1 place left', '÷ 0.01': 'same as × 100, digits move 2 places left' })[hist[hist.length - 1]] : 'Choose an operation and watch the digits move.'}</div>
      <WCtl><div className="chips">{ops.map(o => <button key={o[0]} className="chip" onClick={() => apply(o)}>{o[0]}</button>)}<button className="chip" onClick={() => { setV(start); setHist([]); }}>Reset</button></div></WCtl>
    </div>
  );
};

/* 7.2 significant figures */
W.sigfig = function ({ cfg, onState }) {
  const nums = (cfg && cfg.nums) || [4836, 0.05072, 29.96, 0.0007149];
  const [ni, setNi] = uSt(0), [sf, setSf] = uSt(2);
  const x = nums[ni];
  const r = Number(x.toPrecision(sf));
  const s = String(x); let seen = false, cnt = 0;
  const chars = s.split('').map((ch, i) => { if (/\d/.test(ch)) { if (ch !== '0') seen = true; if (seen) { cnt++; return { ch, k: cnt <= sf ? 'keep' : cnt === sf + 1 ? 'decide' : 'drop' }; } return { ch, k: 'lead' }; } return { ch, k: 'pt' }; });
  useRep(onState, { ni, sf, r, x }, [ni, sf]);
  return (
    <div className="wbox">
      <div className="wsf">{chars.map((c, i) => <span key={i} className={'sf-' + c.k}>{c.ch}</span>)}</div>
      <div className="wnote" style={{ textAlign: 'center' }}>Leading zeros don't count. The <span className="sf-decide">decider</span> digit after the last kept digit decides: 5 or more rounds up.</div>
      <WRead items={[['Number', s], ['Sig. figs', sf], ['Rounded', wxFmt(r, 8)]]} />
      <WCtl><WSeg label="Number" opts={nums.map((n, i) => [i, String(n)])} v={ni} set={setNi} /><WSl label="Significant figures" v={sf} set={setSf} min={1} max={4} /></WCtl>
    </div>
  );
};

/* 7.3 multiplying / dividing decimals */
W.decmul = function ({ cfg, onState }) {
  const [a, setA] = uSt(2.4), [b, setB] = uSt(0.3), [op, setOp] = uSt('×');
  const ai = Math.round(a * 10), bi = Math.round(b * 10);
  const res = op === '×' ? wxR(a * b, 4) : wxR(a / b, 4);
  const est = op === '×' ? Number(a.toPrecision(1)) * Number(b.toPrecision(1)) : Number(a.toPrecision(1)) / Number(b.toPrecision(1));
  useRep(onState, { a, b, op, res }, [a, b, op]);
  return (
    <div className="wbox">
      <div className="wbig">{wxFmt(a, 1)} {op} {wxFmt(b, 1)} = <b>{wxFmt(res, 3)}</b></div>
      <div className="wsteps">
        <div className="wst-line"><span className="mono">estimate</span><span>{Number(a.toPrecision(1))} {op} {Number(b.toPrecision(1))} ≈ {wxFmt(est, 2)}</span></div>
        {op === '×' ? <>
          <div className="wst-line"><span className="mono">whole numbers</span><span>{ai} × {bi} = {ai * bi}</span></div>
          <div className="wst-line"><span className="mono">adjust</span><span>each number was × 10, so ÷ 100: {ai * bi} ÷ 100 = {wxFmt(res, 3)}</span></div>
        </> : <>
          <div className="wst-line"><span className="mono">equivalent</span><span>× both by 10: {wxFmt(a * 10, 1)} ÷ {bi}</span></div>
          <div className="wst-line"><span className="mono">divide</span><span>{wxFmt(a * 10, 1)} ÷ {bi} = {wxFmt(res, 3)}</span></div>
        </>}
      </div>
      <div className="wnote">{op === '×' ? (b < 1 ? 'Multiplying by a number less than 1 makes it smaller.' : 'Multiplying by a number more than 1 makes it bigger.') : (b < 1 ? 'Dividing by a number less than 1 makes it bigger.' : 'Dividing by a number more than 1 makes it smaller.')}</div>
      <WCtl><WSeg opts={['×', '÷']} v={op} set={setOp} /><WSl label="First" v={a} set={setA} min={0.2} max={9.8} step={0.2} fmt={v => wxFmt(v, 1)} /><WSl label="Second" v={b} set={setB} min={0.1} max={4} step={0.1} fmt={v => wxFmt(v, 1)} /></WCtl>
    </div>
  );
};

/* fraction bar helper */
function FBar({ whole, num, den, color, label, w = 420 }) {
  const cells = []; const total = Math.max(whole, 1) * den;
  for (let i = 0; i < total; i++) cells.push(<rect key={i} x={(i % (den * whole)) * (w / (den * whole))} y={0} width={w / (den * whole) - 1} height={26} className={i < num ? 'w-cell' : 'w-empty'} style={i < num && color ? { fill: color } : null} />);
  return <div className="wfbar"><span className="mono">{label}</span><svg viewBox={`0 0 ${w} 26`} className="wsvg">{cells}{Array.from({ length: whole + 1 }, (_, i) => <line key={i} x1={i * w / whole} x2={i * w / whole} y1="0" y2="26" className="w-ax" />)}</svg></div>;
}

/* 10.1 subtracting mixed numbers */
W.mixed = function ({ cfg, onState }) {
  const [aw, setAw] = uSt(3), [an, setAn] = uSt(1), [ad, setAd] = uSt(4);
  const [bw, setBw] = uSt(1), [bn, setBn] = uSt(2), [bd, setBd] = uSt(3);
  const A = aw + an / ad, B = bw + bn / bd;
  const L = wxLcm(ad, bd), An = an * (L / ad), Bn = bn * (L / bd);
  const borrow = An < Bn;
  const diff = (aw * L + An) - (bw * L + Bn);
  const rw = Math.floor(diff / L), rn = diff - rw * L, g = wxG(rn, L) || 1;
  useRep(onState, { borrow, pos: diff > 0, rw, rn: rn / g, rd: L / g, L }, [aw, an, ad, bw, bn, bd]);
  return (
    <div className="wbox">
      <div className="wbig">{aw} {an}/{ad} − {bw} {bn}/{bd} = <b>{diff <= 0 ? (diff === 0 ? '0' : 'negative') : `${rw ? rw + ' ' : ''}${rn ? rn / g + '/' + L / g : ''}`}</b></div>
      <div className="wsteps">
        <div className="wst-line"><span className="mono">estimate</span><span>{Math.round(A)} − {Math.round(B)} ≈ {Math.round(A) - Math.round(B)}</span></div>
        <div className="wst-line"><span className="mono">common denom.</span><span>{aw} {An}/{L} − {bw} {Bn}/{L}</span></div>
        {borrow && <div className="wst-line"><span className="mono">borrow 1</span><span>{An}/{L} is smaller than {Bn}/{L}, so rewrite {aw} {An}/{L} as {aw - 1} {An + L}/{L}</span></div>}
        <div className="wst-line"><span className="mono">subtract</span><span>wholes: {borrow ? aw - 1 : aw} − {bw} = {(borrow ? aw - 1 : aw) - bw}; fractions: {borrow ? An + L : An}/{L} − {Bn}/{L} = {(borrow ? An + L : An) - Bn}/{L}</span></div>
      </div>
      <FBar whole={4} num={Math.round(A * ad)} den={ad} label={`${aw} ${an}/${ad}`} />
      <FBar whole={4} num={Math.round(B * bd)} den={bd} label={`${bw} ${bn}/${bd}`} color="var(--ink-3)" />
      <WCtl>
        <WNum label="A whole" v={aw} set={setAw} min={1} max={4} /><WNum label="A top" v={an} set={x => setAn(Math.min(x, ad - 1))} min={1} max={ad - 1} /><WNum label="A bottom" v={ad} set={x => { setAd(x); setAn(Math.min(an, x - 1)); }} min={2} max={8} />
        <WNum label="B whole" v={bw} set={setBw} min={0} max={3} /><WNum label="B top" v={bn} set={x => setBn(Math.min(x, bd - 1))} min={1} max={bd - 1} /><WNum label="B bottom" v={bd} set={x => { setBd(x); setBn(Math.min(bn, x - 1)); }} min={2} max={8} />
      </WCtl>
    </div>
  );
};

/* 10.2 integer ÷ fraction and integer × mixed number */
W.fracdiv = function ({ cfg, onState }) {
  const [mode, setMode] = uSt('÷');
  const [n, setN] = uSt(3), [p, setP] = uSt(1), [q, setQ] = uSt(4), [w, setW] = uSt(2);
  const div = n * q / p, mul = n * (w + p / q);
  useRep(onState, { mode, n, p, q, w, div, mul }, [mode, n, p, q, w]);
  const W_ = 440, pieces = n * q;
  return (
    <div className="wbox">
      {mode === '÷' ? <>
        <div className="wbig">{n} ÷ {p}/{q} = <b>{wxRat(div)}</b></div>
        <svg viewBox={`0 0 ${W_} 60`} className="wsvg">
          {Array.from({ length: pieces }, (_, i) => { const grp = Math.floor(i / p); return <rect key={i} x={i * W_ / pieces} y="8" width={W_ / pieces - 1} height="30" className="w-cell" style={{ fill: `oklch(${grp % 2 ? 0.62 : 0.75} 0.1 250)`, opacity: Math.floor(pieces / p) * p <= i ? 0.35 : 1 }} />; })}
          {Array.from({ length: n + 1 }, (_, i) => <line key={i} x1={i * W_ / n} x2={i * W_ / n} y1="2" y2="44" className="w-ax" />)}
          {Array.from({ length: n }, (_, i) => <text key={i} x={(i + 0.5) * W_ / n} y="57" textAnchor="middle">1</text>)}
        </svg>
        <div className="wnote">How many groups of {p}/{q} fit into {n}? Each whole has {q} quarters-style pieces → {pieces} pieces of 1/{q}, grouped in {p}s → {wxRat(div)} groups. Same as {n} × {q}/{p}.</div>
      </> : <>
        <div className="wbig">{n} × {w} {p}/{q} = <b>{wxRat(mul)}</b></div>
        <div className="wsteps">
          <div className="wst-line"><span className="mono">estimate</span><span>{n} × {Math.round(w + p / q)} ≈ {n * Math.round(w + p / q)}</span></div>
          <div className="wst-line"><span className="mono">split</span><span>{n} × {w} = {n * w}, and {n} × {p}/{q} = {n * p}/{q}</span></div>
          <div className="wst-line"><span className="mono">add</span><span>{n * w} + {wxRat(n * p / q)} = {wxRat(mul)}</span></div>
        </div>
      </>}
      <WCtl>
        <WSeg opts={[['÷', 'Integer ÷ fraction'], ['×', 'Integer × mixed number']]} v={mode} set={setMode} />
        <WNum label="Integer" v={n} set={setN} min={1} max={6} />
        {mode === '×' && <WNum label="Whole part" v={w} set={setW} min={1} max={4} />}
        <WNum label="Fraction top" v={p} set={x => setP(Math.min(x, q - 1))} min={1} max={q - 1} />
        <WNum label="Fraction bottom" v={q} set={x => { setQ(x); setP(Math.min(p, x - 1)); }} min={2} max={8} />
      </WCtl>
    </div>
  );
};

/* 16.1 recurring decimals */
W.longdiv = function ({ cfg, onState }) {
  const [n, setN] = uSt(1), [d, setD] = uSt(3);
  const digits = [], seen = {}; let r = n % d, rep = -1;
  const ip = Math.floor(n / d);
  for (let i = 0; i < 24 && r !== 0; i++) { if (seen[r] != null) { rep = seen[r]; break; } seen[r] = i; r *= 10; digits.push(Math.floor(r / d)); r %= d; }
  const term = r === 0 && rep < 0;
  let dd = d / wxG(n, d); const only25 = (() => { let m = dd; while (m % 2 === 0) m /= 2; while (m % 5 === 0) m /= 5; return m === 1; })();
  useRep(onState, { n, d, term, period: rep >= 0 ? digits.length - rep : 0 }, [n, d]);
  return (
    <div className="wbox">
      <div className="wbig">{n}/{d} = {ip}.{digits.length === 0 ? '0' : digits.map((x, i) => <span key={i} className={rep >= 0 && i >= rep ? 'w-rec' : ''}>{x}</span>)}{rep >= 0 && <span className="wdim">…</span>}</div>
      <div className="wnote">{term ? 'This decimal terminates: it stops.' : `The digits under the bar repeat for ever, a recurring decimal with a ${digits.length - rep}-digit cycle.`}</div>
      <div className="wsteps">
        <div className="wst-line"><span className="mono">simplest form</span><span>{n / wxG(n, d)}/{dd}</span></div>
        <div className="wst-line"><span className="mono">denominator</span><span>{dd} {only25 ? 'has only 2s and 5s as prime factors → terminates' : 'has a prime factor other than 2 or 5 → recurs'}</span></div>
      </div>
      <WCtl><WNum label="Numerator" v={n} set={setN} min={1} max={d - 1 > 0 ? d - 1 : 1} /><WNum label="Denominator" v={d} set={x => { setD(x); if (n >= x) setN(x - 1); }} min={2} max={15} /></WCtl>
    </div>
  );
};

/* 16.2 compare fraction and decimal */
W.compare = function ({ cfg, onState }) {
  const [n, setN] = uSt(3), [d, setD] = uSt(8), [x, setX] = uSt(0.4), [neg, setNeg] = uSt(false);
  const L = (neg ? -1 : 1) * n / d, R = (neg ? -1 : 1) * x;
  const sym = Math.abs(L - R) < 1e-9 ? '=' : L < R ? '<' : '>';
  useRep(onState, { L, R, sym, neg }, [n, d, x, neg]);
  const P = wxPlane(440, 70, neg ? -1 : 0, neg ? 0 : 1, 0, 1, 16);
  return (
    <div className="wbox">
      <div className="wbig" style={{ textAlign: 'center' }}>{neg ? '−' : ''}{n}/{d} <b className="w-sym">{sym}</b> {neg ? '−' : ''}{wxFmt(x, 3)}</div>
      <svg viewBox="0 0 440 70" className="wsvg">
        <line x1={P.X(P.x0)} x2={P.X(P.x1)} y1="35" y2="35" className="w-ax" />
        {Array.from({ length: 11 }, (_, i) => { const v = P.x0 + i / 10; return <g key={i}><line x1={P.X(v)} x2={P.X(v)} y1="30" y2="40" className="w-ax" /><text x={P.X(v)} y="58" textAnchor="middle">{wxFmt(v, 1)}</text></g>; })}
        <circle cx={P.X(L)} cy="35" r="7" className="w-pt" /><text x={P.X(L)} y="18" textAnchor="middle" className="w-lab">{neg ? '−' : ''}{n}/{d}</text>
        <circle cx={P.X(R)} cy="35" r="7" className="w-pt2" /><text x={P.X(R)} y="18" textAnchor="middle" className="w-lab">{wxFmt(R, 3)}</text>
      </svg>
      <div className="wnote">{neg ? '−' : ''}{n}/{d} = {wxFmt(L, 4)} as a decimal.{neg ? ' With negatives, the number further left (more negative) is smaller.' : ''}</div>
      <WCtl><WNum label="Top" v={n} set={x2 => setN(Math.min(x2, d))} min={1} max={d} /><WNum label="Bottom" v={d} set={x2 => { setD(x2); setN(Math.min(n, x2)); }} min={2} max={12} /><WSl label="Decimal" v={x} set={setX} min={0} max={1} step={0.005} fmt={v => wxFmt(v, 3)} /><WSeg opts={[[false, 'Positive'], [true, 'Negative']]} v={neg} set={setNeg} /></WCtl>
    </div>
  );
};

/* 16.3 compare fractions via percentages */
W.pctbar = function ({ cfg, onState }) {
  const [a, setA] = uSt(13), [b, setB] = uSt(20), [c, setC] = uSt(16), [d, setD] = uSt(25);
  const p1 = a / b * 100, p2 = c / d * 100;
  useRep(onState, { p1, p2, a, b, c, d }, [a, b, c, d]);
  const bar = (p, lab, cls) => <div className="wpb"><span className="mono">{lab}</span><div className="wpb-t"><i className={cls} style={{ width: Math.min(100, p) + '%' }} /><span>{wxFmt(p, 1)}%</span></div></div>;
  return (
    <div className="wbox">
      {bar(p1, `${a}/${b}`, '')}{bar(p2, `${c}/${d}`, 'b')}
      <div className="wbig" style={{ textAlign: 'center' }}>{a}/{b} {Math.abs(p1 - p2) < 1e-9 ? '=' : p1 > p2 ? '>' : '<'} {c}/{d}</div>
      <div className="wnote">{a}/{b} = {a} ÷ {b} × 100 = {wxFmt(p1, 1)}%. {c}/{d} = {wxFmt(p2, 1)}%. Percentages are fractions out of 100, so they are easy to compare.</div>
      <WCtl><WNum label="Score A" v={a} set={x => setA(Math.min(x, b))} min={0} max={b} /><WNum label="Out of" v={b} set={x => { setB(x); setA(Math.min(a, x)); }} min={2} max={50} /><WNum label="Score B" v={c} set={x => setC(Math.min(x, d))} min={0} max={d} /><WNum label="Out of" v={d} set={x => { setD(x); setC(Math.min(c, x)); }} min={2} max={50} /></WCtl>
    </div>
  );
};

/* 19.1 percentage change */
W.pctchange = function ({ cfg, onState }) {
  const [o, setO] = uSt(80), [p, setP] = uSt(25), [dir, setDir] = uSt('inc');
  const m = dir === 'inc' ? 1 + p / 100 : 1 - p / 100, nv = wxR(o * m, 2), ch = wxR(nv - o, 2);
  useRep(onState, { o, p, dir, m: wxR(m, 4), nv, ch }, [o, p, dir]);
  const mx = Math.max(o, nv) * 1.05;
  return (
    <div className="wbox">
      <div className="wpb"><span className="mono">Original · 100%</span><div className="wpb-t"><i style={{ width: o / mx * 100 + '%' }} /><span>{wxFmt(o)}</span></div></div>
      <div className="wpb"><span className="mono">New · {dir === 'inc' ? 100 + p : 100 - p}%</span><div className="wpb-t"><i className="b" style={{ width: nv / mx * 100 + '%' }} /><span>{wxFmt(nv)}</span></div></div>
      <WRead items={[['Multiplier', wxFmt(m, 2)], ['New amount', wxFmt(nv)], ['Absolute change', (ch > 0 ? '+' : '') + wxFmt(ch)]]} />
      <div className="wnote">{wxFmt(o)} × {wxFmt(m, 2)} = {wxFmt(nv)}. A {p}% {dir === 'inc' ? 'increase' : 'decrease'} means the new amount is {dir === 'inc' ? 100 + p : 100 - p}% of the original.</div>
      <WCtl><WSeg opts={[['inc', 'Increase'], ['dec', 'Decrease']]} v={dir} set={setDir} /><WSl label="Original amount" v={o} set={setO} min={10} max={200} step={5} /><WSl label="Percentage" v={p} set={setP} min={0} max={100} step={5} fmt={v => v + '%'} /></WCtl>
    </div>
  );
};

/* 22.3 dividing in a ratio */
W.ratiobar = function ({ cfg, onState }) {
  const [t, setT] = uSt(60), [a, setA] = uSt(2), [b, setB] = uSt(3), [c, setC] = uSt(0);
  const parts = [a, b, c].filter(x => x > 0), sum = parts.reduce((x, y) => x + y, 0), one = t / sum;
  useRep(onState, { t, a, b, c, sum, one, shares: parts.map(x => wxR(x * one, 2)) }, [t, a, b, c]);
  const cols = ['var(--acc)', 'color-mix(in oklab, var(--acc) 50%, var(--ink))', 'var(--gold)'];
  let k = 0;
  return (
    <div className="wbox">
      <div className="wbig">Share {t} in the ratio {parts.join(' : ')}</div>
      <div className="wrbar">{parts.map((x, pi) => Array.from({ length: x }, (_, i) => <div key={pi + '-' + i} style={{ background: cols[pi] }}>{wxFmt(one)}</div>))}</div>
      <WRead items={[['Total parts', sum], ['One part', `${t} ÷ ${sum} = ${wxFmt(one)}`], ['Shares', parts.map(x => wxFmt(x * one)).join(' : ')]]} />
      <WCtl><WSl label="Amount" v={t} set={setT} min={10} max={120} step={5} /><WNum label="Part A" v={a} set={setA} min={1} max={6} /><WNum label="Part B" v={b} set={setB} min={1} max={6} /><WNum label="Part C" v={c} set={setC} min={0} max={6} /></WCtl>
    </div>
  );
};

/* 22.2 simplifying ratios */
W.ratiosimp = function ({ cfg, onState }) {
  const rounds = (cfg && cfg.rounds) || [[12, 18, ''], [45, 30, ''], [40, 200, 'cm:m']];
  const [ri, setRi] = uSt(0), [solved, setSolved] = uSt(0);
  const [A0, B0, unit] = rounds[ri];
  const [st, setSt] = uSt({ a: A0, b: B0, conv: !unit }), [bad, setBad] = uSt(null);
  uEf(() => setSt({ a: A0, b: B0, conv: !unit }), [ri]);
  const simple = st.conv && wxG(st.a, st.b) === 1;
  uEf(() => { if (simple && ri + 1 > solved) setSolved(ri + 1); }, [simple]);
  useRep(onState, { solved, total: rounds.length, done: solved === rounds.length }, [solved]);
  const div = k => { if (st.a % k === 0 && st.b % k === 0) setSt({ ...st, a: st.a / k, b: st.b / k }); else { setBad(k); setTimeout(() => setBad(null), 450); } };
  const label = unit && !st.conv ? `${st.a} cm : ${st.b === B0 ? B0 / 100 + ' m' : st.b}` : `${st.a} : ${st.b}`;
  return (
    <div className="wbox">
      <div className="wbig" style={{ textAlign: 'center' }}>{label}</div>
      <div className="wrbar">{Array.from({ length: Math.min(st.a, 24) }, (_, i) => <div key={'a' + i} />)}<span className="wrbar-gap" />{Array.from({ length: Math.min(st.b, 24) }, (_, i) => <div key={'b' + i} className="b" />)}</div>
      {unit && !st.conv ? <button className="btn small" onClick={() => setSt({ ...st, conv: true })}>Convert {B0 / 100} m to {B0} cm first</button>
        : <div><span className="mono">Divide both by</span><div className="chips">{[2, 3, 5, 7, 10].map(k => <button key={k} className={'chip' + (bad === k ? ' shake bad' : '')} disabled={simple} onClick={() => div(k)}>÷ {k}</button>)}</div></div>}
      <div className="wfoot"><span className="mono">{ri + 1} of {rounds.length}{simple ? ' · simplest form ✓' : ''}</span>{simple && ri < rounds.length - 1 && <button className="btn small" onClick={() => setRi(ri + 1)}>Next →</button>}</div>
    </div>
  );
};

/* 22.1 direct proportion: recipe */
W.recipe = function ({ cfg, onState }) {
  const base = (cfg && cfg.base) || 4;
  const ing = (cfg && cfg.ing) || [['Flour', 200, 'g'], ['Milk', 300, 'ml'], ['Eggs', 2, ''], ['Sugar', 50, 'g']];
  const [n, setN] = uSt(base);
  useRep(onState, { n, k: n / base }, [n]);
  return (
    <div className="wbox">
      <div className="wbig">Pancakes for <b>{n}</b> people</div>
      <table className="wtable"><thead><tr><th>Ingredient</th><th>for 1</th><th>for {base}</th><th>for {n}</th></tr></thead>
        <tbody>{ing.map(([nm, q, u]) => <tr key={nm}><td>{nm}</td><td>{wxFmt(q / base)} {u}</td><td>{q} {u}</td><td><b>{wxFmt(q / base * n)} {u}</b></td></tr>)}</tbody></table>
      <div className="wnote">Multiplier = {n} ÷ {base} = {wxFmt(n / base)}. Every amount is multiplied by the same number: that's direct proportion. The ratio flour : milk stays {ing[0][1]} : {ing[1][1]}.</div>
      <WCtl><WSl label="People" v={n} set={setN} min={1} max={12} /></WCtl>
    </div>
  );
};

/* 11.1 miles  km */
W.convert = function ({ cfg, onState }) {
  const [m, setM] = uSt(10);
  const km = m * 8 / 5;
  useRep(onState, { m, km }, [m]);
  const P = wxPlane(460, 110, 0, 100, 0, 1, 20);
  return (
    <div className="wbox">
      <svg viewBox="0 0 460 110" className="wsvg">
        <line x1={P.X(0)} x2={P.X(100)} y1="35" y2="35" className="w-ax" /><line x1={P.X(0)} x2={P.X(100)} y1="75" y2="75" className="w-ax" />
        <text x="8" y="22" className="mono-s">miles</text><text x="8" y="100" className="mono-s">km</text>
        {Array.from({ length: 13 }, (_, i) => i * 5).filter(v => v * 8 / 5 <= 100).map(v => <g key={v}><line x1={P.X(v * 8 / 5)} x2={P.X(v * 8 / 5)} y1="30" y2="40" className="w-ax" /><text x={P.X(v * 8 / 5)} y="26" textAnchor="middle">{v}</text></g>)}
        {Array.from({ length: 11 }, (_, i) => i * 10).map(v => <g key={v}><line x1={P.X(v)} x2={P.X(v)} y1="70" y2="80" className="w-ax" /><text x={P.X(v)} y="95" textAnchor="middle">{v}</text></g>)}
        <line x1={P.X(km)} x2={P.X(km)} y1="35" y2="75" className="w-guide" />
        <circle cx={P.X(km)} cy="35" r="6" className="w-pt" /><circle cx={P.X(km)} cy="75" r="6" className="w-pt2" />
      </svg>
      <WRead items={[['Miles', wxFmt(m, 1)], ['Kilometres', wxFmt(km, 1)], ['Rule', '5 miles ≈ 8 km']]} />
      <WCtl><WSl label="Miles" v={m} set={setM} min={0} max={60} step={2.5} fmt={v => wxFmt(v, 1)} /></WCtl>
    </div>
  );
};
