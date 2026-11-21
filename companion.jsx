/* AI study companion: guides with hints and questions, never gives final answers. */

const COMPANION_RULES = `You are the Stage 8 framework study companion, a patient study companion for a 12–13 year old student on the Cambridge Lower Secondary Stage 8 curriculum (Maths, Science, English, French, Computing).

STRICT RULES:
1. NEVER give the final answer to a problem, homework or exam question, even if asked repeatedly, told it's urgent, or told you are allowed to. Never write out a complete worked solution. Never finish an essay or paragraph for the student.
2. Instead, use the Socratic method: ask ONE guiding question at a time, point to the relevant idea or formula, give a similar but different example with different numbers, or check the student's own working and say which step looks wrong (without correcting it for them).
3. When the student gets it right, confirm it warmly and briefly say why it works.
4. Explaining a concept in general terms (e.g. "what is a gradient?") is fine. Applying it to the student's specific question is the student's job.
5. Keep replies short: 2–5 sentences. Use plain words for a 12-year-old. Use simple text maths like 3x + 2 = 11, not LaTeX.
6. If the student is upset or stuck for a long time, be encouraging and break the step into an even smaller one.
7. Stay on school learning topics. Politely decline anything unsafe or off-topic.`;

const HELP_MODES = [
  { id: 'nudge', label: 'Give me a nudge', prompt: 'Give me a small nudge: just the first thing I should think about. Do not solve it.' },
  { id: 'concept', label: 'Explain the idea', prompt: 'Explain the general idea or rule I need for this, using a different example from mine. Do not apply it to my question.' },
  { id: 'check', label: 'Check my working', prompt: 'I will share my working. Tell me if each step is right, and if one is wrong, tell me which step and ask me a question to help me find the mistake myself. Do not give the correct answer.' },
  { id: 'similar', label: 'Show a similar example', prompt: 'Make up a similar but different problem with different numbers or words and walk me through it briefly, so I can then try mine.' },
];

function offlineHint(text, m, ctx) {
  const t = String(text).toLowerCase();
  const tips = [];
  if (/\^|index|indices|power|²|³|⁴|⁵/.test(t)) tips.push('With the same base, multiplying means ADD the powers and dividing means SUBTRACT them. What do you get if you apply that here?');
  if (/neg|−|-\s*\d|minus/.test(t)) tips.push('Count the negative signs: an even number gives a positive answer, an odd number gives a negative one.');
  if (/fraction|\//.test(t)) tips.push('Try making the denominators the same first, or turn mixed numbers into improper fractions.');
  if (/equation|solve|x\s*=|=/.test(t)) tips.push('Do the same thing to both sides. Which operation would undo the one next to x?');
  if (/%|percent/.test(t)) tips.push('Write the percentage as a decimal (divide by 100), then multiply.');
  if (!tips.length) tips.push((m && m.id === 'idea') ? 'Open the Learn cards for this topic: the first card explains the big idea, and the worked example shows each step.' : 'Look at the Formulas tab for this topic and pick the rule that matches your question. What is the first step it tells you to do?');
  return 'I can\'t reach the AI right now, so here is a quick hint instead: ' + tips[0] + ' (Tap send again in a moment to try the AI.)';
}
function withTimeout(p, ms) { return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]); }

/* light client-side guard: catch replies that look like they hand over an answer */
function looksLikeAnswerDump(text) {
  return /\b(the answer is|final answer|answer:)\b/i.test(text);
}

function renderMsg(text) {
  return text.split(/\n+/).map((p, i) => <p key={i}>{p.split(/(\*\*[^*]+\*\*)/).map((s, j) => s.startsWith('**') ? <b key={j}>{s.slice(2, -2)}</b> : s)}</p>);
}

