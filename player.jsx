/* Question engine + chapter player */

function norm(s) { return String(s).trim().toLowerCase().replace(/\s+/g, '').replace(/%$/, ''); }

function Question({ q, onAnswer, answered }) {
  const [sel, setSel] = useState(null);
  const [val, setVal] = useState('');
  const [order, setOrder] = useState(() => q.items ? q.items.map((_, i) => i) : []);
  const [state, setState] = useState(null); // 'right' | 'wrong'
  const inputRef = useRef(null);

  useEffect(() => { if (q.type === 'input' && inputRef.current) inputRef.current.focus(); }, []);

  const submit = () => {
    let ok = false;
    if (q.type === 'mc') ok = sel === q.a;
    if (q.type === 'input') ok = q.accept.some(a => norm(a) === norm(val));
    if (q.type === 'order') ok = order.every((v, i) => v === q.order[i]);
    setState(ok ? 'right' : 'wrong');
    onAnswer(ok);
  };
  const canSubmit = q.type === 'mc' ? sel != null : q.type === 'input' ? val.trim() !== '' : true;
  const locked = state != null;
  const move = (i, d) => setOrder(o => { const n = o.slice(); [n[i], n[i + d]] = [n[i + d], n[i]]; return n; });

  return (
    <div>
      <div className="q-text">{q.q}{q.marks && <span className="marks">[{q.marks} mark]</span>}</div>
      {q.quote && <div className="quote">{q.quote}</div>}

      {q.type === 'mc' && (
        <div className="opts">
          {q.opts.map((o, i) => {
            let cls = 'opt';
            if (locked && i === q.a) cls += ' right';
            else if (locked && i === sel) cls += ' wrong';
            else if (i === sel) cls += ' sel';
            return <button key={i} className={cls} disabled={locked} onClick={() => setSel(i)}><span className="k">{'ABCD'[i]}</span><span>{o}</span></button>;
          })}
        </div>
      )}
      {q.type === 'input' && (
        <div className="inp-row">
          <input ref={inputRef} className={'inp' + (state ? ' ' + state : '')} value={val} disabled={locked}
            onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && canSubmit && !locked) submit(); }}
            placeholder="Your answer" inputMode={/^\d/.test(q.accept[0]) ? 'decimal' : 'text'} />
          {q.suffix && <span className="inp-suffix">{q.suffix}</span>}
        </div>
      )}
      {q.type === 'order' && (
        <ol className={'order-list' + (state ? ' ' + state : '')}>
          {order.map((idx, i) => (
            <li key={idx} className="order-item">
              <span className="pos">{i + 1}</span>{q.items[idx]}
              {!locked && <span className="mv">
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                <button onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label="Move down">↓</button>
              </span>}
            </li>
          ))}
        </ol>
      )}

      {state && (
        <div className={'feedback ' + state}>
          <span className="tag">{state === 'right' ? 'Correct' : 'Not quite'}</span>
          <span>{q.why}</span>
        </div>
      )}
      {!locked && <button className="btn" disabled={!canSubmit} onClick={submit}>Check answer</button>}
    </div>
  );
}

/* runs a set of questions. mode: 'check' (retry wrong until right), 'practice' / 'challenge' (scored once) */
function QuestionSet({ qs, mode, onFinish }) {
  const [i, setI] = useState(0);
  const [results, setResults] = useState([]);
  const [last, setLast] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const q = qs[i];

  const answer = (ok) => { setLast(ok); };
  const next = () => {
    if (mode === 'check' && !last) { setAttempt(a => a + 1); setLast(null); return; }
    const r = [...results, last];
    setResults(r); setLast(null); setAttempt(0);
    if (i + 1 >= qs.length) onFinish(r); else setI(i + 1);
  };

  return (
    <div>
      <div className="q-meta">
        <span className="mono">Question {i + 1} of {qs.length}</span>
        <div className="q-dots">{qs.map((_, k) => <i key={k} className={k < i ? 'on' : k === i ? 'cur' : ''} />)}</div>
      </div>
      <Question key={i + '-' + attempt} q={q} onAnswer={answer} />
      {last != null && (
        <button className="btn" onClick={next}>
          {mode === 'check' && !last ? 'Try again' : i + 1 >= qs.length ? 'Finish' : 'Next question →'}
        </button>
      )}
    </div>
  );
}

