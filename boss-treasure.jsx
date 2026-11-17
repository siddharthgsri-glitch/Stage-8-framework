/* Redesigned boss battle + treasure chest (overrides the originals in player8.jsx) */
const BB_ICN = ['ghost', 'alien', 'skull', 'robot', 'bug', 'fire', 'lightning', 'shooting-star'];
const BB_NAMES = ['The Phantom', 'Zorg the Alien', 'Skull King', 'Mega-Bot', 'The Glitch', 'Inferno', 'Thunderclap', 'Comet Crusher'];
const bbIdx = ch => (String(ch.id).charCodeAt(1) + String(ch.id).length) % BB_ICN.length;

function Boss({ ch, onDone }) {
  const g = useGame();
  const qs = React.useMemo(() => [...ch.challenge, ...ch.practice.slice(-2)].slice(0, 5), [ch.id]);
  const bi = bbIdx(ch), boss = ic(BB_ICN[bi]), bname = BB_NAMES[bi];
  const [phase, setPhase] = React.useState('intro'), [hearts, setHearts] = React.useState(3), [maxH, setMaxH] = React.useState(3), [hp, setHp] = React.useState(qs.length), [i, setI] = React.useState(0), [last, setLast] = React.useState(null), [hit, setHit] = React.useState(null), [k, setK] = React.useState(0), [dmg, setDmg] = React.useState(null);
  const start = (extra) => { const h = extra && GAME.use('heart') ? 4 : 3; setHearts(h); setMaxH(h); setHp(qs.length); setI(0); setLast(null); setK(k + 1); setPhase('fight'); };
  const res = ok => { setLast(ok); GAME.answer(ok); setHit(ok ? 'boss' : 'you'); setDmg({ ok, id: Date.now() }); setTimeout(() => setHit(null), 700); if (ok) setHp(h => h - 1); else setHearts(h => h - 1); };
  const next = () => {
    if (hearts <= 0) { setPhase('lose'); return; }
    if (hp <= 0 || i + 1 >= qs.length) { const medal = hp > 0 ? 0 : hearts >= maxH ? 3 : hearts >= maxH - 1 ? 2 : 1; if (!medal) { setPhase('lose'); return; } setPhase({ win: medal }); GAME.event('boss'); if (medal === 3) GAME.event('gold'); GAME.award(40 + medal * 20, 20 + medal * 15, ['', 'Bronze', 'Silver', 'Gold'][medal] + ' medal!'); GAME.confetti(); return; }
    setI(i + 1); setLast(null);
  };
  const Hearts = () => <div className="bb-hearts">{Array.from({ length: maxH }, (_, x) => <span key={x} className={x < hearts ? 'on' : ''}>{ic(x < hearts ? 'heart' : 'heart-break')}</span>)}</div>;
  const me = (S8AUTH.user() || {}).name || 'You';
  if (phase === 'intro') return (
    <div className="bb bb-intro">
      <div className="bb-sky"><i /><i /><i /><i /><i /><i /></div>
      <div className="bb-tag">{ic('sword')} Chapter boss</div>
      <div className="bb-vs-row">
        <div className="bb-fighter you"><div className="bb-plat"><Avatar g={g} size={96} /></div><b>{me}</b><Hearts /></div>
        <div className="bb-vs-big">VS</div>
        <div className="bb-fighter foe"><div className="bb-plat"><div className="bb-boss float">{boss}</div></div><b>{bname}</b><div className="bb-hpbar"><i style={{ width: '100%' }} /></div></div>
      </div>
      <h2>{ch.title}</h2>
      <p>{bname} has <b>{qs.length} HP</b>. Every right answer is a hit. Every wrong answer costs you a heart. No hints in a boss fight!</p>
      <div className="bb-medals"><span><MedalIc m={3} /> Lose no hearts</span><span><MedalIc m={2} /> Lose 1</span><span><MedalIc m={1} /> Lose 2</span></div>
      <div className="g-row" style={{ justifyContent: 'center' }}><button className="btn g-btn big bb-go" onClick={() => start(false)}>{ic('sword')} Fight!</button>{g.power.heart > 0 && <button className="btn g-btn ghost" onClick={() => start(true)}>{ic('heart')} Use extra heart ({g.power.heart})</button>}</div>
    </div>);
  if (phase === 'lose') return <div className="bb bb-end lose"><div className="bb-sky"><i /><i /><i /></div><div className="bb-boss big float">{boss}</div><h2>{bname} wins this round!</h2><p>Review the Learn cards and models, then come back stronger.</p><button className="btn g-btn big" onClick={() => setPhase('intro')}>{ic('arrow-counter-clockwise')} Rematch</button></div>;
  if (phase.win) return <div className="bb bb-end win"><div className="bb-rays" /><div className={'bb-medal m' + phase.win}><span>{ic('medal')}</span></div><h2>{['', 'Bronze', 'Silver', 'Gold'][phase.win]} medal!</h2><p>You defeated {bname} with {hearts} heart{hearts !== 1 ? 's' : ''} left. The treasure chest is now unlocked!</p><div className="g-row" style={{ justifyContent: 'center' }}>{phase.win < 3 && <button className="btn g-btn ghost" onClick={() => setPhase('intro')}>Try for gold</button>}<button className="btn g-btn big" onClick={() => onDone(phase.win)}>{ic('gift')} Open the treasure</button></div></div>;
  return (
    <div className="bb bb-fight">
      <div className="bb-arena">
        <div className="bb-sky"><i /><i /><i /><i /><i /><i /></div>
        <div className={'bb-fighter you' + (hit === 'you' ? ' hurt' : '') + (hit === 'boss' ? ' attack' : '')}><div className="bb-plat sm"><Avatar g={g} size={70} /></div><Hearts /></div>
        <div className="bb-round"><b>Round {i + 1}</b><small>of {qs.length}</small></div>
        <div className={'bb-fighter foe' + (hit === 'boss' ? ' hurt' : '') + (hit === 'you' ? ' attack' : '')}><div className="bb-plat sm"><div className="bb-boss">{boss}</div></div><div className="bb-hpbar"><i style={{ width: (hp / qs.length * 100) + '%' }} /></div><small>{bname} · {hp}/{qs.length} HP</small></div>
        {dmg && <div key={dmg.id} className={'bb-dmg ' + (dmg.ok ? 'hit' : 'miss')}>{dmg.ok ? '−1 HP' : '−1 ' + ic('heart')}</div>}
      </div>
      <div className="g-quizbox bb-q"><ComboBar /><GQ key={k + '-' + i} q={qs[i]} onResult={res} allowHint={false} />{last != null && <button className="btn g-btn big" onClick={next}>{hearts <= 0 ? 'Oh no…' : hp <= 0 ? 'Final blow!' : 'Next attack →'}</button>}</div>
    </div>
  );
}