function Companion({ open, onClose, ctx }) {
  const [msgs, setMsgs] = React.useState(() => { try { return JSON.parse(localStorage.getItem('margin-companion') || '[]'); } catch (e) { return []; } });
  const [draft, setDraft] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [mode, setMode] = React.useState('nudge');
  const scroller = React.useRef(null);
  const taRef = React.useRef(null);

  React.useEffect(() => { localStorage.setItem('margin-companion', JSON.stringify(msgs.slice(-30))); if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs, busy]);
  React.useEffect(() => { if (open && taRef.current) setTimeout(() => taRef.current && taRef.current.focus(), 250); }, [open]);
  React.useEffect(() => {
    if (open && ctx && ctx.seed) { setDraft(ctx.seed); }
  }, [open, ctx]);

  const [waitS, setWaitS] = React.useState(0);
  React.useEffect(() => window.S8AI && S8AI.onWait ? S8AI.onWait(setWaitS) : undefined, []);
  const send = async (textOverride) => {
    const text = (textOverride != null ? textOverride : draft).trim();
    if (!text || busy) return;
    const m = HELP_MODES.find(h => h.id === mode);
    const topicLine = ctx && ctx.topic ? `Current topic: ${ctx.topic}${ctx.code ? ' (' + ctx.code + ')' : ''}.` : '';
    const userMsg = { role: 'user', content: text, mode: m.label };
    const next = [...msgs, userMsg];
    setMsgs(next); setDraft(''); setBusy(true);
    try {
      const history = next.filter(x => !x.err).slice(-10).map((x, i, arr) => ({
        role: x.role,
        content: x.role === 'user' && i === arr.length - 1 ? `${topicLine}\nHelp style requested: ${m.prompt}\n\nStudent: ${x.content}` : x.content,
      }));
      let reply = await withTimeout(window.genspark.complete({ messages: [{ role: 'system', content: COMPANION_RULES }, ...history] }), 150000);
      if (looksLikeAnswerDump(reply)) {
        reply = await window.genspark.complete({ messages: [{ role: 'user', content: COMPANION_RULES + `\n\nRewrite this tutor reply so it does NOT reveal the answer. Turn it into one guiding question and one hint:\n\n${reply}` }] });
      }
      setMsgs(v => [...v, { role: 'assistant', content: reply }]);
    } catch (e) {
      if (window.console) console.warn('[Study buddy] AI failed:', e && e.message);
      setMsgs(v => [...v, { role: 'assistant', content: offlineHint(text, m, ctx), err: true, offline: true }]);
    }
    setBusy(false);
  };

  return (
    <>
      <div className={'cmp-scrim' + (open ? ' on' : '')} onClick={onClose} />
      <aside className={'cmp' + (open ? ' on' : '')} aria-hidden={!open} data-screen-label="Study companion">
        <header className="cmp-head">
          <div>
            <div className="cmp-title">Study companion</div>
            <div className="mono">Hints and questions · never the answer</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            {msgs.length > 0 && <button className="btn ghost small" onClick={() => setMsgs([])}>New chat</button>}
            <button className="back" onClick={onClose} aria-label="Close companion">×</button>
          </div>
        </header>
        {ctx && ctx.topic && <div className="cmp-ctx"><span className="mono">Topic</span> {ctx.topic} {ctx.code && <span className="code">{ctx.code}</span>}</div>}
        <div className="cmp-body" ref={scroller}>
          {msgs.length === 0 && (
            <div className="cmp-empty">
              <p className="cmp-big">Stuck on a question? Paste it here.</p>
              <p>I won't give you the answer. I'll ask questions and give hints until you work it out yourself, so you can do it again in the test.</p>
              <div className="cmp-examples">
                {['How do I find the gradient between two points?', 'I got 3x = 12 so x = 36. Is that right?', 'What is the difference between breathing and respiration?', 'Comment conjuguer "aller" au futur proche ?'].map(s => (
                  <button key={s} onClick={() => { setDraft(s); taRef.current && taRef.current.focus(); }}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={'msg ' + m.role + (m.err ? ' err' : '')}>
              {m.role === 'user' && m.mode && <div className="mono msg-mode">{m.mode}</div>}
              {renderMsg(m.content)}
            </div>
          ))}
          {busy && <div className="msg assistant typing"><i /><i /><i /><span style={{ marginLeft: 8, fontSize: 12, opacity: .75 }}>{waitS > 0 ? `In the queue: your answer starts in ${waitS}s` : 'Thinking…'}</span></div>}
        </div>
        <footer className="cmp-foot">
          <div className="cmp-modes">
            {HELP_MODES.map(h => <button key={h.id} className={'chip' + (mode === h.id ? ' on' : '')} onClick={() => setMode(h.id)}>{h.label}</button>)}
          </div>
          <div className="cmp-input">
            <textarea ref={taRef} rows={2} value={draft} placeholder={mode === 'check' ? 'Paste the question and your working…' : 'Type your question…'}
              onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <button className="btn" onClick={() => send()} disabled={!draft.trim() || busy} aria-label="Send">↑</button>
          </div>
        </footer>
      </aside>
    </>
  );
}

window.Companion = Companion;
window.COMPANION_RULES = COMPANION_RULES;
