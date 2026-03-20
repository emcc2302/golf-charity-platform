/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDraws, getMyDrawHistory } from '../../services/api';

const DrawHistoryPage = () => {
  const { isSubscribed } = useAuth();
  const [draws, setDraws] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    Promise.all([
      getDraws(),
      isSubscribed ? getMyDrawHistory() : Promise.resolve({ data: { data: [] } })
    ]).then(([allRes, myRes]) => {
      setDraws(allRes.data.data);
      setMyHistory(myRes.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [isSubscribed]);

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const getMatchBadge = (matchType) => {
    if (!matchType) return null;
    const styles = {
      '5-match': 'badge-gold',
      '4-match': 'badge-green',
      '3-match': 'badge-gray',
    };
    return <span className={`badge ${styles[matchType] || 'badge-gray'}`}>{matchType === '5-match' ? '🏆 Jackpot!' : `${matchType}`}</span>;
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 4 }}>DRAW HISTORY</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>View all monthly draw results and your participation history.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {['all', 'mine'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 20px', fontSize: '0.88rem', fontWeight: 500,
              color: tab === t ? 'var(--accent-green)' : 'var(--text-secondary)',
              borderBottom: tab === t ? '2px solid var(--accent-green)' : '2px solid transparent',
              marginBottom: -1, transition: 'var(--transition)'
            }}
          >
            {t === 'all' ? 'All Draws' : 'My Wins'}
          </button>
        ))}
      </div>

      {tab === 'all' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {draws.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              No draws published yet. Check back after the first monthly draw!
            </div>
          ) : draws.map(draw => (
            <div key={draw._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 4 }}>
                    {MONTHS[draw.month - 1]} {draw.year} DRAW
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {draw.participantCount} participants · {draw.drawType} draw
                  </p>
                </div>
                <span className="badge badge-green">Published</span>
              </div>

              {/* Draw numbers */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                {draw.drawNumbers?.map((n, i) => (
                  <div key={i} className="number-ball draw-ball">{n}</div>
                ))}
              </div>

              {/* Prize pools */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: '5-Match Jackpot', amount: draw.prizePool?.fiveMatch, color: 'var(--accent-gold)' },
                  { label: '4-Match', amount: draw.prizePool?.fourMatch, color: 'var(--accent-green)' },
                  { label: '3-Match', amount: draw.prizePool?.threeMatch, color: 'var(--accent-blue)' },
                ].map(p => (
                  <div key={p.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{p.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: p.color, fontWeight: 600 }}>
                      €{((p.amount || 0) / 100).toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Winners summary */}
              {draw.winners?.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>Winners</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {draw.winners.map((w, i) => (
                      <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-primary)' }}>{w.user?.name || 'Anonymous'}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>· {w.matchType}</span>
                        <span style={{ color: 'var(--accent-green)', marginLeft: 6, fontFamily: 'var(--font-mono)' }}>€{((w.prizeAmount || 0) / 100).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {draw.jackpotRolledOver && (
                <div style={{ marginTop: 12, padding: '8px 14px', background: 'var(--accent-gold-dim)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--accent-gold)' }}>
                  🔄 Jackpot rolled over to next month
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'mine' && (
        <div>
          {!isSubscribed ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Subscribe to participate in monthly draws.</p>
            </div>
          ) : myHistory.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              You haven't won any draws yet. Keep entering your scores for the best chance!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myHistory.map((item, i) => (
                <div key={i} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 4 }}>
                        {MONTHS[item.month - 1]} {item.year}
                      </h4>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        {item.drawNumbers?.map((n, j) => (
                          <div key={j} className={`number-ball ${item.myMatch?.matchedNumbers?.includes(n) ? 'matched' : ''}`} style={{ width: 36, height: 36, fontSize: '0.82rem' }}>{n}</div>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {item.myMatch ? (
                        <>
                          {getMatchBadge(item.myMatch.matchType)}
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--accent-green)', marginTop: 6 }}>
                            +€{((item.myMatch.prizeAmount || 0) / 100).toFixed(2)}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            Status: <span style={{ color: item.myMatch.paymentStatus === 'paid' ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
                              {item.myMatch.paymentStatus}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No match this draw</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DrawHistoryPage;
