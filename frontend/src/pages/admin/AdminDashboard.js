/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminGetAnalytics } from '../../services/api';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetAnalytics().then(r => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const r = data?.revenue || {};

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 4 }}>ADMIN DASHBOARD</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Platform overview and key metrics.</p>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Users', value: data?.totalUsers || 0, accent: true },
          { label: 'Active Subscribers', value: data?.activeSubscribers || 0, accent: true },
          { label: 'Total Revenue', value: `€${((r.total || 0) / 100).toFixed(0)}`, accent: true },
          { label: 'Charity Donated', value: `€${((r.charityTotal || 0) / 100).toFixed(0)}`, accent: false, gold: true },
          { label: 'Prize Pool Total', value: `€${((r.prizeTotal || 0) / 100).toFixed(0)}`, accent: false },
          { label: 'Pending Winners', value: data?.pendingWinnersCount || 0, accent: false, warn: true },
          { label: 'Active Charities', value: data?.totalCharities || 0, accent: false },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.gold ? 'var(--accent-gold)' : s.warn && s.value > 0 ? '#f87171' : s.accent ? 'var(--accent-green)' : 'var(--text-primary)' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent transactions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>RECENT TRANSACTIONS</h3>
          </div>
          {!data?.recentTransactions?.length ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No transactions yet.</p>
          ) : (
            <div>
              {data.recentTransactions.slice(0, 6).map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>{t.user?.name || 'User'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{format(new Date(t.createdAt), 'dd MMM yyyy')}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontSize: '0.9rem' }}>
                    +€{((t.amount || 0) / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent draws */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>RECENT DRAWS</h3>
            <Link to="/admin/draws" style={{ fontSize: '0.8rem', color: 'var(--accent-green)' }}>Manage →</Link>
          </div>
          {!data?.recentDraws?.length ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No draws yet. <Link to="/admin/draws" style={{ color: 'var(--accent-green)' }}>Create one →</Link></p>
          ) : (
            <div>
              {data.recentDraws.map((d, i) => {
                const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < data.recentDraws.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>{MONTHS[d.month - 1]} {d.year}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        {d.drawNumbers?.slice(0, 5).map((n, j) => (
                          <span key={j} style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>{n}</span>
                        ))}
                      </div>
                    </div>
                    <span className={`badge ${d.status === 'published' ? 'badge-green' : 'badge-gray'}`}>{d.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      {data?.pendingWinnersCount > 0 && (
        <div style={{ marginTop: 24, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontWeight: 600, color: '#f87171', marginBottom: 4 }}>⚠️ {data.pendingWinnersCount} winner{data.pendingWinnersCount > 1 ? 's' : ''} awaiting verification</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Review and approve winner proof submissions.</p>
          </div>
          <Link to="/admin/winners" className="btn btn-danger btn-sm">Review Winners</Link>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
