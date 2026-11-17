/* English models */
function enSay(t, lang = 'en-GB', rate = 0.95, pitch = 1, onend) {
  if (!window.speechSynthesis) { onend && onend(); return; }
  const u = new SpeechSynthesisUtterance(t); u.lang = lang; u.rate = rate; u.pitch = pitch;
  const vs = speechSynthesis.getVoices(); const v = vs.find(x => x.lang === lang) || vs.find(x => x.lang && x.lang.slice(0, 2) === lang.slice(0, 2)); if (v) u.voice = v;
  if (onend) u.onend = onend; speechSynthesis.speak(u);
}
window.enSay = enSay;
function useEnRounds(n, onState, extra) {
  const [ri, setRi] = uSt(0), [solved, setSolved] = uSt(0);
  const ex = extra || {};
  useRep(onState, { solved, total: n, done: solved >= n, ...ex }, [solved, JSON.stringify(ex)]);
  const win = () => setSolved(s => Math.max(s, ri + 1));
  return [ri, setRi, solved, win];
}
function EnFoot({ ri, n, ok, onNext }) {
  return <div className="wfoot"><span className="mono">{ri + 1} of {n}</span>{ok && ri < n - 1 && <button className="btn small" onClick={onNext}>Next →</button>}{ok && ri === n - 1 && <span className="wnote" style={{ color: 'var(--ok)' }}>All done ✓</span>}</div>;
}
function enMark(text, marks, cls = 'en-ev') {
  if (!marks || !marks.length) return text;
  const esc = marks.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return text.split(new RegExp('(' + esc.join('|') + ')', 'g')).map((p, i) => marks.includes(p) ? <mark key={i} className={cls}>{p}</mark> : <React.Fragment key={i}>{p}</React.Fragment>);
}
function EnFb({ ok, yes, no }) { return <div className={'feedback ' + (ok ? 'right' : 'wrong')} style={{ opacity: 1, animation: 'none' }}><span className="tag">{ok ? 'Yes!' : 'Not quite'}</span><span>{ok ? yes : no}</span></div>; }

/* Word builder: prefix + root + suffix */
const EN_ROOTS = {
  port: { m: 'carry', pre: { trans: 'across', im: 'in', ex: 'out', re: 'back' }, suf: { able: 'able to be', er: 'a person who', ation: 'the act of' }, w: { 'trans|': ['transport', 'carry across'], '|able': ['portable', 'able to be carried'], 'im|': ['import', 'carry in to a country'], 'ex|': ['export', 'carry out of a country'], 're|': ['report', 'carry back news'], '|er': ['porter', 'a person who carries bags'], 'trans|ation': ['transportation', 'the act of carrying across'], 'ex|er': ['exporter', 'a person who sends goods out'], 're|er': ['reporter', 'a person who carries back news'], 'im|er': ['importer', 'a person who brings goods in'] } },
  spect: { m: 'look', pre: { in: 'into', re: 'back at', pro: 'forward' }, suf: { ator: 'a person who', acle: 'a thing', or: 'a person who', ful: 'full of' }, w: { 'in|': ['inspect', 'look into closely'], 're|': ['respect', 'look back at with admiration'], 'pro|': ['prospect', 'a look forward: a future chance'], '|ator': ['spectator', 'a person who watches'], '|acle': ['spectacle', 'a thing to look at'], 'in|or': ['inspector', 'a person who looks into things'], 're|ful': ['respectful', 'full of respect'] } },
  act: { m: 'do', pre: { re: 'back', inter: 'between', trans: 'across' }, suf: { ion: 'the act of', ive: 'tending to', or: 'a person who' }, w: { 're|': ['react', 'act back: respond'], 'inter|': ['interact', 'act between people'], '|ion': ['action', 'the act of doing'], '|ive': ['active', 'tending to do things'], '|or': ['actor', 'a person who acts'], 're|ion': ['reaction', 'an act in response'], 'inter|ive': ['interactive', 'tending to act with others'], 'inter|ion': ['interaction', 'acting together'], 'trans|ion': ['transaction', 'an exchange (e.g. buying)'] } },
  happy: { m: 'glad', pre: { un: 'not' }, suf: { ness: 'the state of', ly: 'in a … way', er: 'more' }, w: { 'un|': ['unhappy', 'not happy'], '|ness': ['happiness', 'the state of being happy (y → i)'], '|ly': ['happily', 'in a happy way (y → i)'], '|er': ['happier', 'more happy (y → i)'], 'un|ness': ['unhappiness', 'the state of not being happy'], 'un|ly': ['unhappily', 'in an unhappy way'] } },
};
W.wordbuild = function ({ cfg, onState }) {
  const [root, setRoot] = uSt('port'), [pre, setPre] = uSt(''), [suf, setSuf] = uSt(''), [found, setFound] = uSt({});
  const R = EN_ROOTS[root]; const hit = R.w[pre + '|' + suf];
  uEf(() => { if (hit && !found[hit[0]]) setFound(f => ({ ...f, [hit[0]]: root })); }, [root, pre, suf]);
  const n = Object.keys(found).length, roots = new Set(Object.values(found)).size;
  useRep(onState, { found: n, roots }, [n, roots]);
  return (
    <div className="wbox">
      <div className="en-build">
        <div className={'en-part pre' + (pre ? '' : ' empty')}><small>prefix</small><b>{pre ? pre + '-' : '—'}</b><i>{pre ? R.pre[pre] : ''}</i></div>
        <span className="en-plus">+</span>
        <div className="en-part root"><small>root</small><b>{root}</b><i>{R.m}</i></div>
        <span className="en-plus">+</span>
        <div className={'en-part suf' + (suf ? '' : ' empty')}><small>suffix</small><b>{suf ? '-' + suf : '—'}</b><i>{suf ? R.suf[suf] : ''}</i></div>
        <span className="en-plus">=</span>
        <div className={'en-part res' + (hit ? ' ok' : '')}><small>{hit ? 'real word!' : 'hmm…'}</small><b>{hit ? hit[0] : '?'}</b><i>{hit ? hit[1] : pre || suf ? 'Not a real word. Try another part!' : 'Add a prefix or suffix'}</i></div>
      </div>
      <div className="wnote"> Words found ({n}): {Object.keys(found).join(', ') || 'none yet'}</div>
      <WCtl><WSeg label="Root" opts={Object.keys(EN_ROOTS).map(k => [k, k + ' (' + EN_ROOTS[k].m + ')'])} v={root} set={k => { setRoot(k); setPre(''); setSuf(''); }} /><WSeg label="Prefix" opts={[['', 'none'], ...Object.keys(R.pre).map(k => [k, k + '-'])]} v={pre} set={setPre} /><WSeg label="Suffix" opts={[['', 'none'], ...Object.keys(R.suf).map(k => [k, '-' + k])]} v={suf} set={setSuf} /></WCtl>
    </div>
  );
};

