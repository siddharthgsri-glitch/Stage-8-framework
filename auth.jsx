/* Sign-in / register screen, profile page and leaderboard */

const AV = id => (GAME.SHOP.avatar.find(a => a[0] === id) || GAME.SHOP.avatar[0])[1];
function ago(t) { if (!t) return '–'; const m = Math.round((Date.now() - t) / 60000); if (m < 1) return 'just now'; if (m < 60) return m + ' min ago'; const h = Math.round(m / 60); if (h < 24) return h + ' h ago'; return Math.round(h / 24) + ' d ago'; }

function PinPad({ value, onChange, onDone, shake, label }) {
  const ref = React.useRef(value); ref.current = value;
  const cb = React.useRef({}); cb.current = { onChange, onDone };
  const press = d => { const cur = ref.current; if (cur.length >= 4) return; const v = cur + d; ref.current = v; cb.current.onChange(v); if (v.length === 4 && cb.current.onDone) { const fn = cb.current.onDone; setTimeout(() => fn(v), 160); } };
  const del = () => { const v = ref.current.slice(0, -1); ref.current = v; cb.current.onChange(v); };
  React.useEffect(() => {
    const k = e => { if (e.target && e.target.tagName === 'INPUT') return; if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') del(); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);
  return (
    <div className="pin">
      {label && <div className="pin-l">{label}</div>}
      <div className={'pin-dots' + (shake ? ' shake' : '')}>{[0, 1, 2, 3].map(i => <i key={i} className={i < value.length ? 'on' : ''} />)}</div>
      <div className="pin-pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <button type="button" key={n} onClick={() => press(String(n))}>{n}</button>)}
        <span />
        <button type="button" onClick={() => press('0')}>0</button>
        <button type="button" className="del" onClick={del} aria-label="Delete">⌫</button>
      </div>
    </div>
  );
}

function AuthScreen() {
  const users = S8AUTH.list().sort((x, y) => (y.last || 0) - (x.last || 0));
  const [mode, setMode] = React.useState(users.length ? 'pick' : 'hello');
  const [pick, setPick] = React.useState(null);
  const [pin, setPin] = React.useState(''), [err, setErr] = React.useState(''), [shake, setShake] = React.useState(false), [busy, setBusy] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [f, setF] = React.useState({ name: '', cls: '', avatar: 'fox', keepGuest: true, pin: '', pin2: '' });
  const [q, setQ] = React.useState('');
  const fRef = React.useRef(f); fRef.current = f;
  const orphan = S8AUTH.hasOrphan();
  const fail = m => { setErr(m); setShake(true); setTimeout(() => setShake(false), 450); };
  const tryLogin = async v => { setBusy(true); try { await S8AUTH.login(pick.username, v); } catch (e) { fail(e.message); setPin(''); setBusy(false); } };
  const create = async v2 => {
    const cur = fRef.current;
    if (v2 !== cur.pin) { fail("Codes don't match. Try again!"); setF(o => ({ ...o, pin: '', pin2: '' })); return; }
    setBusy(true); try { await S8AUTH.register({ ...cur, pin: cur.pin }); } catch (e) { fail(e.message); setBusy(false); }
  };
  const list = users.filter(u => !q || (u.name + ' ' + u.username + ' ' + u.cls).toLowerCase().includes(q.toLowerCase()));
  const back = () => { setErr(''); setPin(''); if (mode === 'pick' && pick) setPick(null); else if (mode === 'new' && step > 1) setStep(step - 1); else setMode(users.length ? 'pick' : 'hello'); };
  const showBack = (mode === 'pick' && pick) || mode === 'new';
  return (
    <div className="au2" data-screen-label="Sign in">
      <div className="au2-bg">{['', '', '', '', '', '', '', '', '', ''].map((e, i) => <span key={i} style={{ left: (i * 10 + 3) + '%', animationDelay: (i * 0.7) + 's', fontSize: 26 + (i % 3) * 10 }}>{e}</span>)}</div>
      <div className="au2-head"><div className="g-logo-ic" style={{ width: 52, height: 52, fontSize: 28, borderRadius: 16 }}></div><div><b>Stage 8 framework</b><small>Maths · Science · Computing</small></div></div>

      <div className="au2-card">
        {showBack && <button className="au2-back" onClick={back}>←</button>}

        {mode === 'hello' && <div className="au2-hello">
          <div className="au2-big"></div>
          <h1>Welcome!</h1>
          <p>Make your player in 3 quick steps and start collecting stars.</p>
          <button className="btn g-btn big au2-wide" onClick={() => { setMode('new'); setStep(1); }}> Make my player</button>
        </div>}

        {mode === 'pick' && !pick && <>
          <h1 className="au2-h">Who's playing?</h1>
          {users.length > 6 && <input className="au2-search" value={q} onChange={e => setQ(e.target.value)} placeholder=" Find your name" />}
          <div className="au2-grid">
            {list.map(u => <button key={u.username} className="au2-p" onClick={() => { setPick(u); setPin(''); setErr(''); }}>
              <span className={'g-av av-' + u.s.avatar + ' fr-' + u.s.frame} style={{ width: 76, height: 76, fontSize: 44 }}>{AV(u.s.avatar)}</span>
              <b>{u.name}</b><small>{u.cls ? 'Class ' + u.cls + ' · ' : ''}Lv {GAME.levelOf(u.s.xp).lvl}</small>
            </button>)}
            <button className="au2-p add" onClick={() => { setMode('new'); setStep(1); setErr(''); }}><span className="au2-plus">＋</span><b>I'm new!</b><small>Make a player</small></button>
          </div>
        </>}

        {mode === 'pick' && pick && <div className="au2-login">
          <span className={'g-av av-' + pick.s.avatar + ' fr-' + pick.s.frame + ' g-bounce'} style={{ width: 96, height: 96, fontSize: 56 }}>{AV(pick.s.avatar)}</span>
          <h1 className="au2-h" style={{ margin: '8px 0 0' }}>Hi {pick.name}!</h1>
          <PinPad value={pin} onChange={v => { setPin(v); setErr(''); }} onDone={tryLogin} shake={shake} label="Type your secret code" />
          <div className="au2-msg">{busy ? 'Opening…' : err ? ' ' + err : ' '}</div>
        </div>}

        {mode === 'new' && <div className="au2-new">
          <div className="au2-steps">{[1, 2, 3].map(n => <i key={n} className={n <= step ? 'on' : ''} />)}</div>
          {step === 1 && <>
            <h1 className="au2-h">What's your name?</h1>
            <input className="au2-name" autoFocus value={f.name} maxLength={20} placeholder="Type your first name" onChange={e => { setF({ ...f, name: e.target.value }); setErr(''); }} onKeyDown={e => e.key === 'Enter' && f.name.trim() && setStep(2)} />
            <div className="au2-cls"><span>Class (optional)</span>{['7A', '7B', '8A', '8B', '8C', '9A'].map(c => <button key={c} className={'chip' + (f.cls === c ? ' on' : '')} onClick={() => setF({ ...f, cls: f.cls === c ? '' : c })}>{c}</button>)}<input value={['7A', '7B', '8A', '8B', '8C', '9A'].includes(f.cls) ? '' : f.cls} onChange={e => setF({ ...f, cls: e.target.value.slice(0, 6) })} placeholder="other" /></div>
            <button className="btn g-btn big au2-wide" disabled={!f.name.trim()} onClick={() => setStep(2)}>Next →</button>
          </>}
          {step === 2 && <>
            <h1 className="au2-h">Pick your buddy, {f.name.trim()}!</h1>
            <div className="au2-avs">{S8AUTH.STARTERS.map(x => <button key={x} className={'au2-av' + (f.avatar === x ? ' on' : '')} onClick={() => setF({ ...f, avatar: x })}>{AV(x)}</button>)}</div>
            <button className="btn g-btn big au2-wide" onClick={() => setStep(3)}>That's me! →</button>
          </>}
          {step === 3 && <div className="au2-login">
            <span className="g-av" style={{ width: 72, height: 72, fontSize: 42 }}>{AV(f.avatar)}</span>
            <h1 className="au2-h" style={{ margin: '6px 0 0' }}>{f.pin.length < 4 ? 'Choose a secret code' : 'Type it once more'}</h1>
            <p className="g-sub" style={{ margin: 0 }}>{f.pin.length < 4 ? '4 numbers you can remember (like a lock code)' : 'Just to make sure!'}</p>
            {f.pin.length < 4
              ? <PinPad key="p1" value={f.pin} onChange={v => { setF(o => ({ ...o, pin: v })); setErr(''); }} shake={shake} />
              : <PinPad key="p2" value={f.pin2} onChange={v => { setF(o => ({ ...o, pin2: v })); setErr(''); }} onDone={create} shake={shake} />}
            {orphan && <label className="au-check" style={{ marginTop: 6 }}><input type="checkbox" checked={f.keepGuest} onChange={e => setF({ ...f, keepGuest: e.target.checked })} /> Keep the progress already on this device</label>}
            <div className="au2-msg">{busy ? 'Creating your player…' : err ? ' ' + err : ' '}</div>
          </div>}
        </div>}
      </div>
      <p className="au2-foot">Progress is saved on this device. Back it up from your profile to use another device.</p>
    </div>
  );
}

function Leaderboard({ compact }) {
  const [by, setBy] = React.useState('xp');
  const me = S8AUTH.current();
  const rows = S8AUTH.list().sort((a, b) => (b.s[by] || 0) - (a.s[by] || 0));
  const cols = [['xp', ' XP'], ['stars', ' Stars'], ['medals', ' Medals'], ['topics', ' Topics'], ['streak', ' Streak']];
  return (
    <div className="g-card">
      <div className="g-card-h"><h3> Leaderboard</h3><span className="g-sub">{rows.length} player{rows.length === 1 ? '' : 's'} on this device</span></div>
      <div className="g-tabs" style={{ margin: '4px 0 12px' }}>{cols.map(([k, l]) => <button key={k} className={by === k ? 'on' : ''} onClick={() => setBy(k)}>{l}</button>)}</div>
      <div className="lb">
        {rows.slice(0, compact ? 5 : 100).map((u, i) => (
          <div key={u.username} className={'lb-row' + (u.username === me ? ' me' : '')}>
            <span className={'lb-rank r' + i}>{i < 3 ? ['', '', ''][i] : i + 1}</span>
            <span className={'g-av av-' + u.s.avatar + ' fr-' + u.s.frame} style={{ width: 40, height: 40, fontSize: 22 }}>{AV(u.s.avatar)}</span>
            <span className="lb-name"><b>{u.name}{u.username === me ? ' (you)' : ''}</b><small>@{u.username}{u.cls ? ' · ' + u.cls : ''} · Lv {GAME.levelOf(u.s.xp).lvl} · {ago(u.last)}</small></span>
            <span className="lb-val">{u.s[by] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage({ go }) {
  const g = useGame(); const L = GAME.levelOf(g.xp);
  const u = S8AUTH.user(); const me = S8AUTH.current();
  const [name, setName] = React.useState(u.name), [cls, setCls] = React.useState(u.cls || '');
  const [pw, setPw] = React.useState({ old: '', nw: '' }), [msg, setMsg] = React.useState(''), [err, setErr] = React.useState('');
  const [del, setDel] = React.useState(''), [delOpen, setDelOpen] = React.useState(false);
  const s = S8AUTH.summary((() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('s8f-')) o[k] = localStorage.getItem(k); } return o; })());
  const fileRef = React.useRef(null);
  const saveProfile = () => { S8AUTH.updateProfile({ name, cls }); GAME.setName(name.slice(0, 18)); setMsg(' Profile saved'); setErr(''); };
  const changePw = async () => { try { await S8AUTH.changePassword(pw.old, pw.nw); setPw({ old: '', nw: '' }); setMsg(' Secret code changed'); setErr(''); } catch (e) { setErr(e.message); } };
  const onFile = e => { const file = e.target.files[0]; if (!file) return; const rd = new FileReader(); rd.onload = () => { try { if (confirm('Replace your current progress with the progress in this file?')) S8AUTH.importData(JSON.parse(rd.result)); } catch (x) { setErr(x.message || 'Could not read that file.'); } }; rd.readAsText(file); };
  return (
    <div className="wrap g-page" data-screen-label="Profile">
      <div className="g-welcome" style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className={'g-av av-' + g.avatar + ' fr-' + g.frame} style={{ width: 110, height: 110, fontSize: 64 }}>{AV(g.avatar)}</span>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontWeight: 800, opacity: .9 }}>@{me}{u.cls ? ' · Class ' + u.cls : ''}</div>
          <h1 style={{ margin: '4px 0' }}>{u.name}</h1>
          <div style={{ fontWeight: 700 }}>Level {L.lvl} · {L.title} · {g.xp} XP</div>
          <div className="g-xpbar big" style={{ maxWidth: 380 }}><i style={{ width: (L.into / L.need * 100) + '%' }} /></div>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: .9 }}>Member since {new Date(u.created).toLocaleDateString()} · progress saves automatically</div>
        </div>
        <button className="btn g-btn" onClick={() => S8AUTH.logout()}> Sign out</button>
      </div>

      <div className="g-stats">{[['', s.stars, 'stars'], ['', s.medals, 'medals'], ['', s.golds, 'gold medals'], ['', s.topics, 'topics done'], ['', s.correct, 'correct answers'], ['', s.best, 'best streak'], ['', s.badges, 'badges'], ['', g.coins, 'coins']].map(([i, v, l]) => <div key={l} className="g-stat"><span>{i}</span><b>{v}</b><small>{l}</small></div>)}</div>

      <div className="pf-grid">
        <Leaderboard />
        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <div className="g-card">
            <div className="g-card-h"><h3> My details</h3></div>
            <label className="au-f"><span>Name</span><input value={name} onChange={e => setName(e.target.value)} maxLength={30} /></label>
            <label className="au-f"><span>Class</span><input value={cls} onChange={e => setCls(e.target.value)} maxLength={20} /></label>
            <div className="g-row"><button className="btn g-btn small" onClick={saveProfile}>Save</button><button className="btn g-btn ghost small" onClick={() => go('shop')}> Change avatar</button></div>
          </div>
          <div className="g-card">
            <div className="g-card-h"><h3> Secret code</h3></div>
            <label className="au-f"><span>Current code</span><input inputMode="numeric" maxLength={4} type="password" value={pw.old} onChange={e => setPw({ ...pw, old: e.target.value.replace(/\D/g, '') })} placeholder="••••" /></label>
            <label className="au-f"><span>New 4-number code</span><input inputMode="numeric" maxLength={4} type="password" value={pw.nw} onChange={e => setPw({ ...pw, nw: e.target.value.replace(/\D/g, '') })} placeholder="••••" /></label>
            <button className="btn g-btn small" onClick={changePw} disabled={pw.old.length < 4 || pw.nw.length < 4}>Change code</button>
          </div>
          <div className="g-card">
            <div className="g-card-h"><h3> Back up & move</h3></div>
            <p className="g-sub" style={{ marginBottom: 10 }}>Download your progress as a file. On another device, create or sign in to your profile and load the file there.</p>
            <div className="g-row"><button className="btn g-btn small" onClick={() => S8AUTH.exportData()}> Back up my progress</button><button className="btn g-btn ghost small" onClick={() => fileRef.current.click()}> Load a backup</button><input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={onFile} /></div>
          </div>
          {(msg || err) && <div className={err ? 'au-err' : 'au-ok'}>{err ? ' ' + err : msg}</div>}
          <div className="g-card" style={{ borderTop: '6px solid #ff6b6b' }}>
            {!delOpen ? <button className="btn g-btn ghost small" onClick={() => setDelOpen(true)}> Delete my profile…</button> : <>
              <p className="g-sub" style={{ marginBottom: 8 }}>This deletes your profile and all your progress from this device. Type your secret code to confirm.</p>
              <div className="g-row"><input className="au-in" type="password" inputMode="numeric" maxLength={4} value={del} onChange={e => setDel(e.target.value.replace(/\D/g, ''))} placeholder="Code" /><button className="btn g-btn small" style={{ '--acc': '#e04848' }} onClick={async () => { try { await S8AUTH.deleteAccount(del); } catch (e) { setErr(e.message); } }}>Delete forever</button><button className="btn g-btn ghost small" onClick={() => setDelOpen(false)}>Cancel</button></div>
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AuthScreen, ProfilePage, Leaderboard });
