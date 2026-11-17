/* Stage 8 framework: shared widget helpers + generic widgets */
const uSt = React.useState, uEf = React.useEffect, uRf = React.useRef, uMm = React.useMemo;
window.W = window.W || {};

function useRep(onState, st, deps) { uEf(() => { onState && onState(st); }, deps); }
function wxR(n, d = 2) { const p = Math.pow(10, d); return Math.round(n * p) / p; }
function wxFmt(n, d = 2) { const v = wxR(n, d); return (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-GB', { maximumFractionDigits: d }); }
function wxG(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a; }
function wxLcm(a, b) { return a / wxG(a, b) * b; }
function wxRng(seed) { let s = (seed >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function wxShuffle(a, seed) { const r = a.slice(), rnd = wxRng(seed || 7); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = r[i]; r[i] = r[j]; r[j] = t; } return r; }
function wxRat(v, maxD = 12) {
  if (Math.abs(v - Math.round(v)) < 1e-9) return wxFmt(Math.round(v), 0);
  for (let d = 2; d <= maxD; d++) { const n = v * d; if (Math.abs(n - Math.round(n)) < 1e-9) return (v < 0 ? '−' : '') + Math.abs(Math.round(n)) + '/' + d; }
  return wxFmt(v, 2);
}
function wxLin(a, b, v = 'x') {
  const parts = [];
  if (a !== 0) parts.push(a === 1 ? v : a === -1 ? '−' + v : wxRat(a) + v);
  if (!parts.length) parts.push(wxRat(b));
  else if (b !== 0) parts.push((b < 0 ? ' − ' : ' + ') + wxRat(Math.abs(b)));
  return parts.join('');
}
function wxIsPrime(n) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
function wxPlane(Wd, Ht, x0, x1, y0, y1, pad = 0) {
  const sx = (Wd - 2 * pad) / (x1 - x0), sy = (Ht - 2 * pad) / (y1 - y0);
  return { W: Wd, H: Ht, x0, x1, y0, y1, sx, sy, X: x => pad + (x - x0) * sx, Y: y => Ht - pad - (y - y0) * sy, ix: px => x0 + (px - pad) / sx, iy: py => y0 + (Ht - pad - py) / sy };
}
function WAxes({ P, step = 1, lab = 2, noLabels }) {
  const out = [];
  for (let x = Math.ceil(P.x0); x <= P.x1; x += step) out.push(<line key={'x' + x} x1={P.X(x)} x2={P.X(x)} y1={P.Y(P.y0)} y2={P.Y(P.y1)} className={x === 0 ? 'w-ax' : 'w-gl'} />);
  for (let y = Math.ceil(P.y0); y <= P.y1; y += step) out.push(<line key={'y' + y} y1={P.Y(y)} y2={P.Y(y)} x1={P.X(P.x0)} x2={P.X(P.x1)} className={y === 0 ? 'w-ax' : 'w-gl'} />);
  if (!noLabels) {
    const ly = Math.min(P.H - 3, Math.max(10, P.Y(Math.max(P.y0, Math.min(0, P.y1))) + 12));
    const lx = Math.max(12, Math.min(P.W - 3, P.X(Math.max(P.x0, Math.min(0, P.x1))) - 4));
    for (let x = Math.ceil(P.x0); x <= P.x1; x++) if (x !== 0 && x % lab === 0) out.push(<text key={'tx' + x} x={P.X(x)} y={ly} textAnchor="middle">{x}</text>);
    for (let y = Math.ceil(P.y0); y <= P.y1; y++) if (y !== 0 && y % lab === 0) out.push(<text key={'ty' + y} x={lx} y={P.Y(y) + 3} textAnchor="end">{y}</text>);
  }
  return <g>{out}</g>;
}
function useDrag(ref, onMove) {
  const d = uRf(null);
  const pt = e => { const s = ref.current, r = s.getBoundingClientRect(), vb = s.viewBox.baseVal; return [(e.clientX - r.left) / r.width * vb.width, (e.clientY - r.top) / r.height * vb.height]; };
  const start = id => e => { e.preventDefault(); e.stopPropagation(); d.current = id; try { ref.current.setPointerCapture(e.pointerId); } catch (_) {} };
  const bind = { onPointerMove: e => { if (d.current != null) onMove(d.current, pt(e)); }, onPointerUp: () => { d.current = null; }, onPointerCancel: () => { d.current = null; } };
  return [start, bind, pt];
}
function wxArc(cx, cy, r, a0, a1) {
  const p = a => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0},${y0} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 0 : 1} ${x1},${y1}`;
}
function wxWedge(cx, cy, r, a0, a1) { return wxArc(cx, cy, r, a0, a1).replace(/^M/, `M${cx},${cy} L`) + ' Z'; }

function WSl({ label, v, set, min, max, step = 1, fmt }) {
  return (
    <label className="wsl">
      <span className="wsl-top"><span className="mono">{label}</span><b>{fmt ? fmt(v) : v}</b></span>
      <input type="range" min={min} max={max} step={step} value={v} onChange={e => set(+e.target.value)} />
    </label>
  );
}
function WSeg({ opts, v, set, label }) {
  return (
    <div className="wseg">
      {label && <span className="mono">{label}</span>}
      <div className="chips">{opts.map(o => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return <button key={String(val)} className={'chip' + (v === val ? ' on' : '')} onClick={() => set(val)}>{lab}</button>; })}</div>
    </div>
  );
}
function WRead({ items }) { return <div className="wread">{items.map(([l, v], i) => <div key={i}><div className="v">{v}</div><div className="l">{l}</div></div>)}</div>; }
function WCtl({ children }) { return <div className="wctl">{children}</div>; }
function WNum({ label, v, set, min, max, step = 1, fmt }) {
  return (
    <div className="wnum"><span className="mono">{label}</span>
      <div className="wnum-c">
        <button onClick={() => set(Math.max(min, wxR(v - step, 4)))} disabled={v <= min}>−</button>
        <b>{fmt ? fmt(v) : v}</b>
        <button onClick={() => set(Math.min(max, wxR(v + step, 4)))} disabled={v >= max}>+</button>
      </div>
    </div>
  );
}

/* ---------- Generic: sort into groups ---------- */
W.sort = function WSort({ cfg, onState }) {
  const items = uMm(() => wxShuffle(cfg.items.map((it, i) => ({ t: it[0], b: it[1], i })), cfg.items.length * 3 + 1), []);
  const [placed, setPlaced] = uSt({});
  const [sel, setSel] = uSt(items[0].i);
  const [bad, setBad] = uSt(null);
  const [miss, setMiss] = uSt(0);
  const n = Object.keys(placed).length, total = items.length;
  useRep(onState, { placed: n, total, done: n === total, miss }, [n, miss]);
  const drop = b => {
    if (sel == null) return;
    const it = items.find(x => x.i === sel);
    if (it.b === b) { const np = { ...placed, [sel]: b }; setPlaced(np); const nx = items.find(x => np[x.i] == null); setSel(nx ? nx.i : null); }
    else { setBad(b); setMiss(m => m + 1); setTimeout(() => setBad(null), 450); }
  };
  return (
    <div className="wbox">
      <div className="wsort-pool">
        {items.filter(it => placed[it.i] == null).map(it => <button key={it.i} className={'wtile' + (sel === it.i ? ' sel' : '')} onClick={() => setSel(it.i)}>{it.t}</button>)}
        {n === total && <span className="wnote">All sorted ✓</span>}
      </div>
      <div className="wnote">{sel != null ? 'Tap the group the highlighted card belongs in.' : ''}</div>
      <div className="wbins" style={{ gridTemplateColumns: `repeat(${Math.min(cfg.bins.length, 3)}, 1fr)` }}>
        {cfg.bins.map((b, bi) => (
          <button key={bi} className={'wbin' + (sel != null ? ' hot' : '') + (bad === bi ? ' shake' : '')} onClick={() => drop(bi)}>
            <span className="wbin-h">{b}</span>
            {items.filter(it => placed[it.i] === bi).map(it => <span key={it.i} className="wbin-it">{it.t}</span>)}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ---------- Generic: match pairs ---------- */
W.match = function WMatch({ cfg, onState }) {
  const right = uMm(() => wxShuffle(cfg.pairs.map((p, i) => ({ t: p[1], i })), cfg.pairs.length + 5), []);
  const [sel, setSel] = uSt(null), [done, setDone] = uSt([]), [bad, setBad] = uSt(null);
  useRep(onState, { matched: done.length, total: cfg.pairs.length, done: done.length === cfg.pairs.length }, [done.length]);
  const pick = i => { if (sel == null || done.includes(i)) return; if (sel === i) { setDone([...done, i]); setSel(null); } else { setBad(i); setTimeout(() => setBad(null), 450); } };
  const hue = i => ({ background: `oklch(0.93 0.045 ${(i * 53 + 20) % 360})`, borderColor: `oklch(0.6 0.1 ${(i * 53 + 20) % 360})` });
  return (
    <div className="wbox">
      {cfg.h && <div className="wmatch"><span className="mono">{cfg.h[0]}</span><span className="mono">{cfg.h[1]}</span></div>}
      <div className="wmatch">
        <div className="wm-col">{cfg.pairs.map((p, i) => <button key={i} className={'wm-it' + (sel === i ? ' sel' : '')} style={done.includes(i) ? hue(i) : null} disabled={done.includes(i)} onClick={() => setSel(i)}>{p[0]}</button>)}</div>
        <div className="wm-col">{right.map(r => <button key={r.i} className={'wm-it' + (bad === r.i ? ' shake' : '')} style={done.includes(r.i) ? hue(r.i) : null} disabled={done.includes(r.i)} onClick={() => pick(r.i)}>{r.t}</button>)}</div>
      </div>
      <div className="wnote">{done.length === cfg.pairs.length ? 'All matched ✓' : sel == null ? 'Tap a card on the left, then its partner on the right.' : 'Now tap its partner on the right.'}</div>
    </div>
  );
};

/* ---------- Generic: fill blanks with tiles ---------- */
W.slots = function WSlots({ cfg, onState }) {
  const [ri, setRi] = uSt(0), [solved, setSolved] = uSt(0);
  const R = cfg.rounds[ri];
  const parts = R.t.split('{}'), nb = parts.length - 1;
  const tiles = uMm(() => wxShuffle([...R.a, ...(R.x || [])], ri + 11), [ri]);
  const [fill, setFill] = uSt(() => Array(nb).fill(null));
  const [chk, setChk] = uSt(null);
  uEf(() => { setFill(Array(nb).fill(null)); setChk(null); }, [ri]);
  useRep(onState, { solved, total: cfg.rounds.length, done: solved === cfg.rounds.length }, [solved]);
  const used = fill.filter(x => x != null);
  const put = ti => { const k = fill.indexOf(null); if (k < 0) return; const f = fill.slice(); f[k] = ti; setFill(f); setChk(null); };
  const clear = k => { if (chk === 'ok') return; const f = fill.slice(); f[k] = null; setFill(f); setChk(null); };
  const check = () => { const ok = fill.every((ti, k) => ti != null && tiles[ti] === R.a[k]); setChk(ok ? 'ok' : 'bad'); if (ok && ri + 1 > solved) setSolved(ri + 1); };
  return (
    <div className="wbox">
      {R.p && <div className="wprompt">{R.p}</div>}
      <div className="wslot-s">{parts.map((p, k) => (
        <React.Fragment key={k}>{p}{k < nb && <button className={'wblank' + (fill[k] != null ? ' full' : '') + (chk === 'bad' && fill[k] != null && tiles[fill[k]] !== R.a[k] ? ' bad' : '') + (chk === 'ok' ? ' good' : '')} onClick={() => fill[k] != null && clear(k)}>{fill[k] != null ? tiles[fill[k]] : '\u00a0'}</button>}</React.Fragment>
      ))}</div>
      <div className="wsort-pool">{tiles.map((t, ti) => <button key={ti} className="wtile" disabled={used.includes(ti) || chk === 'ok'} onClick={() => put(ti)}>{t}</button>)}</div>
      <div className="wfoot">
        <span className="mono">{ri + 1} of {cfg.rounds.length}{chk === 'bad' ? ' · not quite: tap a red tile to remove it' : chk === 'ok' ? ' · correct ✓' : ''}</span>
        {chk === 'ok' ? (ri < cfg.rounds.length - 1 ? <button className="btn small" onClick={() => setRi(ri + 1)}>Next →</button> : <span className="wnote">All done ✓</span>)
          : <button className="btn small" disabled={fill.includes(null)} onClick={check}>Check</button>}
      </div>
    </div>
  );
};

/* ---------- Generic: put in order ---------- */
W.order = function WOrder({ cfg, onState }) {
  const [ri, setRi] = uSt(0), [solved, setSolved] = uSt(0);
  const R = cfg.rounds[ri];
  const mk = r => { let o = wxShuffle(cfg.rounds[r].items.map((_, i) => i), r + 3); if (o.every((v, i) => v === i)) o = o.reverse(); return o; };
  const [ord, setOrd] = uSt(() => mk(0));
  const [chk, setChk] = uSt(null);
  uEf(() => { setOrd(mk(ri)); setChk(null); }, [ri]);
  useRep(onState, { solved, total: cfg.rounds.length, done: solved === cfg.rounds.length }, [solved]);
  const mv = (i, d) => { const o = ord.slice(); const t = o[i]; o[i] = o[i + d]; o[i + d] = t; setOrd(o); setChk(null); };
  const check = () => { const ok = ord.every((v, i) => v === i); setChk(ok ? 'ok' : 'bad'); if (ok && ri + 1 > solved) setSolved(ri + 1); };
  return (
    <div className="wbox">
      {R.p && <div className="wprompt">{R.p}</div>}
      <ol className={'order-list' + (chk === 'ok' ? ' right' : chk === 'bad' ? ' wrong' : '')} style={{ margin: 0 }}>
        {ord.map((idx, i) => (
          <li key={idx} className="order-item" style={{ fontSize: 17, fontFamily: 'var(--sans)' }}>
            <span className="pos">{i + 1}</span>{R.items[idx]}
            {chk !== 'ok' && <span className="mv"><button onClick={() => mv(i, -1)} disabled={i === 0}>↑</button><button onClick={() => mv(i, 1)} disabled={i === ord.length - 1}>↓</button></span>}
          </li>
        ))}
      </ol>
      <div className="wfoot">
        <span className="mono">{cfg.rounds.length > 1 ? `${ri + 1} of ${cfg.rounds.length}` : ''}{chk === 'bad' ? ' · not quite yet' : chk === 'ok' ? ' · correct ✓' : ''}</span>
        {chk === 'ok' ? (ri < cfg.rounds.length - 1 ? <button className="btn small" onClick={() => setRi(ri + 1)}>Next →</button> : null) : <button className="btn small" onClick={check}>Check order</button>}
      </div>
    </div>
  );
};

/* ---------- Generic: choose each next step ---------- */
W.steps = function WSteps({ cfg, onState }) {
  const [ri, setRi] = uSt(0), [k, setK] = uSt(0), [solved, setSolved] = uSt(0), [bad, setBad] = uSt(null);
  const R = cfg.rounds[ri]; const fin = k >= R.steps.length;
  const opts = uMm(() => wxShuffle(R.opts, ri + 5), [ri]);
  useRep(onState, { solved, total: cfg.rounds.length, done: solved === cfg.rounds.length }, [solved]);
  const pick = o => {
    if (fin) return;
    if (o === R.steps[k][0]) { const nk = k + 1; setK(nk); if (nk >= R.steps.length && ri + 1 > solved) setSolved(ri + 1); }
    else { setBad(o); setTimeout(() => setBad(null), 500); }
  };
  return (
    <div className="wbox">
      {R.p && <div className="wprompt">{R.p}</div>}
      <div className="wsteps">
        <div className="wst-line"><span className="mono">start</span><span>{R.start}</span></div>
        {R.steps.slice(0, k).map((s, i) => <div key={i} className="wst-line"><span className="mono">{s[0]}</span><span>{s[1]}</span></div>)}
      </div>
      {!fin ? (
        <div><span className="mono">{R.ask || 'What should you do next (to both sides)?'}</span>
          <div className="chips">{opts.map(o => <button key={o} className={'chip' + (bad === o ? ' shake bad' : '')} onClick={() => pick(o)}>{o}</button>)}</div></div>
      ) : (
        <div className="wfoot"><span className="wnote" style={{ color: 'var(--ok)' }}>Done ✓ {R.done || ''}</span>
          {ri < cfg.rounds.length - 1 && <button className="btn small" onClick={() => { setRi(ri + 1); setK(0); }}>Next →</button>}</div>
      )}
    </div>
  );
};

Object.assign(window, { useRep, wxR, wxFmt, wxG, wxLcm, wxRng, wxShuffle, wxRat, wxLin, wxIsPrime, wxPlane, WAxes, useDrag, wxArc, wxWedge, WSl, WSeg, WRead, WCtl, WNum });
