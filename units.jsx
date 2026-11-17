/* Units, 60-second explainer videos, unit headers */
const UNITS = [
  { id: 'm-num', subj: 'maths', name: 'Number', chapters: ['m1', 'm4', 'm7', 'm10', 'm13', 'm16', 'm19', 'm22'] },
  { id: 'm-alg', subj: 'maths', name: 'Algebra', chapters: ['m5', 'm9', 'm14', 'm20', 'm23'] },
  { id: 'm-geo', subj: 'maths', name: 'Geometry and measure', chapters: ['m2', 'm6', 'm11', 'm15', 'm18', 'm25'] },
  { id: 'm-sta', subj: 'maths', name: 'Statistics and probability', chapters: ['m3', 'm8', 'm12', 'm17', 'm21', 'm24'] },
  { id: 's-bio', subj: 'science', name: 'Biology', chapters: ['s1', 's2', 's3'], extra: ['sr1'] },
  { id: 's-che', subj: 'science', name: 'Chemistry', chapters: ['s4', 's5', 's6', 'sL', 'sG'], extra: ['sr2'] },
  { id: 's-phy', subj: 'science', name: 'Physics', chapters: ['s7', 's8', 's9', 's10'], extra: ['sr3'] },
  { id: 's-ear', subj: 'science', name: 'Earth and space', chapters: ['s11', 's12'], extra: ['sr4'] },
  { id: 'c-sys', subj: 'computing', name: 'Networks and computer systems', chapters: ['c1', 'c3'] },
  { id: 'c-prg', subj: 'computing', name: 'Algorithms and programming', chapters: ['c2', 'c4', 'c6'] },
  { id: 'c-dat', subj: 'computing', name: 'Managing data', chapters: ['c5'] },
  { id: 'e-rea', subj: 'english', name: 'Reading', chapters: ['e1', 'e3', 'e4'] },
  { id: 'e-wri', subj: 'english', name: 'Writing', chapters: ['e2', 'e5', 'e6', 'e7'] },
  { id: 'e-spk', subj: 'english', name: 'Speaking and listening', chapters: ['e8'] },
  { id: 'f-me', subj: 'french', name: 'Me and my world', chapters: ['f1', 'f2', 'f3'] },
  { id: 'f-out', subj: 'french', name: 'Out and about', chapters: ['f4', 'f5', 'f6'] },
  { id: 'f-wid', subj: 'french', name: 'The wider world', chapters: ['f7', 'f8'] },
];
const SUBJ_ICN = { maths: 'calculator', science: 'flask', computing: 'laptop', english: 'books', french: 'translate' };
const SCENE_ICN = { maths: ['function', 'percent', 'ruler', 'pi', 'chart-bar', 'calculator'], science: ['flask', 'atom', 'dna', 'magnet', 'planet', 'drop', 'leaf', 'thermometer'], computing: ['laptop', 'robot', 'bug', 'lock', 'chart-bar', 'brain'], english: ['book-open', 'pen-nib', 'quotes', 'chat-circle-text', 'books', 'note-pencil'], french: ['translate', 'chat-circle-text', 'globe-hemisphere-east', 'book-open', 'pen-nib', 'speaker-high'] };
const unitOf = chId => UNITS.find(u => u.chapters.includes(chId) || (u.extra || []).includes(chId));
const chOf = id => BOOK.find(c => c.id === id);
const progOf = () => LS8.get('s8f-progress', {});
const chComplete = (id, prog) => !!((((prog || progOf()).book || {})[id] || {}).medal);
const unitDone = (u, prog) => u.chapters.filter(id => chComplete(id, prog)).length;

function nodeText(n) {
  if (n == null || n === false || n === true) return '';
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(nodeText).join('');
  if (n.props) return nodeText(n.props.children);
  return '';
}
const first = s => String(s || '').split(/(?<=[.!?])\s/)[0];