/* Clue detective: context meaning / inference */
W.clue = function ({ cfg, onState }) {
  const R = cfg.rounds; const [ri, setRi, solved, win] = useEnRounds(R.length, onState);
  const r = R[ri]; const [sel, setSel] = uSt(null), [hint, setHint] = uSt(false);
  uEf(() => { setSel(null); setHint(false); }, [ri]);
  const ok = sel === r.a;
  const pick = i => { if (ok) return; setSel(i); if (i === r.a) win(); else setHint(true); };
  const txt = r.word ? r.t.split(r.word) : [r.t];
  return (
    <div className="wbox">
      <div className="en-detective"> <span>{cfg.label || 'Clue detective'}</span></div>
      <div className="en-passage">{txt.map((p, i) => <React.Fragment key={i}>{enMark(p, hint || ok ? r.ev : [])}{i < txt.length - 1 && <b className="en-target">{r.word}</b>}</React.Fragment>)}</div>
      <div className="wprompt">{r.q}</div>
      <div className="en-opts">{r.opts.map((o, i) => <button key={i} className={'chip' + (sel === i ? i === r.a ? ' on' : ' bad shake' : '')} onClick={() => pick(i)}>{o}</button>)}</div>
      {sel != null && <EnFb ok={ok} yes={r.why} no="Look at the highlighted clues and try again." />}
      {!hint && !ok && <div><button className="chip" onClick={() => setHint(true)}> Show me the clues</button></div>}
      <EnFoot ri={ri} n={R.length} ok={ok} onNext={() => setRi(ri + 1)} />
    </div>
  );
};

/* Suffix spelling machine */
const EN_SUF_RULES = { add: [' Just add it', 'Nothing changes: just add the suffix.'], drop: [' Drop the final e', 'A word ending in e loses the e before a suffix that starts with a vowel.'], dbl: [' Double the last letter', 'Short vowel + one consonant: double the consonant before a vowel suffix.'], yi: [' Change y to i', 'Consonant + y: change y to i (but keep y before -ing).'] };
const EN_SUF_R = [['hope', 'ing', 'drop', 'hoping'], ['run', 'ing', 'dbl', 'running'], ['happy', 'ness', 'yi', 'happiness'], ['play', 'ed', 'add', 'played'], ['care', 'ful', 'add', 'careful'], ['begin', 'er', 'dbl', 'beginner'], ['beauty', 'ful', 'yi', 'beautiful'], ['write', 'ing', 'drop', 'writing']];
W.suffixlab = function ({ cfg, onState }) {
  const [ri, setRi, solved, win] = useEnRounds(EN_SUF_R.length, onState);
  const [b, s, rule, res] = EN_SUF_R[ri]; const [sel, setSel] = uSt(null);
  uEf(() => setSel(null), [ri]);
  const ok = sel === rule;
  const pick = k => { if (ok) return; setSel(k); if (k === rule) win(); };
  const show = () => {
    if (rule === 'drop') return <>{b.slice(0, -1)}<s className="en-del">e</s><span className="en-add">{s}</span></>;
    if (rule === 'dbl') return <>{b}<span className="en-ins">{b.slice(-1)}</span><span className="en-add">{s}</span></>;
    if (rule === 'yi') return <>{b.slice(0, -1)}<s className="en-del">y</s><span className="en-ins">i</span><span className="en-add">{s}</span></>;
    return <>{b}<span className="en-add">{s}</span></>;
  };
  return (
    <div className="wbox">
      <div className="en-machine">
        <span className="en-chipw">{b}</span><span className="en-plus">+</span><span className="en-chipw suf">-{s}</span>
        <span className="en-gear"></span>
        <span className={'en-chipw out' + (ok ? ' ok' : '')}>{ok ? show() : '?'}</span>
      </div>
      <div className="wprompt">Which spelling rule does the machine need?</div>
      <div className="en-opts">{Object.entries(EN_SUF_RULES).map(([k, [l]]) => <button key={k} className={'chip' + (sel === k ? k === rule ? ' on' : ' bad shake' : '')} onClick={() => pick(k)}>{l}</button>)}</div>
      {sel && <EnFb ok={ok} yes={`${b} + ${s} = ${res}. ${EN_SUF_RULES[rule][1]}`} no="Look at the last letters of the word and the first letter of the suffix." />}
      <EnFoot ri={ri} n={EN_SUF_R.length} ok={ok} onNext={() => setRi(ri + 1)} />
    </div>
  );
};

/* Highlighter: find techniques / facts & opinions etc. */
W.highlight = function ({ cfg, onState }) {
  const items = uMm(() => { const out = []; cfg.chunks.forEach(c => { if (Array.isArray(c)) out.push({ t: c[0], k: c[1], why: c[2] }); else c.split(/(\s+)/).forEach(w => w && out.push(/^\s+$/.test(w) ? { sp: w } : { t: w })); }); return out; }, []);
  const total = items.filter(x => x.k).length;
  const [pen, setPen] = uSt(cfg.pens[0][0]), [got, setGot] = uSt({}), [bad, setBad] = uSt(null), [msg, setMsg] = uSt(''), [last, setLast] = uSt(null);
  const n = Object.keys(got).length;
  useRep(onState, { found: n, total, done: n >= total }, [n]);
  const col = k => (cfg.pens.find(p => p[0] === k) || [])[2];
  const tap = (it, i) => {
    if (got[i]) { setLast(i); setMsg(''); return; }
    if (it.k && it.k === pen) { setGot({ ...got, [i]: 1 }); setLast(i); setMsg(''); }
    else { setBad(i); setTimeout(() => setBad(null), 450); setMsg(it.k ? ' There is something here, but try a different pen!' : ' Nothing special about that word.'); }
  };
  const L = last != null && items[last].k ? items[last] : null;
  return (
    <div className="wbox">
      <div className="pens">{cfg.pens.map(([k, l, c]) => <button key={k} className={'pen' + (pen === k ? ' on' : '')} style={{ '--pc': c }} onClick={() => setPen(k)}><i />{l}</button>)}</div>
      <div className="en-hl">{items.map((it, i) => it.sp ? it.sp : <button key={i} className={'en-w' + (got[i] ? ' got' : '') + (bad === i ? ' shake bad' : '')} style={got[i] ? { '--wc': col(it.k) } : null} onClick={() => tap(it, i)}>{it.t}</button>)}</div>
      <div className="en-why">{msg || (L ? <><b style={{ color: col(L.k) }}>{cfg.pens.find(p => p[0] === L.k)[1]}:</b> {L.why}</> : 'Pick a highlighter pen, then tap the words or phrases that match it.')}</div>
      <div className="wpb"><div className="wpb-t"><i style={{ width: n / total * 100 + '%' }} /><span>Found {n} / {total}</span></div></div>
    </div>
  );
};

