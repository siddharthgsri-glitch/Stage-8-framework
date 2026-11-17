/* Stage 8 interactives: linear graph, moments beam, sentence builder */

function Stepper({ label, value, onChange, min, max, step = 1, fmt }) {
  const dec = () => onChange(Math.max(min, +(value - step).toFixed(2)));
  const inc = () => onChange(Math.min(max, +(value + step).toFixed(2)));
  return (
    <div className="stepper">
      <span className="mono">{label}</span>
      <div className="stepper-ctl">
        <button onClick={dec} disabled={value <= min} aria-label={'Decrease ' + label}>−</button>
        <span className="stepper-v">{fmt ? fmt(value) : value}</span>
        <button onClick={inc} disabled={value >= max} aria-label={'Increase ' + label}>+</button>
      </div>
    </div>
  );
}

function fracStr(v) {
  if (Number.isInteger(v)) return String(v);
  const h = Math.round(v * 2);
  if (Math.abs(h - v * 2) < 1e-6) return (h < 0 ? '−' : '') + Math.abs(h) + '/2';
  return String(v);
}
function signed(v) { return v < 0 ? '− ' + fracStr(-v) : '+ ' + fracStr(v); }

/* ---------------- Linear graph y = mx + c ---------------- */
function LinearGraph({ onState, target, compact, fixed }) {
  const [m, setM] = React.useState(fixed ? fixed.m : 1);
  const [c, setC] = React.useState(fixed ? fixed.c : 0);
  React.useEffect(() => { onState && onState({ m, c }); }, [m, c]);
  const R = 6, S = 300, u = S / (2 * R);
  const X = x => S / 2 + x * u, Y = y => S / 2 - y * u;
  const line = (mm, cc) => {
    const x1 = -R, x2 = R;
    return { x1: X(x1), y1: Y(mm * x1 + cc), x2: X(x2), y2: Y(mm * x2 + cc) };
  };
  const L = line(m, c);
  const grid = [];
  for (let i = -R; i <= R; i++) {
    grid.push(<line key={'v' + i} x1={X(i)} y1={0} x2={X(i)} y2={S} className={i === 0 ? 'ax' : 'gl'} />);
    grid.push(<line key={'h' + i} x1={0} y1={Y(i)} x2={S} y2={Y(i)} className={i === 0 ? 'ax' : 'gl'} />);
  }
  const tri = m !== 0 && Math.abs(c + m) <= R - 0.5;
  return (
    <div className="lgraph">
      <svg viewBox={`0 0 ${S} ${S}`} className="lg-svg">
        <defs><clipPath id="lgclip"><rect x="0" y="0" width={S} height={S} /></clipPath></defs>
        {grid}
        {[-4, -2, 2, 4].map(i => <text key={'tx' + i} x={X(i)} y={Y(0) + 13} className="tick">{i}</text>)}
        {[-4, -2, 2, 4].map(i => <text key={'ty' + i} x={X(0) - 6} y={Y(i) + 4} className="tick" textAnchor="end">{i}</text>)}
        <g clipPath="url(#lgclip)">
          {target && <line {...line(target.m, target.c)} className="tgt" />}
          <line {...L} className="ln" />
          {tri && !compact && (
            <g className="tri">
              <line x1={X(0)} y1={Y(c)} x2={X(1)} y2={Y(c)} />
              <line x1={X(1)} y1={Y(c)} x2={X(1)} y2={Y(c + m)} />
              <text x={X(0.5)} y={Y(c) + (m > 0 ? 14 : -6)} textAnchor="middle">1</text>
              <text x={X(1) + 6} y={Y(c + m / 2) + 4}>{fracStr(m)}</text>
            </g>
          )}
          <circle cx={X(0)} cy={Y(c)} r="5" className="yint" />
        </g>
      </svg>
      {!compact && (
        <>
          <div className="lg-eq">y = {m === 0 ? '' : (m === 1 ? '' : m === -1 ? '−' : fracStr(m).replace('-', '−'))}{m === 0 ? '' : 'x '}{m === 0 ? fracStr(c).replace('-', '−') : c === 0 ? '' : signed(c)}</div>
          {!fixed && (
            <div className="stepper-row">
              <Stepper label="Gradient m" value={m} onChange={setM} min={-3} max={3} step={0.5} fmt={v => fracStr(v).replace('-', '−')} />
              <Stepper label="Intercept c" value={c} onChange={setC} min={-5} max={5} fmt={v => fracStr(v).replace('-', '−')} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- Moments beam ---------------- */
function MomentsBeam({ onState, fixed, compact }) {
  const [L, setL] = React.useState(fixed ? fixed.L : { F: 30, d: 2 });
  const [Rt, setR] = React.useState(fixed ? fixed.R : { F: 20, d: 2 });
  const mL = L.F * L.d, mR = Rt.F * Rt.d;
  React.useEffect(() => { onState && onState({ L, R: Rt, mL, mR }); }, [L.F, L.d, Rt.F, Rt.d]);
  const diff = mR - mL;
  const ang = Math.max(-14, Math.min(14, diff / 6));
  const W = 440, H = 220, cx = W / 2, by = 120, unit = 38;
  const block = (F, side, d) => {
    const h = 18 + F * 0.9, w = 34;
    const x = cx + side * d * unit;
    return (
      <g key={side}>
        <rect x={x - w / 2} y={by - 7 - h} width={w} height={h} rx="3" className={side < 0 ? 'blkL' : 'blkR'} />
        <text x={x} y={by - 7 - h / 2 + 5} textAnchor="middle" className="blk-t">{F}N</text>
      </g>
    );
  };
  return (
    <div className="beam">
      <svg viewBox={`0 0 ${W} ${H}`}>
        <line x1="10" y1={H - 18} x2={W - 10} y2={H - 18} className="floor" />
        <polygon points={`${cx},${by + 4} ${cx - 26},${H - 18} ${cx + 26},${H - 18}`} className="pivot" />
        <g style={{ transform: `rotate(${ang}deg)`, transformOrigin: `${cx}px ${by}px`, transition: 'transform .5s cubic-bezier(.3,1.4,.5,1)' }}>
          <rect x={cx - 5.4 * unit} y={by - 7} width={10.8 * unit} height="12" rx="2" className="plank" />
          {[1, 2, 3, 4, 5].map(i => <g key={i}>
            <line x1={cx - i * unit} y1={by - 7} x2={cx - i * unit} y2={by + 5} className="mk" />
            <line x1={cx + i * unit} y1={by - 7} x2={cx + i * unit} y2={by + 5} className="mk" />
            <text x={cx - i * unit} y={by + 20} textAnchor="middle" className="tick">{i}</text>
            <text x={cx + i * unit} y={by + 20} textAnchor="middle" className="tick">{i}</text>
          </g>)}
          {block(L.F, -1, L.d)}
          {block(Rt.F, 1, Rt.d)}
        </g>
      </svg>
      {!compact && (
        <>
          <div className="beam-read">
            <div><span className="mono">Anticlockwise moment</span><div className="v">{L.F} × {L.d} = <b>{mL}</b> Nm</div></div>
            <div className="mid">{diff === 0 ? 'Balanced' : diff > 0 ? 'Tips clockwise ↻' : 'Tips anticlockwise ↺'}</div>
            <div style={{ textAlign: 'right' }}><span className="mono">Clockwise moment</span><div className="v">{Rt.F} × {Rt.d} = <b>{mR}</b> Nm</div></div>
          </div>
          {!fixed && (
            <div className="stepper-row four">
              <Stepper label="Left weight" value={L.F} onChange={F => setL({ ...L, F })} min={10} max={60} step={10} fmt={v => v + ' N'} />
              <Stepper label="Left distance" value={L.d} onChange={d => setL({ ...L, d })} min={1} max={5} fmt={v => v + ' m'} />
              <Stepper label="Right weight" value={Rt.F} onChange={F => setR({ ...Rt, F })} min={10} max={60} step={10} fmt={v => v + ' N'} />
              <Stepper label="Right distance" value={Rt.d} onChange={d => setR({ ...Rt, d })} min={1} max={5} fmt={v => v + ' m'} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- Sentence builder ---------------- */
const SB = {
  main1: 'the town lost power',
  coords: ['and', 'but', 'so'],
  main2: { and: 'the roads flooded', but: 'the hospital stayed open', so: 'the hospital used its generators' },
  subs: ['when', 'after', 'because'],
  sub: { when: 'the storm hit the coast', after: 'the storm hit the coast', because: 'the storm hit the coast' },
};
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function SentenceBuilder({ onState, fixed }) {
  const [co, setCo] = React.useState(fixed ? fixed.co : null);
  const [su, setSu] = React.useState(fixed ? fixed.su : null);
  const [front, setFront] = React.useState(fixed ? fixed.front : false);
  const type = co && su ? 'Compound-complex' : co ? 'Compound' : su ? 'Complex' : 'Simple';
  React.useEffect(() => { onState && onState({ type, front: !!(su && front) }); }, [type, front, su]);

  const parts = [];
  const subPart = su && [<b key="sc" className="conn">{su}</b>, ' ', <span key="s" className="cl sub">{SB.sub[su]}</span>];
  if (su && front) { parts.push(<b key="sc" className="conn">{cap(su)}</b>, ' ', <span key="s" className="cl sub">{SB.sub[su]}</span>, ', '); }
  parts.push(<span key="m1" className="cl main">{su && front ? SB.main1 : cap(SB.main1)}</span>);
  if (su && !front) parts.push(' ', ...subPart);
  if (co) parts.push(<span key="cm">{', '}</span>, <b key="cc" className="conn">{co}</b>, ' ', <span key="m2" className="cl main">{SB.main2[co]}</span>);
  parts.push('.');

  const Chip = ({ on, children, onClick }) => <button className={'chip' + (on ? ' on' : '')} onClick={onClick}>{children}</button>;
  return (
    <div className="sbuild">
      <div className="sb-type"><span className="mono">Sentence type</span><span className="sb-type-v">{type}</span></div>
      <p className="sb-sentence">{parts}</p>
      <div className="sb-legend"><span><i className="main" />Main clause</span><span><i className="sub" />Subordinate clause</span><span><b className="conn">bold</b> = connective</span></div>
      {!fixed && (
        <div className="sb-ctl">
          <div><span className="mono">Add a main clause with…</span>
            <div className="chips"><Chip on={!co} onClick={() => setCo(null)}>nothing</Chip>{SB.coords.map(x => <Chip key={x} on={co === x} onClick={() => setCo(x)}>{x}</Chip>)}</div></div>
          <div><span className="mono">Add a subordinate clause with…</span>
            <div className="chips"><Chip on={!su} onClick={() => setSu(null)}>nothing</Chip>{SB.subs.map(x => <Chip key={x} on={su === x} onClick={() => setSu(x)}>{x}</Chip>)}</div></div>
          <div><span className="mono">Put the subordinate clause</span>
            <div className="chips"><Chip on={!front} onClick={() => setFront(false)}>after</Chip><Chip on={front} onClick={() => { setFront(true); if (!su) setSu('when'); }}>at the front</Chip></div></div>
        </div>
      )}
    </div>
  );
}

window.INTERACTIVE_KINDS = Object.assign(window.INTERACTIVE_KINDS || {}, { linear: LinearGraph, moments: MomentsBeam, sentences: SentenceBuilder });
Object.assign(window, { LinearGraph, MomentsBeam, SentenceBuilder, Stepper });