/* ---------- scene builders ---------- */
function topicScenes(ch, sec) {
  const pool = SCENE_ICN[ch.subj] || SCENE_ICN.maths;
  const S = [{ k: 'Topic ' + sec.n, h: sec.t, sub: (window.SUBJ_NAME || {})[ch.subj] + ' · ' + ch.title, say: `Topic ${sec.n}: ${sec.t}. Here is the big picture in about a minute.`, icn: SUBJ_ICN[ch.subj], kind: 'title' }];
  (sec.notice || []).forEach((n, i) => { const t = nodeText(n); S.push({ k: ['The big idea', 'Look closer', 'Remember this'][i] || 'Key point', h: t, say: t, icn: pool[i % pool.length], kind: 'point', n: i + 1 }); });
  const fs = window.secFormulas ? secFormulas(ch, sec.n) : [];
  if (fs.length) S.push({ k: fs[0].rule ? 'The rule' : 'The formula', h: fs[0].e, sub: fs[0].n + (fs[0].ex ? ' · e.g. ' + fs[0].ex : ''), say: `${fs[0].n}. ${fs[0].e.replace(/·/g, ',')}`, icn: 'function', kind: 'formula' });
  const q = (sec.check || [])[0];
  if (q && typeof q.q === 'string') { const a = q.type === 'mc' ? q.opts[q.a] : q.type === 'input' ? q.accept[0] : ''; S.push({ k: 'Quick example', h: q.q, sub: a ? 'Answer: ' + a : '', say: `Quick example. ${q.q} The answer is ${a}. ${first(q.why)}`, icn: 'lightbulb', kind: 'example' }); }
  S.push({ k: 'Your turn', h: 'Explore the models, then take the quiz', sub: 'Win up to 3 stars', say: 'Now it is your turn. Explore the models, then take the quiz to win up to three stars!', icn: 'rocket', kind: 'outro' });
  return S;
}
function reviewScenes(ch) {
  const pool = SCENE_ICN[ch.subj] || SCENE_ICN.maths;
  const S = [{ k: 'End of stage review', h: ch.title, sub: (window.SUBJ_NAME || {})[ch.subj] + ' review in 60 seconds', say: `${ch.title}. Here are the big ideas to remember before the boss.`, icn: SUBJ_ICN[ch.subj], kind: 'title' }];
  [...(ch.challenge || []), ...(ch.practice || [])].filter(q => typeof q.q === 'string').slice(0, 4).forEach((q, i) => { const a = q.type === 'mc' ? q.opts[q.a] : q.type === 'input' ? q.accept[0] : ''; S.push({ k: 'Remember ' + (i + 1), h: first(q.why) || q.q, sub: a ? q.q + ' → ' + a : '', say: first(q.why) || q.q, icn: pool[i % pool.length], kind: 'point', n: i + 1 }); });
  S.push({ k: 'Your mission', h: 'Beat the review boss', sub: 'Win a medal to complete the review', say: 'Now beat the review boss and win a medal!', icn: 'trophy', kind: 'outro' });
  return S;
}
function chapterScenes(ch) {
  if (!ch.secs.length) return reviewScenes(ch);
  const pool = SCENE_ICN[ch.subj] || SCENE_ICN.maths;
  const S = [{ k: (ch.subj === 'computing' ? 'Unit ' : 'Chapter ') + ch.n, h: ch.title, sub: 'The whole chapter in 60 seconds', say: `${ch.title}. Here is the whole chapter in sixty seconds.`, icn: SUBJ_ICN[ch.subj], kind: 'title' }];
  if (ch.secs.length) S.push({ k: 'In this chapter', h: ch.secs.map(s => s.n + '  ' + s.t).join('\n'), say: `There are ${ch.secs.length} topics: ${ch.secs.map(s => s.t).join(', ')}.`, icn: 'list-checks', kind: 'list' });
  (ch.recap.points || []).slice(0, 4).forEach((p, i) => S.push({ k: 'Key idea ' + (i + 1), h: p, say: p, icn: pool[i % pool.length], kind: 'point', n: i + 1 }));
  if ((ch.recap.terms || []).length) S.push({ k: 'Key words', h: ch.recap.terms.slice(0, 4).map(t => t[0]).join('  ·  '), sub: ch.recap.terms[0][0] + ': ' + ch.recap.terms[0][1], say: 'Key words to know: ' + ch.recap.terms.slice(0, 4).map(t => t[0]).join(', ') + '.', icn: 'book-open', kind: 'formula' });
  S.push({ k: 'Your mission', h: 'Finish every topic, practise, then beat the boss', sub: 'The treasure chest opens when the chapter is complete', say: 'Your mission: finish every topic, practise, then beat the boss to open the treasure chest.', icn: 'trophy', kind: 'outro' });
  return S;
}
function unitScenes(u) {
  const chs = u.chapters.map(chOf).filter(Boolean);
  const pool = SCENE_ICN[u.subj] || SCENE_ICN.maths;
  const S = [{ k: 'Unit', h: u.name, sub: (window.SUBJ_NAME || {})[u.subj] + ' · ' + chs.length + ' chapter' + (chs.length > 1 ? 's' : ''), say: `Welcome to the ${u.name} unit. Here is what you will learn, in one minute.`, icn: SUBJ_ICN[u.subj], kind: 'title' }];
  chs.slice(0, 6).forEach((c, i) => S.push({ k: (u.subj === 'computing' ? 'Unit ' : 'Chapter ') + c.n, h: c.title, sub: c.recap.points[0], say: `${c.title}. ${c.recap.points[0]}`, icn: pool[i % pool.length], kind: 'point', n: i + 1 }));
  S.push({ k: 'Unit past paper', h: 'Complete every chapter to unlock the past paper', sub: 'Exam-style questions, hints, a mark scheme and a report card', say: 'When you complete every chapter, you unlock the unit past paper, with a mark scheme and your own report card.', icn: 'exam', kind: 'outro' });
  return S;
}

