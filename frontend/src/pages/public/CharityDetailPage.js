/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { getCharity } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CharityDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCharity(id).then(r => setCharity(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!charity) return <div style={{ paddingTop: 120, textAlign: 'center' }}>Charity not found.</div>;

  const isSelected = user?.selectedCharity?._id === charity._id || user?.selectedCharity === charity._id;

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <Link to="/charities" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24, display: 'inline-block' }}>
            ← Back to Charities
          </Link>

          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ width: 80, height: 80, borderRadius: 14, background: 'var(--accent-green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--accent-green)', fontWeight: 700, flexShrink: 0 }}>
                {charity.logo ? <img src={charity.logo} alt={charity.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 14 }} /> : charity.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  {charity.isFeatured && <span className="badge badge-gold">⭐ Featured</span>}
                  <span className="badge badge-gray">{charity.category}</span>
                  {charity.country && <span className="badge badge-gray">🌍 {charity.country}</span>}
                </div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', marginBottom: 12 }}>{charity.name}</h1>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>{charity.description}</p>
                {charity.website && (
                  <a href={charity.website} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-green)', fontSize: '0.88rem', marginTop: 12, display: 'inline-block' }}>
                    Visit Website →
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-label">Supporters</div>
              <div className="stat-value stat-accent">{charity.subscriberCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Received</div>
              <div className="stat-value stat-accent">€{((charity.totalReceived || 0) / 100).toFixed(0)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Events</div>
              <div className="stat-value stat-accent">{charity.events?.length || 0}</div>
            </div>
          </div>

          {/* Events */}
          {charity.events?.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 20 }}>UPCOMING EVENTS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {charity.events.map(ev => (
                  <div key={ev._id} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ background: 'var(--accent-green-dim)', borderRadius: 10, padding: '10px 16px', textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--accent-green)' }}>
                        {new Date(ev.date).getDate()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {new Date(ev.date).toLocaleString('default', { month: 'short' })}
                      </div>
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>{ev.title}</h4>
                      {ev.location && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 4 }}>📍 {ev.location}</p>}
                      {ev.description && <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{ev.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="card card-glow" style={{ textAlign: 'center', padding: '40px' }}>
            {isSelected ? (
              <>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>✅</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 8 }}>THIS IS YOUR CHOSEN CHARITY</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>You're already supporting {charity.name} with your subscription.</p>
                <Link to="/dashboard/charity" className="btn btn-secondary">Change Charity</Link>
              </>
            ) : user ? (
              <>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 8 }}>SUPPORT THIS CAUSE</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Direct a portion of your subscription to {charity.name}.</p>
                <Link to="/dashboard/charity" className="btn btn-primary">Select as My Charity</Link>
              </>
            ) : (
              <>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 8 }}>WANT TO SUPPORT {charity.name.toUpperCase()}?</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Create an account and choose this charity at signup.</p>
                <Link to="/register" className="btn btn-primary">Join & Support</Link>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CharityDetailPage;
