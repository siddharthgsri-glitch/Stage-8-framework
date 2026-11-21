/* Mock exams: student chooses subject + chapters, timed paper, AI marking,
   answers + mark scheme on screen, Word downloads (question paper, mark scheme, report). Overrides MockExam. */
function MockExam2({ go }) {
  const SUBS = ['maths', 'science', 'computing', 'english', 'french'];
  const chOfSub = s => BOOK.filter(c => c.subj === s && !c.review);
  const [subj, setSubj] = React.useState('maths'), [len, setLen] = React.useState(20);
  const [picked, setPicked] = React.useState(() => chOfSub('maths').map(c => c.id));
  const [items, setItems] = React.useState(null), [ans, setAns] = React.useState({}), [qi, setQi] = React.useState(0), [left, setLeft] = React.useState(0), [res, setRes] = React.useState(null), [marking, setMarking] = React.useState(false), [t0, setT0] = React.useState(0);
  const hist = LS8.get('s8f-exams', []);
  const pickSub = s => { setSubj(s); setPicked(chOfSub(s).map(c => c.id)); };
  const title = () => `${SUBJ_NM[subj]} mock exam`;
  const build = () => {
    const all = SR.all(); const chs = chOfSub(subj).filter(c => picked.includes(c.id)); const out = [];
    if (!chs.length) return [];
    const per = Math.max(1, Math.ceil(len / chs.length));
    wxShuffle(chs, Date.now() % 991).forEach(ch => {
      const ks = Object.keys(all).filter(k => k.startsWith(ch.id + '|'));
      const pref = [...wxShuffle(ks.filter(k => k.includes('|x|')), 3), ...wxShuffle(ks.filter(k => k.includes('|p|')), 5), ...wxShuffle(ks.filter(k => k.includes('|c|')), 7)];
      pref.slice(0, per).forEach(k => out.push(k));
    });
    return wxShuffle(out, 11).slice(0, len).map((k, i) => { const inf = SR.info(k); return { n: i + 1, k, q: inf.q, ch: inf.ch, marks: inf.q.type === 'mc' ? 1 : 2 }; });
  };
  React.useEffect(() => { if (!items || res || marking) return; const t = setInterval(() => setLeft(l => l - 1), 1000); return () => clearInterval(t); }, [items, res, marking]);
  const handIn = async () => {
    setMarking(true); window.scrollTo(0, 0);
    const rows = rowsFromItems(items, ans, {});
    rows.forEach(r => { const it = items.find(x => x.n === r.n); window.SR && SR.record(it.q, r.got === r.marks, 0); });
    const got = rows.reduce((a, r) => a + r.got, 0), tot = rows.reduce((a, r) => a + r.marks, 0);
    const rep = await aiReport(title(), subj, rows, got, tot);
    const rec = { id: Date.now(), kind: 'mock', unit: 'mock-' + subj, unitName: title(), subj, date: Date.now(), got, tot, pct: rep.pct, grade: rep.grade, byCh: rep.byCh, by: rep.byCh, rows, ai: rep.ai, time: Math.round((Date.now() - t0) / 1000), student: (S8AUTH.user() || {}).name || 'Student', cls: (S8AUTH.user() || {}).cls || '' };
    LS8.set('s8f-exams', [rec, ...LS8.get('s8f-exams', [])].slice(0, 30));
    GAME.award(Math.round(rep.pct / 2), Math.round(rep.pct / 4), 'Mock exam marked'); if (rep.pct >= 80) GAME.confetti();
    setRes(rec); setMarking(false);
  };
  React.useEffect(() => { if (items && !res && !marking && left <= 0) handIn(); }, [left]);

  if (marking) return <div className="wrap g-page"><div className="pp-marking"><div className="pp-spin">{ic('note-pencil')}</div><h2>The examiner is marking your paper…</h2><p className="g-sub">Checking every answer against the mark scheme and writing your report card. With the free AI this can take up to a minute.</p></div></div>;
  if (res) return <PaperResult rec={res} u={{ subj: res.subj }} go={go} again={() => { setRes(null); setItems(null); setAns({}); }} />;

  if (items) {
    const it = items[qi], q = it.q, a = ans[it.n];
    const answered = Object.keys(ans).filter(k => ans[k] !== '' && ans[k] != null).length;
    const setA = v => setAns({ ...ans, [it.n]: v }); const ord = a || (q.items ? q.items.map((_, k) => k) : []);
    return (
      <div className="wrap g-page pp" data-screen-label="Mock exam">
        <div className={'st-timer' + (left < 60 ? ' low' : '')}>{ic('timer')} {Math.floor(Math.max(0, left) / 60)}:{String(Math.max(0, left) % 60).padStart(2, '0')}</div>
        <div className="pp-sheet">
          <div className="pp-sh-top"><div><small>Cambridge Lower Secondary · Stage 8 · {SUBJ_NM[subj]}</small><b>{title()}</b></div><div className="pp-meta"><span>{answered}/{items.length} answered</span><span>{items.reduce((x, y) => x + y.marks, 0)} marks</span></div></div>
          <div className="pp-nav">{items.map((x, k) => <button key={x.n} className={(k === qi ? 'cur ' : '') + (ans[x.n] != null && ans[x.n] !== '' ? 'ans' : '')} onClick={() => setQi(k)}>{x.n}</button>)}</div>
          <div className="pp-q">
            <div className="pp-qh"><span className="pp-qn">{it.n}</span><span className="pp-from">{it.ch.title}</span><span className="pp-mk">[{it.marks} mark{it.marks > 1 ? 's' : ''}]</span></div>
            <div className="pp-qt">{q.q}</div>
            {q.quote && <div className="quote">{q.quote}</div>}
            {q.type === 'mc' && <div className="pp-opts">{q.opts.map((o, k) => <button key={k} className={'pp-opt' + (a === k ? ' on' : '')} onClick={() => setA(k)}><span>{'ABCD'[k]}</span>{o}</button>)}</div>}
            {q.type === 'input' && <div className="pp-line"><input className="inp" value={a || ''} onChange={e => setA(e.target.value)} placeholder="Write your answer" />{q.suffix && <span>{q.suffix}</span>}</div>}
            {q.type === 'order' && <ol className="order-list">{ord.map((idx, k) => <li key={idx} className="order-item"><span className="pos">{k + 1}</span>{q.items[idx]}<span className="mv"><button disabled={k === 0} onClick={() => { const n = ord.slice(); [n[k], n[k - 1]] = [n[k - 1], n[k]]; setA(n); }}>↑</button><button disabled={k === ord.length - 1} onClick={() => { const n = ord.slice(); [n[k], n[k + 1]] = [n[k + 1], n[k]]; setA(n); }}>↓</button></span></li>)}</ol>}
            <p className="g-sub" style={{ margin: 0 }}>No hints in a mock exam. Every answer and the full mark scheme are shown after you hand in.</p>
          </div>
          <div className="pp-foot"><button className="btn g-btn ghost" disabled={qi === 0} onClick={() => setQi(qi - 1)}>← Previous</button>{qi < items.length - 1 ? <button className="btn g-btn" onClick={() => setQi(qi + 1)}>Next →</button> : <button className="btn g-btn big" onClick={() => { if (answered < items.length && !confirm(`You have answered ${answered} of ${items.length}. Hand in anyway?`)) return; handIn(); }}>{ic('check-circle')} Hand in for marking</button>}</div>
        </div>
      </div>
    );
  }

  const chs = chOfSub(subj);
  const start = () => { const its = build(); if (!its.length) return; setItems(its); setAns({}); setQi(0); setLeft(its.length * 90); setT0(Date.now()); window.scrollTo(0, 0); };
  return (
    <div className="wrap g-page" data-screen-label="Mock exams">
      <PageHead ic={ic('exam')} title="Checkpoint mock exams" sub="Pick a subject and the chapters you want to be tested on. Sit a timed exam-style paper, then get it marked: grade, every correct answer, the full mark scheme and a report card, all downloadable as Word documents." grad="linear-gradient(135deg,#4facfe,#7f5af0)" />
      <div className="g-card st-form">
        <label>{ic('books')} Subject<div className="chips">{SUBS.map(s => <button key={s} className={'chip' + (subj === s ? ' on' : '')} onClick={() => pickSub(s)}>{SUBJ_IC[s]} {SUBJ_NM[s]}</button>)}</div></label>
        <label>{ic('list-checks')} Chapters to include <span className="g-sub" style={{ fontWeight: 700 }}>({picked.length} of {chs.length} chosen)</span>
          <div className="g-row"><button className="g-pill" onClick={() => setPicked(chs.map(c => c.id))}>Select all</button><button className="g-pill" onClick={() => setPicked([])}>Clear</button></div>
          <div className="st-hwpick">{chs.map(c => <button key={c.id} className={'st-hwc' + (picked.includes(c.id) ? ' on' : '')} onClick={() => setPicked(picked.includes(c.id) ? picked.filter(x => x !== c.id) : [...picked, c.id])}><span className="b">{picked.includes(c.id) ? '✓' : ''}</span>{c.subj === 'computing' ? 'Unit ' : 'Ch '}{c.n}. {c.title}</button>)}</div>
        </label>
        <label>{ic('timer')} Length<div className="chips">{[[10, 'Short · 10 Qs · 15 min'], [20, 'Standard · 20 Qs · 30 min'], [30, 'Full · 30 Qs · 45 min']].map(([n, l]) => <button key={n} className={'chip' + (len === n ? ' on' : '')} onClick={() => setLen(n)}>{l}</button>)}</div></label>
        <div className="g-row">
          <button className="btn g-btn big" disabled={!picked.length} onClick={start}>{ic('note-pencil')} Start the exam</button>
          <button className="btn g-btn ghost" disabled={!picked.length} onClick={() => downloadBlankPaper(title(), subj, build(), 'paper')}>{ic('download-simple')} Question paper (Word)</button>
          <button className="btn g-btn ghost" disabled={!picked.length} onClick={() => downloadBlankPaper(title(), subj, build(), 'blank')}>{ic('download-simple')} Paper + mark scheme (Word)</button>
        </div>
        {!picked.length && <span className="st-err">Choose at least one chapter.</span>}
      </div>
      {hist.length > 0 && <><h2 className="g-h2">Past papers</h2><div className="st-hist">{hist.map((h, i) => <div key={h.id || i} className="g-card st-hrow" style={{ gridTemplateColumns: '1.2fr 1fr 70px 70px auto' }}><span>{SUBJ_IC[h.subj]} {SUBJ_NM[h.subj]}</span><span className="g-sub">{new Date(h.date).toLocaleDateString()}</span><b>{h.got}/{h.tot}</b><span className={'st-pill ' + (h.pct >= 60 ? 'ok' : 'bad')}>{h.pct}%</span>{h.rows ? <span className="g-row" style={{ gap: 6 }}><button className="g-pill" onClick={() => setRes(h)}>{ic('eye')} Answers</button><button className="g-pill" onClick={() => downloadPaperDoc(h, 'all')}>{ic('download-simple')} Word</button></span> : <span className="g-sub">older paper</span>}</div>)}</div></>}
    </div>
  );
}

