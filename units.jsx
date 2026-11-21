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

/* ---------- narration helpers ---------- */
const speakable = s => String(s || '')
  .replace(/→/g, ' gives ').replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/−/g, ' minus ')
  .replace(/\s=\s/g, ' equals ').replace(/²/g, ' squared').replace(/³/g, ' cubed').replace(/√/g, 'square root of ')
  .replace(/(\d)\s*%/g, '$1 percent').replace(/°C/g, ' degrees Celsius').replace(/°/g, ' degrees')
  .replace(/\bcm³/g, 'cubic centimetres').replace(/\bm\/s\b/g, 'metres per second').replace(/\bkm\/h\b/g, 'kilometres per hour')
  .replace(/·/g, ', ').replace(/[“”"]/g, '').replace(/\s+/g, ' ').trim();
const sentences = t => (String(t).match(/[^.!?]+[.!?]*/g) || [t]).map(s => s.trim()).filter(Boolean);
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const clip = (s, n = 160) => { s = String(s || ''); return s.length > n ? s.slice(0, s.lastIndexOf(' ', n)) + '…' : s; };
const ORD = ['First', 'Next', 'Then', 'After that', 'Finally'];
const ansOf = q => q.type === 'mc' ? q.opts[q.a] : q.type === 'input' ? q.accept[0] + (q.suffix ? ' ' + q.suffix : '') : (q.order || []).map(i => q.items[i]).join(' → ');
const EN = t => [t, 'en-GB'], FR = t => [t, 'fr-FR'];

/* ---------- scene builders ---------- */
function topicScenes(ch, sec) {
  const pool = SCENE_ICN[ch.subj] || SCENE_ICN.maths, SN = (window.SUBJ_NAME || {})[ch.subj];
  const S = [{ k: 'Topic ' + sec.n, h: sec.t, sub: SN + ' · ' + ch.title, say: [EN(`Topic ${sec.n}: ${sec.t}. Let's look at the big ideas in about a minute.`)], icn: SUBJ_ICN[ch.subj], kind: 'title' }];
  (sec.notice || []).forEach((n, i) => { const t = nodeText(n); S.push({ k: ['The big idea', 'Look closer', 'Remember this'][i] || 'Key point', h: t, say: [EN((i === 0 ? '' : ['', 'Now look closer. ', 'And remember: '][i] || '') + t)], icn: pool[i % pool.length], kind: 'point', n: i + 1 }); });
  const fs = window.secFormulas ? secFormulas(ch, sec.n) : [];
  if (fs.length) S.push({ k: fs[0].rule ? 'The rule' : 'The formula', h: fs[0].e, sub: fs[0].n + (fs[0].ex ? ' · e.g. ' + fs[0].ex : ''), say: [EN(`Here is the ${fs[0].rule ? 'rule' : 'formula'} to use. ${fs[0].n}: ${fs[0].e}.${fs[0].ex ? ' For example, ' + fs[0].ex + '.' : ''}`)], icn: 'function', kind: 'formula' });
  const q = (sec.check || [])[0];
  if (q && typeof q.q === 'string') S.push({ k: 'Try this', h: q.q, sub: 'Answer: ' + ansOf(q), reveal: true, say: [EN(`Try this one. ${q.q}`), EN('Have a think.'), EN(`The answer is ${ansOf(q)}. ${first(q.why)}`)], icn: 'lightbulb', kind: 'example' });
  S.push({ k: 'Your turn', h: 'Explore the models, then take the quiz', sub: 'Win up to 3 stars', say: [EN("Now it's your turn. Explore the models, then take the quiz to win up to three stars!")], icn: 'rocket', kind: 'outro' });
  return S;
}
function reviewScenes(ch) {
  const pool = SCENE_ICN[ch.subj] || SCENE_ICN.maths, SN = (window.SUBJ_NAME || {})[ch.subj];
  const S = [{ k: 'End of stage review', h: ch.title, sub: SN + ' · quick revision', say: [EN(`${ch.title}. Let's revise the most important ideas before you face the review boss.`)], icn: SUBJ_ICN[ch.subj], kind: 'title' }];
  [...(ch.challenge || []), ...(ch.practice || [])].filter(q => typeof q.q === 'string' && q.why).slice(0, 4).forEach((q, i) => S.push({ k: 'Revision point ' + (i + 1), h: q.q, sub: ansOf(q) + ': ' + clip(first(q.why), 110), reveal: true, say: [EN(`${ORD[i] || 'Next'}: ${q.q}`), EN(`The answer is ${ansOf(q)}. ${first(q.why)}`)], icn: pool[i % pool.length], kind: 'example', n: i + 1 }));
  S.push({ k: 'Your mission', h: 'Beat the review boss', sub: 'Win a medal to complete the review', say: [EN('Great revision! Now beat the review boss and win a medal.')], icn: 'trophy', kind: 'outro' });
  return S;
}
function chapterScenes(ch) {
  if (!ch.secs.length) return reviewScenes(ch);
  const pool = SCENE_ICN[ch.subj] || SCENE_ICN.maths, SN = (window.SUBJ_NAME || {})[ch.subj], lbl = (ch.subj === 'computing' ? 'Unit ' : 'Chapter ') + ch.n;
  const S = [{ k: SN + ' · ' + lbl, h: ch.title, sub: `${ch.secs.length} topic${ch.secs.length > 1 ? 's' : ''} · the whole chapter in about a minute`, say: [EN(`Welcome to ${SN}, ${lbl}: ${ch.title}.`), EN(`In this short video you'll see the big ideas from all ${ch.secs.length} topics.`)], icn: SUBJ_ICN[ch.subj], kind: 'title' }];
  S.push({ k: 'In this chapter', h: ch.secs.map(s => s.n + '  ' + s.t).join('\n'), say: [EN(`Here's what you'll learn: ${ch.secs.map(s => s.t).join(', ')}.`)], icn: 'list-checks', kind: 'list' });
  ch.secs.slice(0, 5).forEach((s, i) => { const n0 = nodeText((s.notice || [])[0]); S.push({ k: 'Topic ' + s.n, h: s.t, sub: clip(n0, 170), say: [EN(`${ORD[i] || 'Next'}, ${s.t}.`), EN(n0)], icn: pool[i % pool.length], kind: 'point', n: i + 1 }); });
  const F = ((window.FORMULAS || {})[ch.id] || [])[0];
  if (F) S.push({ k: F.rule ? 'Key rule' : 'Key formula', h: F.e, sub: F.n + (F.ex ? ' · e.g. ' + F.ex : ''), say: [EN(`A key ${F.rule ? 'rule' : 'formula'} in this chapter is ${F.n}: ${F.e}.`), ...(F.ex ? [EN('For example, ' + F.ex + '.')] : [])], icn: 'function', kind: 'formula' });
  const q = (ch.practice || []).find(x => typeof x.q === 'string' && x.why);
  if (q) S.push({ k: 'Worked example', h: q.q, sub: 'Answer: ' + ansOf(q) + ' · ' + clip(first(q.why), 100), reveal: true, say: [EN(`Let's try an example. ${q.q}`), EN('Pause and think.'), EN(`The answer is ${ansOf(q)}. ${first(q.why)}`)], icn: 'lightbulb', kind: 'example' });
  const T = (ch.recap.terms || []).slice(0, 3);
  if (T.length) S.push({ k: 'Key words', h: T.map(t => t[0] + ': ' + t[1]).join('\n'), say: [EN('Key words to remember.'), ...T.flatMap(([w, d]) => [ch.subj === 'french' ? FR(w) : EN(w), EN((ch.subj === 'french' ? 'means ' : '') + d)])], icn: 'book-open', kind: 'list' });
  S.push({ k: 'Your mission', h: 'Finish every topic, practise, then beat the boss', sub: 'The treasure chest opens when the chapter is complete', say: [EN("That's the big picture! Now work through each topic, practise, and beat the boss to open the treasure chest.")], icn: 'trophy', kind: 'outro' });
  return S;
}

/* ---------- voice ---------- */
const VOICE = { list: [], en: null, fr: null };
function pickVoices() {
  if (!window.speechSynthesis) return;
  const vs = speechSynthesis.getVoices(); if (!vs.length) return;
  VOICE.list = vs;
  const rank = (v, lang) => { let s = 0; const n = v.name.toLowerCase(); if (!v.lang || !v.lang.toLowerCase().startsWith(lang.slice(0, 2))) return -1; if (v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase()) s += 4; if (/natural|neural|online/.test(n)) s += 10; if (/google/.test(n)) s += 6; if (/(sonia|libby|ryan|serena|daniel|kate|martha|arthur|amélie|amelie|thomas|denise|henri|audrey|samantha|karen|moira)/.test(n)) s += 5; if (v.localService === false) s += 1; return s; };
  const best = lang => vs.map(v => [v, rank(v, lang)]).filter(x => x[1] >= 0).sort((a, b) => b[1] - a[1])[0];
  VOICE.en = (best('en-GB') || best('en-US') || [null])[0]; VOICE.fr = (best('fr-FR') || [null])[0];
}
if (window.speechSynthesis) { pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; setTimeout(pickVoices, 800); }
function sayChunks(chunks, onDone, token) {
  const synth = window.speechSynthesis; if (!synth) { onDone(false); return; }
  const parts = []; chunks.forEach(([t, l]) => sentences(speakable(t)).forEach(s => parts.push([s, l])));
  let i = 0, done = false;
  const fin = ok => { if (done) return; done = true; onDone(ok); };
  const next = () => {
    if (token.dead) return; if (i >= parts.length) { fin(true); return; }
    const [txt, lang] = parts[i++]; const u = new SpeechSynthesisUtterance(txt);
    const v = lang.startsWith('fr') ? VOICE.fr : VOICE.en; if (v) u.voice = v; u.lang = lang; u.rate = lang.startsWith('fr') ? 0.85 : 0.98; u.pitch = 1.03;
    let fired = false; const guard = setTimeout(() => { if (!fired && !token.dead) { fired = true; synth.cancel(); next(); } }, 1500 + txt.split(/\s+/).length * 650);
    u.onend = () => { if (fired) return; fired = true; clearTimeout(guard); setTimeout(next, 180); };
    u.onerror = () => { if (fired) return; fired = true; clearTimeout(guard); next(); };
    synth.speak(u);
  };
  next();
}
const estDur = s => { const w = (s.say || []).reduce((a, c) => a + String(c[0]).split(/\s+/).length, 0); return Math.max(5, w / 2.4 + (s.reveal ? 3 : 1.5)); };

/* ---------- player ---------- */
function ExplainerVideo({ scenes, vkey, onEnd, compact }) {
  const dur = React.useMemo(() => scenes.map(estDur), [scenes]);
  const total = dur.reduce((a, b) => a + b, 0);
  const [si, setSi] = React.useState(0), [play, setPlay] = React.useState(false), [cc, setCc] = React.useState(true), [mute, setMute] = React.useState(false), [ended, setEnded] = React.useState(false), [el, setEl] = React.useState(0), [rev, setRev] = React.useState(false), [line, setLine] = React.useState('');
  const S = scenes[si];
  const tok = React.useRef({ dead: true });
  const stopAll = () => { tok.current.dead = true; window.speechSynthesis && speechSynthesis.cancel(); window.FRVOICE && FRVOICE.stop(); };
  React.useEffect(() => {
    setRev(false); setEl(0);
    if (!play) return;
    stopAll(); const t = { dead: false }; tok.current = t;
    const t0 = performance.now(); let raf;
    const tick = () => { if (t.dead) return; setEl((performance.now() - t0) / 1000); raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick);
    const advance = () => { if (t.dead) return; if (si + 1 < scenes.length) setSi(si + 1); else { setPlay(false); setEnded(true); finish(); } };
    let timer;
    if (S.reveal) timer = setTimeout(() => !t.dead && setRev(true), Math.max(2500, dur[si] * 450));
    const canSpeak = !mute && window.speechSynthesis && (VOICE.en || speechSynthesis.getVoices().length);
    if (canSpeak) {
      const chunks = S.say || [];
      // show caption line by line + reveal when the answer starts
      const parts = []; chunks.forEach(([tx, l]) => sentences(speakable(tx)).forEach(x => parts.push(x)));
      let shown = 0; setLine(parts[0] || '');
      const wrap = chunks.map(c => c);
      sayChunksWithCaption(wrap, x => { if (t.dead) return; setLine(x); if (/^The answer is/i.test(x)) setRev(true); }, ok => { if (t.dead) return; setTimeout(advance, 700); }, t);
    } else {
      setLine(((S.say || []).map(c => c[0]).join(' ')));
      timer = setTimeout(advance, dur[si] * 1000);
      if (S.reveal) setTimeout(() => !t.dead && setRev(true), dur[si] * 550);
    }
    return () => { t.dead = true; cancelAnimationFrame(raf); clearTimeout(timer); window.speechSynthesis && speechSynthesis.cancel(); };
  }, [si, play, mute]);
  React.useEffect(() => () => stopAll(), []);
  const finish = () => { const w = LS8.get('s8f-videos', {}); if (!w[vkey]) { w[vkey] = Date.now(); LS8.set('s8f-videos', w); GAME.award(10, 5, 'Video watched'); } onEnd && onEnd(); };
  const go = i => { setEnded(false); setSi(Math.max(0, Math.min(scenes.length - 1, i))); };
  const unlock = () => { try { if (window.speechSynthesis) { pickVoices(); speechSynthesis.cancel(); speechSynthesis.resume(); const z = new SpeechSynthesisUtterance(' '); z.volume = 0; speechSynthesis.speak(z); } } catch (e) {} };
  const toggle = () => { if (ended) { unlock(); setEnded(false); setSi(0); setPlay(true); return; } if (!play) unlock(); setPlay(!play); };
  const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  const before = dur.slice(0, si).reduce((a, b) => a + b, 0), lp = play ? Math.min(0.97, el / dur[si]) : 0;
  const watched = !!LS8.get('s8f-videos', {})[vkey];
  const lines = String(S.h).split('\n');
  return (
    <div className={'xv' + (compact ? ' compact' : '')}>
      <div className={'xv-stage k-' + S.kind} onClick={toggle}>
        <div className="xv-bg"><i /><i /><i /><i /></div>
        <div className="xv-grid" />
        <div key={si} className="xv-scene">
          <div className="xv-icon"><span>{ic(S.icn)}</span></div>
          <div className="xv-k">{S.n ? <b>{S.n}</b> : null}{S.k}</div>
          <div className={'xv-h' + (String(S.h).length > 90 || lines.length > 3 ? ' long' : '') + (S.kind === 'formula' ? ' eq' : '')}>{lines.map((ln, li) => <div key={li} className="xv-line" style={{ animationDelay: (0.15 + li * 0.25) + 's' }}>{ln}</div>)}</div>
          {S.sub && (!S.reveal || rev) && <div className={'xv-sub' + (S.reveal ? ' xv-ans' : '')}>{S.reveal && <span>{ic('check-circle')}</span>}{S.sub}</div>}
          {S.reveal && !rev && play && <div className="xv-think">{ic('hourglass')} Think…</div>}
        </div>
        <div className="xv-brand"><span>{ic('play-circle')}</span> Stage 8 explainer · {si + 1}/{scenes.length}</div>
        {cc && play && line && <div className="xv-cc">{line}</div>}
        {!play && <div className="xv-overlay"><button className="xv-big" aria-label="Play">{ic(ended ? 'arrow-counter-clockwise' : 'play')}</button><span>{ended ? 'Watch again' : si > 0 ? 'Paused · tap to continue' : 'Play · about ' + fmt(total)}</span></div>}
      </div>
      <div className="xv-ctl">
        <button className="xv-b" onClick={toggle}>{ic(play ? 'pause' : 'play')}</button>
        <button className="xv-b" onClick={() => go(si - 1)} title="Previous">{ic('skip-back')}</button>
        <button className="xv-b" onClick={() => go(si + 1)} title="Next">{ic('skip-forward')}</button>
        <div className="xv-bar">{scenes.map((_, i) => <i key={i} style={{ width: dur[i] / total * 100 + '%' }} onClick={() => go(i)}><em style={{ width: (i < si || ended ? 1 : i === si ? lp : 0) * 100 + '%' }} /></i>)}</div>
        <span className="xv-time">{fmt(before + (play ? Math.min(el, dur[si]) : 0))} / {fmt(total)}</span>
        <button className={'xv-b' + (cc ? ' on' : '')} onClick={() => setCc(!cc)} title="Captions">{ic('closed-captioning')}</button>
        <button className={'xv-b' + (mute ? '' : ' on')} onClick={() => setMute(!mute)} title={mute ? 'Turn narration on' : 'Mute narration'}>{ic(mute ? 'speaker-slash' : 'speaker-high')}</button>
        {watched && <span className="xv-done">{ic('check-circle')} Watched</span>}
      </div>
      {!window.speechSynthesis && <div className="xv-novoice">This browser can't read aloud. Captions are shown instead.</div>}
    </div>
  );
}
function sayChunksWithCaption(chunks, onLine, onDone, token) {
  const synth = window.speechSynthesis;
  const parts = []; chunks.forEach(([t, l]) => sentences(speakable(t)).forEach(s => parts.push([s, l])));
  let i = 0, done = false;
  const fin = ok => { if (done) return; done = true; onDone(ok); };
  const next = () => {
    if (token.dead) return; if (i >= parts.length) { fin(true); return; }
    const [txt, lang] = parts[i++]; onLine(txt);
    if (lang.startsWith('fr') && window.FRVOICE) { let fdone = false; const fg = setTimeout(() => { if (!fdone && !token.dead) { fdone = true; FRVOICE.stop(); next(); } }, 3000 + txt.split(/\s+/).length * 900); FRVOICE.say(txt, { onend: () => { if (fdone) return; fdone = true; clearTimeout(fg); setTimeout(next, 250); } }); return; }
    const u = new SpeechSynthesisUtterance(txt);
    const v = lang.startsWith('fr') ? VOICE.fr : VOICE.en; if (v) u.voice = v; u.lang = lang; u.rate = lang.startsWith('fr') ? 0.85 : 0.98; u.pitch = 1.03;
    let fired = false; const guard = setTimeout(() => { if (!fired && !token.dead) { fired = true; synth.cancel(); next(); } }, 2000 + txt.split(/\s+/).length * 700);
    u.onend = () => { if (fired) return; fired = true; clearTimeout(guard); setTimeout(next, /think|pause/i.test(txt) ? 1400 : 200); };
    u.onerror = e => { if (fired) return; fired = true; clearTimeout(guard); if (e && e.error === 'interrupted') return; setTimeout(next, 300); };
    synth.speak(u);
  };
  next();
}
function VideoModal({ title, scenes, vkey, onClose }) {
  React.useEffect(() => { const k = e => e.key === 'Escape' && onClose(); addEventListener('keydown', k); document.body.style.overflow = 'hidden'; return () => { removeEventListener('keydown', k); document.body.style.overflow = ''; window.speechSynthesis && speechSynthesis.cancel(); }; }, []);
  return ReactDOM.createPortal(<div className="g-modal-bg xv-modal" onClick={e => { e.stopPropagation(); onClose(); }}><div className="xv-mbox" onClick={e => e.stopPropagation()}><div className="xv-mh"><b>{title}</b><button className="xv-b" onClick={onClose} aria-label="Close">{ic('x')}</button></div><ExplainerVideo scenes={scenes} vkey={vkey} /></div></div>, document.body);
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