/* Analysis sentence builder */
W.analysis = function ({ cfg, onState }) {
  const R = cfg.rounds; const [ri, setRi, solved, win] = useEnRounds(R.length, onState);
  const r = R[ri]; const [t, setT] = uSt(null), [e, setE] = uSt(null), [chk, setChk] = uSt(null);
  const effs = uMm(() => wxShuffle(r.effs, ri + 3), [ri]);
  uEf(() => { setT(null); setE(null); setChk(null); }, [ri]);
  const check = () => { const ok = t === r.tech && e === r.eff; setChk(ok); if (ok) win(); };
  return (
    <div className="wbox">
      <div className="en-quote">“{r.quote}”</div>
      <div className="en-sent">The writer uses <span className={'en-slot' + (t ? ' f' : '')}>{t || 'technique'}</span>, “{r.quote}”, to <span className={'en-slot b' + (e ? ' f' : '')}>{e || 'effect on the reader'}</span>.</div>
      <div><span className="mono">1 · Name the technique</span><div className="chips">{r.techs.map(x => <button key={x} className={'chip' + (t === x ? ' on' : '')} onClick={() => { setT(x); setChk(null); }}>{x}</button>)}</div></div>
      <div><span className="mono">2 · Explain the effect</span><div className="en-opts">{effs.map(x => <button key={x} className={'chip' + (e === x ? ' on' : '')} onClick={() => { setE(x); setChk(null); }}>{x}</button>)}</div></div>
      {chk != null && <EnFb ok={chk} yes="Technique + quotation + effect = a perfect analysis sentence!" no={t !== r.tech ? 'Check the technique name.' : 'Think about how it makes the reader feel.'} />}
      <div className="wfoot"><span className="mono">{ri + 1} of {R.length}</span>{chk ? (ri < R.length - 1 ? <button className="btn small" onClick={() => setRi(ri + 1)}>Next →</button> : <span className="wnote" style={{ color: 'var(--ok)' }}>All done ✓</span>) : <button className="btn small" disabled={!t || !e} onClick={check}>Check</button>}</div>
    </div>
  );
};

/* Punctuation for meaning */
const EN_ENDS = [['.', 'Calm statement', '', 0.95, 1], ['!', 'Shock or excitement', '', 1.1, 1.35], ['?', 'Question or disbelief', '', 1, 1.15], ['...', 'Trailing off: suspense', '', 0.7, 0.9]];
const EN_SENTS = ['You ate all the cake', 'The door is open', 'She is here', 'We won'];
const EN_COMMA = [["Let's eat Grandma!", "Let's eat, Grandma!", ' Eating Grandma!', ' Inviting Grandma to eat'], ['I love cooking my family and my dog.', 'I love cooking, my family and my dog.', ' Cooking the family and the dog!', ' Three things I love'], ['The teacher said the student is clever.', 'The teacher, said the student, is clever.', ' The teacher thinks the student is clever', ' The student thinks the teacher is clever']];
W.punct = function ({ cfg, onState }) {
  const [mode, setMode] = uSt('end'), [si, setSi] = uSt(0), [ei, setEi] = uSt(0), [tried, setTried] = uSt([0]), [ci, setCi] = uSt(0), [cm, setCm] = uSt(false), [seen, setSeen] = uSt(['0-0']);
  const pairs = new Set(seen.filter(k => seen.includes(k.split('-')[0] + '-0') && seen.includes(k.split('-')[0] + '-1')).map(k => k.split('-')[0])).size;
  useRep(onState, { ends: tried.length, commas: pairs }, [tried.length, pairs]);
  const E = EN_ENDS[ei], txt = EN_SENTS[si] + E[0];
  const pickE = i => { setEi(i); if (!tried.includes(i)) setTried([...tried, i]); const e = EN_ENDS[i]; window.speechSynthesis && speechSynthesis.cancel(); enSay(EN_SENTS[si] + e[0], 'en-GB', e[3], e[4]); };
  const C = EN_COMMA[ci];
  const toggleC = v => { setCm(v); const k = ci + '-' + (v ? 1 : 0); if (!seen.includes(k)) setSeen([...seen, k]); };
  return (
    <div className="wbox">
      {mode === 'end' ? <>
        <div className="en-face">{E[2]}</div>
        <div className="en-bigsent">{EN_SENTS[si]}<b className="en-pmark">{E[0]}</b></div>
        <div className="wbig" style={{ textAlign: 'center', fontSize: 20 }}>{E[1]}</div>
        <div className="en-endbtns">{EN_ENDS.map((e, i) => <button key={i} className={'en-endb' + (ei === i ? ' on' : '')} onClick={() => pickE(i)}>{e[0]}</button>)}</div>
        <div className="wnote">Tap an ending to hear how the same words change their tone. Tried {tried.length}/4.</div>
      </> : <>
        <div className="en-face">{cm ? C[3].split(' ')[0] : C[2].split(' ')[0]}</div>
        <div className="en-bigsent">{cm ? C[1] : C[0]}</div>
        <div className="wbig" style={{ textAlign: 'center', fontSize: 20 }}>{(cm ? C[3] : C[2]).split(' ').slice(1).join(' ')}</div>
        <div className="g-row" style={{ justifyContent: 'center' }}><button className={'chip' + (!cm ? ' on' : '')} onClick={() => toggleC(false)}>No comma</button><button className={'chip' + (cm ? ' on' : '')} onClick={() => toggleC(true)}>With comma ,</button></div>
        <div className="wnote">One small comma can completely change the meaning! Both versions viewed for {pairs}/3 sentences.</div>
      </>}
      <WCtl><WSeg opts={[['end', 'End punctuation'], ['comma', 'Commas change meaning']]} v={mode} set={setMode} />{mode === 'end' ? <WSeg label="Sentence" opts={EN_SENTS.map((s, i) => [i, s])} v={si} set={setSi} /> : <WSeg label="Sentence" opts={EN_COMMA.map((c, i) => [i, 'Sentence ' + (i + 1)])} v={ci} set={i => { setCi(i); setCm(false); const k = i + '-0'; if (!seen.includes(k)) setSeen(s => [...s, k]); }} />}</WCtl>
    </div>
  );
};