const STEP_KEYS = ['play', 'notice', 'check', 'practice', 'challenge', 'recap'];
const STEP_LABELS = { play: 'Play', notice: 'Notice', check: 'Check', practice: 'Practice', challenge: 'Challenge', recap: 'Recap' };

function Stars({ n, of = 3 }) {
  return <span className="stars">{Array.from({ length: of }, (_, i) => <span key={i} className={i < n ? '' : 'off'}>★</span>)}</span>;
}

function PlayStep({ ch, onDone }) {
  const [s, setS] = useState({});
  const seen = useRef({});
  const [, force] = useState(0);
  const handle = useCallback((st) => {
    if (st.state && !seen.current[st.state]) { seen.current[st.state] = true; force(x => x + 1); }
    setS(st);
  }, []);
  const tasks = ch.play.tasks;
  // sticky completion
  const doneRef = useRef(tasks.map(() => false));
  tasks.forEach((t, i) => { if (doneRef.current[i]) return; try { if (t.test(s, seen.current)) doneRef.current[i] = true; } catch (e) { /* state not ready yet */ } });
  const done = doneRef.current;
  const all = done.every(Boolean);
  const curIdx = done.findIndex(d => !d);

  const Inter = (window.INTERACTIVE_KINDS && window.INTERACTIVE_KINDS[ch.play.kind]) || (ch.play.kind === 'grid' ? HundredGrid : ch.play.kind === 'particles' ? ParticleBox : WordTagger);

  return (
    <div className="stage">
      <div className="figure">
        <div className="fig-head"><span className="t">Fig. 1 · {ch.play.heading}</span><span className="mono">Interactive</span></div>
        <Inter onState={handle} />
      </div>
      <div className="panel">
        <div className="panel-kicker"><span className="mono">Step 1 · Play</span></div>
        <h2>{ch.play.heading}</h2>
        <p className="intro">{ch.play.intro}</p>
        <ul className="tasks">
          {tasks.map((t, i) => (
            <li key={i} className={'task' + (done[i] ? ' done' : '') + (i === curIdx ? ' cur' : '')}>
              <span className="box">✓</span><span className="txt">{t.t}</span>
            </li>
          ))}
        </ul>
        <button className="btn" disabled={!all} onClick={onDone}>{all ? 'See what you found →' : `${done.filter(Boolean).length} of ${tasks.length} done`}</button>
      </div>
    </div>
  );
}

function NoticeStep({ ch, onDone }) {
  const [speaking, setSpeaking] = useState(false);
  const listen = () => {
    if (!window.speechSynthesis) return;
    if (speaking) { speechSynthesis.cancel(); setSpeaking(false); return; }
    const el = document.querySelector('.notice-lines');
    const u = new SpeechSynthesisUtterance(el ? el.innerText : '');
    u.rate = 0.95; u.onend = () => setSpeaking(false);
    speechSynthesis.speak(u); setSpeaking(true);
  };
  useEffect(() => () => window.speechSynthesis && speechSynthesis.cancel(), []);
  const Mini = () => {
    if (ch.notice.Figure) { const F = ch.notice.Figure; return <F />; }
    if (ch.play.kind === 'grid') return (
      <div className="mini3">
        {[[25, <Frac a="1" b="4" />], [60, '0.6'], [75, '75%']].map(([n, c], i) => (
          <div key={i}><HundredGrid preset={n} readonly compact /><div className="cap">{c}</div></div>
        ))}
      </div>
    );
    if (ch.play.kind === 'particles') return (
      <div className="mini3">
        {[[-15, 'Solid'], [50, 'Liquid'], [130, 'Gas']].map(([t, c], i) => (
          <div key={i}><ParticleBox fixedTemp={t} small /><div className="cap">{c}</div></div>
        ))}
      </div>
    );
    return <WordTagger demo />;
  };
  return (
    <div className="stage">
      <div className="figure">
        <div className="fig-head"><span className="t">Fig. 2 · Side by side</span><span className="mono">Notice</span></div>
        <Mini />
      </div>
      <div className="panel">
        <div className="panel-kicker"><span className="mono">Step 2 · Notice</span></div>
        <h2>{ch.notice.heading}</h2>
        <ol className="notice-lines">
          {ch.notice.lines.map((l, i) => <li key={i} style={{ animationDelay: (i * 0.35) + 's' }}><span>{l}</span></li>)}
        </ol>
        <div className="row">
          <button className="btn" onClick={onDone}>Check my understanding →</button>
          <button className="btn ghost" onClick={listen}>{speaking ? '■ Stop' : ' Listen'}</button>
        </div>
      </div>
    </div>
  );
}

