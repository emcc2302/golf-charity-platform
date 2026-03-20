/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { getCharities, getLatestDraw } from '../../services/api';
import './HomePage.css';

const HomePage = () => {
  const [charities, setCharities] = useState([]);
  const [latestDraw, setLatestDraw] = useState(null);

  useEffect(() => {
    getCharities({ featured: true }).then(r => setCharities(r.data.data.slice(0, 3))).catch(() => {});
    getLatestDraw().then(r => setLatestDraw(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="home">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-grid" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <span className="badge badge-green">🌍 Now Live — Giving Back Since 2024</span>
          </div>
          <h1 className="hero-title">
            EVERY SWING<br />
            <span className="gradient-text">CHANGES LIVES</span>
          </h1>
          <p className="hero-subtitle">
            Subscribe, enter your Stableford scores, and compete in monthly draws —
            while a portion of every subscription goes directly to your chosen charity.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">Start Playing & Giving</Link>
            <Link to="/how-it-works" className="btn btn-secondary btn-lg">See How It Works</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">€50K+</span>
              <span className="hero-stat-label">Given to Charities</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">2,400+</span>
              <span className="hero-stat-label">Active Members</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">18</span>
              <span className="hero-stat-label">Monthly Draws</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Simple Process</span>
            <h2 className="section-title">THREE STEPS TO PLAY & GIVE</h2>
          </div>
          <div className="steps-grid">
            {[
              { num: '01', icon: '💳', title: 'Subscribe', desc: 'Choose monthly or yearly plan. A portion of every subscription goes to your chosen charity automatically.' },
              { num: '02', icon: '🏌️', title: 'Enter Scores', desc: 'Log your last 5 Stableford golf scores (1–45). Your scores are your draw tickets — more scores mean more chances.' },
              { num: '03', icon: '🎰', title: 'Win & Give', desc: 'Monthly draws match your scores against drawn numbers. Win cash prizes while your charity receives its share.' },
            ].map(s => (
              <div key={s.num} className="step-card">
                <div className="step-num">{s.num}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest draw */}
      {latestDraw && (
        <section className="section section-dark">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Latest Results</span>
              <h2 className="section-title">LAST MONTH'S DRAW</h2>
            </div>
            <div className="draw-showcase">
              <div className="draw-numbers-display">
                {latestDraw.drawNumbers?.map((n, i) => (
                  <div key={i} className="number-ball draw-ball">{n}</div>
                ))}
              </div>
              <div className="draw-info">
                <p className="draw-month">{new Date(latestDraw.year, latestDraw.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                <div className="draw-prizes">
                  <div className="prize-row">
                    <span>5-Number Match (Jackpot)</span>
                    <span className="prize-amount">€{((latestDraw.prizePool?.fiveMatch || 0) / 100).toFixed(0)}</span>
                  </div>
                  <div className="prize-row">
                    <span>4-Number Match</span>
                    <span className="prize-amount">€{((latestDraw.prizePool?.fourMatch || 0) / 100).toFixed(0)}</span>
                  </div>
                  <div className="prize-row">
                    <span>3-Number Match</span>
                    <span className="prize-amount">€{((latestDraw.prizePool?.threeMatch || 0) / 100).toFixed(0)}</span>
                  </div>
                </div>
                <Link to="/register" className="btn btn-primary">Enter Next Draw</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Prize pool breakdown */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Transparency</span>
            <h2 className="section-title">WHERE YOUR MONEY GOES</h2>
          </div>
          <div className="allocation-grid">
            {[
              { pct: '50%', label: 'Prize Pool', color: 'var(--accent-green)', desc: 'Split across 5, 4, and 3-number match tiers. Jackpot rolls over if unclaimed.' },
              { pct: '10%+', label: 'Your Charity', color: 'var(--accent-gold)', desc: 'Minimum 10% goes directly to your chosen charity. Increase any time you want.' },
              { pct: '40%', label: 'Platform', color: 'var(--accent-blue)', desc: 'Operations, technology, support, and continued platform development.' },
            ].map(a => (
              <div key={a.label} className="allocation-card card">
                <div className="allocation-pct" style={{ color: a.color }}>{a.pct}</div>
                <div className="allocation-label">{a.label}</div>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured charities */}
      {charities.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Featured Partners</span>
              <h2 className="section-title">CAUSES WORTH PLAYING FOR</h2>
            </div>
            <div className="charity-cards">
              {charities.map(c => (
                <Link key={c._id} to={`/charities/${c.slug || c._id}`} className="charity-preview card">
                  <div className="charity-preview-logo">
                    {c.logo ? <img src={c.logo} alt={c.name} /> : <span>{c.name.charAt(0)}</span>}
                  </div>
                  <h3>{c.name}</h3>
                  <p>{c.shortDescription || c.description.slice(0, 100)}...</p>
                  <span className="badge badge-gray">{c.category}</span>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link to="/charities" className="btn btn-secondary">View All Charities</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box card card-glow">
            <h2>READY TO PLAY & GIVE BACK?</h2>
            <p>Join thousands of golfers making a difference with every score they enter.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Join Free Today</Link>
              <Link to="/charities" className="btn btn-secondary btn-lg">Explore Charities</Link>
            </div>
            <p className="cta-note">Monthly plan from €9.99 · Cancel anytime · Min. 10% to charity</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
