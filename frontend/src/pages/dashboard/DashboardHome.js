/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboard, syncSubscription } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const DashboardHome = () => {
  const { user, isSubscribed, updateUser, loadUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-sync subscription when redirected back from Stripe
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (paymentStatus === 'success') {
      setSyncing(true);
      toast.loading('Activating your subscription...', { id: 'sync' });

      syncSubscription({ sessionId: sessionId || null })
        .then(res => {
          if (res.data.synced) {
            toast.success('🎉 Subscription activated! Welcome to GolfGives.', { id: 'sync' });
            if (res.data.user) updateUser(res.data.user);
            // Also reload full user to refresh auth context
            loadUser();
          } else {
            toast.error('Payment received but sync pending — refreshing...', { id: 'sync' });
            setTimeout(() => loadUser(), 3000);
          }
        })
        .catch(() => {
          toast.error('Could not confirm subscription. Please refresh.', { id: 'sync' });
        })
        .finally(() => {
          setSyncing(false);
          // Clean up URL params
          setSearchParams({});
        });
    }
  }, []);

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: 6 }}>
          GOOD DAY, {user?.name?.split(' ')[0]?.toUpperCase()} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Here's your golf charity platform overview.</p>
      </div>

      {/* Syncing banner */}
      {syncing && (
        <div style={{ background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--radius-md)', padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
          <span style={{ color: 'var(--accent-green)', fontWeight: 500 }}>Activating your subscription...</span>
        </div>
      )}

      {/* Subscription alert */}
      {!isSubscribed && !syncing && (
        <div style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.25)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--accent-gold)', marginBottom: 4 }}>⚠️ No Active Subscription</p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Subscribe to enter scores and participate in monthly draws.</p>
          </div>
          <Link to="/dashboard/subscribe" className="btn btn-gold btn-sm">Subscribe Now</Link>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-label">Subscription</div>
          <div className="stat-value" style={{ fontSize: '1.3rem', marginTop: 4 }}>
            <span className={isSubscribed ? 'stat-accent' : ''} style={{ fontSize: '1rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              {isSubscribed ? '✅ Active' : '❌ Inactive'}
            </span>
          </div>
          {user?.subscription?.currentPeriodEnd && isSubscribed && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Renews {format(new Date(user.subscription.currentPeriodEnd), 'dd MMM yyyy')}
            </div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-label">Scores Logged</div>
          <div className="stat-value stat-accent">
            {data?.scores?.length || 0}
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>/5</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Score</div>
          <div className="stat-value stat-accent">
            {data?.averageScore ? data.averageScore.toFixed(1) : '—'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Won</div>
          <div className="stat-value stat-accent">
            €{((data?.totalWon || 0) / 100).toFixed(2)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent scores */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>MY SCORES</h3>
            <Link to="/dashboard/scores" style={{ fontSize: '0.8rem', color: 'var(--accent-green)' }}>Manage →</Link>
          </div>
          {!isSubscribed ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Subscribe to enter scores.</p>
          ) : data?.scores?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No scores yet.{' '}
              <Link to="/dashboard/scores" style={{ color: 'var(--accent-green)' }}>Add your first score →</Link>
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.scores.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="number-ball" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>{s.score}</div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {format(new Date(s.date), 'dd MMM yyyy')}
                    </span>
                  </div>
                  {i === 0 && <span className="badge badge-green">Latest</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Charity */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>MY CHARITY</h3>
            <Link to="/dashboard/charity" style={{ fontSize: '0.8rem', color: 'var(--accent-green)' }}>Change →</Link>
          </div>
          {data?.user?.selectedCharity ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--accent-green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                {data.user.selectedCharity?.name?.charAt(0) || '♥'}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{data.user.selectedCharity?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{data.user.charityContributionPercent}% of subscription</div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No charity selected.{' '}
              <Link to="/dashboard/charity" style={{ color: 'var(--accent-green)' }}>Choose one →</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