/* Connectives */
const EN_CONN = { add: [' Adding', ['Furthermore,', 'In addition,', 'Moreover,', 'Also,']], contrast: [' Contrasting', ['However,', 'Nevertheless,', 'On the other hand,', 'Although']], cause: [' Cause & effect', ['As a result,', 'Therefore,', 'Consequently,', 'Because']], seq: [' Sequencing', ['Next,', 'Then,', 'After that,', 'Finally,']], emph: [' Emphasising', ['Above all,', 'In particular,', 'Indeed,', 'Most importantly,']] };
const EN_CONN_R = [['It was raining heavily.', 'We played football outside.', 'contrast'], ['She revised every evening.', 'She passed the test easily.', 'cause'], ['Boil the water.', 'Add the pasta and stir.', 'seq'], ['Plastic harms sea creatures.', 'It pollutes our beaches.', 'add'], ['Sleep helps your brain work well.', 'It is vital before exams.', 'emph']];
function enJoin(a, b, c) { const lc = s => s[0].toLowerCase() + s.slice(1); if (c.endsWith(',')) return a + ' ' + c + ' ' + lc(b); return c + ' ' + lc(a.replace(/\.$/, '')) + ', ' + lc(b); }
W.connect = function ({ cfg, onState }) {
  const [ri, setRi, solved, win] = useEnRounds(EN_CONN_R.length, onState);
  const [a, b, rel] = EN_CONN_R[ri]; const [r, setR] = uSt(null), [c, setC] = uSt(null);
  uEf(() => { setR(null); setC(null); }, [ri]);
  const okR = r === rel, ok = okR && c;
  uEf(() => { if (ok) win(); }, [ok]);
  return (
    <div className="wbox">
      <div className="en-ideas"><span>{a}</span><span className="en-link"></span><span>{b}</span></div>
      <div><span className="mono">1 · How are the ideas linked?</span><div className="en-opts">{Object.entries(EN_CONN).map(([k, [l]]) => <button key={k} className={'chip' + (r === k ? k === rel ? ' on' : ' bad shake' : '')} onClick={() => { setR(k); setC(null); }}>{l}</button>)}</div></div>
      {r && !okR && <div className="wnote"> Hmm, does the second idea add, contrast, result, come next or matter most?</div>}
      {okR && <div><span className="mono">2 · Pick a connective</span><div className="chips">{EN_CONN[rel][1].map(x => <button key={x} className={'chip' + (c === x ? ' on' : '')} onClick={() => setC(x)}>{x.replace(/,$/, '')}</button>)}</div></div>}
      {ok && <div className="en-result">{enJoin(a, b, c)} <button className="fr-say sm" onClick={() => enSay(enJoin(a, b, c))}></button></div>}
      <EnFoot ri={ri} n={EN_CONN_R.length} ok={!!ok} onNext={() => setRi(ri + 1)} />
    </div>
  );
};

/* Summary: keep only main points */
W.summary = function ({ cfg, onState }) {
  const [sel, setSel] = uSt([]), [chk, setChk] = uSt(null), [done, setDone] = uSt(false);
  const words = sel.reduce((a, i) => a + cfg.text[i][0].split(/\s+/).length, 0);
  useRep(onState, { done }, [done]);
  const tog = i => { setChk(null); setSel(sel.includes(i) ? sel.filter(x => x !== i) : [...sel, i]); };
  const check = () => { const miss = cfg.text.filter((t, i) => t[1] && !sel.includes(i)).length, extra = sel.filter(i => !cfg.text[i][1]).length; setChk({ miss, extra }); if (!miss && !extra) setDone(true); };
  return (
    <div className="wbox">
      <div className="mono">Tap the sentences to keep in your summary (limit {cfg.limit} words)</div>
      <div className="en-sumlist">{cfg.text.map(([s, m], i) => <button key={i} className={'en-sum' + (sel.includes(i) ? ' on' : '') + (chk && sel.includes(i) && !m ? ' bad' : '') + (chk && !sel.includes(i) && m ? ' miss' : '')} onClick={() => tog(i)}><span className="b">{sel.includes(i) ? '✓' : ''}</span>{s}</button>)}</div>
      <div className="wpb"><span className="mono">Word count</span><div className="wpb-t"><i style={{ width: Math.min(100, words / cfg.limit * 100) + '%', background: words > cfg.limit ? 'var(--bad)' : undefined }} /><span>{words} / {cfg.limit} words</span></div></div>
      {chk && <EnFb ok={done} yes="Perfect summary: only the main points, and short!" no={(chk.miss ? `You're missing ${chk.miss} main point${chk.miss > 1 ? 's' : ''} (dashed). ` : '') + (chk.extra ? `${chk.extra} sentence${chk.extra > 1 ? 's are' : ' is'} only a detail or example (red).` : '')} />}
      <button className="btn small" onClick={check} disabled={!sel.length}>Check my summary</button>
    </div>
  );
};

/* Persuasive speech builder */
W.persuade = function ({ cfg, onState }) {
  const [on, setOn] = uSt([]), [info, setInfo] = uSt(null), [played, setPlayed] = uSt(false), [speaking, setSpeaking] = uSt(false);
  useRep(onState, { used: on.length, played }, [on.length, played]);
  const speech = cfg.items.filter(it => on.includes(it[0])).map(it => it[3]).join(' ');
  const listen = () => { if (speaking) { speechSynthesis.cancel(); setSpeaking(false); return; } if (!speech) return; setPlayed(true); setSpeaking(true); enSay(cfg.topic + '. ' + speech, 'en-GB', 0.95, 1, () => setSpeaking(false)); };
  return (
    <div className="wbox">
      <div className="en-topic"> {cfg.topic}</div>
      <div className="en-aforest">{cfg.items.map(([k, l, d]) => <button key={k} className={'en-af' + (on.includes(k) ? ' on' : '')} onClick={() => { setOn(on.includes(k) ? on.filter(x => x !== k) : [...on, k]); setInfo(k); }}><b>{k}</b><span>{l}</span></button>)}</div>
      {info && <div className="wnote"><b>{cfg.items.find(i => i[0] === info)[1]}:</b> {cfg.items.find(i => i[0] === info)[2]}</div>}
      <div className="en-speech">{on.length ? cfg.items.filter(it => on.includes(it[0])).map(it => <span key={it[0]}><sup>{it[0]}</sup>{it[3]} </span>) : <i>Tap the AFOREST letters to add techniques to your speech.</i>}</div>
      <div className="wpb"><span className="mono">Persuasion power</span><div className="wpb-t"><i style={{ width: on.length / cfg.items.length * 100 + '%', background: 'linear-gradient(90deg,#ffc75f,#ff6f91)' }} /><span>{['Not convinced yet…', 'Hmm, a little', 'Getting there!', 'Quite convincing', 'Very persuasive!', 'Wow, I agree!', 'Unstoppable!', 'Standing ovation! '][on.length]}</span></div></div>
      <WCtl><button className="btn small" onClick={listen} disabled={!speech}>{speaking ? ' Stop' : ' Listen to my speech'}</button></WCtl>
    </div>
  );
};

