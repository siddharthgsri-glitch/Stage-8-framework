/* French models */
function frSay(t, rate = 0.85) { enSay(t, 'fr-FR', rate); }
window.frSay = frSay;
function FrSay({ t, sm }) { return <button className={'fr-say' + (sm ? ' sm' : '')} onClick={e => { e.stopPropagation(); window.speechSynthesis && speechSynthesis.cancel(); frSay(t); }} title="Listen"></button>; }
window.FrSay = FrSay;

/* Vocab flashcards */
W.frcards = function ({ cfg, onState }) {
  const cards = cfg.cards; const [i, setI] = uSt(0), [flip, setFlip] = uSt(false), [seen, setSeen] = uSt([0]), [known, setKnown] = uSt([]);
  const go = n => { setI(n); setFlip(false); if (!seen.includes(n)) setSeen(s => [...s, n]); };
  useRep(onState, { seen: seen.length, total: cards.length, known: known.length }, [seen.length, known.length]);
  const c = cards[i];
  const doFlip = () => { setFlip(!flip); if (!flip) frSay(c[1]); };
  return (
    <div className="wbox">
      <div className={'fr-card' + (flip ? ' flip' : '')} onClick={doFlip}>
        <div className="fr-face fr-front"><span className="fr-emo">{c[0]}</span><small>Tap to see the French</small></div>
        <div className="fr-face fr-back"><span className="fr-emo sm">{c[0]}</span><b>{c[1]}</b><span>{c[2]}</span>{c[3] && <i>say: {c[3]}</i>}</div>
      </div>
      <div className="g-row" style={{ justifyContent: 'center' }}>
        <button className="btn small ghost" disabled={i === 0} onClick={() => go(i - 1)}>←</button>
        <FrSay t={c[1]} />
        <button className={'chip' + (known.includes(i) ? ' on' : '')} onClick={() => setKnown(k => k.includes(i) ? k.filter(x => x !== i) : [...k, i])}>{known.includes(i) ? '✓ I know it' : 'I know it'}</button>
        <button className="btn small" disabled={i === cards.length - 1} onClick={() => go(i + 1)}>→</button>
      </div>
      <div className="fr-dots">{cards.map((_, k) => <i key={k} className={(k === i ? 'cur ' : '') + (known.includes(k) ? 'k' : seen.includes(k) ? 's' : '')} onClick={() => go(k)} />)}</div>
      <div className="wnote">Seen {seen.length}/{cards.length} · I know {known.length}</div>
    </div>
  );
};

/* Listen & pick */
W.frlisten = function ({ cfg, onState }) {
  const items = cfg.items; const [ri, setRi, solved, win] = useEnRounds(items.length, onState);
  const it = items[ri]; const opts = uMm(() => wxShuffle([it, ...wxShuffle(items.filter(x => x !== it), ri).slice(0, 3)], ri + 7), [ri]);
  const [sel, setSel] = uSt(null);
  uEf(() => { setSel(null); const t = setTimeout(() => frSay(it[1]), 300); return () => clearTimeout(t); }, [ri]);
  const ok = sel === it;
  return (
    <div className="wbox">
      <div className="fr-ear"><button className="fr-bigplay" onClick={() => frSay(it[1])}></button><span>Listen and pick the right picture</span><button className="chip" onClick={() => frSay(it[1], 0.55)}> Slow</button></div>
      <div className="fr-picks">{opts.map((o, k) => <button key={k} className={'fr-pick' + (sel === o ? (o === it ? ' ok' : ' bad shake') : '')} onClick={() => { if (ok) return; setSel(o); if (o === it) win(); }}><span>{o[0]}</span>{sel && (o === it || sel === o) && <small>{o[1]}</small>}</button>)}</div>
      {sel && <EnFb ok={ok} yes={`“${it[1]}” = ${it[2]}`} no="Listen again and try another picture!" />}
      <EnFoot ri={ri} n={items.length} ok={ok} onNext={() => setRi(ri + 1)} />
    </div>
  );
};

/* Sentence builder (word order) */
W.frbuild = function ({ cfg, onState }) {
  const R = cfg.rounds; const [ri, setRi, solved, win] = useEnRounds(R.length, onState);
  const r = R[ri]; const tiles = uMm(() => wxShuffle(r.w.map((w, i) => ({ w, i })), ri + 5), [ri]);
  const [pick, setPick] = uSt([]), [chk, setChk] = uSt(null);
  uEf(() => { setPick([]); setChk(null); }, [ri]);
  const sent = pick.map(i => r.w[i]).join(' ');
  const check = () => { const ok = sent === r.w.join(' '); setChk(ok); if (ok) { win(); frSay(sent); } };
  return (
    <div className="wbox">
      <div className="fr-en">EN {r.en}</div>
      <div className="fr-line">{pick.length ? pick.map((i, k) => <button key={k} className="fr-tile in" onClick={() => { if (chk) return; setPick(pick.filter((_, x) => x !== k)); setChk(null); }}>{r.w[i]}</button>) : <span className="wnote">Tap the words in the right order…</span>}</div>
      <div className="fr-pool">{tiles.map(t => <button key={t.i} className="fr-tile" disabled={pick.includes(t.i) || chk} onClick={() => setPick([...pick, t.i])}>{t.w}</button>)}</div>
      {chk != null && <EnFb ok={chk} yes={<>FR {r.w.join(' ')} {r.tip ? ' · ' + r.tip : ''}</>} no={'Not quite. ' + (r.tip || 'Check the word order.')} />}
      <div className="wfoot"><span className="mono">{ri + 1} of {R.length}</span>{chk ? (ri < R.length - 1 ? <button className="btn small" onClick={() => setRi(ri + 1)}>Next →</button> : <span className="wnote" style={{ color: 'var(--ok)' }}>All done ✓</span>) : <div className="g-row"><button className="chip" onClick={() => { setPick([]); setChk(null); }}>Clear</button><button className="btn small" disabled={pick.length < r.w.length} onClick={check}>Check</button></div>}</div>
    </div>
  );
};

