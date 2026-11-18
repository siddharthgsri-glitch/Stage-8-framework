/* Study pages: Study hub, Daily mix, Mistake notebook, Mock exams, Revision planner,
   Card album, Progress report, Class challenge, Homework, Teacher mode, Settings */
const SUBJ_IC = { maths: '', science: '', computing: '', english: '', french: '', other: '' };
const SUBJ_NM = { maths: 'Maths', science: 'Science', computing: 'Computing', english: 'English', french: 'French', other: 'Other' };
const fmtMin = s => { const m = Math.round(s / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; };
function PageHead({ ic, title, sub, grad, children }) {
  return <div className="g-welcome st-head" style={{ background: grad || 'linear-gradient(135deg, var(--t1), var(--t2))' }}><div style={{ fontSize: 52 }}>{ic}</div><h1>{title}</h1>{sub && <p>{sub}</p>}{children}</div>;
}

/* ---------- Study hub ---------- */
function StudyHub({ go }) {
  const mixDone = (LS8.get('s8f-mix', {}).date === new Date().toISOString().slice(0, 10));
  const nm = SR.mistakes().length;
  const tools = [
    ['mix', '', "Today's 10 minutes", mixDone ? 'Done today ✓ (play again for XP)' : 'Your daily mix of review questions', 'lc-1'],
    ['mistakes', '', 'Mistake notebook', nm ? `${nm} mistake${nm > 1 ? 's' : ''} to fix` : 'No mistakes yet: great!', 'lc-0'],
    ['exam', '', 'Checkpoint mock exams', 'Timed, mixed papers with marks', 'lc-3'],
    ['planner', '', 'Revision planner', 'A day-by-day plan to your exam', 'lc-2'],
    ['lab:steps', '', 'Maths: step-by-step working', 'Every line of your working checked', 'lc-1'],
    ['lab:practical', '', 'Science: virtual practicals', 'Plan, test, graph and conclude', 'lc-0'],
    ['lab:writing', '', 'English: writing feedback', 'AI feedback on your paragraph', 'lc-3'],
    ['lab:convo', '', 'French: real conversations', 'Speak to an AI waiter or pen-pal', 'lc-2'],
    ['lab:python', '', 'Computing: run real Python', 'Write and run your own programs', 'lc-1'],
    ['class', '', 'Weekly class challenge', 'Earn stars together as a class', 'lc-0'],
    ['album', '', 'Card album', 'Collect a card for every chapter', 'lc-3'],
    ['report', '', 'My progress report', 'A printable one-page summary', 'lc-2'],
    ['teacher', '', 'Teacher mode', 'Set homework, view the class', 'lc-1'],
    ['settings', '', 'Reading & display settings', 'Read aloud, dyslexia font, text size', 'lc-0'],
  ];
  return (
    <div className="wrap g-page" data-screen-label="Study hub">
      <PageHead ic="" title="Study zone" sub="Tools to help you remember more, practise smarter and get exam-ready." />
      <div className="g-power-cards st-tools">{tools.map(([r, ic, t, d, c]) => <button key={r} className={'g-pcard ' + c} onClick={() => go(r)}><div style={{ fontSize: 36 }}>{ic}</div><b>{t}</b><div>{d}</div></button>)}</div>
    </div>
  );
}

/* ---------- shared question runner ---------- */
function QRunner({ keys, onFinish, title, tag, exam, onProgress }) {
  const [i, setI] = React.useState(0), [last, setLast] = React.useState(null), [res, setRes] = React.useState([]);
  const k = keys[i], info = SR.info(k);
  if (!info) return <div className="g-card">Nothing to practise.</div>;
  const answer = (ok, hl = 0) => { setLast(ok); GAME.answer(ok); setRes(r => { const n = [...r, { k, ok, hl }]; onProgress && onProgress(n); return n; }); };
  const next = () => { if (i + 1 >= keys.length) { onFinish(res); return; } setI(i + 1); setLast(null); };
  return (
    <div className="g-quizbox">
      <div className="g-quiz-top"><span className="g-tag">{tag}</span><div className="g-qdots">{keys.map((_, x) => <i key={x} className={x < i ? (res[x] && res[x].ok ? 'on' : 'bad') : x === i ? 'cur' : ''} />)}</div><ComboBar /></div>
      <div className="st-src">{SUBJ_IC[info.ch.subj]} {SUBJ_NM[info.ch.subj]} · {info.ch.title}{info.sec ? ' · ' + info.sec.n + ' ' + info.sec.t : ''}{(SR.store()[k] || {}).m ? <span className="st-mtag"> from your notebook</span> : null}</div>
      <GQ key={k + i} q={info.q} onResult={answer} allowHint={!exam} />
      {last != null && <button className="btn g-btn big" onClick={next}>{i + 1 >= keys.length ? 'Finish ' : 'Next →'}</button>}
    </div>
  );
}

/* ---------- Daily mix ---------- */
function DailyMix({ go }) {
  const [keys, setKeys] = React.useState(null), [done, setDone] = React.useState(null);
  const st = LS8.get('s8f-mix', {}); const today = new Date().toISOString().slice(0, 10);
  const nm = SR.mistakes().length, nd = SR.due().length;
  const finish = r => {
    const right = r.filter(x => x.ok).length;
    const s = LS8.get('s8f-mix', {}); const first = s.date !== today;
    LS8.set('s8f-mix', { date: today, count: (s.count || 0) + (first ? 1 : 0), best: Math.max(s.best || 0, right) });
    if (first) { GAME.event('mix'); GAME.award(40, 30, 'Daily mix complete!'); GAME.confetti(); }
    setDone({ right, n: r.length, first });
  };
  if (done) return <div className="wrap g-page"><div className="g-result"><div className="g-bigicon g-bounce">{done.right === done.n ? '' : ''}</div><h2>{done.right} / {done.n} right</h2><p className="g-sub">{done.first ? 'Daily mix done! Come back tomorrow for a new one.' : 'Extra practice done. Nice work!'} Questions you got wrong are in your mistake notebook.</p><div className="g-row" style={{ justifyContent: 'center' }}><button className="btn g-btn ghost" onClick={() => go('mistakes')}> Mistake notebook</button><button className="btn g-btn big" onClick={() => go('home')}>Home</button></div></div></div>;
  if (keys) return <div className="wrap g-page"><QRunner keys={keys} tag=" Today's 10 minutes" onFinish={finish} /></div>;
  return (
    <div className="wrap g-page" data-screen-label="Daily mix">
      <PageHead ic="" title="Today's 10 minutes" sub="A short daily mix that brings back what you got wrong and what you are about to forget. A little every day beats a lot once a week!">
        <div className="st-mixstats"><span><b>{Math.min(nm, 4)}</b> from your mistakes</span><span><b>{Math.min(nd, 4)}</b> due for review</span><span><b> {st.count || 0}</b> mixes done</span></div>
        <button className="btn g-btn big" onClick={() => setKeys(SR.buildMix(10))}>{st.date === today ? ' Play again' : " Start today's mix"}</button>
      </PageHead>
      <div className="g-card st-explain"><h3>How it works</h3><div className="st-boxes">{['Today', '1 day', '2 days', '4 days', '8 days', '16 days', '32 days'].map((d, i) => <div key={i} className="st-box"><b>Box {i}</b><small>review after {d}</small></div>)}</div><p className="g-sub">Each right answer moves a question to the next box, so you see it less often. A wrong answer sends it back to Box 0 and into your mistake notebook. This is called <b>spaced repetition</b>, and it is one of the best-proven ways to remember things.</p></div>
    </div>
  );
}

/* ---------- Mistake notebook ---------- */
function Mistakes({ go }) {
  const [tick, setTick] = React.useState(0), [run, setRun] = React.useState(null), [f, setF] = React.useState('all');
  const list = SR.mistakes().filter(m => f === 'all' || m.ch.subj === f);
  const subs = [...new Set(SR.mistakes().map(m => m.ch.subj))];
  if (run) return <div className="wrap g-page"><QRunner keys={run} tag=" Fix your mistakes" onFinish={() => { setRun(null); setTick(tick + 1); }} /></div>;
  const qtext = q => typeof q.q === 'string' ? q.q : 'Question';
  const ans = q => q.type === 'mc' ? q.opts[q.a] : q.type === 'input' ? q.accept[0] : (q.order || []).map(i => q.items[i]).join(' → ');
  return (
    <div className="wrap g-page" data-screen-label="Mistake notebook">
      <PageHead ic="" title="Mistake notebook" sub="Every question you get wrong is saved here with its explanation. Get it right twice in a row (without the full-solution hint) to clear it." grad="linear-gradient(135deg,#ff9671,#ff6f91)">
        <div className="st-mixstats"><span><b>{SR.mistakes().length}</b> to fix</span><span><b>{SR.fixedCount()}</b> cleared</span></div>
        {list.length > 0 && <button className="btn g-btn big" onClick={() => setRun(list.slice(0, 10).map(m => m.k))}> Retry {Math.min(10, list.length)} mistakes</button>}
      </PageHead>
      {subs.length > 1 && <div className="chips" style={{ margin: '16px 0' }}>{['all', ...subs].map(s => <button key={s} className={'chip' + (f === s ? ' on' : '')} onClick={() => setF(s)}>{s === 'all' ? 'All' : SUBJ_IC[s] + ' ' + SUBJ_NM[s]}</button>)}</div>}
      {!list.length ? <div className="g-card st-empty"><div style={{ fontSize: 60 }}></div><h3>Nothing to fix!</h3><p className="g-sub">Wrong answers from quizzes, practice, bosses, mock exams and your daily mix appear here automatically.</p></div> :
        <div className="st-mlist">{list.map(m => <div key={m.k} className="g-card st-mi"><div className="st-src">{SUBJ_IC[m.ch.subj]} {m.ch.title}{m.sec ? ' · ' + m.sec.n : ''} <span className="st-streak">{m.r.s ? `✓ ${m.r.s}/2 right` : `✗ wrong ${m.r.w}×`}</span></div><b className="st-q">{qtext(m.q)}</b><details><summary>Show answer & explanation</summary><div className="st-ans"><b>Answer:</b> {String(ans(m.q))}</div><div className="g-sub">{m.q.why}</div></details><div className="g-row"><button className="btn g-btn small" onClick={() => setRun([m.k])}>Retry</button><button className="btn g-btn ghost small" onClick={() => go('book:' + m.ch.id)}>Open chapter</button></div></div>)}</div>}
    </div>
  );
}

/* ---------- Mock exams ---------- */
const MARKS = q => q.type === 'mc' ? 1 : 2;
function buildExam(subj, len) {
  const all = SR.all(); const chs = BOOK.filter(c => c.subj === subj && !c.review);
  const keys = [];
  const per = Math.max(1, Math.ceil(len / chs.length));
  wxShuffle(chs, Date.now() % 991).forEach(ch => {
    const ks = Object.keys(all).filter(k => k.startsWith(ch.id + '|') && (k.includes('|x|') || k.includes('|p|')));
    wxShuffle(ks, Date.now() % 313).slice(0, per).forEach(k => keys.push(k));
  });
  return wxShuffle(keys, 7).slice(0, len);
}
function MockExam({ go }) {
  const [subj, setSubj] = React.useState('maths'), [len, setLen] = React.useState(20), [paper, setPaper] = React.useState(null), [res, setRes] = React.useState(null), [left, setLeft] = React.useState(0);
  const hist = LS8.get('s8f-exams', []);
  const sofar = React.useRef([]);
  React.useEffect(() => { if (!paper || res) return; const t = setInterval(() => setLeft(l => l - 1), 1000); return () => clearInterval(t); }, [paper, res]);
  const finish = (r) => {
    const by = {}; let got = 0, tot = 0;
    paper.forEach(k => { const info = SR.info(k); const m = MARKS(info.q); tot += m; const a = r.find(x => x.k === k); const g = a && a.ok ? m : 0; got += g; const id = info.ch.id; by[id] = by[id] || { t: info.ch.title, got: 0, tot: 0 }; by[id].got += g; by[id].tot += m; });
    const pct = Math.round(got / tot * 100);
    const rec = { subj, date: Date.now(), got, tot, pct, by, time: len * 90 - left };
    LS8.set('s8f-exams', [rec, ...hist].slice(0, 30));
    GAME.award(Math.round(pct / 2), Math.round(pct / 4), 'Mock exam complete'); if (pct >= 80) GAME.confetti();
    setRes(rec);
  };
  React.useEffect(() => { if (paper && !res && left <= 0) { finish(sofar.current); } }, [left]);
  if (res) {
    const rows = Object.entries(res.by).sort((a, b) => b[1].got / b[1].tot - a[1].got / a[1].tot);
    const strong = rows.filter(r => r[1].got / r[1].tot >= 0.75), weak = rows.filter(r => r[1].got / r[1].tot < 0.5);
    const grade = res.pct >= 80 ? ['', 'Excellent'] : res.pct >= 60 ? ['', 'Good'] : res.pct >= 40 ? ['', 'Getting there'] : ['', 'Keep practising'];
    return (
      <div className="wrap g-page" data-screen-label="Exam results">
        <div className="g-card st-exres"><div className="st-score"><div className="st-ring" style={{ '--p': res.pct }}><b>{res.pct}%</b></div><div><h2>{grade[0]} {grade[1]}</h2><p className="g-sub">{SUBJ_NM[res.subj]} mock · {res.got} / {res.tot} marks · {fmtMin(res.time)}</p></div></div>
          <div className="st-sw"><div><h3> Strong</h3>{strong.length ? strong.map(([id, r]) => <span key={id} className="st-pill ok">{r.t}</span>) : <span className="g-sub">Keep going!</span>}</div><div><h3> Needs work</h3>{weak.length ? weak.map(([id, r]) => <button key={id} className="st-pill bad" onClick={() => go('book:' + id)}>{r.t} →</button>) : <span className="g-sub">Nothing below 50%. Well done!</span>}</div></div>
          <h3>Marks by chapter</h3>
          <div className="st-bars">{rows.map(([id, r]) => <div key={id} className="st-bar"><span>{r.t}</span><i><em style={{ width: r.got / r.tot * 100 + '%', background: r.got / r.tot >= .75 ? '#43c463' : r.got / r.tot >= .5 ? '#ffc75f' : '#ff6b6b' }} /></i><b>{r.got}/{r.tot}</b></div>)}</div>
          <div className="g-row"><button className="btn g-btn ghost" onClick={() => go('mistakes')}> Review mistakes</button><button className="btn g-btn ghost" onClick={() => go('planner')}> Make a revision plan</button><button className="btn g-btn" onClick={() => { setRes(null); setPaper(null); }}>New paper</button></div>
        </div>
      </div>
    );
  }
  if (paper) return <div className="wrap g-page"><div className={'st-timer' + (left < 60 ? ' low' : '')}> {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}<button className="chip" onClick={() => { if (confirm('Hand in your paper now?')) setLeft(0); }}>Hand in</button></div><QRunner keys={paper} exam tag={` ${SUBJ_NM[subj]} mock exam`} onFinish={finish} onProgress={r => { sofar.current = r; }} /></div>;
  return (
    <div className="wrap g-page" data-screen-label="Mock exams">
      <PageHead ic="" title="Checkpoint mock exams" sub="A timed exam-style paper that mixes questions from every chapter. No hints! You get marks, a grade and a results page by topic." grad="linear-gradient(135deg,#4facfe,#7f5af0)">
        <div className="st-exsetup"><div className="chips">{['maths', 'science', 'computing', 'english', 'french'].map(s => <button key={s} className={'chip' + (subj === s ? ' on' : '')} onClick={() => setSubj(s)}>{SUBJ_IC[s]} {SUBJ_NM[s]}</button>)}</div>
          <div className="chips">{[[10, 'Short · 10 Qs · 15 min'], [20, 'Standard · 20 Qs · 30 min'], [30, 'Full · 30 Qs · 45 min']].map(([n, l]) => <button key={n} className={'chip' + (len === n ? ' on' : '')} onClick={() => setLen(n)}>{l}</button>)}</div>
          <button className="btn g-btn big" onClick={() => { sofar.current = []; setPaper(buildExam(subj, len)); setLeft(len * 90); }}>Start the exam </button></div>
      </PageHead>
      {hist.length > 0 && <><h2 className="g-h2">Past papers</h2><div className="st-hist">{hist.map((h, i) => <div key={i} className="g-card st-hrow"><span>{SUBJ_IC[h.subj]} {SUBJ_NM[h.subj]}</span><span className="g-sub">{new Date(h.date).toLocaleDateString()}</span><b>{h.got}/{h.tot}</b><span className={'st-pill ' + (h.pct >= 60 ? 'ok' : 'bad')}>{h.pct}%</span></div>)}</div></>}
    </div>
  );
}

/* ---------- Revision planner ---------- */
function Planner({ go }) {
  const [P, setP] = React.useState(() => LS8.get('s8f-plan', null));
  const [date, setDate] = React.useState(() => new Date(Date.now() + 21 * 864e5).toISOString().slice(0, 10));
  const [subs, setSubs] = React.useState(['maths', 'science', 'english']), [mins, setMins] = React.useState(30), [rest, setRest] = React.useState([6]), [start, setStart] = React.useState('17:00');
  const save = p => { LS8.set('s8f-plan', p); setP(p); };
  const make = () => {
    const prog = LS8.get('s8f-progress', {});
    const exams = LS8.get('s8f-exams', []);
    const weakExam = {}; exams.forEach(e => Object.entries(e.by).forEach(([id, r]) => { weakExam[id] = Math.min(weakExam[id] == null ? 1 : weakExam[id], r.got / r.tot); }));
    const mist = {}; SR.mistakes().forEach(m => mist[m.ch.id] = (mist[m.ch.id] || 0) + 1);
    const chs = BOOK.filter(c => subs.includes(c.subj) && !c.review).map(c => ({ c, score: chPct8(c, prog) * 0.6 + (weakExam[c.id] != null ? weakExam[c.id] : 0.5) * 0.4 - (mist[c.id] || 0) * 0.05 })).sort((a, b) => a.score - b.score);
    // rotate subjects so each week mixes them (weakest chapter of each subject first)
    const bySub = {}; chs.forEach(x => (bySub[x.c.subj] = bySub[x.c.subj] || []).push(x));
    const order = subs.filter(k => bySub[k]); chs.length = 0;
    for (let i = 0; order.some(k => bySub[k].length); i++) { const k = order[i % order.length]; if (bySub[k].length) chs.push(bySub[k].shift()); }
    const days = []; const end = new Date(date); let d = new Date(); d.setHours(0, 0, 0, 0);
    const perDay = Math.max(1, Math.floor(mins / 20)); let ci = 0;
    while (d < end && days.length < 120) {
      if (!rest.includes(d.getDay())) {
        const items = []; const left = Math.round((end - d) / 864e5);
        if (left <= 2) items.push({ t: ' Mock exam: ' + SUBJ_NM[subs[days.length % subs.length]], r: 'exam' });
        else { for (let k = 0; k < perDay; k++) { const x = chs[ci++ % chs.length]; if (x) items.push({ t: SUBJ_IC[x.c.subj] + ' ' + x.c.title, r: 'book:' + x.c.id }); } if (days.length % 3 === 2) items.push({ t: ' Fix 5 mistakes', r: 'mistakes' }); if (days.length % 7 === 6) items.push({ t: ' Short mock exam', r: 'exam' }); }
        items.unshift({ t: " Today's 10 minutes", r: 'mix' });
        days.push({ d: d.toISOString().slice(0, 10), items: items.map(x => ({ ...x, done: false })) });
      }
      d = new Date(d.getTime() + 864e5);
    }
    save({ exam: date, subs, mins, start, days, made: Date.now() });
  };
  if (!P) return (
    <div className="wrap g-page" data-screen-label="Revision planner">
      <PageHead ic="" title="Revision timetable" sub="Tell me when your exam is and when you like to study. I'll build a colourful weekly timetable that starts with your weakest chapters (from your stars, mock exams and mistakes)." grad="linear-gradient(135deg,#ff6f91,#ffb347 45%,#4facfe)" />
      <div className="g-card st-form">
        <label> Exam date<input type="date" className="inp" value={date} min={new Date().toISOString().slice(0, 10)} onChange={e => setDate(e.target.value)} /></label>
        <label> Subjects<div className="chips">{['maths', 'science', 'computing', 'english', 'french'].map(s => <button key={s} className={'chip' + (subs.includes(s) ? ' on' : '')} onClick={() => setSubs(subs.includes(s) ? subs.filter(x => x !== s) : [...subs, s])}>{SUBJ_IC[s]} {SUBJ_NM[s]}</button>)}</div></label>
        <label> Time per day<div className="chips">{[20, 30, 45, 60].map(m => <button key={m} className={'chip' + (mins === m ? ' on' : '')} onClick={() => setMins(m)}>{m} min</button>)}</div></label>
        <label> Rest days<div className="chips">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((n, i) => <button key={i} className={'chip' + (rest.includes(i) ? ' on' : '')} onClick={() => setRest(rest.includes(i) ? rest.filter(x => x !== i) : [...rest, i])}>{n}</button>)}</div></label>
        <label>{ic('alarm')} Start time each day<input type="time" className="inp" value={start} onChange={e => setStart(e.target.value || '17:00')} style={{ maxWidth: 180 }} /></label>
        <button className="btn g-btn big" disabled={!subs.length} onClick={make}>{ic('calendar-dots')} Build my timetable</button>{false && <span>x</span>}{/* */}
      </div>
    </div>
  );
  const today = new Date().toISOString().slice(0, 10);
  return <Timetable P={P} save={save} setP={setP} go={go} today={today} />;
}

