/* Topic page: objectives + AI-generated practice with a hint ladder */

function parseJSON(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('no json');
  return JSON.parse(m[0]);
}

function AIPractice({ subject, topic, objective, onPractised }) {
  const [q, setQ] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState(null);
  const [ans, setAns] = React.useState('');
  const [hintsShown, setHintsShown] = React.useState(0);
  const [judge, setJudge] = React.useState(null);
  const [judging, setJudging] = React.useState(false);
  const [tries, setTries] = React.useState(0);
  const [showSol, setShowSol] = React.useState(false);

  const gen = async () => {
    setLoading(true); setErr(null); setQ(null); setAns(''); setHintsShown(0); setJudge(null); setTries(0); setShowSol(false);
    const isFr = subject.id === 'french';
    const prompt = `Write ONE practice question for a 12-13 year old Cambridge Lower Secondary Stage 8 ${subject.name} student.
Learning objective (${objective.code}): "${objective.text}"
Topic: ${topic.title}
${isFr ? 'Write the question in English, but have the student answer in French (e.g. translate, conjugate, or complete a sentence).' : ''}
The question must have a short, checkable answer (a number, word, phrase or one sentence). Use a fresh real-world context. Keep it under 50 words.
Return ONLY JSON like this:
{"question":"...","hints":["a gentle first nudge","a more specific hint","a hint that nearly gets there but does not state the answer"],"answer":"...","solution":"a short worked solution, 2-4 steps"}`;
    try {
      const r = await window.genspark.complete(prompt);
      const j = parseJSON(r);
      if (!j.question || !j.answer) throw new Error('bad');
      setQ(j);
    } catch (e) { setErr('Could not make a question just now. Try again.'); }
    setLoading(false);
  };

  const check = async () => {
    if (!ans.trim()) return;
    setJudging(true);
    try {
      const r = await window.genspark.complete(`You are marking a student's answer. Question: "${q.question}". Correct answer: "${q.answer}". Student answered: "${ans}".
Decide if the student's answer is correct or equivalent (accept equivalent forms, small spelling slips in non-language subjects, and units if reasonable${subject.id === 'french' ? '; in French, accents matter only slightly, so accept missing accents but note them' : ''}).
Return ONLY JSON: {"correct": true/false, "feedback": "one or two encouraging sentences. If wrong, point out what kind of mistake it might be or ask a guiding question, but NEVER reveal the correct answer or any part of it."}`);
      const j = parseJSON(r);
      // guard: strip any accidental reveal
      if (!j.correct && q.answer && j.feedback && j.feedback.toLowerCase().includes(String(q.answer).toLowerCase()) && String(q.answer).length > 1) {
        j.feedback = 'Not quite yet. Look at your working again. Which step are you least sure about?';
      }
      setJudge(j); setTries(t => t + 1);
      if (j.correct) onPractised && onPractised();
    } catch (e) { setJudge({ correct: false, feedback: 'I could not mark that just now. Try again.' }); }
    setJudging(false);
  };

  return (
    <div className="aip">
      <div className="aip-head">
        <h3>Practice question</h3>
        <span className="code">{objective.code}</span>
      </div>
      {!q && !loading && (
        <>
          <p className="aip-empty">The companion writes a new question on this objective each time. Use the hints one at a time, and try it yourself first.</p>
          {err && <p style={{ color: 'var(--bad)', marginTop: 8 }}>{err}</p>}
          <button className="btn" style={{ marginTop: 14 }} onClick={gen}>Write me a question</button>
        </>
      )}
      {loading && <div><div className="skeleton" style={{ width: '90%' }} /><div className="skeleton" style={{ width: '70%' }} /><div className="skeleton" style={{ width: '40%' }} /></div>}
      {q && (
        <>
          <div className="aip-q">{q.question}</div>
          {hintsShown > 0 && (
            <ul className="hints">
              {q.hints.slice(0, hintsShown).map((h, i) => <li key={i}><span className="mono">Hint {i + 1}</span><span>{h}</span></li>)}
            </ul>
          )}
          <textarea rows={2} value={ans} onChange={e => { setAns(e.target.value); if (judge && !judge.correct) setJudge(null); }} placeholder="Your answer" disabled={judge && judge.correct}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); check(); } }} />
          {judge && (
            <div className={'feedback ' + (judge.correct ? 'right' : 'wrong')} style={{ marginTop: 12 }}>
              <span className="tag">{judge.correct ? 'Correct' : 'Not yet'}</span><span>{judge.feedback}</span>
            </div>
          )}
          {showSol && <div className="feedback right" style={{ marginTop: 12, background: 'var(--paper-2)' }}><span className="tag" style={{ color: 'var(--ink-2)' }}>Worked</span><span><b>{q.answer}</b>. {q.solution}</span></div>}
          <div className="row" style={{ marginTop: 14 }}>
            {!(judge && judge.correct) && <button className="btn" onClick={check} disabled={!ans.trim() || judging}>{judging ? 'Marking…' : 'Check'}</button>}
            {!(judge && judge.correct) && hintsShown < q.hints.length && <button className="btn ghost" onClick={() => setHintsShown(hintsShown + 1)}>{hintsShown === 0 ? 'I need a hint' : 'Another hint'}</button>}
            {!(judge && judge.correct) && tries >= 3 && hintsShown >= q.hints.length && !showSol && <button className="btn ghost" onClick={() => setShowSol(true)}>Show worked solution</button>}
            {(judge && judge.correct || showSol) && <button className="btn" onClick={gen}>Another question →</button>}
            <button className="btn ghost small" style={{ marginLeft: 'auto' }} onClick={() => window.openCompanion({ topic: topic.title, code: objective.code, seed: `I'm working on this question: "${q.question}". My answer so far: ${ans || '(not started)'}` })}>Talk it through</button>
          </div>
          {!(judge && judge.correct) && !showSol && tries < 3 && <p className="hint" style={{ marginTop: 10 }}>The worked solution unlocks after 3 tries and all the hints.</p>}
        </>
      )}
    </div>
  );
}