/* PEE paragraph builder */
W.pee = function ({ cfg, onState }) {
  const R = cfg.rounds; const [ri, setRi, solved, win] = useEnRounds(R.length, onState);
  const r = R[ri]; const sh = uMm(() => ({ P: wxShuffle(r.P, ri + 1), E: wxShuffle(r.E, ri + 2), X: wxShuffle(r.X, ri + 3) }), [ri]);
  const [pk, setPk] = uSt({}), [chk, setChk] = uSt(null);
  uEf(() => { setPk({}); setChk(null); }, [ri]);
  const all = pk.P && pk.E && pk.X;
  const check = () => { const ok = pk.P === r.P[0] && pk.E === r.E[0] && pk.X === r.X[0]; setChk(ok); if (ok) win(); };
  const lab = { P: ['P', 'Point', 'Make your point clearly'], E: ['E', 'Evidence', 'Give a fact, example or quote'], X: ['E', 'Explain', 'Explain how the evidence proves your point'] };
  return (
    <div className="wbox">
      <div className="en-topic"> {r.q}</div>
      {['P', 'E', 'X'].map(k => <div key={k} className={'en-peerow ' + k}><div className="en-peeh"><b>{lab[k][0]}</b><span>{lab[k][1]}</span><small>{lab[k][2]}</small></div><div className="en-opts">{sh[k].map(o => <button key={o} className={'chip' + (pk[k] === o ? ' on' : '') + (chk === false && pk[k] === o && o !== r[k][0] ? ' bad' : '')} onClick={() => { setPk({ ...pk, [k]: o }); setChk(null); }}>{o}</button>)}</div></div>)}
      {all && <div className="en-para"><span className="p">{pk.P}</span> <span className="e">{pk.E}</span> <span className="x">{pk.X}</span></div>}
      {chk != null && <EnFb ok={chk} yes="A strong PEE paragraph: point, proof and explanation!" no="One part (red) is weak. A good point is clear, evidence is a real fact/quote, and the explanation links back to the point." />}
      <div className="wfoot"><span className="mono">{ri + 1} of {R.length}</span>{chk ? (ri < R.length - 1 ? <button className="btn small" onClick={() => setRi(ri + 1)}>Next →</button> : <span className="wnote" style={{ color: 'var(--ok)' }}>All done ✓</span>) : <button className="btn small" disabled={!all} onClick={check}>Check paragraph</button>}</div>
    </div>
  );
};

/* Formality slider */
const EN_FORM = [
  { t: 'Asking for help with homework', v: ['hey can u help me with the maths hw??  no clue lol', "Hi Mr Patel,\nCould you help me with the maths homework, please? I'm stuck on question 3.\nThanks,\nSam", 'Dear Mr Patel,\nI am writing to ask whether you would be able to provide some additional support with the mathematics homework, as I am finding question 3 particularly challenging.\nYours sincerely,\nSamuel Okafor'] },
  { t: 'Complaining about lunch', v: ['ugh lunch was SO gross today  never again', "Hi Mrs Lee,\nI just wanted to let you know that today's lunch was cold. Could someone look into it?\nThanks,\nSam", 'Dear Head Teacher,\nI wish to raise a concern regarding the quality of school lunches. On several occasions this week, meals have been served cold.\nI would be grateful if this matter could be investigated.\nYours faithfully,\nSamuel Okafor'] },
  { t: 'Inviting someone to an event', v: ['party at mine sat!! u coming? ', "Hi Aunt Rosa,\nWe're having a small party on Saturday at 4 pm. Would you like to come?\nLove,\nSam", 'Dear Councillor Ahmed,\nOn behalf of the Year 8 student council, I would like to invite you to our charity fair on Saturday 14 June at 2 pm.\nWe would be delighted if you were able to attend.\nYours sincerely,\nSamuel Okafor'] },
];
const EN_FORM_L = [[' Text to a friend', ['Slang & abbreviations (u, lol)', 'Emojis', "Contractions (can't)", 'No greeting or sign-off']], [' Email to a teacher', ['Polite greeting (Hi Mr Patel)', 'Some contractions are OK', 'Please / thank you', 'Short and clear']], [' Formal letter', ['Dear … / Yours sincerely', 'No contractions (I am, not I\'m)', 'Formal words (regarding, grateful)', 'Full sentences and paragraphs']]];
W.formality = function ({ cfg, onState }) {
  const [lvl, setLvl] = uSt(0), [mi, setMi] = uSt(0);
  useRep(onState, { lvl, mi }, [lvl, mi]);
  return (
    <div className="wbox">
      <div className="en-formscale">{EN_FORM_L.map(([l], i) => <button key={i} className={'en-fs' + (lvl === i ? ' on' : '')} onClick={() => setLvl(i)}>{l}</button>)}</div>
      <input type="range" min="0" max="2" step="1" value={lvl} onChange={e => setLvl(+e.target.value)} className="en-frange" />
      <div className={'en-msg l' + lvl}>{EN_FORM[mi].v[lvl]}</div>
      <div className="en-feats">{EN_FORM_L[lvl][1].map(f => <span key={f}>✓ {f}</span>)}</div>
      <div className="wnote">Formality depends on your <b>audience</b> and <b>purpose</b>. Slide from informal to formal and watch the language change.</div>
      <WCtl><WSeg label="Message" opts={EN_FORM.map((m, i) => [i, m.t])} v={mi} set={setMi} /></WCtl>
    </div>
  );
};