function ScoredStep({ ch, kind, onDone, prev }) {
  const [res, setRes] = useState(null);
  const qs = ch[kind];
  const title = kind === 'check' ? 'Quick check' : kind === 'practice' ? 'Practice' : 'Checkpoint challenge';
  const sub = kind === 'check' ? 'Three quick questions. If you get one wrong, read why, then try again.'
    : kind === 'practice' ? 'Five questions, one try each. Score 3, 4 or 5 to earn stars.'
      : 'Exam-style questions like the Cambridge Lower Secondary Checkpoint. Get all three right for the gold medal.';

  if (res) {
    const score = res.filter(Boolean).length;
    if (kind === 'practice') {
      const stars = score >= 5 ? 3 : score >= 4 ? 2 : score >= 3 ? 1 : 0;
      return (
        <div className="stage single"><div className="result">
          <div className="big-stars">{[0, 1, 2].map(i => <span key={i} className={i < stars ? '' : 'off'}>★</span>)}</div>
          <h3>{score} out of {qs.length}</h3>
          <p>{stars === 3 ? 'Full marks. Three stars.' : stars > 0 ? `You earned ${stars} star${stars > 1 ? 's' : ''}. Try again any time for more.` : 'No stars yet. Look at the Notice step again, then have another go.'}</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn ghost" onClick={() => setRes(null)}>Try again</button>
            <button className="btn" onClick={() => onDone({ stars })}>On to the challenge →</button>
          </div>
        </div></div>
      );
    }
    if (kind === 'challenge') {
      const gold = score === qs.length;
      return (
        <div className="stage single"><div className="result">
          <div className={'medal' + (gold ? '' : ' plain')}>{score}/{qs.length}</div>
          <h3>{gold ? 'Gold medal' : 'Challenge complete'}</h3>
          <p>{gold ? 'Every mark, Checkpoint style. Well done.' : 'Read the explanations, then try again to win gold.'}</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn ghost" onClick={() => setRes(null)}>Try again</button>
            <button className="btn" onClick={() => onDone({ gold })}>See the recap →</button>
          </div>
        </div></div>
      );
    }
  }

  return (
    <div className="stage single">
      <div className="panel">
        <div className="panel-kicker">
          <span className="mono">Step {STEP_KEYS.indexOf(kind) + 1} · {STEP_LABELS[kind]}</span>
          {kind === 'challenge' && ch.codes.map(c => <span key={c} className="code">{c}</span>)}
          {kind === 'practice' && prev && prev.stars > 0 && <Stars n={prev.stars} />}
        </div>
        <h2>{title}</h2>
        <p className="intro">{sub}</p>
        <QuestionSet key={kind + (res ? 1 : 0)} qs={qs} mode={kind === 'check' ? 'check' : 'scored'} onFinish={kind === 'check' ? () => onDone({}) : setRes} />
      </div>
    </div>
  );
}