const SPEAK_LINK = {
  'family-and-daily-routine': 'family', 'school-life-and-opinions': 'school', 'town-shopping-and-directions': 'town',
  'near-future-aller-infinitive': 'future', 'the-perfect-tense-passe-compose': 'future', 'phonics-and-pronunciation': 'sounds',
  'giving-and-justifying-opinions': 'school', 'everyday-transactions': 'town',
};

function TopicPage({ subject, strand, topic, chapter, go, prog, markPractised }) {
  const [objIdx, setObjIdx] = React.useState(0);
  const obj = topic.objectives[objIdx];
  const spk = subject.id === 'french' ? (Object.entries(SPEAK_LINK).find(([k]) => topic.id.endsWith(k)) || [null, 'sounds'])[1]
    : subject.id === 'english' && strand.id === 'speaking-and-listening' ? 'perform' : null;
  return (
    <div className={'subj-' + subject.id} data-screen-label={'Topic ' + topic.title}>
      <div className="wrap">
        <div className="crumbs">
          <button onClick={() => go('home')}>Stage 8</button><span>/</span>
          <button onClick={() => go('subject:' + subject.id)}>{subject.name}</button><span>/</span>
          <span>{strand.name}</span>
        </div>
        <div className="topic-wrap">
          <div>
            <div className="row" style={{ gap: 10 }}><span className="code">{topic.objectives[0].code.replace(/\.\d+$/, '')}</span>{chapter && <span className="live-tag">Interactive chapter</span>}</div>
            <h1>{topic.title}</h1>
            <p style={{ color: 'var(--ink-2)', fontSize: 17.5 }}>{topic.objectives.length === 1 ? 'What you need to be able to do:' : `${topic.objectives.length} things you need to be able to do. Pick one to practise.`}</p>
            <ul className="obj-list">
              {topic.objectives.map((o, i) => (
                <li key={i} className={'obj' + (i === objIdx ? ' cur' : '')}>
                  <span className="code">{o.code}</span>
                  <p>{o.text}</p>
                  <div className="obj-act">
                    <button onClick={() => setObjIdx(i)}>{i === objIdx ? 'Practising' : 'Practise'}</button>
                    <button onClick={() => window.openCompanion({ topic: topic.title, code: o.code, seed: `Can you help me understand this: "${o.text}"?` })}>Ask</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="side-stack">
            {chapter && (
              <div className="chapter-card">
                <span className="mono">Interactive chapter · {chapter.codes.join(' · ')}</span>
                <h3>{chapter.title}</h3>
                <p>{chapter.desc} Play → Notice → Check → Practice → Challenge → Recap.</p>
                <button className="btn" onClick={() => go('chapter:' + chapter.id)}>{prog.chapters && prog.chapters[chapter.id] && prog.chapters[chapter.id].reached ? 'Continue chapter →' : 'Open chapter →'}</button>
              </div>
            )}
            {spk && (
              <div className="chapter-card" style={{ background: 'var(--acc)' }}>
                <span className="mono">Speaking companion</span>
                <h3>Say it out loud</h3>
                <p>Listen to a model voice, record yourself, and see which words came out clearly.</p>
                <button className="btn" onClick={() => go('speak:' + subject.id + ':' + spk)}>Practise speaking →</button>
              </div>
            )}
            <AIPractice key={topic.id + objIdx} subject={subject} topic={topic} objective={obj} onPractised={() => markPractised(topic.id)} />
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TopicPage, AIPractice });
