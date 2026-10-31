'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, BrainCircuit, Database, FileText, GitBranch, LayoutDashboard, ShieldCheck, Sparkles, Users } from 'lucide-react'

const team = ['Vanshika Yogi', 'Nisha Sharma', 'Shreya Gupta', 'Shiwani Gupta']

function Flow({ items }: { items: string[] }) {
  return <div className="presentation-flow">{items.map((item, index) => <div className="presentation-flow-item" key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong>{index < items.length - 1 && <i>→</i>}</div>)}</div>
}

export default function PresentationPage() {
  const [slide, setSlide] = useState(0)
  const next = () => setSlide((value) => Math.min(4, value + 1))
  const previous = () => setSlide((value) => Math.max(0, value - 1))

  return <main className="presentation-shell" onKeyDown={(event) => { if (event.key === 'ArrowRight') next(); if (event.key === 'ArrowLeft') previous() }} tabIndex={0}>
    <div className="presentation-progress"><span style={{ width: `${((slide + 1) / 5) * 100}%` }} /></div>
    <section className="presentation-slide">
      <div className="presentation-kicker">MAJOR PROJECT <span>•</span> 2025–26</div>
      {slide === 0 && <div className="presentation-title-layout"><div><div className="presentation-eyebrow"><ShieldCheck /> DRDO RAC INTERVIEW BOARDS</div><h1>Expert Matching &amp;<br /><em>Suitability Prediction</em></h1><p className="presentation-subtitle">AI-Assisted Expert Relevance Matching System</p><div className="presentation-team"><div><small>PROJECT TEAM</small>{team.map((name) => <span key={name}>{name}</span>)}</div><div><small>GUIDE</small><span>Priyanka Vishwakarma</span></div></div></div><div className="presentation-orbit"><div className="orbit-line" /><div className="orbit-node node-candidate"><Users /><small>CANDIDATE</small></div><div className="orbit-node node-board"><LayoutDashboard /><small>BOARD</small></div><div className="orbit-node node-expert"><BrainCircuit /><small>EXPERT MATCHING</small></div><div className="orbit-core"><Sparkles /></div></div></div>}
      {slide === 1 && <><h2>Problem Statement <em>&amp; Objective</em></h2><p className="presentation-lead">RAC interviews require suitable experts from DRDO, industry and academia to be selected for interview boards.</p><div className="presentation-columns"><div className="presentation-card"><small>THE CHALLENGE</small><h3>Manual selection is complex</h3><p>Comparing board subjects, candidate expertise, expert backgrounds and research profiles is difficult and time-consuming.</p><Flow items={['Profile comparison', 'Domain evaluation', 'Expert selection']} /></div><div className="presentation-card presentation-card-accent"><small>THE OBJECTIVE</small><h3>Assist administrators</h3><p>Develop a system that can eventually identify relevant experts for a particular interview board.</p><Flow items={['Digital profiles', 'AI-assisted matching', 'Recommendation']} /></div></div></>}
      {slide === 2 && <><h2>Current Frontend <em>Prototype</em></h2><p className="presentation-lead">The current prototype provides the interface and workflow for the future expert-relevance system.</p><div className="prototype-grid">{[['Dashboard', LayoutDashboard], ['Experts', Users], ['Candidates', FileText], ['Interview Boards', GitBranch], ['Matching Workflow', BrainCircuit]].map(([label, Icon]) => <div className="prototype-module" key={label as string}><Icon /><strong>{label as string}</strong></div>)}</div><div className="prototype-path"><span>Dashboard</span><i>→</i><span>Manage Experts</span><i>→</i><span>Manage Candidates</span><i>→</i><span>Interview Boards</span><i>→</i><span>Matching Results</span></div><div className="demo-badge">DEMO / MOCK DATA <span>Displayed scores are illustrative and are not real AI predictions.</span></div></>}
      {slide === 3 && <><div className="planned-label"><span>PLANNED / NEXT DEVELOPMENT</span></div><h2>Planned End-to-End <em>AI Workflow</em></h2><div className="architecture"><div className="arch-inputs"><div><FileText /><strong>Candidate Resume</strong><span>Profile extraction</span></div><div><FileText /><strong>Expert Resume</strong><span>Profile extraction</span></div><div><LayoutDashboard /><strong>Board Subject</strong><span>Interview context</span></div></div><div className="arch-arrow">↓</div><div className="arch-main"><BrainCircuit /><strong>AI MATCHING</strong><span>Board subject + candidate expertise + expert expertise + research + experience</span></div><div className="arch-arrow">↓</div><div className="arch-output"><span>Contextual relevance score</span><i>→</i><span>Expert ranking</span><i>→</i><span>Recommendation</span><i>→</i><b>Admin final decision</b></div></div><div className="tech-direction"><span>Frontend <b>Vercel / Next.js</b></span><span>Backend <b>AI-assisted backend</b></span><span>Database <b>MongoDB</b></span><span>AI <b>Extraction + matching</b></span></div></>}
      {slide === 4 && <div className="thank-you"><div className="thank-orbit"><Sparkles /></div><h1>Thank <em>you.</em></h1><p>Questions &amp; Discussion</p><div className="thank-meta"><span>Expert Matching &amp; Suitability Prediction for DRDO RAC Interview Boards</span><span>Guide: Priyanka Vishwakarma</span></div><div className="thank-team">{team.join('  •  ')}</div></div>}
      <footer><span>RAC EXPERT RELEVANCE SYSTEM</span><span>{String(slide + 1).padStart(2, '0')} / 05</span></footer>
    </section>
    <nav className="presentation-controls" aria-label="Presentation controls"><button onClick={previous} disabled={slide === 0} aria-label="Previous slide"><ArrowLeft /></button><div>{[0,1,2,3,4].map((item) => <button key={item} className={item === slide ? 'active' : ''} onClick={() => setSlide(item)} aria-label={`Go to slide ${item + 1}`} />)}</div><button onClick={next} disabled={slide === 4} aria-label="Next slide"><ArrowRight /></button></nav>
  </main>
}