/* Story arc */
const EN_ARC = ['Opening', 'Build-up', 'Climax', 'Resolution', 'Ending'];
W.storyarc = function ({ cfg, onState }) {
  const evs = uMm(() => wxShuffle(cfg.events.map((e, i) => ({ t: e[0], s: e[1], i })), 9), []);
  const [place, setPlace] = uSt({}), [sel, setSel] = uSt(null), [chk, setChk] = uSt(null);
  const done = chk === true;
  useRep(onState, { done }, [done]);
  const pts = [[40, 160], [120, 115], [200, 40], [280, 110], [360, 150]];
  const put = st => { if (sel == null) return; setPlace({ ...place, [sel]: st }); setSel(null); setChk(null); };
  const check = () => setChk(evs.every(e => place[e.i] === e.s));
  return (
    <div className="wbox">
      <svg viewBox="0 0 400 200" className="wsvg">
        <path d={`M${pts.map(p => p.join(',')).join(' L')}`} fill="none" stroke="var(--acc)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="10" y="20" style={{ fontSize: 11 }}>tension ↑</text>
        {pts.map(([x, y], i) => <g key={i} onClick={() => put(i)} style={{ cursor: sel != null ? 'pointer' : 'default' }}>
          <circle cx={x} cy={y} r={sel != null ? 18 : 14} fill={sel != null ? 'var(--gold)' : '#fff'} stroke="var(--acc)" strokeWidth="3" />
          <text x={x} y={y + 5} textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fill: 'var(--ink)' }}>{evs.filter(e => place[e.i] === i).length || ''}</text>
          <text x={x} y={y + 34} textAnchor="middle" className="w-lab" style={{ fontSize: 12 }}>{EN_ARC[i]}</text>
        </g>)}
      </svg>
      <div className="mono">{sel != null ? ' Now tap a point on the story arc' : 'Tap an event, then tap where it belongs on the arc'}</div>
      <div className="en-sumlist">{evs.map(e => <button key={e.i} className={'en-sum' + (sel === e.i ? ' on' : '') + (chk === false && place[e.i] != null && place[e.i] !== e.s ? ' bad' : '')} onClick={() => setSel(e.i)}><span className="b">{place[e.i] != null ? EN_ARC[place[e.i]][0] : '?'}</span>{e.t}{place[e.i] != null && <small className="en-tagp">{EN_ARC[place[e.i]]}</small>}</button>)}</div>
      {chk != null && <EnFb ok={chk} yes="Perfect story shape: tension builds to a climax, then resolves!" no="Some events (red) are in the wrong place. Where does the tension peak?" />}
      <button className="btn small" disabled={Object.keys(place).length < evs.length} onClick={check}>Check my story arc</button>
    </div>
  );
};

/* Viewpoint switcher */
const EN_VP = {
  '1-past': 'I crept down the dark stairs. My heart was pounding as I reached for the door.', '1-present': 'I creep down the dark stairs. My heart is pounding as I reach for the door.',
  '2-past': 'You crept down the dark stairs. Your heart was pounding as you reached for the door.', '2-present': 'You creep down the dark stairs. Your heart is pounding as you reach for the door.',
  '3-past': 'She crept down the dark stairs. Her heart was pounding as she reached for the door.', '3-present': 'She creeps down the dark stairs. Her heart is pounding as she reaches for the door.',
};
const EN_VP_NOTE = { 1: 'First person (I, my): we are inside the narrator\'s head, so it feels personal, but we only know what they know.', 2: 'Second person (you): puts the reader in the story. It is unusual and very immersive.', 3: 'Third person (she, her): the narrator stands outside the character and can describe more.', past: 'Past tense: most stories are told as if the events already happened.', present: 'Present tense: feels immediate and tense, as if it is happening now.' };
W.viewpoint = function ({ cfg, onState }) {
  const [p, setP] = uSt('1'), [t, setT] = uSt('past');
  useRep(onState, { person: p, tense: t }, [p, t]);
  const PR = ['I', 'My', 'my', 'You', 'Your', 'you', 'She', 'Her', 'she'], VB = ['crept', 'creep', 'creeps', 'was', 'is', 'reached', 'reach', 'reaches'];
  return (
    <div className="wbox">
      <div className="en-bigsent" style={{ fontSize: 24, textAlign: 'left' }}>{EN_VP[p + '-' + t].split(/(\s+)/).map((w, i) => { const c = w.replace(/[.,]/g, ''); return PR.includes(c) ? <mark key={i} className="en-pr">{w}</mark> : VB.includes(c) ? <mark key={i} className="en-vb">{w}</mark> : w; })}</div>
      <div className="g-row"><span className="en-key pr">pronouns</span><span className="en-key vb">verbs (tense)</span><button className="fr-say sm" onClick={() => enSay(EN_VP[p + '-' + t])}></button></div>
      <div className="wnote">{EN_VP_NOTE[p]} {EN_VP_NOTE[t]}</div>
      <WCtl><WSeg label="Person" opts={[['1', '1st: I'], ['2', '2nd: you'], ['3', '3rd: she']]} v={p} set={setP} /><WSeg label="Tense" opts={[['past', 'Past'], ['present', 'Present']]} v={t} set={setT} /></WCtl>
    </div>
  );
};

/* Vocabulary upgrade */
const EN_UP = { t: ['The', ['nice'], 'dog', ['went'], 'across the', ['big'], 'field and', ['said'], 'hello to the', ['small'], 'cat.'], o: { nice: [['scruffy', 'messy and loveable'], ['playful', 'full of fun'], ['loyal', 'faithful'], ['excitable', 'easily thrilled']], went: [['bounded', 'big happy leaps'], ['crept', 'slowly and secretly'], ['raced', 'very fast'], ['trotted', 'light quick steps']], big: [['vast', 'huge and open'], ['muddy', 'wet and dirty'], ['sprawling', 'spreading widely'], ['frosty', 'covered in ice']], said: [['barked', 'a loud dog sound'], ['yelped', 'a short high cry'], ['woofed', 'a friendly bark'], ['growled', 'a low warning sound']], small: [['tiny', 'very small'], ['timid', 'shy and nervous'], ['ginger', 'orange-furred'], ['sleepy', 'tired']] } };
W.upgrade = function ({ cfg, onState }) {
  const [ch, setCh] = uSt({}), [open, setOpen] = uSt(null);
  const n = Object.keys(ch).length;
  useRep(onState, { upgraded: n }, [n]);
  const sent = EN_UP.t.map(x => Array.isArray(x) ? (ch[x[0]] || x[0]) : x).join(' ');
  return (
    <div className="wbox">
      <div className="en-bigsent" style={{ fontSize: 24, lineHeight: 2 }}>{EN_UP.t.map((x, i) => Array.isArray(x) ? <button key={i} className={'en-dull' + (ch[x[0]] ? ' up' : '') + (open === x[0] ? ' open' : '')} onClick={() => setOpen(x[0])}>{ch[x[0]] || x[0]}</button> : <span key={i}> {x} </span>)}</div>
      {open ? <div><span className="mono">Replace “{open}” with a more precise word:</span><div className="en-opts">{EN_UP.o[open].map(([w, m]) => <button key={w} className={'chip' + (ch[open] === w ? ' on' : '')} onClick={() => { setCh({ ...ch, [open]: w }); }}>{w} <small style={{ opacity: .7 }}>· {m}</small></button>)}</div></div> : <div className="wnote"> Tap a dull word (dashed) to upgrade it.</div>}
      <div className="wpb"><span className="mono">Word power</span><div className="wpb-t"><i style={{ width: n / 5 * 100 + '%', background: 'linear-gradient(90deg,#a78bfa,#4facfe)' }} /><span>{n}/5 upgraded {n === 5 ? '' : ''}</span></div></div>
      <WCtl><button className="btn small" onClick={() => enSay(sent)}> Read my sentence</button></WCtl>
      <div className="wnote">Precise words <b>show</b> the reader exactly what happens. “Crept” and “bounded” paint very different pictures from “went”!</div>
    </div>
  );
};