/* Verb conjugation machine */
const FR_PRON = ['je', 'tu', 'il / elle', 'nous', 'vous', 'ils / elles'];
const FR_VERBS = {
  parler: ['parl', '-er', ['e', 'es', 'e', 'ons', 'ez', 'ent'], 'to speak'], finir: ['fin', '-ir', ['is', 'is', 'it', 'issons', 'issez', 'issent'], 'to finish'], vendre: ['vend', '-re', ['s', 's', '', 'ons', 'ez', 'ent'], 'to sell'],
  être: [null, 'irregular', ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'], 'to be'], avoir: [null, 'irregular', ['ai', 'as', 'a', 'avons', 'avez', 'ont'], 'to have'], aller: [null, 'irregular', ['vais', 'vas', 'va', 'allons', 'allez', 'vont'], 'to go'], faire: [null, 'irregular', ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'], 'to do / make'],
};
W.frconj = function ({ cfg, onState }) {
  const verbs = (cfg && cfg.verbs) || Object.keys(FR_VERBS);
  const [v, setV] = uSt(verbs[0]), [p, setP] = uSt(0), [mode, setMode] = uSt('learn'), [ans, setAns] = uSt(''), [score, setScore] = uSt(0), [res, setRes] = uSt(null), [q, setQ] = uSt([verbs[0], 1]), [seen, setSeen] = uSt([verbs[0]]);
  const V = FR_VERBS[v], form = (vb, pi) => { const X = FR_VERBS[vb]; return X[0] ? X[0] + X[2][pi] : X[2][pi]; };
  const pr = (pi, f) => (pi === 0 && /^[aeiouéêh]/.test(f)) ? "j'" : FR_PRON[pi].split(' / ')[0] + ' ';
  useRep(onState, { seen: seen.length, score }, [seen.length, score]);
  const newQ = () => { setQ([verbs[Math.floor(Math.random() * verbs.length)], Math.floor(Math.random() * 6)]); setAns(''); setRes(null); };
  const check = () => { const ok = ans.trim().toLowerCase() === form(q[0], q[1]); setRes(ok); if (ok) setScore(s => s + 1); };
  return (
    <div className="wbox">
      {mode === 'learn' ? <>
        <div className="fr-verbh"><b>{v}</b><span>{V[3]} · {V[1]}</span>{V[0] && <span className="fr-stem">stem: <b>{V[0]}</b>-</span>}</div>
        <div className="fr-conj">{FR_PRON.map((pn, i) => { const f = form(v, i); return <button key={i} className={'fr-row' + (p === i ? ' on' : '')} onClick={() => { setP(i); frSay(pr(i, f) + f); }}><span className="pn">{pn}</span><span className="fv">{V[0] ? <>{V[0]}<b>{V[2][i] || '—'}</b></> : <b>{f}</b>}</span><span className="sp"></span></button>; })}</div>
        <div className="wnote">{V[0] ? 'Regular verb: take off ' + V[1] + ' to find the stem, then add the ending shown in colour.' : 'Irregular verb: learn these by heart, as they are used all the time!'}</div>
      </> : <>
        <div className="fr-quiz"><span className="mono">Conjugate</span><div className="wbig"><b>{q[0]}</b> → {FR_PRON[q[1]]} ___</div>
          <input className="inp gq-inp" value={ans} autoFocus onChange={e => { setAns(e.target.value); setRes(null); }} onKeyDown={e => e.key === 'Enter' && (res ? newQ() : check())} placeholder="type the verb" />
          <div className="fr-acc">{['é', 'è', 'ê', 'à', 'ç', 'ô'].map(a => <button key={a} className="chip" onClick={() => setAns(ans + a)}>{a}</button>)}</div>
          {res != null && <EnFb ok={res} yes={pr(q[1], form(q[0], q[1])) + form(q[0], q[1]) + ' ✓'} no={'Answer: ' + form(q[0], q[1])} />}
          <div className="g-row">{res == null ? <button className="btn small" onClick={check} disabled={!ans}>Check</button> : <button className="btn small" onClick={newQ}>Next →</button>}<span className="mono"> Score: {score}</span></div></div>
      </>}
      <WCtl><WSeg opts={[['learn', ' Learn the table'], ['quiz', ' Quick-fire quiz']]} v={mode} set={m => { setMode(m); if (m === 'quiz') newQ(); }} />{mode === 'learn' && <WSeg label="Verb" opts={verbs} v={v} set={x => { setV(x); setSeen(s => s.includes(x) ? s : [...s, x]); }} />}</WCtl>
    </div>
  );
};

