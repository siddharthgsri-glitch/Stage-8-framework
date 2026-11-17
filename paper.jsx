/* Unit past paper: exam-style questions (hints only) → AI marking → mark scheme + report card → Word download */
const PAPER_LEN = { short: 12, full: 18 };
function paperQs(u) {
  const chs = u.chapters.map(chOf).filter(Boolean); const out = [];
  let r = 0; const per = Math.max(2, Math.ceil(16 / chs.length));
  chs.forEach((c, ci) => {
    const pool = [...(c.challenge || []).map((q, i) => ({ q, k: c.id + '|x|' + i })), ...(c.practice || []).map((q, i) => ({ q, k: c.id + '|p|' + i })), ...c.secs.flatMap((s, si) => (s.check || []).map((q, qi) => ({ q, k: `${c.id}|c|${si}|${qi}` })))];
    const pick = [...pool.filter(p => p.k.includes('|x|')), ...wxShuffle(pool.filter(p => !p.k.includes('|x|')), ci + 3)].slice(0, per);
    pick.forEach(p => out.push({ ...p, ch: c }));
  });
  return out.slice(0, 18).map((p, i) => ({ ...p, n: i + 1, marks: p.q.type === 'mc' ? 1 : p.q.type === 'order' ? 2 : 2 }));
}
const ansText = q => q.type === 'mc' ? q.opts[q.a] : q.type === 'input' ? q.accept[0] + (q.suffix ? ' ' + q.suffix : '') : (q.order || []).map(i => q.items[i]).join(' → ');
const qText = q => typeof q.q === 'string' ? q.q : nodeText(q.q);
function markLocal(item, a) {
  const q = item.q; if (a == null || a === '' ) return 0;
  if (q.type === 'mc') return a === q.a ? item.marks : 0;
  if (q.type === 'order') { const ok = a.filter((v, i) => v === q.order[i]).length; return ok === a.length ? item.marks : ok >= a.length - 2 ? 1 : 0; }
  const n = s => String(s).trim().toLowerCase().replace(/\s+/g, '').replace(/[%°]$/, '');
  if (q.accept.some(x => n(x) === n(a))) return item.marks;
  const num = parseFloat(String(a).replace(/[^\d.\-]/g, '')), exp = parseFloat(String(q.accept[0]).replace(/[^\d.\-]/g, ''));
  if (Number.isFinite(num) && Number.isFinite(exp) && exp !== 0 && Math.abs(num - exp) / Math.abs(exp) < 0.02) return item.marks - 1 || 1;
  return 0;
}
function hintsFor(q) {
  const h = [];
  if (q.h1) h.push(q.h1); else if (q.type === 'mc') h.push('Rule out the options that cannot be true first.'); else if (q.type === 'input') h.push(/^-?\d/.test(String(q.accept[0])) ? 'Write down what you know, then choose the right method or formula.' : 'Think about the key word for this topic.'); else h.push('Find the first step, then the last step.');
  const f = window.SR ? SR.formulasFor(q) : [];
  h.push(q.h2 || (f.length ? `Useful: ${f[0].n}: ${f[0].e}` : 'Look back at the Learn cards for this chapter.'));
  return h;
}