/* ---------- player ---------- */
function ExplainerVideo({ scenes, vkey, onEnd, compact }) {
  const dur = React.useMemo(() => { const d = scenes.map(s => Math.max(6, (String(s.say).split(/\s+/).length / 2.5) + 1.8)); const tot = d.reduce((a, b) => a + b, 0); const k = tot < 50 ? 50 / tot : 1; return d.map(x => x * k); }, [scenes]);
  const total = dur.reduce((a, b) => a + b, 0);
  const starts = dur.reduce((a, d, i) => (a.push(i ? a[i - 1] + dur[i - 1] : 0), a), []);
  const [t, setT] = React.useState(0), [play, setPlay] = React.useState(false), [cc, setCc] = React.useState(true), [mute, setMute] = React.useState(false), [ended, setEnded] = React.useState(false);
  const si = Math.min(scenes.length - 1, starts.filter(s => s <= t + 0.001).length - 1);
  const S = scenes[si];
  const last = React.useRef(-1), raf = React.useRef(0), t0 = React.useRef(0);
  React.useEffect(() => {
    if (!play) { cancelAnimationFrame(raf.current); return; }
    t0.current = performance.now() - t * 1000;
    const tick = now => { const nt = (now - t0.current) / 1000; if (nt >= total) { setT(total); setPlay(false); setEnded(true); finish(); return; } setT(nt); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [play]);
  React.useEffect(() => {
    if (!play || mute || !window.speechSynthesis) return;
    if (last.current === si) return; last.current = si;
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(S.say); u.lang = 'en-GB'; u.rate = 1; speechSynthesis.speak(u);
  }, [si, play, mute]);
  React.useEffect(() => { if (!play && window.speechSynthesis) { speechSynthesis.cancel(); last.current = -1; } }, [play]);
  React.useEffect(() => () => { cancelAnimationFrame(raf.current); window.speechSynthesis && speechSynthesis.cancel(); }, []);
  const finish = () => { const w = LS8.get('s8f-videos', {}); if (!w[vkey]) { w[vkey] = Date.now(); LS8.set('s8f-videos', w); GAME.award(10, 5, 'Video watched'); } onEnd && onEnd(); };
  const seek = e => { const r = e.currentTarget.getBoundingClientRect(); const nt = Math.max(0, Math.min(total - 0.1, (e.clientX - r.left) / r.width * total)); setT(nt); t0.current = performance.now() - nt * 1000; last.current = -1; setEnded(false); };
  const go = i => { const nt = starts[i] + 0.01; setT(nt); t0.current = performance.now() - nt * 1000; last.current = -1; setEnded(false); };
  const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  const local = t - starts[si], lp = Math.min(1, local / dur[si]);
  const watched = !!LS8.get('s8f-videos', {})[vkey];
  return (
    <div className={'xv' + (compact ? ' compact' : '')}>
      <div className={'xv-stage k-' + S.kind} onClick={() => { if (ended) { go(0); setPlay(true); } else setPlay(!play); }}>
        <div className="xv-bg"><i /><i /><i /><i /></div>
        <div className="xv-grid" />
        <div key={si} className="xv-scene">
          <div className="xv-icon"><span>{ic(S.icn)}</span></div>
          <div className="xv-k">{S.n ? <b>{S.n}</b> : null}{S.k}</div>
          <div className={'xv-h' + (String(S.h).length > 90 ? ' long' : '') + (S.kind === 'formula' ? ' eq' : '')}>{String(S.h).split('\n').map((line, li) => <div key={li} className="xv-line" style={{ animationDelay: (0.15 + li * 0.25) + 's' }}>{line}</div>)}</div>
          {S.sub && <div className="xv-sub">{S.sub}</div>}
        </div>
        <div className="xv-brand"><span>{ic('play-circle')}</span> Stage 8 explainer</div>
        {cc && play && <div className="xv-cc">{S.say}</div>}
        {!play && <div className="xv-overlay"><button className="xv-big" aria-label="Play">{ic(ended ? 'arrow-counter-clockwise' : 'play')}</button><span>{ended ? 'Watch again' : t > 0 ? 'Paused' : `Play · ${fmt(total)}`}</span></div>}
      </div>
      <div className="xv-ctl">
        <button className="xv-b" onClick={() => { if (ended) { go(0); } setPlay(!play); }}>{ic(play ? 'pause' : 'play')}</button>
        <button className="xv-b" onClick={() => go(Math.max(0, si - 1))} title="Previous">{ic('skip-back')}</button>
        <button className="xv-b" onClick={() => go(Math.min(scenes.length - 1, si + 1))} title="Next">{ic('skip-forward')}</button>
        <div className="xv-bar" onClick={seek}>{scenes.map((_, i) => <i key={i} style={{ width: dur[i] / total * 100 + '%' }}><em style={{ width: (i < si ? 1 : i === si ? lp : 0) * 100 + '%' }} /></i>)}</div>
        <span className="xv-time">{fmt(t)} / {fmt(total)}</span>
        <button className={'xv-b' + (cc ? ' on' : '')} onClick={() => setCc(!cc)} title="Captions">{ic('closed-captioning')}</button>
        <button className={'xv-b' + (mute ? '' : ' on')} onClick={() => { setMute(!mute); window.speechSynthesis && speechSynthesis.cancel(); last.current = -1; }} title="Narration">{ic(mute ? 'speaker-slash' : 'speaker-high')}</button>
        {watched && <span className="xv-done">{ic('check-circle')} Watched</span>}
      </div>
    </div>
  );
}
function VideoModal({ title, scenes, vkey, onClose }) {
  React.useEffect(() => { const k = e => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, []);
  return <div className="g-modal-bg xv-modal" onClick={onClose}><div className="xv-mbox" onClick={e => e.stopPropagation()}><div className="xv-mh"><b>{title}</b><button className="xv-b" onClick={onClose}>{ic('x')}</button></div><ExplainerVideo scenes={scenes} vkey={vkey} /></div></div>;
}
function TopicVideo({ ch, sec, onNext }) {
  const sc = React.useMemo(() => topicScenes(ch, sec), [ch.id, sec.n]);
  return <div className="xv-wrap"><ExplainerVideo scenes={sc} vkey={'t:' + ch.id + ':' + sec.n} /><div className="g-row" style={{ justifyContent: 'space-between' }}><span className="g-sub">{ic('lightbulb')} Watch the 1-minute explainer, then work through the Learn cards.</span><button className="btn g-btn" onClick={onNext}>Next: Learn cards →</button></div></div>;
}
function ChapterVideoCard({ ch }) {
  const [open, setOpen] = React.useState(false);
  const watched = !!LS8.get('s8f-videos', {})['c:' + ch.id];
  return <>
    <button className="xv-card" onClick={() => setOpen(true)}><span className="xv-card-play">{ic('play')}</span><span><b>{ch.subj === 'computing' ? 'Unit' : 'Chapter'} in 60 seconds</b><small>{watched ? ic('check-circle') + ' Watched · watch again' : 'A quick animated overview before you start'}</small></span></button>
    {open && <VideoModal title={ch.title} scenes={chapterScenes(ch)} vkey={'c:' + ch.id} onClose={() => setOpen(false)} />}
  </>;
}

function ChapterVideoBtn({ ch }) {
  const [open, setOpen] = React.useState(false);
  const watched = !!LS8.get('s8f-videos', {})['c:' + ch.id];
  return <>
    <span role="button" tabIndex={0} className={'xv-chip' + (watched ? ' done' : '')} onClick={e => { e.stopPropagation(); setOpen(true); }} onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); setOpen(true); } }}><i>{ic(watched ? 'check-circle' : 'play')}</i>{watched ? 'Watched' : '60-second video'}</span>
    {open && <span onClick={e => e.stopPropagation()}><VideoModal title={(window.SUBJ_NAME || {})[ch.subj] + ' · ' + ch.title} scenes={chapterScenes(ch)} vkey={'c:' + ch.id} onClose={() => setOpen(false)} /></span>}
  </>;
}