/* ---------- Card album ---------- */
function Album() {
  const prog = LS8.get('s8f-progress', {}); const owned = CARD8.owned(prog);
  const [f, setF] = React.useState('maths'), [open, setOpen] = React.useState(null);
  const chs = BOOK.filter(c => c.subj === f);
  return (
    <div className="wrap g-page" data-screen-label="Card album">
      <PageHead ic="" title="Card album" sub="Finish a chapter and open its treasure chest to unlock a card: famous mathematicians, scientists, writers and French-speaking cities." grad="linear-gradient(135deg,#a78bfa,#ff7eb3)"><b>{owned.length} / {BOOK.length} collected</b></PageHead>
      <div className="chips" style={{ margin: '16px 0' }}>{['maths', 'science', 'computing', 'english', 'french'].map(s => <button key={s} className={'chip' + (f === s ? ' on' : '')} onClick={() => setF(s)}>{SUBJ_IC[s]} {SUBJ_NM[s]} ({BOOK.filter(c => c.subj === s && owned.includes(c.id)).length}/{BOOK.filter(c => c.subj === s).length})</button>)}</div>
      <div className="st-album">{chs.map(c => { const has = owned.includes(c.id), cd = CARD8.forChapter(c); return <button key={c.id} className={'st-card ' + (has ? cd.rare : 'locked')} onClick={() => has && setOpen(cd)}><span className="st-cic">{has ? cd.ic : ''}</span><b>{has ? cd.name : '???'}</b><small>{has ? cd.sub : 'Finish: ' + c.title}</small>{has && cd.rare !== 'common' && <i className="st-rare">{cd.rare === 'rare' ? ' Rare' : ' Shiny'}</i>}</button>; })}</div>
      {open && <div className="g-modal-bg" onClick={() => setOpen(null)}><div className={'st-card big ' + open.rare} onClick={e => e.stopPropagation()}><span className="st-cic">{open.ic}</span><b>{open.name}</b><small>{open.sub}</small><p>{open.fact}</p><button className="btn g-btn" onClick={() => setOpen(null)}>Close</button></div></div>}
    </div>
  );
}
function CardReveal({ ch }) { const c = CARD8.forChapter(ch); return <div className={'st-card reveal ' + c.rare}><span className="st-cic">{c.ic}</span><b>{c.name}</b><small>{c.sub}</small><p>{c.fact}</p><i className="st-rare"> New card for your album!</i></div>; }

