/* Speaking companion: hear a model, record yourself, get word-by-word feedback. */

const SPEAK_SETS = {
  french: {
    lang: 'fr-FR', label: 'French',
    sets: [
      { id: 'sounds', title: 'Key sounds', items: [
        { t: 'bonjour', tip: '"on" is a nasal sound: let air come through your nose and don\'t say the "n". The "j" is soft, like the "s" in "measure".' },
        { t: 'la rue', tip: 'French "u": say "ee", then round your lips into an "oo" shape without moving your tongue.' },
        { t: 'les grenouilles', tip: '"ouille" sounds like "oo-y". The final "s" is silent.' },
        { t: 'un croissant', tip: 'The French "r" comes from the back of the throat, a bit like gently gargling. "oi" sounds like "wa".' },
        { t: 'beaucoup', tip: '"eau" sounds like "oh". The final "p" is silent: boh-KOO.' },
      ] },
      { id: 'family', title: 'Family & daily routine', items: [
        { t: 'Je me lève à sept heures.', tip: 'Run "à sept heures" together: "a-sè-teur". The "h" is silent and the "t" links to the next word.' },
        { t: "J'ai un frère et deux sœurs.", tip: '"sœur" uses a sound between "e" and "u". Round your lips as if to whistle and say "er".' },
        { t: 'Ma mère est très gentille.', tip: '"gentille": the "ille" sounds like "ee-y". The "g" before "e" is soft, like the "s" in "measure".' },
      ] },
      { id: 'school', title: 'School & opinions', items: [
        { t: "J'adore les sciences parce que c'est intéressant.", tip: 'Link "c\'est intéressant" as "sè-tin-té-ré-SSAN". Stress falls lightly on the last syllable of each group.' },
        { t: 'Ma matière préférée, c\'est le français.', tip: 'é = a crisp "ay" without the glide. "ç" sounds like "s".' },
        { t: "Je n'aime pas les maths, c'est trop difficile.", tip: '"maths" sounds like "matt". In French the "s" and "h" are not pronounced.' },
      ] },
      { id: 'future', title: 'Near future & past', items: [
        { t: 'Ce weekend, je vais aller au cinéma.', tip: '"je vais aller": the "s" in "vais" is silent. "au" sounds like "oh".' },
        { t: "Hier, je suis allé à la plage.", tip: '"suis allé" links: "swee-za-LAY". This liaison is expected.' },
        { t: "Nous avons mangé une glace.", tip: '"Nous avons" links with a "z" sound: "noo-za-VON".' },
      ] },
      { id: 'town', title: 'Town & shopping', items: [
        { t: 'Où est la gare, s\'il vous plaît ?', tip: '"s\'il vous plaît": "seel-voo-PLAY". The final "t" is silent.' },
        { t: "Je voudrais un kilo de pommes.", tip: '"voudrais" sounds like "voo-DRAY". The "s" is silent.' },
        { t: "C'est combien ?", tip: '"combien" ends with a nasal "yan": kom-BYAN.' },
      ] },
    ],
  },
  english: {
    lang: 'en-GB', label: 'English',
    sets: [
      { id: 'tricky', title: 'Tricky words', items: [
        { t: 'hyperbole', tip: 'Four syllables: hy-PER-bo-lee. The final "e" is said aloud.' },
        { t: 'oxymoron', tip: 'ox-ee-MOR-on. Stress is on the third syllable.' },
        { t: 'onomatopoeia', tip: 'on-o-mat-o-PEE-a. Say it slowly in chunks first.' },
        { t: 'Wednesday', tip: 'WENZ-day. The first "d" is silent.' },
        { t: 'February', tip: 'FEB-roo-ary. Try not to drop the first "r".' },
      ] },
      { id: 'science', title: 'Science vocabulary', items: [
        { t: 'mitochondria', tip: 'my-toe-KON-dree-a. The "ch" sounds like "k".' },
        { t: 'chromatography', tip: 'kro-ma-TOG-ra-fee. Stress is on "TOG".' },
        { t: 'exothermic', tip: 'ex-oh-THER-mik. Use a soft "th", as in "think".' },
        { t: 'electromagnet', tip: 'ee-LEK-tro-mag-net' },
        { t: 'bioaccumulation', tip: 'by-oh-a-kew-mew-LAY-shun. Break it into bio + accumulation.' },
      ] },
      { id: 'maths', title: 'Maths vocabulary', items: [
        { t: 'perpendicular', tip: 'per-pen-DIK-yoo-lar' },
        { t: 'parallelogram', tip: 'pa-ra-LEL-o-gram' },
        { t: 'trapezium', tip: 'tra-PEE-zee-um' },
        { t: 'circumference', tip: 'sir-KUM-fer-ence. Stress is on the second syllable.' },
        { t: 'hierarchy', tip: 'HIGH-er-ar-kee. The "ch" sounds like "k".' },
      ] },
      { id: 'perform', title: 'Read aloud with style', items: [
        { t: 'Cold, grey mist crept slowly over the silent, empty moor.', tip: 'Pause briefly at each comma. Slow down on "crept slowly" so the pace matches the meaning.' },
        { t: 'He waited. The footsteps came closer. Then silence.', tip: 'Leave a real pause at each full stop. Drop your voice on "Then silence."' },
        { t: 'Ladies and gentlemen, I stand before you today to argue for change.', tip: 'Persuasive opening: give a slight stress to "argue" and "change", and make eye contact at the comma.' },
      ] },
    ],
  },
};