/* Revision timetable form: student picks subjects AND the exact chapters (their own syllabus). */
function PlannerPick({ go }) {
  const SUBS = ['maths', 'science', 'computing', 'english', 'french'];
  const [P, setP] = React.useState(() => LS8.get('s8f-plan', null));
  const [date, setDate] = React.useState(() => new Date(Date.now() + 21 * 864e5).toISOString().slice(0, 10));
  const [subs, setSubs] = React.useState(['maths', 'science', 'english']);
  const [picked, setPicked] = React.useState(() => BOOK.filter(c => ['maths', 'science', 'english'].includes(c.subj) && !c.review).map(c => c.id));
  const [open, setOpen] = React.useState('maths');
  const [mins, setMins] = React.useState(30), [rest, setRest] = React.useState([6]), [start, setStart] = React.useState('17:00'), [extras, setExtras] = React.useState({ mix: true, mistakes: true, mocks: true });
  const save = p => { LS8.set('s8f-plan', p); setP(p); };
  const chOfSub = s => BOOK.filter(c => c.subj === s && !c.review);
  const togSub = s => { if (subs.includes(s)) { setSubs(subs.filter(x => x !== s)); setPicked(picked.filter(id => (BOOK.find(c => c.id === id) || {}).subj !== s)); } else { setSubs([...subs, s]); setPicked([...picked, ...chOfSub(s).map(c => c.id)]); setOpen(s); } };
  const togCh = id => setPicked(picked.includes(id) ? picked.filter(x => x !== id) : [...picked, id]);
  const make = () => {
    const chs = picked.map(id => BOOK.find(c => c.id === id)).filter(Boolean);
    // keep the student's own order within each subject, rotate subjects day by day
    const bySub = {}; chs.forEach(c => (bySub[c.subj] = bySub[c.subj] || []).push(c));
    Object.values(bySub).forEach(a => a.sort((x, y) => (parseFloat(x.n) || 0) - (parseFloat(y.n) || 0)));
    const order = subs.filter(k => bySub[k] && bySub[k].length); const seq = [];
    for (let i = 0; order.some(k => bySub[k].length); i++) { const k = order[i % order.length]; if (bySub[k].length) seq.push(bySub[k].shift()); }
    const days = []; const end = new Date(date); let d = new Date(); d.setHours(0, 0, 0, 0);
    const perDay = Math.max(1, Math.floor(mins / 20)); let ci = 0;
    while (d < end && days.length < 180) {
      if (!rest.includes(d.getDay())) {
        const items = []; const leftD = Math.round((end - d) / 864e5);
        if (leftD <= 2 && extras.mocks) items.push({ t: 'Mock exam: ' + SUBJ_NM[order[days.length % Math.max(1, order.length)]], r: 'exam' });
        else {
          for (let k = 0; k < perDay; k++) { const c = seq[ci++ % Math.max(1, seq.length)]; if (c) items.push({ t: c.title, r: 'book:' + c.id }); }
          if (extras.mistakes && days.length % 3 === 2) items.push({ t: 'Fix 5 mistakes', r: 'mistakes' });
          if (extras.mocks && days.length % 7 === 6) items.push({ t: 'Short mock exam', r: 'exam' });
        }
        if (extras.mix) items.unshift({ t: "Today's 10 minutes", r: 'mix' });
        days.push({ d: d.toISOString().slice(0, 10), items: items.map(x => ({ ...x, done: false })) });
      }
      d = new Date(d.getTime() + 864e5);
    }
    save({ exam: date, subs: order, chapters: picked, mins, start, days, made: Date.now() });
  };
  if (P) return <Timetable P={P} save={save} setP={setP} go={go} today={new Date().toISOString().slice(0, 10)} />;
  const nPick = picked.length;
  return (
    <div className="wrap g-page" data-screen-label="Revision planner">
      <PageHead ic={ic('calendar-dots')} title="Revision timetable" sub="You choose what goes in: pick your exam date, your subjects and the exact chapters on your syllabus. I'll turn them into a colourful weekly timetable." grad="linear-gradient(135deg,#ff6f91,#ffb347 45%,#4facfe)" />
      <div className="g-card st-form">
        <label>{ic('calendar')} Exam date<input type="date" className="inp" value={date} min={new Date().toISOString().slice(0, 10)} onChange={e => setDate(e.target.value)} style={{ maxWidth: 220 }} /></label>
        <label>{ic('books')} 1 · Choose your subjects<div className="chips">{SUBS.map(s => <button key={s} className={'chip' + (subs.includes(s) ? ' on' : '')} onClick={() => togSub(s)}>{SUBJ_IC[s]} {SUBJ_NM[s]}</button>)}</div></label>
        {subs.length > 0 && <div className="pk-box">
          <b className="pk-h">{ic('list-checks')} 2 · Tick the chapters on your syllabus <span className="g-sub">({nPick} chosen)</span></b>
          <div className="pk-tabs">{subs.map(s => { const all = chOfSub(s), n = all.filter(c => picked.includes(c.id)).length; return <button key={s} className={'pk-tab' + (open === s ? ' on' : '')} onClick={() => setOpen(s)}>{SUBJ_IC[s]} {SUBJ_NM[s]} <em>{n}/{all.length}</em></button>; })}</div>
          {subs.includes(open) && <>
            <div className="g-row"><button className="g-pill" onClick={() => setPicked([...new Set([...picked, ...chOfSub(open).map(c => c.id)])])}>Select all {SUBJ_NM[open]}</button><button className="g-pill" onClick={() => setPicked(picked.filter(id => (BOOK.find(c => c.id === id) || {}).subj !== open))}>Clear {SUBJ_NM[open]}</button></div>
            <div className="st-hwpick">{chOfSub(open).map(c => <button key={c.id} className={'st-hwc' + (picked.includes(c.id) ? ' on' : '')} onClick={() => togCh(c.id)}><span className="b">{picked.includes(c.id) ? '✓' : ''}</span>{c.subj === 'computing' ? 'Unit ' : 'Ch '}{c.n}. {c.title}</button>)}</div>
          </>}
        </div>}
        <label>{ic('clock')} 3 · Time per day<div className="chips">{[20, 30, 45, 60, 90].map(m => <button key={m} className={'chip' + (mins === m ? ' on' : '')} onClick={() => setMins(m)}>{m} min</button>)}</div></label>
        <label>{ic('bed')} Rest days<div className="chips">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((n, i) => <button key={i} className={'chip' + (rest.includes(i) ? ' on' : '')} onClick={() => setRest(rest.includes(i) ? rest.filter(x => x !== i) : [...rest, i])}>{n}</button>)}</div></label>
        <label>{ic('alarm')} Start time each day<input type="time" className="inp" value={start} onChange={e => setStart(e.target.value || '17:00')} style={{ maxWidth: 180 }} /></label>
        <label>{ic('sparkle')} Extras (optional)<div className="chips">{[['mix', "Today's 10 minutes"], ['mistakes', 'Fix mistakes'], ['mocks', 'Mock exams']].map(([k, l]) => <button key={k} className={'chip' + (extras[k] ? ' on' : '')} onClick={() => setExtras({ ...extras, [k]: !extras[k] })}>{extras[k] ? '✓ ' : ''}{l}</button>)}</div></label>
        <button className="btn g-btn big" disabled={!nPick} onClick={make}>{ic('calendar-dots')} Build my timetable</button>
        {!nPick && <span className="st-err">Tick at least one chapter.</span>}
      </div>
    </div>
  );
}
Object.assign(window, { MockExam2, PlannerPick });