/* ---------- Progress report ---------- */
function reportFor(username) {
  const data = S8DATA.userData(username), P = S8DATA.parseD;
  const prog = P(data, 's8f-progress', {}), game = P(data, 's8f-game', {}), time = P(data, 's8f-time', { total: 0, by: {}, days: {} }), exams = P(data, 's8f-exams', []), sr = P(data, 's8f-sr', {});
  const rows = ['maths', 'science', 'computing', 'english', 'french'].map(s => {
    const chs = BOOK.filter(c => c.subj === s && !c.review);
    const per = chs.map(c => ({ c, p: chPct8(c, prog) }));
    const topics = chs.reduce((a, c) => a + c.secs.filter(x => (((prog.book || {})[c.id] || {}).secDone || {})[x.n]).length, 0), totT = chs.reduce((a, c) => a + c.secs.length, 0);
    const ex = exams.filter(e => e.subj === s);
    return { s, topics, totT, pct: per.reduce((a, x) => a + x.p, 0) / per.length, strong: per.filter(x => x.p >= 0.75).map(x => x.c.title), weak: per.filter(x => x.p > 0 && x.p < 0.4).map(x => x.c.title), exam: ex.length ? Math.max(...ex.map(e => e.pct)) : null, time: (time.by || {})[s] || 0 };
  });
  const mistakes = Object.values(sr).filter(r => r.m).length, fixed = Object.values(sr).filter(r => r.fixed).length;
  const days7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(Date.now() - (6 - i) * 864e5).toISOString().slice(0, 10); return [d, (time.days || {})[d] || 0]; });
  return { rows, game, time, mistakes, fixed, days7, exams };
}
function Report({ go, username }) {
  const me = username || S8AUTH.current(); const U = (S8DATA.db().users || {})[me] || {};
  const R = reportFor(me); const L = GAME.levelOf(R.game.xp || 0);
  const mx = Math.max(60, ...R.days7.map(d => d[1]));
  return (
    <div className="wrap g-page st-report" data-screen-label="Progress report">
      <div className="st-noprint g-row" style={{ margin: '10px 0 16px' }}><button className="btn g-btn ghost" onClick={() => go(username ? 'teacher' : 'study')}>← Back</button><button className="btn g-btn" onClick={() => window.print()}> Print / save as PDF</button></div>
      <div className="st-paper">
        <div className="st-rh"><div><small>STAGE 8 FRAMEWORK · PROGRESS REPORT</small><h1>{U.name || 'Student'}</h1><span>{U.cls ? 'Class ' + U.cls + ' · ' : ''}{new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span></div><div className="st-rk"><div><b>{L.lvl}</b><small>Level</small></div><div><b>{(R.game.streak || {}).best || 0}</b><small>Best streak</small></div><div><b>{fmtMin(R.time.total || 0)}</b><small>Time learning</small></div><div><b>{(R.game.stats || {}).correct || 0}</b><small>Correct answers</small></div></div></div>
        <table className="st-rt"><thead><tr><th>Subject</th><th>Topics done</th><th>Progress</th><th>Best mock</th><th>Time</th></tr></thead><tbody>{R.rows.map(r => <tr key={r.s}><td>{SUBJ_IC[r.s]} {SUBJ_NM[r.s]}</td><td>{r.topics} / {r.totT}</td><td><span className="st-mini"><i style={{ width: r.pct * 100 + '%' }} /></span> {Math.round(r.pct * 100)}%</td><td>{r.exam == null ? '–' : r.exam + '%'}</td><td>{fmtMin(r.time)}</td></tr>)}</tbody></table>
        <div className="st-r2"><div><h3> Strengths</h3><ul>{R.rows.flatMap(r => r.strong.slice(0, 3).map(t => <li key={t}>{SUBJ_IC[r.s]} {t}</li>)).slice(0, 8)}{!R.rows.some(r => r.strong.length) && <li className="g-sub">Complete more chapters to see strengths.</li>}</ul></div><div><h3> To work on</h3><ul>{R.rows.flatMap(r => r.weak.slice(0, 3).map(t => <li key={t}>{SUBJ_IC[r.s]} {t}</li>)).slice(0, 8)}{!R.rows.some(r => r.weak.length) && <li className="g-sub">No weak areas found yet.</li>}</ul><p className="g-sub"> {R.mistakes} mistakes waiting · {R.fixed} cleared</p></div></div>
        <h3>Last 7 days</h3>
        <div className="st-week">{R.days7.map(([d, s]) => <div key={d}><i style={{ height: Math.max(4, s / mx * 90) + 'px' }} /><small>{new Date(d).toLocaleDateString(undefined, { weekday: 'short' })}</small><b>{Math.round(s / 60)}m</b></div>)}</div>
        <div className="st-sign"><span>Teacher comment: ______________________________________</span><span>Parent signature: ____________________</span></div>
      </div>
    </div>
  );
}

/* ---------- Class challenge ---------- */
function ClassChallenge({ compact, go }) {
  const C = CLASS8.state(); const me = S8AUTH.current(); const pct = Math.min(100, C.total / C.goal * 100);
  const can = C.done && !C.claimed.includes(me);
  const box = <div className={'g-card st-class' + (compact ? ' compact' : '')}>
    <div className="g-card-h"><h3> Weekly class challenge</h3><span className="g-sub">{C.daysLeft} day{C.daysLeft !== 1 ? 's' : ''} left</span></div>
    <p className="st-goal">Earn <b>{C.goal} </b> together this week</p>
    <div className="st-cbar"><i style={{ width: pct + '%' }} /><span>{C.total} / {C.goal} </span></div>
    <div className="st-contrib">{C.contrib.slice(0, compact ? 5 : 30).map(c => <span key={c.username} className={c.username === me ? 'me' : ''} title={c.name}><Avatar g={{ avatar: c.avatar }} size={28} />{c.name.split(' ')[0]} <b>+{c.stars}</b></span>)}</div>
    {can ? <button className="btn g-btn big" onClick={() => { CLASS8.claim(); go && go('class'); }}> Claim the class reward</button> : C.done ? <span className="st-pill ok">Reward claimed ✓</span> : <span className="g-sub">Everyone's stars count. Help your class reach the goal for a group reward!</span>}
    {compact && <button className="btn g-btn ghost small" onClick={() => go('class')}>See the whole class →</button>}
  </div>;
  if (compact) return box;
  return <div className="wrap g-page" data-screen-label="Class challenge"><PageHead ic="" title="Weekly class challenge" sub="Work as a team! Everyone on this device earns stars towards one shared goal. When the class reaches it, everyone can claim a reward chest." grad="linear-gradient(135deg,#ffc75f,#ff9671)" />{box}</div>;
}

/* ---------- Homework card ---------- */
function HomeworkCard({ go, prog }) {
  const H = HW8.get(); if (!H.items.length) return null;
  return <div className="g-card st-hw"><div className="g-card-h"><h3> Homework this week</h3>{H.due && <span className="g-sub">Due {new Date(H.due).toDateString()}</span>}</div>{H.note && <p className="st-note">“{H.note}”</p>}{H.items.map(id => { const c = BOOK.find(x => x.id === id); if (!c) return null; const [d, t] = HW8.topicsFor(id, prog); return <button key={id} className={'st-hwi' + (d === t ? ' done' : '')} onClick={() => go('book:' + id)}><span>{SUBJ_IC[c.subj]}</span><b>{c.title}</b><small>{d}/{t} topics</small>{d === t ? <i>✓</i> : <i>→</i>}</button>; })}</div>;
}

/* ---------- Teacher mode ---------- */
function Teacher({ go }) {
  const [ok, setOk] = React.useState(TEACHER8.unlocked()), [pin, setPin] = React.useState(''), [err, setErr] = React.useState(''), [tab, setTab] = React.useState('class'), [view, setView] = React.useState(null);
  const [hw, setHw] = React.useState(HW8.get()), [subj, setSubj] = React.useState('maths');
  const has = TEACHER8.has();
  if (!ok) return (
    <div className="wrap g-page"><PageHead ic="" title="Teacher mode" sub={has ? 'Enter the teacher PIN to continue.' : 'Create a 6-number teacher PIN. Students should not know it.'} grad="linear-gradient(135deg,#2b2140,#7f5af0)" />
      <div className="g-card st-form" style={{ maxWidth: 420, margin: '20px auto' }}><input className="inp" type="password" inputMode="numeric" maxLength={6} placeholder="6-number PIN" value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setErr(''); }} />{err && <div className="st-err">{err}</div>}<button className="btn g-btn big" disabled={pin.length !== 6} onClick={async () => { if (!has) { await TEACHER8.setPin(pin); setOk(true); } else if (await TEACHER8.check(pin)) setOk(true); else setErr('Wrong PIN.'); }}>{has ? 'Unlock' : 'Create PIN'}</button></div></div>);
  if (view) return <Report go={() => setView(null)} username={view} />;
  const list = S8AUTH.list();
  const saveHw = v => { HW8.set(v); setHw(v); };
  return (
    <div className="wrap g-page" data-screen-label="Teacher mode">
      <PageHead ic="" title="Teacher mode" sub={`${list.length} player${list.length !== 1 ? 's' : ''} on this device`} grad="linear-gradient(135deg,#2b2140,#7f5af0)"><div className="g-row"><button className="btn g-btn ghost" onClick={() => { TEACHER8.lock(); setOk(false); setPin(''); }}> Lock</button></div></PageHead>
      <div className="chips" style={{ margin: '16px 0' }}>{[['class', ' Class overview'], ['hw', ' Set homework']].map(([k, l]) => <button key={k} className={'chip' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{l}</button>)}</div>
      {tab === 'class' ? <div className="g-card" style={{ overflowX: 'auto' }}><table className="st-rt"><thead><tr><th>Student</th><th>Level</th><th></th><th>Topics</th><th>Homework</th><th>Mistakes</th><th>Last active</th><th></th></tr></thead><tbody>{list.map(u => { const data = S8DATA.userData(u.username); const prog = S8DATA.parseD(data, 's8f-progress', {}); const sr = S8DATA.parseD(data, 's8f-sr', {}); const hd = hw.items.filter(id => HW8.doneFor(id, prog)).length; return <tr key={u.username}><td><span className="g-row" style={{ gap: 8 }}><Avatar g={{ avatar: u.s.avatar }} size={30} /><b>{u.name}</b>{u.cls && <small className="g-sub">{u.cls}</small>}</span></td><td>{GAME.levelOf(u.s.xp).lvl}</td><td>{u.s.stars}</td><td>{u.s.topics}</td><td>{hw.items.length ? <span className={'st-pill ' + (hd === hw.items.length ? 'ok' : 'bad')}>{hd}/{hw.items.length}</span> : '–'}</td><td>{Object.values(sr).filter(r => r.m).length}</td><td className="g-sub">{new Date(u.last).toLocaleDateString()}</td><td><button className="btn g-btn small" onClick={() => setView(u.username)}> Report</button></td></tr>; })}</tbody></table></div> :
        <div className="g-card st-form">
          <label> Due date<input type="date" className="inp" value={hw.due || ''} onChange={e => saveHw({ ...hw, due: e.target.value })} /></label>
          <label> Message to the class<input className="inp" value={hw.note || ''} placeholder="e.g. Finish these before Friday's test!" onChange={e => saveHw({ ...hw, note: e.target.value })} /></label>
          <label> Chapters<div className="chips">{['maths', 'science', 'computing', 'english', 'french'].map(s => <button key={s} className={'chip' + (subj === s ? ' on' : '')} onClick={() => setSubj(s)}>{SUBJ_IC[s]} {SUBJ_NM[s]}</button>)}</div></label>
          <div className="st-hwpick">{BOOK.filter(c => c.subj === subj).map(c => <button key={c.id} className={'st-hwc' + (hw.items.includes(c.id) ? ' on' : '')} onClick={() => saveHw({ ...hw, items: hw.items.includes(c.id) ? hw.items.filter(x => x !== c.id) : [...hw.items, c.id] })}><span className="b">{hw.items.includes(c.id) ? '✓' : ''}</span>{c.n}. {c.title}</button>)}</div>
          <div className="g-row"><b>{hw.items.length} chapter{hw.items.length !== 1 ? 's' : ''} set</b>{hw.items.length > 0 && <button className="btn g-btn ghost small" onClick={() => saveHw({ items: [], note: '', due: '' })}>Clear homework</button>}</div>
        </div>}
    </div>
  );
}

/* ---------- Settings (accessibility + offline + accounts) ---------- */
function Settings() {
  const [v, setV] = React.useState(A11Y.get());
  React.useEffect(() => { const f = x => setV(x); A11Y.subs.add(f); return () => A11Y.subs.delete(f); }, []);
  const sw = 'serviceWorker' in navigator;
  const [off, setOff] = React.useState(window.__s8offline || 'checking');
  React.useEffect(() => { const t = setInterval(() => setOff(window.__s8offline || 'checking'), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="wrap g-page" data-screen-label="Settings">
      <PageHead ic="" title="Reading & display" sub="Make the app easier to read and use." grad="linear-gradient(135deg,#00c9a7,#4facfe)" />
      <div className="g-card st-form a11y-panel">
        <label> Font<div className="chips">{[['default', 'Default'], ['lexend', 'Lexend (easy reading)'], ['atkinson', 'Atkinson (dyslexia-friendly)']].map(([k, l]) => <button key={k} className={'chip' + (v.font === k ? ' on' : '')} onClick={() => A11Y.set({ font: k })}>{l}</button>)}</div></label>
        <label> Text size<div className="chips">{[[0.9, 'Small'], [1, 'Normal'], [1.12, 'Large'], [1.25, 'Extra large']].map(([k, l]) => <button key={k} className={'chip' + (v.size === k ? ' on' : '')} onClick={() => A11Y.set({ size: k })}>{l}</button>)}</div></label>
        <label className="st-sw-row"><span> <b>Tap to read aloud</b><small>Tap any text, question or answer to hear it.</small></span><button className={'st-toggle' + (v.read ? ' on' : '')} onClick={() => A11Y.set({ read: !v.read })}><i /></button></label>
        <label className="st-sw-row"><span> <b>High contrast</b><small>Stronger colours and borders.</small></span><button className={'st-toggle' + (v.contrast ? ' on' : '')} onClick={() => A11Y.set({ contrast: !v.contrast })}><i /></button></label>
        <label className="st-sw-row"><span> <b>Reduce motion</b><small>Turn off bouncing, confetti and animations.</small></span><button className={'st-toggle' + (v.motion ? ' on' : '')} onClick={() => A11Y.set({ motion: !v.motion })}><i /></button></label>
        <p className="st-preview">Preview: The quick brown fox jumps over the lazy dog. 3x + 5 = 20.</p>
      </div>
      <div className="g-card st-form">
        <h3> Works offline</h3>
        <p className="g-sub">{!sw ? 'This browser cannot save the app for offline use.' : off === 'ready' ? ' Ready: the app is saved on this device and will open without internet. (The AI study buddy, writing feedback and conversations still need internet.)' : off === 'blocked' ? 'Offline saving is not available in this preview window. Open the app in its own browser tab to turn it on.' : ' Saving the app for offline use…'}</p>
        <p className="g-sub">Tip: use your browser's “Add to Home Screen” to open it like an app.</p>
      </div>
      <div className="g-card st-form">
        <h3> Online accounts</h3>
        <p className="g-sub">Right now, players and progress are saved <b>on this device only</b>. To move to another device, open your profile and use <b> Back up my progress</b>, then load the file on the new device. Real online accounts that sync automatically (and let teachers see a whole class from anywhere) need a hosted online database. That has to be built and published outside this app.</p>
      </div>
    </div>
  );
}


/* ---------- Revision timetable (weekly grid) ---------- */
const TT_COL = {
  maths: ['#4f8cff', '#2f6fe0', '#eaf2ff'], science: ['#37c871', '#1f9e55', '#e6f8ee'], computing: ['#22b8c9', '#118a99', '#e3f6f8'],
  english: ['#ff8a5c', '#e2603f', '#fff0e8'], french: ['#a77bff', '#7a4fe0', '#f2ebff'],
  mix: ['#ffc94d', '#f0a500', '#fff7de'], mistakes: ['#ff6f91', '#e2457a', '#ffeaf0'], exam: ['#3b2a63', '#231a3f', '#ece8f6'],
};
const TT_ICN = { maths: 'calculator', science: 'flask', computing: 'laptop', english: 'books', french: 'translate', mix: 'timer', mistakes: 'notebook', exam: 'exam' };
const TT_NAME = { maths: 'Maths', science: 'Science', computing: 'Computing', english: 'English', french: 'French', mix: "Today's 10 minutes", mistakes: 'Fix mistakes', exam: 'Mock exam' };
function ttInfo(it) {
  const r = it.r || '';
  if (r === 'mix') return { k: 'mix', title: "Today's 10 minutes", sub: 'Daily review mix' };
  if (r === 'mistakes') return { k: 'mistakes', title: 'Fix 5 mistakes', sub: 'Mistake notebook' };
  if (r === 'exam') { const m = String(it.t).match(/(Maths|Science|Computing|English|French)/); return { k: 'exam', title: m ? m[1] + ' mock exam' : 'Short mock exam', sub: 'Timed paper' }; }
  if (r.startsWith('book:')) { const c = BOOK.find(x => x.id === r.slice(5)); if (c) return { k: c.subj, title: c.title, sub: (c.subj === 'computing' ? 'Unit ' : 'Chapter ') + c.n }; }
  return { k: 'mix', title: String(it.t).replace(/^[\uE000-\uF8FF\s]+/, ''), sub: '' };
}
const ttMin = t => { const [h, m] = String(t || '17:00').split(':').map(Number); return h * 60 + (m || 0); };
const ttFmt = m => { const h = Math.floor(m / 60) % 24, mm = m % 60; return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); };
const ttISO = d => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10); };
function Timetable({ P, save, setP, go, today }) {
  const start = ttMin(P.start || '17:00');
  const perDay = Math.max(1, Math.floor((P.mins || 30) / 20));
  const slotLen = Math.max(15, Math.round(((P.mins || 30) - 10) / perDay / 5) * 5);
  const durOf = k => k === 'mix' || k === 'mistakes' ? 10 : k === 'exam' ? 20 : slotLen;
  const byDate = {}; P.days.forEach((d, di) => byDate[d.d] = di);
  // weeks Mon..Sun from the first plan day to the exam
  const first = new Date(P.days.length ? P.days[0].d : today); const monday = new Date(first); monday.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  const examD = new Date(P.exam); const weeks = []; for (let w = new Date(monday); w <= examD; w.setDate(w.getDate() + 7)) weeks.push(new Date(w));
  const curWeek = Math.max(0, weeks.findIndex(w => { const e = new Date(w); e.setDate(e.getDate() + 7); return new Date(today) >= w && new Date(today) < e; }));
  const [wi, setWi] = React.useState(curWeek < 0 ? 0 : curWeek);
  const W = weeks[Math.min(wi, weeks.length - 1)] || monday;
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(W); d.setDate(W.getDate() + i); return d; });
  const rows = Math.max(1, ...days.map(d => { const di = byDate[ttISO(d)]; return di == null ? 0 : P.days[di].items.length; }));
  const rowStart = []; let tcur = start; for (let r = 0; r < rows; r++) { rowStart.push(tcur); tcur += (r === 0 ? 10 : slotLen) + 5; }
  const tot = P.days.reduce((a, d) => a + d.items.length, 0), dn = P.days.reduce((a, d) => a + d.items.filter(x => x.done).length, 0);
  const left = Math.max(0, Math.ceil((examD - new Date(today)) / 864e5));
  const tog = (di, ii) => { const p = JSON.parse(JSON.stringify(P)); const it = p.days[di].items[ii]; it.done = !it.done; if (it.done) { GAME.award(5, 2); if (p.days[di].items.every(x => x.done)) GAME.toast('Day complete! Great revision.', true); } save(p); };
  const setStart = v => save({ ...P, start: v });
  // subject minutes this week + overall
  const weekMins = {}; days.forEach(d => { const di = byDate[ttISO(d)]; if (di == null) return; P.days[di].items.forEach(it => { const k = ttInfo(it).k; weekMins[k] = (weekMins[k] || 0) + durOf(k); }); });
  const allSubs = ['maths', 'science', 'computing', 'english', 'french'].filter(k => P.subs.includes(k));
  const wkDone = days.reduce((a, d) => { const di = byDate[ttISO(d)]; return di == null ? a : a + P.days[di].items.filter(x => x.done).length; }, 0), wkTot = days.reduce((a, d) => { const di = byDate[ttISO(d)]; return di == null ? a : a + P.days[di].items.length; }, 0);
  const DN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="wrap g-page tt" data-screen-label="Revision timetable">
      <div className="tt-hero">
        <div className="tt-blobs"><i /><i /><i /><i /></div>
        <div className="tt-count"><b>{left}</b><small>day{left !== 1 ? 's' : ''} to go</small></div>
        <div className="tt-ht">
          <small>{ic('calendar-dots')} My revision timetable</small>
          <h1>Exam on {examD.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</h1>
          <div className="tt-subs">{allSubs.map(k => <span key={k} style={{ '--c1': TT_COL[k][0], '--c2': TT_COL[k][1] }}>{ic(TT_ICN[k])} {TT_NAME[k]}</span>)}</div>
          <div className="tt-prog"><i><em style={{ width: (tot ? dn / tot * 100 : 0) + '%' }} /></i><b>{dn} / {tot} sessions done</b></div>
        </div>
        <div className="tt-hacts st-noprint">
          <label className="tt-time">{ic('alarm')} Starts at <input type="time" value={P.start || '17:00'} onChange={e => setStart(e.target.value || '17:00')} /></label>
          <button className="btn g-btn ghost small" onClick={() => window.print()}>{ic('printer')} Print week</button>
          <button className="btn g-btn ghost small" onClick={() => { if (confirm('Make a new timetable? Your ticks will be lost.')) { save(null); setP(null); } }}>{ic('arrow-counter-clockwise')} New timetable</button>
        </div>
      </div>

      <div className="tt-bar st-noprint">
        <button className="tt-nav" disabled={wi <= 0} onClick={() => setWi(wi - 1)}>{ic('skip-back')}</button>
        <div className="tt-wk"><b>Week {wi + 1} of {weeks.length}</b><small>{days[0].toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – {days[6].toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · {wkDone}/{wkTot} done</small></div>
        <button className="tt-nav" disabled={wi >= weeks.length - 1} onClick={() => setWi(wi + 1)}>{ic('skip-forward')}</button>
        {wi !== curWeek && curWeek >= 0 && <button className="g-pill" onClick={() => setWi(curWeek)}>This week</button>}
      </div>

      <div className="tt-scroll">
        <table className="tt-grid">
          <thead><tr><th className="tt-corner">{ic('clock')}</th>{days.map((d, i) => { const iso = ttISO(d); const isT = iso === today, isE = iso === P.exam, di = byDate[iso]; const dd = di != null ? P.days[di] : null; const full = dd && dd.items.every(x => x.done); return <th key={i} className={(isT ? 'today ' : '') + (isE ? 'exam ' : '') + (full ? 'full' : '')}><b>{DN[i]}</b><span>{d.getDate()}</span>{isT && <em>Today</em>}{isE && <em>Exam!</em>}{full && !isT && <em>{ic('check-circle')}</em>}</th>; })}</tr></thead>
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={r}>
                <th className="tt-t"><b>{ttFmt(rowStart[r])}</b><small>Session {r + 1}</small></th>
                {days.map((d, i) => {
                  const iso = ttISO(d), di = byDate[iso], isE = iso === P.exam;
                  if (isE) return r === 0 ? <td key={i} rowSpan={rows} className="tt-examday"><div>{ic('trophy')}<b>Exam day</b><small>You've got this!</small></div></td> : null;
                  if (iso > P.exam) return r === 0 ? <td key={i} rowSpan={rows} className="tt-after" /> : null;
                  if (di == null) return r === 0 ? <td key={i} rowSpan={rows} className={'tt-rest' + (iso < (P.days[0] || {}).d ? ' before' : '')}><div>{iso < (P.days[0] || {}).d ? '' : <>{ic('bed')}<b>Rest day</b><small>Recharge!</small></>}</div></td> : null;
                  const it = P.days[di].items[r];
                  if (!it) return <td key={i} className="tt-free" />;
                  const inf = ttInfo(it), col = TT_COL[inf.k] || TT_COL.mix, dur = durOf(inf.k);
                  return (
                    <td key={i} className="tt-cell">
                      <div className={'tt-slot k-' + inf.k + (it.done ? ' done' : '') + (iso < today && !it.done ? ' missed' : '')} style={{ '--c1': col[0], '--c2': col[1], '--c3': col[2] }}>
                        <button className="tt-ck" onClick={() => tog(di, r)} aria-label="Mark done">{it.done ? ic('check') : ''}</button>
                        <div className="tt-sbody" onClick={() => go(it.r)}>
                          <span className="tt-si">{ic(TT_ICN[inf.k])}</span>
                          <small>{TT_NAME[inf.k] === inf.title ? inf.sub : (['mix', 'mistakes', 'exam'].includes(inf.k) ? inf.sub : TT_NAME[inf.k] + ' · ' + inf.sub)}</small>
                          <b>{inf.title}</b>
                          <i>{ic('clock')} {dur} min</i>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tt-foot">
        <div className="tt-legend">{['maths', 'science', 'computing', 'english', 'french', 'mix', 'mistakes', 'exam'].filter(k => !TT_NAME[k] || allSubs.includes(k) || ['mix', 'mistakes', 'exam'].includes(k)).map(k => <span key={k} style={{ '--c1': TT_COL[k][0], '--c2': TT_COL[k][1] }}><i>{ic(TT_ICN[k])}</i>{TT_NAME[k]}{weekMins[k] ? <em>{weekMins[k]} min</em> : null}</span>)}</div>
        <p className="g-sub">Tap a session to open it, and tick the circle when you've finished. Chapters you find hardest come first. Breaks of 5 minutes are built in between sessions.</p>
      </div>
    </div>
  );
}

Object.assign(window, { Timetable, StudyHub, DailyMix, Mistakes, MockExam, Planner, Album, CardReveal, Report, ClassChallenge, HomeworkCard, Teacher, Settings, PageHead, SUBJ_IC, SUBJ_NM });