function PaperPage({ uid, go }) {
  const u = UNITS.find(x => x.id === uid);
  if (!u) return <div className="wrap g-page">Unit not found.</div>;
  const prog = progOf(); const done = unitDone(u, prog), ready = done >= u.chapters.length || !!LS8.get('s8f-unlock', {})[u.id];
  const [phase, setPhase] = React.useState('intro'), [items, setItems] = React.useState(null), [ans, setAns] = React.useState({}), [hints, setHints] = React.useState({}), [i, setI] = React.useState(0), [res, setRes] = React.useState(null), [t0, setT0] = React.useState(0);
  const history = LS8.get('s8f-papers', {})[u.id] || [];
  const start = () => { setItems(paperQs(u)); setAns({}); setHints({}); setI(0); setT0(Date.now()); setPhase('sit'); window.scrollTo(0, 0); };
  const submit = async () => {
    setPhase('marking'); window.scrollTo(0, 0);
    const rows = items.map(it => { const a = ans[it.n]; const m = markLocal(it, a); const given = a == null ? '(no answer)' : it.q.type === 'mc' ? it.q.opts[a] : it.q.type === 'order' ? a.map(x => it.q.items[x]).join(' → ') : String(a); return { n: it.n, ch: it.ch.title, chId: it.ch.id, q: qText(it.q), type: it.q.type, opts: it.q.opts, marks: it.marks, got: m, given, correct: ansText(it.q), why: it.q.why, hints: hints[it.n] || 0, k: it.k }; });
    rows.forEach(r => window.SR && SR.record(items.find(x => x.n === r.n).q, r.got === r.marks, r.hints));
    const got = rows.reduce((a, r) => a + r.got, 0), tot = rows.reduce((a, r) => a + r.marks, 0), pct = Math.round(got / tot * 100);
    const byCh = {}; rows.forEach(r => { byCh[r.chId] = byCh[r.chId] || { t: r.ch, got: 0, tot: 0 }; byCh[r.chId].got += r.got; byCh[r.chId].tot += r.marks; });
    const grade = pct >= 85 ? 'A*' : pct >= 75 ? 'A' : pct >= 65 ? 'B' : pct >= 55 ? 'C' : pct >= 45 ? 'D' : 'E';
    let ai = null;
    try {
      const f = window.genspark && window.genspark.complete;
      const out = await f(`You are an experienced Cambridge Lower Secondary Stage 8 ${SUBJ_NAME[u.subj]} teacher writing a report card for a 12-13 year old after a unit past paper on "${u.name}". Score: ${got}/${tot} (${pct}%), grade ${grade}. Hints used: ${rows.reduce((a, r) => a + r.hints, 0)}.\nResults by chapter: ${Object.values(byCh).map(c => `${c.t}: ${c.got}/${c.tot}`).join('; ')}.\nQuestions answered wrongly: ${rows.filter(r => r.got < r.marks).slice(0, 8).map(r => `Q${r.n} (${r.ch}) "${r.q.slice(0, 90)}" student wrote "${String(r.given).slice(0, 40)}", correct "${String(r.correct).slice(0, 40)}"`).join(' | ') || 'none'}.\nReturn ONLY JSON: {"summary":"2-3 sentence overall teacher comment, warm and specific","strengths":["2-3 specific strengths"],"targets":["2-3 specific next steps"],"perQuestion":{"<question number>":"one short sentence of feedback for each wrong question"},"effort":"Excellent|Good|Satisfactory|Needs improvement"}`);
      ai = JSON.parse(String(out).match(/\{[\s\S]*\}/)[0]);
    } catch (e) {
      const strong = Object.values(byCh).filter(c => c.got / c.tot >= 0.7).map(c => c.t), weak = Object.values(byCh).filter(c => c.got / c.tot < 0.5).map(c => c.t);
      ai = { summary: `You scored ${pct}% on the ${u.name} paper. ${pct >= 70 ? 'This is a strong result that shows secure understanding of most of the unit.' : pct >= 50 ? 'You understand the main ideas; a little more practice on the weaker chapters will make a big difference.' : 'Keep going: review the chapters below and try the paper again.'}`, strengths: strong.length ? strong.map(s => 'Secure understanding of ' + s) : ['You attempted every section of the paper'], targets: weak.length ? weak.map(s => 'Revisit the Learn cards and quiz for ' + s) : ['Show full working on multi-step questions'], perQuestion: {}, effort: pct >= 70 ? 'Good' : 'Satisfactory', offline: true };
    }
    const rec = { id: Date.now(), unit: u.id, unitName: u.name, subj: u.subj, date: Date.now(), got, tot, pct, grade, byCh, rows, ai, time: Math.round((Date.now() - t0) / 1000), student: (S8AUTH.user() || {}).name || 'Student', cls: (S8AUTH.user() || {}).cls || '' };
    const all = LS8.get('s8f-papers', {}); all[u.id] = [rec, ...(all[u.id] || [])].slice(0, 10); LS8.set('s8f-papers', all);
    GAME.award(30 + Math.round(pct / 2), 20 + Math.round(pct / 4), 'Past paper marked'); if (pct >= 75) GAME.confetti();
    setRes(rec); setPhase('result');
  };

  if (phase === 'intro') return (
    <div className="wrap g-page pp" data-screen-label={'Paper ' + u.id}>
      <button className="btn g-btn ghost small" style={{ margin: '12px 0' }} onClick={() => go('subject:' + u.subj)}>← {SUBJ_NAME[u.subj]}</button>
      <div className="pp-hero"><div className="pp-hero-ic">{ic('exam')}</div><div><small>{SUBJ_NAME[u.subj]} · Unit past paper</small><h1>{u.name}</h1><p>Exam-style questions from every chapter in this unit. You can use <b>hints</b>, but answers are never shown. When you hand in, the AI examiner marks your paper and writes your report card. You can download the question paper and mark scheme as a Word document.</p></div></div>
      <div className="pp-req">{u.chapters.map(id => { const c = chOf(id), ok = chComplete(id, prog); return <div key={id} className={'pp-ch' + (ok ? ' ok' : '')}><span>{ic(ok ? 'check-circle' : 'lock')}</span><b>{c.title}</b><small>{ok ? 'Complete' : 'Beat the boss to complete'}</small></div>; })}</div>
      {ready ? <div className="g-row" style={{ justifyContent: 'center', margin: '20px 0' }}><button className="btn g-btn big" onClick={start}>{ic('note-pencil')} Start the paper</button></div>
        : <div className="pp-locked"><span>{ic('lock')}</span><div><b>Locked: {u.chapters.length - done} chapter{u.chapters.length - done > 1 ? 's' : ''} to go</b><p className="g-sub">Complete every chapter in this unit (finish all topics and beat the boss) to unlock the past paper.</p></div>{window.TEACHER8 && TEACHER8.unlocked() && <button className="btn g-btn ghost small" onClick={() => { const x = LS8.get('s8f-unlock', {}); x[u.id] = 1; LS8.set('s8f-unlock', x); location.reload(); }}>Teacher: unlock</button>}</div>}
      {history.length > 0 && <><h2 className="g-h2">Past attempts</h2><div className="st-hist">{history.map(h => <button key={h.id} className="g-card st-hrow" style={{ border: 0, textAlign: 'left', cursor: 'pointer' }} onClick={() => { setRes(h); setPhase('result'); }}><span>{new Date(h.date).toLocaleDateString()}</span><span className="g-sub">{h.got}/{h.tot} marks</span><b>Grade {h.grade}</b><span className={'st-pill ' + (h.pct >= 55 ? 'ok' : 'bad')}>{h.pct}%</span></button>)}</div></>}
    </div>
  );
  if (phase === 'marking') return <div className="wrap g-page"><div className="pp-marking"><div className="pp-spin">{ic('note-pencil')}</div><h2>The examiner is marking your paper…</h2><p className="g-sub">Checking every answer against the mark scheme and writing your report card.</p></div></div>;
  if (phase === 'result') return <PaperResult rec={res} u={u} go={go} again={start} />;

  const it = items[i], q = it.q, a = ans[it.n], h = hints[it.n] || 0, hs = hintsFor(q);
  const setA = v => setAns({ ...ans, [it.n]: v });
  const answered = Object.keys(ans).length;
  const ord = a || (q.items ? q.items.map((_, k) => k) : []);
  return (
    <div className="wrap g-page pp" data-screen-label={'Paper sit ' + u.id}>
      <div className="pp-sheet">
        <div className="pp-sh-top"><div><small>Cambridge Lower Secondary · Stage 8 · {SUBJ_NAME[u.subj]}</small><b>{u.name}: Past paper</b></div><div className="pp-meta"><span>{answered}/{items.length} answered</span><span>{items.reduce((x, y) => x + y.marks, 0)} marks</span></div></div>
        <div className="pp-nav">{items.map((x, k) => <button key={x.n} className={(k === i ? 'cur ' : '') + (ans[x.n] != null ? 'ans' : '')} onClick={() => setI(k)}>{x.n}</button>)}</div>
        <div className="pp-q">
          <div className="pp-qh"><span className="pp-qn">{it.n}</span><span className="pp-from">{it.ch.title}</span><span className="pp-mk">[{it.marks} mark{it.marks > 1 ? 's' : ''}]</span></div>
          <div className="pp-qt">{q.q}</div>
          {q.quote && <div className="quote">{q.quote}</div>}
          {q.type === 'mc' && <div className="pp-opts">{q.opts.map((o, k) => <button key={k} className={'pp-opt' + (a === k ? ' on' : '')} onClick={() => setA(k)}><span>{'ABCD'[k]}</span>{o}</button>)}</div>}
          {q.type === 'input' && <div className="pp-line"><input className="inp" value={a || ''} onChange={e => setA(e.target.value)} placeholder="Write your answer" />{q.suffix && <span>{q.suffix}</span>}</div>}
          {q.type === 'order' && <ol className="order-list">{ord.map((idx, k) => <li key={idx} className="order-item"><span className="pos">{k + 1}</span>{q.items[idx]}<span className="mv"><button disabled={k === 0} onClick={() => { const n = ord.slice(); [n[k], n[k - 1]] = [n[k - 1], n[k]]; setA(n); }}>↑</button><button disabled={k === ord.length - 1} onClick={() => { const n = ord.slice(); [n[k], n[k + 1]] = [n[k + 1], n[k]]; setA(n); }}>↓</button></span></li>)}</ol>}
          <div className="pp-hints">{hs.slice(0, h).map((x, k) => <div key={k} className={'gq-hint h' + (k + 1)}><span className="gq-hl">{ic('lightbulb')} Hint {k + 1}</span><span>{x}</span></div>)}{h < hs.length && <button className="g-pill" onClick={() => setHints({ ...hints, [it.n]: h + 1 })}>{ic('lightbulb')} {h === 0 ? 'Show a hint' : 'Another hint'}</button>}{h >= hs.length && <span className="g-sub">No more hints. Answers are never shown during the paper.</span>}</div>
        </div>
        <div className="pp-foot"><button className="btn g-btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}>← Previous</button>{i < items.length - 1 ? <button className="btn g-btn" onClick={() => setI(i + 1)}>Next →</button> : <button className="btn g-btn big" onClick={() => { if (answered < items.length && !confirm(`You have answered ${answered} of ${items.length}. Hand in anyway?`)) return; submit(); }}>{ic('check-circle')} Hand in for marking</button>}</div>
      </div>
    </div>
  );
}