function Treasure({ ch, prog, setProg, onHome, onNext }) {
  const [opened, setOpened] = React.useState(!!prog.chest), [anim, setAnim] = React.useState(false), [prize, setPrize] = React.useState(null);
  const open = () => { if (anim) return; setAnim(true); setTimeout(() => { setPrize(GAME.chest()); setProg({ chest: true }); setOpened(true); setAnim(false); GAME.confetti(); }, 1100); };
  const u = window.unitOf && unitOf(ch.id);
  const ud = u ? unitDone(u, { book: { ...((LS8.get('s8f-progress', {}).book) || {}), [ch.id]: prog } }) : 0;
  return (
    <div className="g-treasure">
      <div className={'tr-hero' + (opened ? ' open' : '')}>
        <div className="tr-rays" />
        {opened && <div className="tr-coins">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--i': i }}>{ic('coin')}</i>)}</div>}
        <div className={'tr-chest' + (anim ? ' shake' : '') + (opened ? ' open' : '')} onClick={!opened ? open : undefined}>
          <div className="tr-lid"><span className="tr-band" /><span className="tr-lock">{ic(opened ? 'lock-open' : 'lock')}</span></div>
          <div className="tr-base"><span className="tr-band" /><span className="tr-glow" /></div>
        </div>
        <div className="tr-txt">
          <small>Chapter complete</small><h2>{ch.title}</h2>
          <div className="g-row" style={{ justifyContent: 'center' }}><StarRow n={prog.stars || 0} />{prog.medal ? <MedalIc m={prog.medal} /> : null}</div>
          {!opened ? <button className="btn g-btn big tr-btn" onClick={open} disabled={anim}>{ic('key')} {anim ? 'Opening…' : 'Open the chest'}</button> : prize ? <div className="tr-prize"><span>{prize.ic}</span><b>{prize.txt}</b></div> : <span className="tr-opened">{ic('check-circle')} Chest opened</span>}
        </div>
      </div>
      {opened && window.CardReveal && <CardReveal ch={ch} />}
      {opened && u && <div className="tr-unit"><span>{ic('exam')}</span><div><b>Unit: {u.name}</b><small>{ud}/{u.chapters.length} chapters complete{ud >= u.chapters.length ? '. The unit past paper is unlocked!' : ''}</small></div><button className="btn g-btn small" onClick={() => { localStorage.setItem('s8f-route', 'paper:' + u.id); location.reload(); }}>{ud >= u.chapters.length ? 'Sit the past paper' : 'View unit'}</button></div>}
      <h3 className="g-h3">{ic('lightning')} Power-up cards: remember these</h3>
      <div className="g-power-cards">{ch.recap.points.map((p, i) => <div key={i} className={'g-pcard lc-' + (i % 4)}><span className="n">{i + 1}</span>{p}</div>)}</div>
      {window.FormulaSheet && <FormulaSheet ch={ch} />}
      <h3 className="g-h3">{ic('book-open')} Word bank</h3>
      <div className="g-words">{ch.recap.terms.map(([t, d]) => <div key={t} className="g-word"><b>{t}</b><span>{d}</span></div>)}</div>
      <div className="g-row" style={{ justifyContent: 'center', margin: '28px 0 60px' }}>
        <button className="btn g-btn ghost" onClick={() => window.print()}>{ic('printer')} Print</button>
        <button className="btn g-btn ghost" onClick={onHome}>{ic('map-trifold')} Back to map</button>
        {onNext && <button className="btn g-btn big" onClick={onNext}>Next chapter →</button>}
      </div>
    </div>
  );
}
window.BossBattle = Boss; window.TreasureRoom = Treasure;
