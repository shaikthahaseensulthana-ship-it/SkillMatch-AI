import { useEffect, useState } from 'react';

const API = 'http://127.0.0.1:5000/api';

export default function App() {
  const [page, setPage] = useState('analyzer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [skills, setSkills] = useState([]);
  const [matches, setMatches] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`${API}/jobs`).then(r => r.json()).then(setJobs)
      .catch(() => setMessage('Backend is not running. Start Flask first.'));
  }, []);

  async function auth(mode) {
    setMessage('');
    setBusy(true);
    try {
      const response = await fetch(`${API}/${mode}`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, email, password})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');
      setMessage(data.message);
      if (mode === 'login') {
        setUser(data.user);
        setName(data.user.name);
        setPage('profile');
      } else setPage('login');
    } catch (e) { setMessage(e.message); }
    finally { setBusy(false); }
  }

  async function analyze(e) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`${API}/resume/analyze`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({resumeText})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analysis failed');
      setSkills(data.skills);
      setMatches(data.jobs);
      setMessage(`Analysis complete — ${data.skills.length} skill(s) detected.`);
    } catch (e) { setMessage(`${e.message}. Check that Flask is running.`); }
    finally { setBusy(false); }
  }

  async function saveProfile(e) {
    e.preventDefault();
    if (!user) { setMessage('Register and sign in to save your demo profile.'); return; }
    try {
      const response = await fetch(`${API}/profile/${encodeURIComponent(user.email)}`, {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save profile');
      setUser(data.profile);
      setMessage(data.message);
    } catch (e) { setMessage(e.message); }
  }

  return <div className="layout">
    <aside className="sidebar">
      <div className="brand"><span className="logo">S</span><span>SkillMatch <i>AI</i></span></div>
      <p className="label">WORKSPACE</p>
      <button className={page === 'analyzer' ? 'nav active' : 'nav'} onClick={() => setPage('analyzer')}>✦ Resume Analyzer</button>
      <button className={page === 'jobs' ? 'nav active' : 'nav'} onClick={() => setPage('jobs')}>▤ Sample Jobs</button>
      <button className={page === 'profile' ? 'nav active' : 'nav'} onClick={() => setPage('profile')}>◎ My Profile</button>
      <div className="account"><div className="avatar">{user?.name?.[0]?.toUpperCase() || 'G'}</div><div><b>{user?.name || 'Guest user'}</b><small>{user?.email || 'Sample workspace'}</small></div>{user && <button onClick={() => {setUser(null);setMessage('Signed out.')}}>↪</button>}</div>
    </aside>
    <main className="main">
      <header className="topbar"><span>Career workspace / <b>{page === 'analyzer' ? 'Resume Analyzer' : page === 'jobs' ? 'Sample Jobs' : 'My Profile'}</b></span><span className="badge">● DEMO PROJECT</span></header>
      <div className="content">
        <div className="hero"><div><p className="eyebrow">YOUR CAREER, SMARTER</p><h1>{page === 'analyzer' ? 'Find your skill match.' : page === 'jobs' ? 'Explore opportunities.' : 'Build your profile.'}</h1><p className="muted">{page === 'analyzer' ? 'Analyze resume text and discover sample roles that fit your skills.' : page === 'jobs' ? 'Browse the example job dataset included with this project.' : 'Create a simple account and profile for your workspace.'}</p></div><div className="spark">✧</div></div>
        {message && <div className="notice">{message}</div>}
        {page === 'analyzer' && <>
          <div className="columns">
            <section className="card"><div className="heading"><h2><span>01</span> Resume skill analysis</h2><small>TEXT INPUT</small></div><p className="muted">Paste resume content. The sample analyzer checks known skill keywords.</p><form onSubmit={analyze}><label htmlFor="resume">Resume content</label><textarea id="resume" rows="9" value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="B.Tech CSE student with Java, Spring Boot, HTML, CSS, JavaScript, React, REST API, MySQL and Git experience..."/><div className="formfoot"><small>{resumeText.length} characters</small><button className="primary" disabled={busy}>{busy ? 'Analyzing…' : 'Analyze my skills →'}</button></div></form></section>
            <section className="card"><div className="heading"><h2><span>02</span> Detected skills</h2><b className="count">{skills.length}</b></div><p className="muted">Skills found in your resume text.</p>{skills.length ? <div className="chips">{skills.map(s => <span key={s}>{s}</span>)}</div> : <div className="empty"><div>⌕</div><b>Your skills will appear here</b><small>Paste resume text and run analysis.</small></div>}<p className="privacy">ⓘ Demo only: text is sent to your local backend for keyword matching.</p></section>
          </div>
          <section className="card results"><div className="heading"><h2><span>03</span> Recommended sample roles</h2><small>SKILL MATCH</small></div>{matches.length ? <div>{matches.map(j => <JobRow key={j.id} job={j} matched/>)}</div> : <div className="empty horizontal"><div>↗</div><b>Job matches will appear here after analysis.</b></div>}</section>
        </>}
        {page === 'jobs' && <section className="card results"><div className="heading"><h2><span>01</span> Sample job opportunities</h2><b className="count">{jobs.length}</b></div><p className="muted">Illustrative local records, not live vacancies.</p>{jobs.map(j => <JobRow key={j.id} job={j}/>)}</section>}
        {page === 'profile' && <div className="columns">
          <section className="card"><div className="heading"><h2><span>01</span> Profile details</h2></div><form onSubmit={saveProfile}><label htmlFor="name">Full name</label><input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"/><label htmlFor="profileEmail">Email address</label><input id="profileEmail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" disabled={!!user}/><button className="primary profile-save">Save profile →</button></form></section>
          <section className="card"><div className="heading"><h2><span>02</span> Demo authentication</h2></div><p className="muted">Register a demo account or sign in.</p><label htmlFor="authName">Name (registration)</label><input id="authName" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"/><label htmlFor="authEmail">Email</label><input id="authEmail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/><label htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Demo password"/><div className="buttons"><button className="primary" disabled={busy} onClick={() => auth('register')}>Register</button><button className="secondary" disabled={busy} onClick={() => auth('login')}>Sign in</button></div><p className="privacy">Demo warning: passwords are stored in memory as plain text. Never use a real password.</p></section>
        </div>}
        <footer>SkillMatch AI · Sample learning project · No external API required</footer>
      </div>
    </main>
  </div>;
}

function JobRow({job, matched = false}) {
  return <article className="jobrow"><div className="joblogo">{job.company[0]}</div><div className="jobinfo"><h3>{job.title}</h3><p>{job.company} · {job.location}</p><div className="chips mini">{(matched ? job.matchedSkills : job.skills).map(s => <span key={s}>{s}</span>)}</div>{matched && job.missingSkills.length > 0 && <small className="gap">Skill gaps: {job.missingSkills.join(', ')}</small>}</div>{matched && <div className="match"><b>{job.matchPercentage}%</b><small>match</small><div><i style={{width: `${job.matchPercentage}%`}}/></div></div>}</article>;
}