function PaperResult({ rec, u, go, again }) {
  const ai = rec.ai || {};
  const rows = Object.entries(rec.byCh);
  return (
    <div className="wrap g-page pp" data-screen-label="Paper result">
      <div className="st-noprint g-row" style={{ margin: '12px 0' }}><button className="btn g-btn ghost small" onClick={() => go('subject:' + u.subj)}>← {SUBJ_NAME[u.subj]}</button><button className="btn g-btn" onClick={() => downloadPaperDoc(rec, 'all')}>{ic('download-simple')} Download Word document</button><button className="btn g-btn ghost" onClick={() => downloadPaperDoc(rec, 'report')}>{ic('certificate')} Report card only</button><button className="btn g-btn ghost" onClick={() => window.print()}>{ic('printer')} Print</button><button className="btn g-btn ghost" onClick={again}>{ic('repeat')} Try again</button></div>
      <div className="rc">
        <div className="rc-head"><div><small>REPORT CARD · UNIT PAST PAPER</small><h1>{rec.unitName}</h1><span>{rec.student}{rec.cls ? ' · Class ' + rec.cls : ''} · {SUBJ_NAME[rec.subj]} · {new Date(rec.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span></div><div className="rc-grade"><b>{rec.grade}</b><small>Grade</small></div></div>
        <div className="rc-kpi"><div><b>{rec.got}/{rec.tot}</b><small>Marks</small></div><div><b>{rec.pct}%</b><small>Score</small></div><div><b>{ai.effort || '–'}</b><small>Effort</small></div><div><b>{rec.rows.reduce((a, r) => a + r.hints, 0)}</b><small>Hints used</small></div><div><b>{Math.round(rec.time / 60)} min</b><small>Time</small></div></div>
        <div className="rc-comment"><span className="rc-ic">{ic('chat-circle-text')}</span><div><b>Examiner's comment</b><p>{ai.summary}</p></div></div>
        <div className="st-sw"><div><h3>{ic('star')} Strengths</h3><ul>{(ai.strengths || []).map((x, k) => <li key={k}>{x}</li>)}</ul></div><div><h3>{ic('target')} Next steps</h3><ul>{(ai.targets || []).map((x, k) => <li key={k}>{x}</li>)}</ul></div></div>
        <h3>Marks by chapter</h3>
        <div className="st-bars">{rows.map(([id, r]) => <div key={id} className="st-bar"><span>{r.t}</span><i><em style={{ width: r.got / r.tot * 100 + '%', background: r.got / r.tot >= .7 ? '#43c463' : r.got / r.tot >= .5 ? '#ffc75f' : '#ff6b6b' }} /></i><b>{r.got}/{r.tot}</b></div>)}</div>
        <h3>Mark scheme & your answers</h3>
        <table className="st-rt rc-ms"><thead><tr><th>Q</th><th>Question</th><th>Your answer</th><th>Mark scheme</th><th>Marks</th></tr></thead><tbody>{rec.rows.map(r => <tr key={r.n} className={r.got === r.marks ? 'ok' : r.got ? 'part' : 'bad'}><td><b>{r.n}</b></td><td>{r.q}<small className="g-sub" style={{ display: 'block' }}>{r.ch}</small></td><td>{r.given}</td><td><b>{r.correct}</b><small style={{ display: 'block' }}>{r.why}</small>{(ai.perQuestion || {})[r.n] && <small className="rc-fb">{ic('pen-nib')} {(ai.perQuestion || {})[r.n]}</small>}</td><td><span className="rc-mk">{r.got}/{r.marks}</span></td></tr>)}</tbody></table>
        {ai.offline && <p className="g-sub">The AI examiner was unavailable, so these comments were generated automatically from your marks.</p>}
      </div>
    </div>
  );
}

/* ---------- Word (.doc) export ---------- */
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function downloadPaperDoc(rec, which) {
  const ai = rec.ai || {};
  const css = `body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1d1830}h1{font-size:20pt;margin:0 0 4pt}h2{font-size:15pt;border-bottom:2px solid #1d1830;padding-bottom:3pt;margin-top:18pt}h3{font-size:12pt;margin:12pt 0 4pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:5pt;vertical-align:top;font-size:10.5pt}th{background:#efeaf7;text-align:left}.small{color:#5b5170;font-size:9.5pt}.q{margin:0 0 12pt}.box{border:1px solid #888;height:28pt;margin-top:4pt}.mk{float:right;font-weight:bold}.kpi td{text-align:center;font-size:13pt;font-weight:bold}.pb{page-break-before:always}`;
  const head = `<p class="small">Cambridge Lower Secondary · Stage 8 · ${esc(SUBJ_NAME[rec.subj])}</p>`;
  const paper = `${head}<h1>${esc(rec.unitName)}: Past paper</h1><p>Name: ________________________ &nbsp; Class: ________ &nbsp; Date: ____________</p><p class="small">Answer all questions. Total: ${rec.tot} marks.</p>` + rec.rows.map(r => `<div class="q"><p><b>${r.n}.</b> ${esc(r.q)} <span class="mk">[${r.marks}]</span></p>${r.type === 'mc' && r.opts ? '<p>' + r.opts.map((o, k) => `${'ABCD'[k]}) ${esc(o)}`).join(' &nbsp;&nbsp; ') + '</p>' : '<div class="box"></div>'}</div>`).join('');
  const ms = `<h1 class="pb">${esc(rec.unitName)}: Mark scheme</h1>${head}<table><tr><th>Q</th><th>Answer</th><th>Guidance</th><th>Marks</th></tr>${rec.rows.map(r => `<tr><td>${r.n}</td><td><b>${esc(r.correct)}</b></td><td>${esc(r.why)}${r.marks > 1 ? '<br><span class="small">Award 1 mark for correct method or a partly correct answer.</span>' : ''}</td><td>${r.marks}</td></tr>`).join('')}</table>`;
  const rep = `<h1 class="${which === 'report' ? '' : 'pb'}">Report card: ${esc(rec.unitName)}</h1>${head}<p><b>Student:</b> ${esc(rec.student)} ${rec.cls ? '&nbsp; <b>Class:</b> ' + esc(rec.cls) : ''} &nbsp; <b>Date:</b> ${new Date(rec.date).toLocaleDateString()}</p><table class="kpi"><tr><td>${rec.got}/${rec.tot}<br><span class="small">Marks</span></td><td>${rec.pct}%<br><span class="small">Score</span></td><td>${rec.grade}<br><span class="small">Grade</span></td><td>${esc(ai.effort || '-')}<br><span class="small">Effort</span></td></tr></table><h3>Examiner's comment</h3><p>${esc(ai.summary)}</p><h3>Strengths</h3><ul>${(ai.strengths || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul><h3>Next steps</h3><ul>${(ai.targets || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul><h3>Marks by chapter</h3><table><tr><th>Chapter</th><th>Marks</th><th>%</th></tr>${Object.values(rec.byCh).map(c => `<tr><td>${esc(c.t)}</td><td>${c.got}/${c.tot}</td><td>${Math.round(c.got / c.tot * 100)}%</td></tr>`).join('')}</table><h3>Your answers</h3><table><tr><th>Q</th><th>Your answer</th><th>Correct answer</th><th>Feedback</th><th>Marks</th></tr>${rec.rows.map(r => `<tr><td>${r.n}</td><td>${esc(r.given)}</td><td>${esc(r.correct)}</td><td>${esc((ai.perQuestion || {})[r.n] || (r.got === r.marks ? 'Correct.' : r.why))}</td><td>${r.got}/${r.marks}</td></tr>`).join('')}</table><p style="margin-top:24pt">Teacher signature: ______________________ &nbsp;&nbsp; Parent signature: ______________________</p>`;
  const body = which === 'report' ? rep : paper + ms + rep;
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${esc(rec.unitName)}</title><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]--><style>${css}</style></head><body>${body}</body></html>`;
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${rec.unitName.replace(/[^a-z0-9]+/gi, '-')}-${which === 'report' ? 'report-card' : 'past-paper'}.doc`; document.body.appendChild(a); a.click(); a.remove();
}

Object.assign(window, { PaperPage, PaperResult, downloadPaperDoc });
