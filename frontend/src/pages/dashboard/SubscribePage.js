/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createCheckoutSession, createPortalSession, getSubscription } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FiCheck } from 'react-icons/fi';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '€9.99',
    period: '/month',
    description: 'Flexible monthly access',
    features: ['Monthly draw entry', 'Score tracking (5 scores)', 'Charity contributions', 'Win cash prizes', 'Cancel anytime'],
    highlight: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '€99.99',
    period: '/year',
    description: 'Best value — save €19.89',
    features: ['Everything in Monthly', '12 draw entries per year', 'Priority support', 'Annual impact report', '2 months free'],
    highlight: true,
  },
];

const SubscribePage = () => {
  const { user, isSubscribed } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSubscribed) {
      getSubscription()
        .then(r => setSubscription(r.data.subscription))
        .catch(() => {});
    }
  }, [isSubscribed]);

  const handleSubscribe = async (plan) => {
    setLoading(plan);
    try {
      const { data } = await createCheckoutSession({ plan });
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create session');
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading('manage');
    try {
      const { data } = await createPortalSession();
      window.location.href = data.url;
    } catch (err) {
      toast.error('Failed to open billing portal');
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 4 }}>SUBSCRIPTION</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Manage your plan and billing.</p>

      {/* Current subscription status */}
      {isSubscribed && (
        <div className="card card-glow" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className="badge badge-green">✅ Active</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {user?.subscription?.plan} Plan
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 6 }}>
                YOU'RE ALL SET
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Your subscription is active.
                {user?.subscription?.currentPeriodEnd && (
                  <> Renews on <strong style={{ color: 'var(--text-primary)' }}>
                    {format(new Date(user.subscription.currentPeriodEnd), 'dd MMM yyyy')}
                  </strong>.</>
                )}
              </p>
              {subscription?.cancelAtPeriodEnd && (
                <p style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', marginTop: 8 }}>
                  ⚠️ Cancels at end of billing period
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={handleManage}
                className="btn btn-secondary"
                disabled={loading === 'manage'}
              >
                {loading === 'manage' ? 'Opening...' : 'Manage Billing'}
              </button>
            </div>
          </div>

          {/* Allocation breakdown */}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 14 }}>Your Subscription Split</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Prize Pool', pct: 50, color: 'var(--accent-green)' },
                { label: 'Your Charity', pct: user?.charityContributionPercent || 10, color: 'var(--accent-gold)' },
                { label: 'Platform', pct: 40, color: 'var(--accent-blue)' },
              ].map(item => (
                <div key={item.label} style={{ flex: 1, minWidth: 120, background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: item.color }}>{item.pct}%</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      {!isSubscribed && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
            {PLANS.map(plan => (
              <div key={plan.id} className={`card ${plan.highlight ? 'card-glow' : ''}`} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-green)', color: '#070d1a', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', padding: '3px 14px', borderRadius: 100 }}>
                    BEST VALUE
                  </div>
                )}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 6 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', color: 'var(--text-primary)' }}>{plan.price}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{plan.period}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{plan.description}</p>
                </div>

                <ul style={{ flex: 1, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      <FiCheck size={14} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`btn ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%' }}
                  disabled={!!loading}
                >
                  {loading === plan.id ? 'Redirecting...' : `Subscribe ${plan.name}`}
                </button>
              </div>
            ))}
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7 }}>
              🔒 Payments processed securely via Stripe. No card data stored on our servers.<br />
              Cancel anytime from your billing portal. Min. 10% of each subscription goes to your charity.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SubscribePage;