/* Proofreading */
const EN_PR = ['Yesterday', ['their', 'there', ['there', "they're"], '"There was" uses there. "Their" means belonging to them.'], 'was a huge storm in', ['london.', 'London.', ['London.', 'LONDON.'], 'Names of places need a capital letter.'], ['Its', "It's", ["It's", "Its'"], '"It\'s" = it is. "Its" means belonging to it.'], 'important to stay', ['inside,', 'inside.', ['inside.', 'inside;;'], 'This is a comma splice: two sentences joined by a comma. Use a full stop.'], ['the', 'The', ['The', 'THE'], 'A new sentence needs a capital letter.'], 'wind was so strong that', ["tree's", 'trees', ['trees', "trees'"], 'A plural, not a possessive: no apostrophe.'], 'fell across the roads. Someone', ['could of', 'could have', ['could have', 'could off'], 'Could have (could\'ve), never "could of".'], 'been hurt, so we stayed home and', ['definately', 'definitely', ['definitely', 'definitly'], 'Spelling: defin-ITE-ly (it contains "finite").'], 'felt safer.'];
W.proofread = function ({ cfg, onState }) {
  const toks = uMm(() => { const out = []; EN_PR.forEach(x => Array.isArray(x) ? out.push({ e: x }) : x.split(' ').forEach(w => out.push({ t: w }))); return out; }, []);
  const total = toks.filter(t => t.e).length;
  const [fix, setFix] = uSt({}), [open, setOpen] = uSt(null), [msg, setMsg] = uSt(''), [bad, setBad] = uSt(null);
  const n = Object.keys(fix).length;
  useRep(onState, { fixed: n, total, done: n >= total }, [n]);
  const tap = (t, i) => { if (t.e) { if (!fix[i]) setOpen(i); setMsg(''); } else { setBad(i); setTimeout(() => setBad(null), 400); setMsg('✓ No mistake there.'); setOpen(null); } };
  const choose = (i, o) => { const e = toks[i].e; if (o === e[1]) { setFix({ ...fix, [i]: 1 }); setMsg(' ' + e[3]); setOpen(null); } else setMsg(' Not that one. Try again!'); };
  return (
    <div className="wbox">
      <div className="mono"> Find and fix {total} mistakes. Tap any word you think is wrong.</div>
      <div className="en-proof">{toks.map((t, i) => <React.Fragment key={i}><button className={'en-pw' + (fix[i] ? ' fixed' : '') + (open === i ? ' open' : '') + (bad === i ? ' shake' : '')} onClick={() => tap(t, i)}>{t.e ? (fix[i] ? t.e[1] : t.e[0]) : t.t}</button> </React.Fragment>)}</div>
      {open != null && <div><span className="mono">Correct “{toks[open].e[0]}” to…</span><div className="chips">{wxShuffle(toks[open].e[2], open).map(o => <button key={o} className="chip" onClick={() => choose(open, o)}>{o}</button>)}</div></div>}
      <div className="en-why">{msg || 'Check capitals, apostrophes, homophones (there/their), punctuation and spelling.'}</div>
      <div className="wpb"><div className="wpb-t"><i style={{ width: n / total * 100 + '%' }} /><span>Fixed {n} / {total}</span></div></div>
    </div>
  );
};

/* Speech delivery coach */
const EN_SPEECH = 'Imagine a world without bees. | No apples. No almonds. No chocolate. | Bees pollinate a third of the food we eat, | yet their numbers are falling fast. | We can help: | plant wildflowers, | avoid pesticides, | and protect their homes. | Act now, before it is too late.';
W.deliver = function ({ cfg, onState }) {
  const chunks = uMm(() => EN_SPEECH.split('|').map(s => s.trim().split(' ')), []);
  const [emph, setEmph] = uSt({}), [rate, setRate] = uSt(1), [pause, setPause] = uSt(true), [cur, setCur] = uSt(-1), [played, setPlayed] = uSt(false), [slow, setSlow] = uSt(false);
  const stop = uRf(false);
  const ne = Object.keys(emph).length;
  useRep(onState, { emph: ne, played, slow }, [ne, played, slow]);
  const play = () => {
    if (cur >= 0) { stop.current = true; speechSynthesis.cancel(); setCur(-1); return; }
    stop.current = false; setPlayed(true); if (rate <= 0.8) setSlow(true);
    const step = ci => {
      if (stop.current || ci >= chunks.length) { setCur(-1); return; }
      setCur(ci); const segs = []; let buf = [];
      chunks[ci].forEach((w, wi) => { if (emph[ci + '-' + wi]) { if (buf.length) segs.push([buf.join(' '), 0]); buf = []; segs.push([w, 1]); } else buf.push(w); });
      if (buf.length) segs.push([buf.join(' '), 0]);
      const say = si => { if (stop.current) return; if (si >= segs.length) { setTimeout(() => step(ci + 1), pause ? 650 : 60); return; } const [t, e] = segs[si]; enSay(t, 'en-GB', e ? rate * 0.8 : rate, e ? 1.25 : 1, () => say(si + 1)); };
      say(0);
    };
    if (window.speechSynthesis) speechSynthesis.cancel(); step(0);
  };
  uEf(() => () => { stop.current = true; window.speechSynthesis && speechSynthesis.cancel(); }, []);
  return (
    <div className="wbox">
      <div className="mono"> Tap words to EMPHASISE them. Then press play.</div>
      <div className="en-speechbox">{chunks.map((c, ci) => <span key={ci} className={'en-chunk' + (cur === ci ? ' now' : '')}>{c.map((w, wi) => <button key={wi} className={'en-ew' + (emph[ci + '-' + wi] ? ' on' : '')} onClick={() => setEmph(e => { const k = ci + '-' + wi, n = { ...e }; if (n[k]) delete n[k]; else n[k] = 1; return n; })}>{w}</button>)}{pause && ci < chunks.length - 1 && <span className="en-pause">‖</span>}</span>)}</div>
      <WRead items={[['Emphasised words', ne], ['Pace', rate < 0.85 ? 'slow ' : rate > 1.15 ? 'fast ' : 'medium'], ['Pauses', pause ? 'on ‖' : 'off']]} />
      <div className="wnote">Great speakers <b>pause</b> after key points, <b>slow down</b> for important ideas and <b>stress</b> the words that matter most.</div>
      <WCtl><button className="btn small" onClick={play}>{cur >= 0 ? ' Stop' : ' Play my speech'}</button><WSl label="Pace" v={rate} set={setRate} min={0.6} max={1.4} step={0.1} fmt={v => '×' + wxFmt(v, 1)} /><button className={'chip' + (pause ? ' on' : '')} onClick={() => setPause(!pause)}>‖ Pauses</button></WCtl>
    </div>
  );
};