/* Reflexive verbs: daily routine */
const FR_ROUT = [['', 'je me réveille', 'I wake up', 7.0], ['', 'je me lève', 'I get up', 7.25], ['', 'je me douche', 'I shower', 7.5], ['', "je m'habille", 'I get dressed', 7.75], ['', 'je prends le petit-déjeuner', 'I have breakfast', 8.0], ['', 'je me brosse les dents', 'I brush my teeth', 8.25], ['', "je vais à l'école", 'I go to school', 8.5], ['', 'je me couche', 'I go to bed', 21.5]];
W.frroutine = function ({ cfg, onState }) {
  const [t, setT] = uSt(7), [seen, setSeen] = uSt([]);
  const cur = [...FR_ROUT].reverse().find(r => r[3] <= t) || FR_ROUT[0];
  uEf(() => { if (!seen.includes(cur[1])) setSeen(s => [...s, cur[1]]); }, [cur[1]]);
  useRep(onState, { seen: seen.length }, [seen.length]);
  const hh = Math.floor(t), mm = Math.round((t - hh) * 60);
  const tw = h => { const n = ['zéro', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt', 'vingt et une', 'vingt-deux']; return n[h] + (h === 1 ? ' heure' : ' heures') + (mm === 15 ? ' et quart' : mm === 30 ? ' et demie' : mm === 45 ? ' quarante-cinq' : ''); };
  const line = cur[1].replace(/^je /, 'Je ') + ' à ' + tw(hh) + '.';
  const isRef = / (me|m') ?/.test(cur[1]) && /m(e|')/.test(cur[1]);
  return (
    <div className="wbox">
      <div className="fr-routine"><span className="fr-emo">{cur[0]}</span><div><div className="fr-clock">{String(hh).padStart(2, '0')}:{String(mm).padStart(2, '0')}</div><b className="fr-big">{cur[1].split(/(me |m')/).map((x, i) => /^(me |m')$/.test(x) ? <mark key={i} className="fr-ref">{x}</mark> : x)}</b><span>{cur[2]}</span></div><FrSay t={line} /></div>
      <div className="fr-sent">“{line}”</div>
      <div className="wnote">{isRef ? <>A <b>reflexive verb</b> has an extra pronoun (<mark className="fr-ref">me</mark>) because you do the action to yourself: je <b>me</b> lève = I get (myself) up. Before a vowel, me → m'.</> : 'Not every routine verb is reflexive: je prends, je vais.'}</div>
      <div className="fr-reftab">{[['je', 'me'], ['tu', 'te'], ['il/elle', 'se'], ['nous', 'nous'], ['vous', 'vous'], ['ils/elles', 'se']].map(([a, b]) => <span key={a}>{a} <mark className="fr-ref">{b}</mark> lève</span>)}</div>
      <WCtl><WSl label="Time of day" v={t} set={setT} min={7} max={21.5} step={0.25} fmt={v => `${Math.floor(v)}:${String(Math.round((v % 1) * 60)).padStart(2, '0')}`} /></WCtl>
    </div>
  );
};

/* Timeline: past / present / future */
const FR_TL = [['regarder la télé', 'watch TV', "j'ai regardé", 'je regarde', 'je vais regarder', 'avoir'], ['aller au parc', 'go to the park', 'je suis allé(e)', 'je vais', 'je vais aller', 'être'], ['manger une pizza', 'eat a pizza', "j'ai mangé", 'je mange', 'je vais manger', 'avoir'], ['jouer au foot', 'play football', "j'ai joué", 'je joue', 'je vais jouer', 'avoir'], ['arriver à Paris', 'arrive in Paris', 'je suis arrivé(e)', "j'arrive", 'je vais arriver', 'être']];
W.frtimeline = function ({ cfg, onState }) {
  const [ai, setAi] = uSt(0), [tt, setTt] = uSt(1), [seen, setSeen] = uSt(['0-1']);
  const A = FR_TL[ai];
  const set = (a, t) => { setAi(a); setTt(t); const k = a + '-' + t; if (!seen.includes(k)) setSeen(s => [...s, k]); const f = FR_TL[a][2 + t]; frSay((t === 0 ? 'Hier, ' : t === 1 ? "Aujourd'hui, " : 'Demain, ') + f); };
  const tenses = new Set(seen.map(k => k.split('-')[1])).size;
  useRep(onState, { tenses, seen: seen.length, tt }, [tenses, seen.length, tt]);
  const lbl = [[' Hier', 'Passé composé', 'Past'], [" Aujourd'hui", 'Présent', 'Present'], [' Demain', 'Futur proche', 'Near future']];
  const f = A[2 + tt];
  return (
    <div className="wbox">
      <div className="fr-tl">{lbl.map((l, i) => <button key={i} className={'fr-tlb t' + i + (tt === i ? ' on' : '')} onClick={() => set(ai, i)}><b>{l[0]}</b><small>{l[1]}</small></button>)}<div className="fr-tlline"><i style={{ left: (tt * 50) + '%' }} /></div></div>
      <div className="fr-tlsent"><span className="fr-big">{(tt === 0 ? 'Hier, ' : tt === 1 ? "Aujourd'hui, " : 'Demain, ')}{tt === 0 ? <>{f.split(' ').map((w, i) => i === (f.startsWith("j'") ? 0 : 1) ? <mark key={i} className="fr-aux">{w}</mark> : <React.Fragment key={i}>{(i ? ' ' : '')}{i > (f.startsWith("j'") ? 0 : 1) ? <mark className="fr-pp">{w}</mark> : w}</React.Fragment>)}</> : tt === 2 ? <><mark className="fr-aux">je vais</mark> <mark className="fr-pp">{f.split(' ').slice(2).join(' ')}</mark></> : f} …</span><FrSay t={(tt === 0 ? 'Hier, ' : tt === 1 ? "Aujourd'hui, " : 'Demain, ') + f} /></div>
      <div className="fr-formula">{tt === 0 ? <><b>PASSÉ COMPOSÉ</b> = <mark className="fr-aux">avoir / être (present)</mark> + <mark className="fr-pp">past participle</mark> {A[5] === 'être' && <em> · this verb uses ÊTRE!</em>}</> : tt === 2 ? <><b>FUTUR PROCHE</b> = <mark className="fr-aux">aller (present)</mark> + <mark className="fr-pp">infinitive</mark></> : <><b>PRÉSENT</b> = stem + present ending</>}</div>
      <div className="wnote">Activity: <b>{A[0]}</b> ({A[1]}). Tried {seen.length} combinations across {tenses}/3 tenses.</div>
      <WCtl><WSeg label="Activity" opts={FR_TL.map((a, i) => [i, a[0]])} v={ai} set={a => set(a, tt)} /></WCtl>
    </div>
  );
};

/* Adjective agreement */
const FR_NOUNS = [['', 'chat', 'm', 'cats'], ['', 'maison', 'f', 'houses'], ['', 'voiture', 'f', 'cars'], ['', 'livre', 'm', 'books']];
const FR_ADJ = [['petit', 'petite', 'petits', 'petites', 'small', 'B'], ['grand', 'grande', 'grands', 'grandes', 'big', 'B'], ['noir', 'noire', 'noirs', 'noires', 'black', 'A'], ['vert', 'verte', 'verts', 'vertes', 'green', 'A'], ['beau', 'belle', 'beaux', 'belles', 'beautiful', 'B'], ['rouge', 'rouge', 'rouges', 'rouges', 'red', 'A']];
W.fragree = function ({ cfg, onState }) {
  const [ni, setNi] = uSt(0), [pl, setPl] = uSt(false), [ai, setAi] = uSt(0), [seen, setSeen] = uSt(['0-0-0']);
  const N = FR_NOUNS[ni], A = FR_ADJ[ai], f = N[2] === 'f';
  const adj = A[(f ? 1 : 0) + (pl ? 2 : 0)];
  const art = pl ? 'les' : f ? 'la' : 'le';
  const noun = N[1] + (pl ? 's' : '');
  const before = A[5] === 'B';
  const phrase = before ? `${art} ${adj} ${noun}` : `${art} ${noun} ${adj}`;
  uEf(() => { const k = ni + '-' + (pl ? 1 : 0) + '-' + ai; if (!seen.includes(k)) setSeen(s => [...s, k]); }, [ni, pl, ai]);
  const combos = new Set(seen.map(k => k.split('-').slice(0, 2).join(''))).size;
  useRep(onState, { combos, seen: seen.length, before: seen.some(k => FR_ADJ[+k.split('-')[2]][5] === 'B') && seen.some(k => FR_ADJ[+k.split('-')[2]][5] === 'A') }, [combos, seen.length]);
  const end = adj.slice(A[0].length);
  return (
    <div className="wbox">
      <div className="fr-agree"><span className="fr-emo">{pl ? N[0] + N[0] : N[0]}</span>
        <div className="fr-big">{before ? <>{art} <span className="fr-adj">{A[0]}<mark className={f ? 'fr-f' : 'fr-m'}>{end || (adj !== A[0] ? adj : '')}</mark></span> {noun}</> : <>{art} {noun} <span className="fr-adj">{adj.startsWith(A[0]) ? <>{A[0]}<mark className={f ? 'fr-f' : 'fr-m'}>{end}</mark></> : adj}</span></>}</div>
        <FrSay t={phrase} /></div>
      <div className="fr-agtab"><span className={!f && !pl ? 'on' : ''}>m. sing: {A[0]}</span><span className={f && !pl ? 'on' : ''}>f. sing: {A[1]}</span><span className={!f && pl ? 'on' : ''}>m. pl: {A[2]}</span><span className={f && pl ? 'on' : ''}>f. pl: {A[3]}</span></div>
      <div className="wnote"><b>Agreement:</b> feminine → add <mark className="fr-f">-e</mark>, plural → add <mark className="fr-m">-s</mark>. <b>Position:</b> most adjectives go <b>after</b> the noun; short common ones (BAGS: Beauty, Age, Goodness, Size, like petit, grand, beau) go <b>before</b>.</div>
      <WCtl><WSeg label="Noun" opts={FR_NOUNS.map((n, i) => [i, n[0] + ' ' + n[1] + ' (' + n[2] + ')'])} v={ni} set={setNi} /><WSeg opts={[[false, 'One'], [true, 'Many']]} v={pl} set={setPl} /><WSeg label="Adjective" opts={FR_ADJ.map((a, i) => [i, a[0] + ' (' + a[4] + ')'])} v={ai} set={setAi} /></WCtl>
    </div>
  );
};

/* Articles & à / de contractions */
const FR_PLACES = [['', 'parc', 'm'], ['', 'piscine', 'f'], ['', 'hôpital', 'v'], ['', 'cinéma', 'm'], ['', 'magasins', 'p'], ['', 'école', 'v']];
W.frarticle = function ({ cfg, onState }) {
  const [pi, setPi] = uSt(0), [prep, setPrep] = uSt('à'), [seen, setSeen] = uSt(['0-à']);
  const P = FR_PLACES[pi];
  const art = { m: 'le', f: 'la', v: "l'", p: 'les' }[P[2]];
  const comb = prep === 'à' ? { m: 'au', f: 'à la', v: "à l'", p: 'aux' }[P[2]] : { m: 'du', f: 'de la', v: "de l'", p: 'des' }[P[2]];
  const contracted = (P[2] === 'm' || P[2] === 'p');
  const sep = s => s.endsWith("'") ? s : s + ' ';
  const sent = prep === 'à' ? `Je vais ${sep(comb)}${P[1]}` : `Je reviens ${sep(comb)}${P[1]}`;
  uEf(() => { const k = pi + '-' + prep; if (!seen.includes(k)) setSeen(s => [...s, k]); }, [pi, prep]);
  const ct = seen.filter(k => ['m', 'p'].includes(FR_PLACES[+k.split('-')[0]][2])).length;
  useRep(onState, { seen: seen.length, contractions: ct }, [seen.length, ct]);
  return (
    <div className="wbox">
      <div className="fr-agree"><span className="fr-emo">{P[0]}</span><div className="fr-artsum"><span className="fr-chip">{prep}</span><span className="en-plus">+</span><span className="fr-chip">{art}</span><span className="en-plus">=</span><span className={'fr-chip res' + (contracted ? ' c' : '')}>{comb}</span></div><FrSay t={sent} /></div>
      <div className="fr-sent">“{sent}.” <small>({prep === 'à' ? "I'm going to the" : "I'm coming back from the"} {P[1]})</small></div>
      <table className="wtable"><thead><tr><th></th><th>le (m)</th><th>la (f)</th><th>l' (vowel)</th><th>les (pl)</th></tr></thead><tbody><tr><th>à</th><td className={prep === 'à' && P[2] === 'm' ? 'w-ok' : ''}><b>au</b></td><td>à la</td><td>à l'</td><td className={prep === 'à' && P[2] === 'p' ? 'w-ok' : ''}><b>aux</b></td></tr><tr><th>de</th><td className={prep === 'de' && P[2] === 'm' ? 'w-ok' : ''}><b>du</b></td><td>de la</td><td>de l'</td><td className={prep === 'de' && P[2] === 'p' ? 'w-ok' : ''}><b>des</b></td></tr></tbody></table>
      <div className="wnote">à + le and à + les <b>squash together</b> into au / aux; de + le and de + les become du / des. La and l' never change.</div>
      <WCtl><WSeg label="Place" opts={FR_PLACES.map((p, i) => [i, p[0] + ' ' + p[1]])} v={pi} set={setPi} /><WSeg label="Preposition" opts={[['à', 'à (to / at)'], ['de', 'de (from / of)']]} v={prep} set={setPrep} /></WCtl>
    </div>
  );
};

/* Opinion builder */
const FR_OP = [['', "J'adore", 'I love', 2], ['', "J'aime", 'I like', 1], ['', "Je n'aime pas", "I don't like", -1], ['', 'Je déteste', 'I hate', -2]];
const FR_SUBJ = [['', 'les sciences'], ['', 'les maths'], ['', "l'art"], ['', 'le sport'], ['FR', 'le français']];
const FR_ADJOP = [['intéressant', 'interesting', 1], ['amusant', 'fun', 1], ['facile', 'easy', 1], ['utile', 'useful', 1], ['ennuyeux', 'boring', -1], ['difficile', 'difficult', -1], ['nul', 'rubbish', -1]];
W.fropinion = function ({ cfg, onState }) {
  const [o, setO] = uSt(0), [s, setS] = uSt(0), [a, setA] = uSt(0), [tr, setTr] = uSt(false), [made, setMade] = uSt([]);
  const O = FR_OP[o], S = FR_SUBJ[s], A = FR_ADJOP[a];
  const line = `${O[1]} ${S[1]} parce que c'est ${tr ? 'très ' : ''}${A[0]}.`;
  const match = Math.sign(O[3]) === Math.sign(A[2]);
  uEf(() => { if (!made.includes(line)) setMade(m => [...m, line]); }, [line]);
  const jus = made.length;
  useRep(onState, { made: jus, intens: tr, mismatch: !match }, [jus, tr, match]);
  return (
    <div className="wbox">
      <div className="fr-opface">{O[0]} {S[0]}</div>
      <div className="fr-sent big"><mark className="fr-opv">{O[1]}</mark> {S[1]} <mark className="fr-pq">parce que c'est</mark> {tr && <mark className="fr-int">très</mark>} <mark className="fr-adjm">{A[0]}</mark>. <FrSay t={line} sm /></div>
      <div className="fr-en">EN {O[2]} {S[1].replace(/^(les|le|l')\s?/, '')} because it's {tr ? 'very ' : ''}{A[1]}.</div>
      {!match && <div className="wnote"> Hmm, “{O[2].toLowerCase()}” + “{A[1]}”? That's a bit odd. Try a reason that matches your opinion!</div>}
      <div className="fr-formula"><b>OPINION FORMULA</b> = <mark className="fr-opv">opinion</mark> + subject + <mark className="fr-pq">parce que c'est</mark> + (<mark className="fr-int">très</mark>) + <mark className="fr-adjm">adjective</mark></div>
      <WCtl><WSeg label="Opinion" opts={FR_OP.map((x, i) => [i, x[0] + ' ' + x[1]])} v={o} set={setO} /><WSeg label="Subject" opts={FR_SUBJ.map((x, i) => [i, x[0] + ' ' + x[1]])} v={s} set={setS} /><WSeg label="Because it's…" opts={FR_ADJOP.map((x, i) => [i, x[0]])} v={a} set={setA} /><button className={'chip' + (tr ? ' on' : '')} onClick={() => setTr(!tr)}>+ très (very)</button></WCtl>
    </div>
  );
};

/* Comparatives & superlatives */
const FR_CMP = [['', "l'éléphant", 6000], ['', 'la girafe', 1200], ['', 'la vache', 700], ['', 'le chien', 30], ['', 'la souris', 0.02]];
W.frcompare = function ({ cfg, onState }) {
  const [a, setA] = uSt(0), [b, setB] = uSt(3), [adj, setAdj] = uSt('grand'), [sup, setSup] = uSt(false), [seen, setSeen] = uSt([]);
  const A = FR_CMP[a], B = FR_CMP[b];
  const fem = A[1].startsWith('la');
  const ad = adj === 'grand' ? (fem ? 'grande' : 'grand') : (fem ? 'petite' : 'petit');
  const AA = A[1][0].toUpperCase() + A[1].slice(1);
  let line, kind;
  if (sup) { const big = adj === 'grand' ? a === 0 : a === 4; kind = 'sup'; line = big ? `${AA} est ${fem ? 'la' : 'le'} plus ${ad}.` : `${AA} n'est pas ${fem ? 'la' : 'le'} plus ${ad}.`; }
  else { const more = adj === 'grand' ? A[2] > B[2] : A[2] < B[2]; kind = a === b ? 'aussi' : more ? 'plus' : 'moins'; line = `${AA} est ${kind === 'aussi' ? 'aussi' : kind} ${ad} que ${B[1].replace(/^le /, 'le ')}.`.replace("que l'", "que l'"); }
  uEf(() => { if (!seen.includes(kind)) setSeen(s => [...s, kind]); }, [kind]);
  useRep(onState, { kinds: seen.length, seen }, [seen.length]);
  return (
    <div className="wbox">
      <div className="fr-cmp"><span style={{ fontSize: 30 + Math.log10(A[2] + 1) * 14 }}>{A[0]}</span>{!sup && <span className="fr-vs">{kind === 'plus' ? '>' : kind === 'moins' ? '<' : '='}</span>}{!sup && <span style={{ fontSize: 30 + Math.log10(B[2] + 1) * 14 }}>{B[0]}</span>}</div>
      <div className="fr-sent big">{line.split(/(plus|moins|aussi|que)/).map((x, i) => ['plus', 'moins', 'aussi', 'que'].includes(x) ? <mark key={i} className="fr-cm">{x}</mark> : x)} <FrSay t={line} sm /></div>
      <div className="fr-formula">{sup ? <><b>SUPERLATIVE</b> = le / la / les + <mark className="fr-cm">plus</mark> + adjective (the most …)</> : <><b>COMPARATIVE</b> = <mark className="fr-cm">plus / moins / aussi</mark> + adjective + <mark className="fr-cm">que</mark> (more / less / as … as)</>}</div>
      <WCtl><WSeg label="Animal" opts={FR_CMP.map((x, i) => [i, x[0]])} v={a} set={setA} />{!sup && <WSeg label="Compared with" opts={FR_CMP.map((x, i) => [i, x[0]])} v={b} set={setB} />}<WSeg opts={[['grand', 'grand (big)'], ['petit', 'petit (small)']]} v={adj} set={setAdj} /><WSeg opts={[[false, 'Compare two'], [true, 'The most…']]} v={sup} set={setSup} /></WCtl>
    </div>
  );
};

/* Modal verbs */
const FR_MOD = [['pouvoir', 'can / be able to', ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent']], ['vouloir', 'want to', ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent']], ['devoir', 'must / have to', ['dois', 'dois', 'doit', 'devons', 'devez', 'doivent']]];
const FR_INF = [['', 'manger une glace', 'eat an ice cream'], ['', 'nager', 'swim'], ['', 'faire mes devoirs', 'do my homework'], ['', 'jouer aux jeux vidéo', 'play video games']];
W.frmodal = function ({ cfg, onState }) {
  const [m, setM] = uSt(0), [p, setP] = uSt(0), [i, setI] = uSt(0), [neg, setNeg] = uSt(false), [seen, setSeen] = uSt([0]);
  const M = FR_MOD[m], I = FR_INF[i];
  const pr = ['Je', 'Tu', 'Il', 'Nous', 'Vous', 'Ils'][p];
  const line = neg ? `${pr} ne ${M[2][p]} pas ${I[1]}.` : `${pr} ${M[2][p]} ${I[1]}.`;
  uEf(() => { if (!seen.includes(m)) setSeen(s => [...s, m]); }, [m]);
  useRep(onState, { modals: seen.length, neg }, [seen.length, neg]);
  return (
    <div className="wbox">
      <div className="fr-opface">{I[0]}</div>
      <div className="fr-sent big">{pr} {neg && <mark className="fr-neg">ne</mark>} <mark className="fr-aux">{M[2][p]}</mark> {neg && <mark className="fr-neg">pas</mark>} <mark className="fr-pp">{I[1]}</mark>. <FrSay t={line} sm /></div>
      <div className="fr-en">EN {pr === 'Je' ? 'I' : pr === 'Tu' ? 'You' : pr === 'Il' ? 'He' : pr === 'Nous' ? 'We' : pr === 'Vous' ? 'You' : 'They'} {neg ? (m === 0 ? "can't" : m === 1 ? "don't want to" : "mustn't") : (m === 0 ? 'can' : m === 1 ? 'want(s) to' : 'must')} {I[2]}.</div>
      <div className="fr-formula"><b>MODAL FORMULA</b> = subject + <mark className="fr-aux">modal verb (conjugated)</mark> + <mark className="fr-pp">infinitive</mark>. Negative: <mark className="fr-neg">ne</mark> … <mark className="fr-neg">pas</mark> goes around the modal.</div>
      <WCtl><WSeg label="Modal" opts={FR_MOD.map((x, k) => [k, x[0] + ' (' + x[1] + ')'])} v={m} set={setM} /><WSeg label="Person" opts={['je', 'tu', 'il', 'nous', 'vous', 'ils'].map((x, k) => [k, x])} v={p} set={setP} /><WSeg label="Action" opts={FR_INF.map((x, k) => [k, x[0] + ' ' + x[1]])} v={i} set={setI} /><button className={'chip' + (neg ? ' on' : '')} onClick={() => setNeg(!neg)}>ne … pas</button></WCtl>
    </div>
  );
};

/* Connectives sentence stretcher */
W.frconnect = function ({ cfg, onState }) {
  const parts = [["J'aime le foot", 'I like football'], ['et', 'and', 'c'], ['je joue le samedi', 'I play on Saturdays'], ['mais', 'but', 'c'], ["je n'aime pas le tennis", "I don't like tennis"], ['parce que', 'because', 'c'], ["c'est ennuyeux", "it's boring"], ['donc', 'so', 'c'], ['je préfère nager', 'I prefer swimming']];
  const [n, setN] = uSt(1), [max, setMax] = uSt(1);
  uEf(() => setMax(m => Math.max(m, n)), [n]);
  useRep(onState, { len: max }, [max]);
  const shown = parts.slice(0, n * 2 - 1);
  const fr = shown.map(p => p[0]).join(' ') + '.', en = shown.map(p => p[1]).join(' ') + '.';
  return (
    <div className="wbox">
      <div className="fr-sent big">{shown.map((p, i) => p[2] ? <mark key={i} className="fr-cn"> {p[0]} </mark> : <span key={i}>{p[0]}</span>)}. <FrSay t={fr} sm /></div>
      <div className="fr-en">EN {en}</div>
      <div className="wpb"><span className="mono">Sentence length</span><div className="wpb-t"><i style={{ width: n / 5 * 100 + '%', background: 'linear-gradient(90deg,#43c463,#4facfe)' }} /><span>{fr.split(' ').length} words {n === 5 ? ' super-sentence!' : ''}</span></div></div>
      <div className="fr-cnlist">{[['et', 'and'], ['mais', 'but'], ['parce que', 'because'], ['donc', 'so'], ['aussi', 'also'], ['cependant', 'however'], ['quand', 'when'], ['où', 'where']].map(([a, b]) => <span key={a}><b>{a}</b> {b}</span>)}</div>
      <WCtl><button className="btn small" disabled={n >= 5} onClick={() => setN(n + 1)}> Add a connective</button><button className="chip" disabled={n <= 1} onClick={() => setN(n - 1)}> Shorter</button></WCtl>
    </div>
  );
};

/* Role-play: café / shop */
W.frcafe = function ({ cfg, onState }) {
  const D = cfg.steps; const [k, setK] = uSt(0), [bad, setBad] = uSt(null), [log, setLog] = uSt([]);
  const s = D[k]; const done = k >= D.length;
  useRep(onState, { step: k, done }, [k]);
  uEf(() => { if (!done) frSay(s.npc); }, [k]);
  const opts = uMm(() => done ? [] : wxShuffle(s.opts.map((o, i) => [o, i]), k + 3), [k]);
  const pick = (o, i) => { if (i === 0) { setLog(l => [...l, [s.npc, s.npcE], [o, null, 1]]); frSay(o); setTimeout(() => setK(k + 1), 900); } else { setBad(i); setTimeout(() => setBad(null), 450); } };
  return (
    <div className="wbox">
      <div className="fr-scene">{cfg.scene}</div>
      <div className="fr-chat">
        {log.map((m, i) => <div key={i} className={'fr-msg' + (m[2] ? ' me' : '')}>{m[0]}{m[1] && <small>{m[1]}</small>}</div>)}
        {!done && <div className="fr-msg"><b>{cfg.npc}</b> {s.npc} <FrSay t={s.npc} sm /><small>{s.npcE}</small></div>}
        {done && <div className="fr-msg win"> Bravo! You completed the conversation in French!</div>}
      </div>
      {!done && <div><span className="mono">Your reply: {s.hint}</span><div className="en-opts">{opts.map(([o, i]) => <button key={o} className={'chip' + (bad === i ? ' bad shake' : '')} onClick={() => pick(o, i)}>{o}</button>)}</div></div>}
      <WCtl><button className="chip" onClick={() => { setK(0); setLog([]); }}>↺ Start again</button></WCtl>
    </div>
  );
};

/* Francophone world map */
const FR_WORLD = [['France', 'Paris', 210, 70, ' Home of the Eiffel Tower', 'FR'], ['Belgique', 'Bruxelles', 214, 62, ' Famous for chocolate and waffles', 'BE'], ['Suisse', 'Berne', 220, 74, ' The Alps; French is one of 4 languages', 'CH'], ['Canada (Québec)', 'Ottawa / Québec', 110, 55, ' Maple syrup; Québec speaks French', 'CA'], ['Sénégal', 'Dakar', 192, 128, ' West Africa; Wolof and French', 'SN'], ["Côte d'Ivoire", 'Yamoussoukro', 204, 140, ' Grows the most cocoa in the world', 'CI'], ['Maroc', 'Rabat', 202, 98, ' French and Arabic are spoken', 'MA'], ['Madagascar', 'Antananarivo', 268, 175, ' Lemurs live only here', 'MG'], ['Haïti', 'Port-au-Prince', 118, 118, ' Caribbean; French and Creole', 'HT'], ['Polynésie française', 'Papeete', 30, 170, ' Tahiti, in the Pacific Ocean', 'PF']];
W.frworld = function ({ cfg, onState }) {
  const [sel, setSel] = uSt(null), [seen, setSeen] = uSt([]);
  const tap = i => { setSel(i); if (!seen.includes(i)) setSeen([...seen, i]); frSay(FR_WORLD[i][0]); };
  useRep(onState, { seen: seen.length }, [seen.length]);
  const C = sel != null ? FR_WORLD[sel] : null;
  return (
    <div className="wbox">
      <svg viewBox="0 0 320 210" className="wsvg" style={{ background: 'oklch(0.9 0.05 230)', borderRadius: 14 }}>
        {[[60, 30, 90, 60], [190, 40, 60, 40], [180, 85, 70, 100], [240, 45, 70, 55], [100, 120, 40, 80], [260, 150, 40, 40]].map(([x, y, w, h], i) => <ellipse key={i} cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill="oklch(0.82 0.07 140)" opacity=".9" />)}
        {FR_WORLD.map((c, i) => <g key={i} onClick={() => tap(i)} style={{ cursor: 'pointer' }}><circle cx={c[2]} cy={c[3]} r={sel === i ? 9 : 6.5} fill={seen.includes(i) ? '#ff6f91' : '#2b2140'} stroke="#fff" strokeWidth="2" />{sel === i && <circle cx={c[2]} cy={c[3]} r="14" fill="none" stroke="#ff6f91" strokeWidth="2"><animate attributeName="r" from="9" to="18" dur="1s" repeatCount="indefinite" /><animate attributeName="opacity" from="1" to="0" dur="1s" repeatCount="indefinite" /></circle>}</g>)}
      </svg>
      {C ? <div className="fr-country"><span className="fr-emo">{C[5]}</span><div><b className="fr-big">{C[0]}</b><div>Capital: <b>{C[1]}</b></div><div>{C[4]}</div></div><FrSay t={C[0]} /></div> : <div className="wnote"> Tap the dots to visit French-speaking countries around the world.</div>}
      <div className="wnote">About 320 million people speak French on 5 continents. Visited {seen.length}/{FR_WORLD.length}.</div>
    </div>
  );
};

/* Sound lab: phonics */
const FR_SOUNDS = [['ou', 'oo', ['bonjour', 'rouge', 'nous']], ['u', 'ee with round lips', ['tu', 'rue', 'sucre']], ['on', 'nasal "ong"', ['bonbon', 'maison', 'nom']], ['an / en', 'nasal "ahn"', ['enfant', 'grand', 'France']], ['in / ain', 'nasal "an"', ['vin', 'pain', 'jardin']], ['oi', 'wa', ['moi', 'trois', 'poisson']], ['r', 'from the throat', ['rouge', 'Paris', 'très']], ['silent letters', 'final consonants are often silent', ['petit', 'Paris', 'grand']]];
W.frsounds = function ({ cfg, onState }) {
  const [si, setSi] = uSt(0), [heard, setHeard] = uSt([]);
  const S = FR_SOUNDS[si];
  const say = w => { frSay(w, 0.75); if (!heard.includes(w)) setHeard(h => [...h, w]); };
  const sounds = new Set(heard.map(w => FR_SOUNDS.findIndex(s => s[2].includes(w)))).size;
  useRep(onState, { heard: heard.length, sounds }, [heard.length, sounds]);
  const mark = w => { const p = S[0].split(' / ')[0]; if (S[0] === 'silent letters') return <>{w.slice(0, -1)}<s className="fr-silent">{w.slice(-1)}</s></>; const ix = w.toLowerCase().indexOf(p); return ix < 0 ? w : <>{w.slice(0, ix)}<mark className="fr-snd">{w.slice(ix, ix + p.length)}</mark>{w.slice(ix + p.length)}</>; };
  return (
    <div className="wbox">
      <div className="fr-sndgrid">{FR_SOUNDS.map((s, i) => <button key={i} className={'fr-snb' + (si === i ? ' on' : '')} onClick={() => setSi(i)}><b>{s[0]}</b><small>{s[1]}</small></button>)}</div>
      <div className="fr-sndwords">{S[2].map(w => <button key={w} className={'fr-sw' + (heard.includes(w) ? ' h' : '')} onClick={() => say(w)}>{mark(w)} </button>)}</div>
      <div className="wnote">Sound: <b>{S[0]}</b> = {S[1]}. Tap each word to hear it, then copy the sound out loud. Words heard: {heard.length}.</div>
    </div>
  );
};