function normWord(w, stripAccents) {
  let s = w.toLowerCase().replace(/[’']/g, "'").replace(/[.,!?;:«»"()¿¡]/g, '').trim();
  if (stripAccents) s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/œ/g, 'oe');
  return s;
}
function lev(a, b) {
  const m = a.length, n = b.length; const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function splitWords(t) { return t.split(/\s+|(?<=')/).filter(w => normWord(w, true)); }

function scoreAttempt(target, heard) {
  const tw = splitWords(target);
  const hw = splitWords(heard).map(w => normWord(w, true));
  const used = new Set();
  const res = tw.map(w => {
    const n = normWord(w, true);
    let best = -1, bd = 99;
    hw.forEach((h, i) => { if (used.has(i)) return; const d = lev(n, h); if (d < bd) { bd = d; best = i; } });
    const tol = n.length <= 3 ? 0 : n.length <= 6 ? 1 : 2;
    const status = bd === 0 ? 'good' : bd <= tol ? 'close' : 'miss';
    if (status !== 'miss' && best >= 0) used.add(best);
    return { w, status };
  });
  const pts = res.reduce((a, r) => a + (r.status === 'good' ? 1 : r.status === 'close' ? 0.6 : 0), 0);
  return { words: res, score: Math.round(pts / Math.max(1, tw.length) * 100) };
}

function useVoice(lang) {
  const [voice, setVoice] = React.useState(null);
  React.useEffect(() => {
    if (!window.speechSynthesis) return;
    const pick = () => {
      const vs = speechSynthesis.getVoices();
      const base = lang.split('-')[0];
      setVoice(vs.find(v => v.lang === lang && /google|natural|enhanced|premium/i.test(v.name)) || vs.find(v => v.lang === lang) || vs.find(v => v.lang && v.lang.startsWith(base)) || null);
    };
    pick(); speechSynthesis.onvoiceschanged = pick;
  }, [lang]);
  return voice;
}

function MicLevel({ active }) {
  const [lv, setLv] = React.useState(Array(24).fill(0.08));
  React.useEffect(() => {
    if (!active) { setLv(Array(24).fill(0.08)); return; }
    let stream, ctx, raf, an;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        an = ctx.createAnalyser(); an.fftSize = 64;
        ctx.createMediaStreamSource(stream).connect(an);
        const buf = new Uint8Array(an.frequencyBinCount);
        const tick = () => { an.getByteFrequencyData(buf); setLv(Array.from({ length: 24 }, (_, i) => Math.max(0.08, (buf[i + 2] || 0) / 255))); raf = requestAnimationFrame(tick); };
        tick();
      } catch (e) {
        const tick = () => { setLv(Array.from({ length: 24 }, () => 0.15 + Math.random() * 0.5)); raf = setTimeout(tick, 90); };
        tick();
      }
    })();
    return () => { cancelAnimationFrame(raf); clearTimeout(raf); stream && stream.getTracks().forEach(t => t.stop()); ctx && ctx.close(); };
  }, [active]);
  return <div className={'miclv' + (active ? ' on' : '')}>{lv.map((v, i) => <i key={i} style={{ transform: `scaleY(${v})` }} />)}</div>;
}

function SpeakingCompanion({ initialLang = 'french', initialSet, onAsk }) {
  const [langKey, setLangKey] = React.useState(initialLang);
  const L = SPEAK_SETS[langKey];
  const [setId, setSetId] = React.useState(initialSet || L.sets[0].id);
  const set = L.sets.find(s => s.id === setId) || L.sets[0];
  const [idx, setIdx] = React.useState(0);
  const item = set.items[Math.min(idx, set.items.length - 1)];
  const [listening, setListening] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [heard, setHeard] = React.useState('');
  const [slow, setSlow] = React.useState(false);
  const [aiTip, setAiTip] = React.useState('');
  const [aiBusy, setAiBusy] = React.useState(false);
  const [best, setBest] = React.useState(() => { try { return JSON.parse(localStorage.getItem('margin-speak-best') || '{}'); } catch (e) { return {}; } });
  const recRef = React.useRef(null);
  const voice = useVoice(L.lang);
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  React.useEffect(() => { setResult(null); setHeard(''); setAiTip(''); }, [langKey, setId, idx]);
  React.useEffect(() => { localStorage.setItem('margin-speak-best', JSON.stringify(best)); }, [best]);
  React.useEffect(() => () => { recRef.current && recRef.current.abort(); window.speechSynthesis && speechSynthesis.cancel(); }, []);

  const speak = (text, rate) => {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    if (L.lang.startsWith('fr') && window.FRVOICE) { FRVOICE.say(text, { slow: slow || (rate && rate < 0.7), rate: rate || 0.9 }); return; }
    const u = new SpeechSynthesisUtterance(text); u.lang = L.lang; if (voice) u.voice = voice; u.rate = rate || (slow ? 0.6 : 0.92);
    speechSynthesis.speak(u);
  };

  const finish = (text) => {
    setHeard(text);
    const r = scoreAttempt(item.t, text);
    setResult(r);
    const k = langKey + ':' + item.t;
    setBest(b => ({ ...b, [k]: Math.max(b[k] || 0, r.score) }));
    if (window.GAME) { GAME.event('speak'); GAME.award(r.score >= 90 ? 15 : r.score >= 65 ? 10 : 5, r.score >= 80 ? 3 : 1, r.score >= 90 ? ' Perfect!' : ' Spoken'); }
  };

  const record = () => {
    if (listening) { recRef.current && recRef.current.stop(); return; }
    if (!SR) { setResult({ unsupported: true }); return; }
    speechSynthesis && speechSynthesis.cancel();
    const rec = new SR(); recRef.current = rec;
    rec.lang = L.lang; rec.interimResults = true; rec.maxAlternatives = 3; rec.continuous = false;
    let finalText = '';
    rec.onresult = (e) => {
      let t = '';
      for (let i = 0; i < e.results.length; i++) {
        const alts = Array.from(e.results[i]);
        const bestAlt = alts.map(a => a.transcript).sort((a, b) => scoreAttempt(item.t, b).score - scoreAttempt(item.t, a).score)[0];
        t += bestAlt;
      }
      setHeard(t); finalText = t;
    };
    rec.onerror = (e) => { setListening(false); if (e.error === 'not-allowed') setResult({ denied: true }); else if (e.error === 'no-speech') setResult({ nospeech: true }); };
    rec.onend = () => { setListening(false); if (finalText) finish(finalText); };
    setResult(null); setHeard(''); setAiTip('');
    rec.start(); setListening(true);
  };

  const askCoach = async () => {
    if (!result || !result.words) return;
    setAiBusy(true);
    const weak = result.words.filter(w => w.status !== 'good').map(w => w.w).join(', ') || 'none';
    try {
      const r = await window.genspark.complete(`You are a friendly ${L.label} pronunciation coach for a 12-year-old. Target phrase: "${item.t}". Speech recognition heard: "${heard}". Words that may be mispronounced: ${weak}. In 3 short sentences or fewer, give practical mouth/tongue/lip tips for the weakest sound, using English sound-alikes. Don't use IPA symbols. Be encouraging.`);
      setAiTip(r);
    } catch (e) { setAiTip('The coach could not connect just now. Try again.'); }
    setAiBusy(false);
  };

  const k = langKey + ':' + item.t;
  const verdict = result && result.words ? (result.score >= 90 ? 'Excellent: that sounded clear.' : result.score >= 65 ? 'Nearly there. Listen again to the highlighted words.' : 'Keep going. Listen slowly, then try a shorter part first.') : null;

  return (
    <div className={'speak subj-' + langKey} data-screen-label="Speaking companion">
      <div className="speak-side">
        <div className="seg">
          {Object.entries(SPEAK_SETS).map(([key, v]) => (
            <button key={key} className={langKey === key ? 'on' : ''} onClick={() => { setLangKey(key); setSetId(v.sets[0].id); setIdx(0); }}>{v.label}</button>
          ))}
        </div>
        <nav className="speak-sets">
          {L.sets.map(s => {
            const done = s.items.filter(it => (best[langKey + ':' + it.t] || 0) >= 80).length;
            return (
              <button key={s.id} className={s.id === setId ? 'on' : ''} onClick={() => { setSetId(s.id); setIdx(0); }}>
                <span>{s.title}</span><span className="mono">{done}/{s.items.length}</span>
              </button>
            );
          })}
        </nav>
        <p className="hint" style={{ marginTop: 16 }}>Phrases you say with 80% or more count as mastered. Your best scores are saved on this device.</p>
      </div>

      <div className="speak-main">
        <div className="speak-card">
          <div className="speak-top">
            <span className="mono">{set.title} · {Math.min(idx, set.items.length - 1) + 1} of {set.items.length}</span>
            {best[k] != null && <span className="mono">Best {best[k]}%</span>}
          </div>

          <div className={'speak-target' + (item.t.length > 34 ? ' long' : '')}>
            {result && result.words
              ? result.words.map((w, i) => <span key={i} className={'sw ' + w.status}>{w.w} </span>)
              : item.t}
          </div>

          <div className="speak-ctl">
            <button className="btn ghost" onClick={() => speak(item.t)}> Listen</button>
            <label className="slowtog"><input type="checkbox" checked={slow} onChange={e => setSlow(e.target.checked)} /> Slow</label>
            <button className={'mic' + (listening ? ' on' : '')} onClick={record} aria-label={listening ? 'Stop recording' : 'Record yourself'}>
              <span className="mic-dot" />
            </button>
            <MicLevel active={listening} />
          </div>
          <div className="mic-label mono">{listening ? 'Listening… tap again to stop' : 'Tap the red button and say the phrase'}</div>

          {heard && <div className="heard"><span className="mono">We heard</span> “{heard}”</div>}

          {result && result.words && (
            <div className="speak-result">
              <div className="score-ring" style={{ '--p': result.score }}><span>{result.score}<small>%</small></span></div>
              <div>
                <div className="verdict">{verdict}</div>
                <div className="legend"><span><i className="good" />Clear</span><span><i className="close" />Close</span><span><i className="miss" />Try again</span></div>
                <div className="row" style={{ marginTop: 12 }}>
                  {result.words.filter(w => w.status !== 'good').slice(0, 3).map((w, i) => <button key={i} className="chip" onClick={() => speak(w.w.replace(/[.,!?]/g, ''), 0.55)}> {w.w.replace(/[.,!?]/g, '')}</button>)}
                </div>
              </div>
            </div>
          )}
          {result && result.unsupported && <div className="feedback wrong"><span className="tag">Note</span><span>This browser can't listen to speech. Try Chrome or Edge on a computer or Android, or Safari on iPhone/iPad. You can still use Listen and the tips below.</span></div>}
          {result && result.denied && <div className="feedback wrong"><span className="tag">Microphone</span><span>Microphone access was blocked. Allow it in your browser settings to record yourself.</span></div>}
          {result && result.nospeech && <div className="feedback wrong"><span className="tag">Hmm</span><span>I didn't hear anything. Move closer to the microphone and try again.</span></div>}

          <div className="tipbox">
            <span className="mono">How to say it</span>
            <p>{item.tip}</p>
            {result && result.words && result.score < 90 && (
              aiTip ? <p className="aitip">{aiTip}</p>
                : <button className="btn ghost small" style={{ marginTop: 10 }} onClick={askCoach} disabled={aiBusy}>{aiBusy ? 'Thinking…' : 'Get a personal tip from the coach'}</button>
            )}
          </div>

          <div className="speak-nav">
            <button className="btn ghost small" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← Previous</button>
            <button className="btn small" disabled={idx >= set.items.length - 1} onClick={() => setIdx(idx + 1)}>Next phrase →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.SpeakingCompanion = SpeakingCompanion;
window.SPEAK_SETS = SPEAK_SETS;