/* ---------- Video library: every subject, every chapter ---------- */
function VideoLibrary({ go }) {
  const subs = ['maths', 'science', 'computing', 'english', 'french'];
  const [s, setS] = React.useState(() => localStorage.getItem('s8f-vidsub') || 'maths');
  const [open, setOpen] = React.useState(null);
  React.useEffect(() => { localStorage.setItem('s8f-vidsub', s); }, [s]);
  const W = LS8.get('s8f-videos', {});
  const chs = BOOK.filter(c => c.subj === s);
  const seen = chs.filter(c => W['c:' + c.id]).length;
  return (
    <div className={'wrap g-page subj-' + s} data-screen-label="Video library">
      <div className="g-welcome vl-head" style={{ background: 'linear-gradient(135deg, #231a3f, color-mix(in oklab, var(--acc) 70%, #231a3f))' }}>
        <div style={{ fontSize: 52 }}>{ic('monitor-play')}</div>
        <h1>Chapter videos</h1>
        <p>A 60-second animated explainer for every chapter in every subject. Watch one before you start a chapter, or use them to revise.</p>
        <b>{seen} / {chs.length} {(window.SUBJ_NAME || {})[s]} videos watched</b>
      </div>
      <div className="vl-tabs">{subs.map(x => <button key={x} className={'vl-tab subj-' + x + (s === x ? ' on' : '')} onClick={() => setS(x)}><span>{ic(SUBJ_ICN[x])}</span>{(window.SUBJ_NAME || {})[x]}<small>{BOOK.filter(c => c.subj === x && W['c:' + c.id]).length}/{BOOK.filter(c => c.subj === x).length}</small></button>)}</div>
      <div className="vl-grid">{chs.map(c => { const w = !!W['c:' + c.id]; const sc = chapterScenes(c); return (
        <button key={c.id} className={'vl-card ' + (window.bookCls ? bookCls(c) : '') + (w ? ' done' : '')} onClick={() => setOpen(c)}>
          <div className="vl-thumb"><div className="vl-ic">{ic(SUBJ_ICN[c.subj])}</div><span className="vl-play">{ic('play')}</span><span className="vl-num">{c.review ? 'Review' : (c.subj === 'computing' ? 'Unit ' : 'Ch ') + c.n}</span>{w && <span className="vl-w">{ic('check-circle')} Watched</span>}</div>
          <div className="vl-info"><b>{c.title}</b><small>{sc.length} scenes · about 1 min</small></div>
        </button>); })}</div>
      {open && <VideoModal title={(window.SUBJ_NAME || {})[open.subj] + ' · ' + open.title} scenes={chapterScenes(open)} vkey={'c:' + open.id} onClose={() => setOpen(null)} />}
    </div>
  );
}

