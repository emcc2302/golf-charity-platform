import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import './HowItWorksPage.css';

const HowItWorksPage = () => (
  <div>
    <Navbar />
    <div className="hiw-hero">
      <div className="container">
        <span className="section-tag">Full Transparency</span>
        <h1>HOW IT WORKS</h1>
        <p>A subscription platform that turns your golf scores into prizes and charitable impact.</p>
      </div>
    </div>

    <div className="container hiw-content">
      {/* Subscription */}
      <div className="hiw-block">
        <div className="hiw-block-num">01</div>
        <div className="hiw-block-body">
          <h2>SUBSCRIBE TO THE PLATFORM</h2>
          <p>Choose between a monthly (€9.99/mo) or yearly plan (€99.99/yr — best value). Your subscription unlocks:</p>
          <ul>
            <li>Access to the score-entry dashboard</li>
            <li>Automatic entry into every monthly draw</li>
            <li>A guaranteed contribution to your chosen charity</li>
            <li>Full prize pool participation</li>
          </ul>
          <div className="plan-comparison">
            <div className="plan-card">
              <div className="plan-name">Monthly</div>
              <div className="plan-price">€9.99<span>/mo</span></div>
              <p>Flexible, cancel anytime</p>
            </div>
            <div className="plan-card plan-featured">
              <div className="plan-badge">Best Value</div>
              <div className="plan-name">Yearly</div>
              <div className="plan-price">€99.99<span>/yr</span></div>
              <p>Save €19.89 vs monthly</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hiw-divider" />

      {/* Scores */}
      <div className="hiw-block">
        <div className="hiw-block-num">02</div>
        <div className="hiw-block-body">
          <h2>ENTER YOUR GOLF SCORES</h2>
          <p>Use the score dashboard to log your Stableford golf scores after each round. Rules:</p>
          <ul>
            <li>Scores must be in Stableford format (range: <strong>1–45</strong>)</li>
            <li>Each score must have a date</li>
            <li>Only your <strong>last 5 scores</strong> are stored — a new score replaces the oldest</li>
            <li>Scores are displayed newest first</li>
          </ul>
          <div className="score-demo">
            {[28, 32, 25, 30, 27].map((s, i) => (
              <div key={i} className="score-demo-ball">{s}</div>
            ))}
          </div>
          <p className="hint">↑ Example: 5 stored Stableford scores used in each monthly draw</p>
        </div>
      </div>

      <div className="hiw-divider" />

      {/* Draw */}
      <div className="hiw-block">
        <div className="hiw-block-num">03</div>
        <div className="hiw-block-body">
          <h2>MONTHLY DRAW SYSTEM</h2>
          <p>Once per month, 5 numbers (1–45) are drawn. Your scores are checked for matches:</p>
          <div className="match-table">
            <div className="match-row header">
              <span>Match Type</span>
              <span>Prize Share</span>
              <span>Jackpot Rollover?</span>
            </div>
            {[
              { type: '5-Number Match', share: '40% of Pool', rollover: '✅ Yes (Jackpot)' },
              { type: '4-Number Match', share: '35% of Pool', rollover: '❌ No' },
              { type: '3-Number Match', share: '25% of Pool', rollover: '❌ No' },
            ].map(r => (
              <div key={r.type} className="match-row">
                <span>{r.type}</span>
                <span className="prize-amount">{r.share}</span>
                <span>{r.rollover}</span>
              </div>
            ))}
          </div>
          <p>If multiple people match the same tier, the prize is <strong>split equally</strong>. If no one wins the jackpot, it rolls over to next month.</p>
        </div>
      </div>

      <div className="hiw-divider" />

      {/* Charity */}
      <div className="hiw-block">
        <div className="hiw-block-num">04</div>
        <div className="hiw-block-body">
          <h2>CHARITY CONTRIBUTIONS</h2>
          <p>At signup, you select a charity from our curated directory. By default, <strong>10% of your subscription</strong> is allocated to them. You can increase this at any time from your dashboard.</p>
          <ul>
            <li>Choose from dozens of verified Irish and international charities</li>
            <li>View charity profiles, events, and impact reports</li>
            <li>Change your charity at any time</li>
            <li>Make additional one-off donations independently</li>
          </ul>
        </div>
      </div>

      <div className="hiw-divider" />

      {/* Winning */}
      <div className="hiw-block">
        <div className="hiw-block-num">05</div>
        <div className="hiw-block-body">
          <h2>WINNER VERIFICATION & PAYOUT</h2>
          <p>If you win, you'll be notified by email. To receive your prize:</p>
          <ul>
            <li>Log into your dashboard and view your win</li>
            <li>Upload a screenshot of your golf scores from your golf platform (e.g. HowDidiDo, Golf Genius)</li>
            <li>Admin reviews and approves your submission</li>
            <li>Payment is processed — status updates to <strong>Paid</strong></li>
          </ul>
        </div>
      </div>
    </div>

    <div className="hiw-cta container">
      <div className="card card-glow" style={{ textAlign: 'center', padding: '48px' }}>
        <h2>READY TO JOIN?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Start playing, giving, and winning today.</p>
        <Link to="/register" className="btn btn-primary btn-lg">Create Your Account</Link>
      </div>
    </div>

    <Footer />
  </div>
);

export default HowItWorksPage;
