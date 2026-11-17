/* Interactive "Play" pieces. Each reports state via onState(obj). */
const { useState, useEffect, useRef, useCallback } = React;

function gcd(a, b) { return b ? gcd(b, a % b) : a; }
function Frac({ a, b }) {
  return <span className="frac"><span className="a">{a}</span><span className="b">{b}</span></span>;
}

/* ---------------- Hundred grid ---------------- */
function HundredGrid({ onState, readonly, preset, compact }) {
  const [cells, setCells] = useState(() => {
    const arr = Array(100).fill(false);
    if (preset) for (let i = 0; i < preset; i++) arr[i] = true;
    return arr;
  });
  const paint = useRef(null);
  const ref = useRef(null);
  const count = cells.filter(Boolean).length;

  useEffect(() => { onState && onState({ count }); }, [count]);

  const setCell = (i, val) => setCells(c => { if (c[i] === val) return c; const n = c.slice(); n[i] = val; return n; });
  const idxFromEvent = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || !el.dataset || el.dataset.i == null || !ref.current.contains(el)) return null;
    return +el.dataset.i;
  };
  const down = (e) => {
    const i = idxFromEvent(e); if (i == null) return;
    paint.current = !cells[i]; setCell(i, paint.current);
    ref.current.setPointerCapture(e.pointerId);
  };
  const move = (e) => { if (paint.current == null) return; const i = idxFromEvent(e); if (i != null) setCell(i, paint.current); };
  const up = () => { paint.current = null; };

  const fill = (n) => setCells(Array(100).fill(false).map((_, i) => i < n));

  const g = gcd(count, 100) || 1;
  return (
    <div>
      <div ref={ref} className={'hgrid' + (readonly ? ' readonly' : '')}
        onPointerDown={readonly ? undefined : down} onPointerMove={readonly ? undefined : move}
        onPointerUp={up} onPointerCancel={up}>
        {cells.map((on, i) => <div key={i} data-i={i} className={'c' + (on ? ' on' : '')} />)}
      </div>
      {!compact && (
        <>
          <div className="readout">
            <div><div className="v">{count === 0 ? '0' : <Frac a={count / g} b={100 / g} />}</div><div className="l">Fraction</div></div>
            <div><div className="v">{(count / 100).toFixed(2).replace(/^0\./, '0.')}</div><div className="l">Decimal</div></div>
            <div><div className="v">{count}%</div><div className="l">Percentage</div></div>
          </div>
          {!readonly && (
            <div className="row" style={{ marginTop: 16, justifyContent: 'space-between' }}>
              <span className="hint">Tap or drag across squares to shade them.</span>
              <button className="btn ghost small" onClick={() => fill(0)}>Clear grid</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- Particle box ---------------- */
function stateOf(t) { return t < 0 ? 'solid' : t < 100 ? 'liquid' : 'gas'; }
const STATE_INFO = {
  solid: { name: 'Solid · ice', arr: 'Packed tightly in a regular pattern', mov: 'Vibrate on the spot' },
  liquid: { name: 'Liquid · water', arr: 'Close together, no regular pattern', mov: 'Slide past each other' },
  gas: { name: 'Gas · water vapour', arr: 'Far apart, spread through the box', mov: 'Move fast in every direction' },
};

function ParticleBox({ onState, fixedTemp, small }) {
  const [temp, setTemp] = useState(fixedTemp != null ? fixedTemp : -15);
  const canvasRef = useRef(null);
  const tempRef = useRef(temp);
  tempRef.current = temp;
  const st = stateOf(temp);

  useEffect(() => { onState && onState({ temp, state: st }); }, [st, temp]);

  useEffect(() => {
    const cv = canvasRef.current; const ctx = cv.getContext('2d');
    const W = 480, H = small ? 400 : 340; cv.width = W * 2; cv.height = H * 2; ctx.scale(2, 2);
    const cols = 8, rows = 6, r = small ? 13 : 11, gap = r * 2 + 2;
    const ox = (W - (cols - 1) * gap) / 2, oy = H - 14 - r - (rows - 1) * gap;
    const ps = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const hx = ox + x * gap + (y % 2 ? 0 : 0), hy = oy + y * gap;
      ps.push({ hx, hy, x: hx, y: hy, vx: 0, vy: 0 });
    }
    const acc = getComputedStyle(cv).getPropertyValue('--acc').trim() || '#3a7';
    let raf; let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(32, now - last) / 16; last = now;
      const T = tempRef.current; const s = stateOf(T);
      ctx.clearRect(0, 0, W, H);
      const speed = s === 'liquid' ? 0.6 + T / 80 : 2.4 + (T - 100) / 25;
      const top = s === 'liquid' ? H * 0.40 : r + 4;
      for (const p of ps) {
        if (s === 'solid') {
          const amp = 0.6 + (T + 30) / 30 * 1.6;
          p.x += ((p.hx + (Math.random() - .5) * amp * 2) - p.x) * 0.35 * dt;
          p.y += ((p.hy + (Math.random() - .5) * amp * 2) - p.y) * 0.35 * dt;
          p.vx = (Math.random() - .5); p.vy = (Math.random() - .5);
        } else {
          p.vx += (Math.random() - .5) * 0.5 * dt; p.vy += (Math.random() - .5) * 0.5 * dt;
          if (s === 'liquid') p.vy += 0.06 * dt;
          const sp = Math.hypot(p.vx, p.vy) || 1;
          p.vx = p.vx / sp * speed; p.vy = p.vy / sp * speed;
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < r + 4) { p.x = r + 4; p.vx = Math.abs(p.vx); }
          if (p.x > W - r - 4) { p.x = W - r - 4; p.vx = -Math.abs(p.vx); }
          if (p.y > H - r - 4) { p.y = H - r - 4; p.vy = -Math.abs(p.vy); }
          if (p.y < top) { p.y += (top - p.y) * (s === 'liquid' ? 0.15 : 1); p.vy = Math.abs(p.vy); }
        }
      }
      if (s !== 'solid') {
        for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
          const a = ps[i], b = ps[j]; const dx = b.x - a.x, dy = b.y - a.y; const d = Math.hypot(dx, dy);
          const min = r * 2 + 1;
          if (d < min && d > 0.01) { const push = (min - d) / 2; const ux = dx / d, uy = dy / d; a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push; }
        }
      }
      // container
      ctx.strokeStyle = '#c9c0ad'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(2, 2); ctx.lineTo(2, H - 2); ctx.lineTo(W - 2, H - 2); ctx.lineTo(W - 2, 2); ctx.stroke();
      for (const p of ps) {
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = acc; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x - r * .35, p.y - r * .35, r * .28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [small]);

  const info = STATE_INFO[st];
  return (
    <div className="pbox">
      <canvas ref={canvasRef} />
      {fixedTemp == null && (
        <>
          <div className="thermo">
            <input type="range" min={-30} max={140} value={temp} onChange={e => setTemp(+e.target.value)} aria-label="Temperature" />
            <div className="thermo-scale"><span>−30 °C</span><span>0 °C</span><span>50 °C</span><span>100 °C</span><span>140 °C</span></div>
          </div>
          <dl className="state-read">
            <dt>State</dt><dd><span className="state-name">{info.name}</span> <span className="temp-big">· {temp} °C</span></dd>
            <dt>Arrangement</dt><dd>{info.arr}</dd>
            <dt>Movement</dt><dd>{info.mov}</dd>
          </dl>
        </>
      )}
    </div>
  );
}

/* ---------------- Word tagger ---------------- */
const POS = {
  noun: { label: 'Noun', c: 'oklch(0.52 0.11 250)' },
  verb: { label: 'Verb', c: 'oklch(0.55 0.13 28)' },
  adj: { label: 'Adjective', c: 'oklch(0.52 0.11 152)' },
  adv: { label: 'Adverb', c: 'oklch(0.55 0.12 310)' },
};
const TAG_SENTENCES = [
  [['The'], ['tired', 'adj'], ['fox', 'noun'], ['slept', 'verb'], ['quietly', 'adv'], ['under'], ['the'], ['old', 'adj'], ['bridge', 'noun'], ['.', 'p']],
  [['Maya', 'noun'], ['bravely', 'adv'], ['opened'.trim(), 'verb'], ['the'], ['heavy', 'adj'], ['door', 'noun'], ['.', 'p']],
  [['Bright', 'adj'], ['stars', 'noun'], ['shimmered', 'verb'], ['silently', 'adv'], ['above'], ['the'], ['sleeping', 'adj'], ['village', 'noun'], ['.', 'p']],
];

function WordTagger({ onState, demo }) {
  const [si, setSi] = useState(demo ? 0 : 0);
  const [pen, setPen] = useState('noun');
  const [tags, setTags] = useState(() => demo ? TAG_SENTENCES[0].map(w => w[1] && w[1] !== 'p' ? w[1] : null) : {});
  const [checked, setChecked] = useState(null); // null | 'ok' | 'bad'
  const [solved, setSolved] = useState(0);
  const sent = TAG_SENTENCES[si];

  useEffect(() => { onState && onState({ solved }); }, [solved]);

  const tap = (i) => {
    if (demo) return;
    setChecked(null);
    setTags(t => ({ ...t, [i]: t[i] === pen ? null : pen }));
  };
  const check = () => {
    const ok = sent.every((w, i) => w[1] === 'p' || (w[1] || null) === (tags[i] || null));
    setChecked(ok ? 'ok' : 'bad');
    if (ok && si + 1 > solved) setSolved(si + 1);
  };
  const next = () => { setSi(si + 1); setTags({}); setChecked(null); };

  return (
    <div>
      {!demo && (
        <div className="pens">
          {Object.entries(POS).map(([k, v]) => (
            <button key={k} className={'pen' + (pen === k ? ' on' : '')} style={{ '--pc': v.c }} onClick={() => setPen(k)}><i />{v.label}</button>
          ))}
        </div>
      )}
      <div className="sentence">
        {sent.map((w, i) => {
          if (w[1] === 'p') return <span key={i} className="word punct">{w[0]}</span>;
          const t = tags[i];
          const wrong = checked === 'bad' && t && t !== w[1];
          const missed = checked === 'bad' && !t && w[1];
          return (
            <button key={i} className={'word' + (t ? ' tagged' : '') + (wrong ? ' wrongw' : '') + (missed ? ' missed' : '')}
              style={t ? { '--wc': POS[t].c } : null} onClick={() => tap(i)}>
              {w[0]}{t && <span className="lab">{POS[t].label}</span>}
            </button>
          );
        })}
      </div>
      {!demo && (
        <div className="sent-nav">
          <span className="hint">
            {checked === 'ok' ? <b style={{ color: 'var(--ok)' }}>All correct.</b>
              : checked === 'bad' ? <span style={{ color: 'var(--bad)' }}>Not quite: red words have the wrong tag, dashed words need one.</span>
                : <>Sentence {si + 1} of {TAG_SENTENCES.length}. Leave small words like <i>the</i> and <i>under</i> blank.</>}
          </span>
          {checked === 'ok' && si < TAG_SENTENCES.length - 1
            ? <button className="btn small" onClick={next}>Next sentence →</button>
            : <button className="btn small" onClick={check} disabled={checked === 'ok'}>Check tags</button>}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { HundredGrid, ParticleBox, WordTagger, Frac, POS });