/* wrappers */
W.speakset = function ({ cfg, onState }) {
  const n = uRf(0);
  useRep(onState, { clicks: 0 }, []);
  return <div className="en-speakwrap" onClickCapture={() => { n.current++; onState && onState({ clicks: n.current }); }}><SpeakingCompanion initialLang={cfg.lang} initialSet={cfg.set} /></div>;
};
W.sentbuild = function ({ onState }) { return <SentenceBuilder onState={onState} />; };
W.wordtag = function ({ onState }) { return <WordTagger onState={onState} />; };

/* Diagrams */
LDIAG.article = { vb: '0 0 360 300', art: () => <>
  <rect x="10" y="8" width="340" height="286" rx="6" fill="#fff" stroke="var(--rule)" strokeWidth="2" />
  <rect x="20" y="16" width="320" height="16" fill="var(--ink)" /><text x="180" y="28" textAnchor="middle" style={{ fontSize: 11, fill: '#fff', fontWeight: 800, letterSpacing: 3 }}>THE DAILY STAR</text>
  <rect x="20" y="38" width="320" height="24" rx="3" fill="oklch(0.86 0.07 30)" /><text x="180" y="55" textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fill: 'var(--ink)' }}>GIRL, 12, SAVES DOG FROM RIVER</text>
  <rect x="20" y="68" width="250" height="7" rx="2" fill="var(--ink-3)" />
  <rect x="20" y="84" width="150" height="88" rx="3" fill="oklch(0.9 0.04 230)" /><text x="95" y="132" textAnchor="middle" style={{ fontSize: 26 }}></text>
  <rect x="20" y="176" width="120" height="5" rx="2" fill="var(--ink-3)" opacity=".6" />
  {[86, 98, 110].map(y => <rect key={y} x="180" y={y} width="160" height="7" rx="2" fill="var(--ink-2)" />)}
  <rect x="180" y="160" width="160" height="36" rx="4" fill="oklch(0.95 0.04 85)" stroke="oklch(0.75 0.1 85)" /><text x="190" y="182" style={{ fontSize: 10, fontStyle: 'italic', fill: 'var(--ink-2)' }}>“I just grabbed his collar!”</text>
  {[200, 212, 224, 236, 248].map(y => <rect key={y} x="20" y={y} width="150" height="5" rx="2" fill="var(--rule)" />)}
  {[128, 140, 206, 218, 230].map(y => <rect key={y} x="180" y={y} width="160" height="5" rx="2" fill="var(--rule)" />)}
  {[256, 266].map(y => <rect key={y} x="180" y={y} width="160" height="5" rx="2" fill="var(--ink-3)" />)}
</>, parts: [
  ['head', 'Headline', 'Short and punchy to grab attention. Often uses puns, alliteration or strong verbs.', 300, 50],
  ['stand', 'Standfirst (sub-heading)', 'One sentence under the headline that sums up the whole story.', 285, 72],
  ['photo', 'Photo & caption', 'A picture makes the story real; the caption explains what it shows.', 95, 128],
  ['lead', 'Lead paragraph (5 Ws)', 'Answers Who? What? Where? When? Why? in the very first lines.', 330, 98],
  ['quote', 'Quotation', 'Words from a witness or expert make the report believable.', 330, 178],
  ['body', 'Body paragraphs', 'More detail, in order of importance: most important first.', 160, 224],
  ['end', 'Closing paragraph', 'What happens next, or a final comment.', 330, 262],
] };
LDIAG.letter = { vb: '0 0 340 320', art: () => <>
  <rect x="20" y="8" width="300" height="304" rx="4" fill="#fff" stroke="var(--rule)" strokeWidth="2" />
  {[24, 34, 44].map(y => <rect key={y} x="220" y={y} width="85" height="6" rx="2" fill="var(--ink-3)" />)}
  <rect x="235" y="62" width="70" height="6" rx="2" fill="oklch(0.7 0.12 30)" />
  {[84, 94, 104].map(y => <rect key={y} x="35" y={y} width="90" height="6" rx="2" fill="var(--ink-3)" />)}
  <text x="35" y="132" style={{ fontSize: 12, fontWeight: 800, fill: 'var(--ink)' }}>Dear Mrs Shah,</text>
  {[146, 156].map(y => <rect key={y} x="35" y={y} width="270" height="5" rx="2" fill="oklch(0.75 0.09 250)" />)}
  {[176, 186, 196, 212, 222, 232].map(y => <rect key={y} x="35" y={y} width={y % 20 ? 270 : 240} height="5" rx="2" fill="var(--rule)" />)}
  {[248, 258].map(y => <rect key={y} x="35" y={y} width="270" height="5" rx="2" fill="oklch(0.75 0.09 150)" />)}
  <text x="35" y="284" style={{ fontSize: 11, fontStyle: 'italic', fill: 'var(--ink)' }}>Yours sincerely,</text>
  <text x="35" y="302" style={{ fontSize: 11, fill: 'var(--ink-2)' }}>Sam Okafor</text>
</>, parts: [
  ['addr', 'Your address', 'Top right corner. Your address only (no name).', 205, 34],
  ['date', 'Date', 'Written under your address.', 220, 65],
  ['recip', "Recipient's address", 'On the left, below the date: who you are writing to.', 140, 94],
  ['greet', 'Greeting', 'Dear Mrs Shah, (name known) or Dear Sir/Madam, (name unknown).', 145, 128],
  ['open', 'Opening paragraph', 'Say clearly why you are writing.', 320, 151],
  ['main', 'Main paragraphs', 'One point per paragraph, with details and reasons.', 320, 205],
  ['close', 'Closing paragraph', 'Say what you would like to happen next.', 320, 253],
  ['sign', 'Sign-off', 'Yours sincerely (you used their name) or Yours faithfully (Dear Sir/Madam).', 140, 284],
] };