/* ---------- unit header on the subject page ---------- */
function UnitBlock({ u, prog, go }) {
  const [open, setOpen] = React.useState(false);
  const done = unitDone(u, prog), n = u.chapters.length, ready = done >= n || !!LS8.get('s8f-unlock', {})[u.id];
  const papers = (LS8.get('s8f-papers', {})[u.id] || []);
  const best = papers.length ? Math.max(...papers.map(p => p.pct)) : null;
  const chs = [...u.chapters, ...(u.extra || [])].map(chOf).filter(Boolean);
  const watched = !!LS8.get('s8f-videos', {})['u:' + u.id];
  return (
    <section className="un-block">
      <div className="un-head">
        <div className="un-ic">{ic(SUBJ_ICN[u.subj])}</div>
        <div className="un-t"><small>Unit</small><h2>{u.name}</h2><div className="un-prog"><i><em style={{ width: done / n * 100 + '%' }} /></i><span>{done} / {n} chapters complete</span></div></div>
        <div className="un-acts">
          <button className={'un-btn paper' + (ready ? '' : ' locked')} onClick={() => go('paper:' + u.id)}><span>{ic(ready ? 'exam' : 'lock')}</span><b>Past paper</b><small>{best != null ? 'Best ' + best + '%' : ready ? 'Ready!' : `${n - done} to go`}</small></button>
        </div>
      </div>
      <BookList chapters={chs} prog={prog} go={go} />
    </section>
  );
}

Object.assign(window, { ChapterVideoBtn, VideoLibrary, chapterScenes, UNITS, unitOf, chComplete, unitDone, nodeText, ExplainerVideo, VideoModal, TopicVideo, ChapterVideoCard, UnitBlock, SUBJ_ICN, chOf });