function RecapStep({ ch, prog, onHome }) {
  return (
    <div className="stage single" style={{ gridTemplateColumns: 'minmax(0, 960px)' }}>
      <div className="recap">
        <div className="panel-kicker"><span className="mono">Step 6 · Recap · one page</span>{window.openCompanion && <button className="btn ghost small" onClick={() => window.openCompanion({ topic: ch.title })}>Ask the companion about this</button>}{ch.codes.map(c => <span key={c} className="code">{c}</span>)}</div>
        <h2>{ch.title}</h2>
        <div className="recap-grid">
          <div><span className="mono">Remember</span><ol>{ch.recap.points.map((p, i) => <li key={i}>{p}</li>)}</ol></div>
          <div><span className="mono">Key words</span><dl className="terms" style={{ marginTop: 10 }}>{ch.recap.terms.map(([t, d]) => <React.Fragment key={t}><dt>{t}</dt><dd>{d}</dd></React.Fragment>)}</dl></div>
        </div>
        <div className="recap-foot">
          <div className="row"><Stars n={prog.stars || 0} />{prog.gold && <span className="code" style={{ background: 'color-mix(in oklab, var(--gold) 22%, var(--paper))', color: 'oklch(0.45 0.1 70)' }}>Gold medal</span>}</div>
          <div className="row">
            <button className="btn ghost" onClick={() => window.print()}>Print recap</button>
            <button className="btn" onClick={onHome}>Back to chapters</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChapterPlayer({ ch, prog, setProg, onHome }) {
  const key = 'margin-step-' + ch.id;
  const [step, setStep] = useState(() => { const s = localStorage.getItem(key); return s && STEP_KEYS.includes(s) ? s : 'play'; });
  const reached = prog.reached || 0;
  const idx = STEP_KEYS.indexOf(step);
  useEffect(() => { localStorage.setItem(key, step); window.scrollTo(0, 0); }, [step]);

  const advance = (extra = {}) => {
    const n = Math.min(idx + 1, STEP_KEYS.length - 1);
    const patch = { ...extra, reached: Math.max(reached, n) };
    if (extra.stars != null) patch.stars = Math.max(prog.stars || 0, extra.stars);
    if (extra.gold != null) patch.gold = prog.gold || extra.gold;
    setProg(patch);
    setStep(STEP_KEYS[n]);
  };

  return (
    <div className={'subj-' + ch.subject}>
      <div className="ch-bar">
        <div className="wrap ch-bar-in">
          <button className="back" onClick={onHome} aria-label="Back to chapters">←</button>
          <div style={{ minWidth: 0 }}>
            <div className="mono" style={{ color: 'var(--acc)' }}>{ch.num} · Stage {ch.stage || 7}</div>
            <div className="ch-title">{ch.title}</div>
          </div>
          <nav className="ch-steps">
            {STEP_KEYS.map((k, i) => (
              <button key={k} className={'ch-step' + (k === step ? ' cur' : i <= reached ? ' done' : '')} disabled={i > reached} onClick={() => setStep(k)}>
                <span className="dot" /><span className="lbl">{STEP_LABELS[k]}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="progress-line"><i style={{ width: ((Math.max(reached, idx) + 1) / STEP_KEYS.length * 100) + '%' }} /></div>
      </div>
      <div className="wrap" data-screen-label={'Chapter ' + ch.id + ' / ' + step}>
        {step === 'play' && <PlayStep ch={ch} onDone={() => advance()} />}
        {step === 'notice' && <NoticeStep ch={ch} onDone={() => advance()} />}
        {step === 'check' && <ScoredStep key="check" ch={ch} kind="check" onDone={() => advance()} />}
        {step === 'practice' && <ScoredStep key="practice" ch={ch} kind="practice" prev={prog} onDone={advance} />}
        {step === 'challenge' && <ScoredStep key="challenge" ch={ch} kind="challenge" onDone={advance} />}
        {step === 'recap' && <RecapStep ch={ch} prog={prog} onHome={onHome} />}
      </div>
    </div>
  );
}

Object.assign(window, { ChapterPlayer, Stars, STEP_KEYS, Question, QuestionSet });
