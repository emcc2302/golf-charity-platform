/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { getMyWinnings, uploadProof } from '../../services/api';
import toast from 'react-hot-toast';
import { FiUpload } from 'react-icons/fi';

const STATUS_STYLES = {
  pending:  { badge: 'badge-gold',  label: '⏳ Pending Verification' },
  verified: { badge: 'badge-green', label: '✅ Verified' },
  paid:     { badge: 'badge-green', label: '💰 Paid' },
  rejected: { badge: 'badge-red',   label: '❌ Rejected' },
};

const WinningsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  const fetchWinnings = useCallback(async () => {
    try {
      const res = await getMyWinnings();
      setData(res.data.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchWinnings(); }, [fetchWinnings]);

  const handleProofUpload = async (drawId, winnerId, file) => {
    if (!file) return;
    setUploading(winnerId);
    const formData = new FormData();
    formData.append('proof', file);
    try {
      await uploadProof(drawId, winnerId, formData);
      toast.success('Proof uploaded! Admin will review shortly.');
      fetchWinnings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setUploading(null);
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const totals = data?.totals || { total: 0, paid: 0, pending: 0 };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 4 }}>MY WINNINGS</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Track your draw prizes and upload verification proof.</p>

      {/* Totals */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-label">Total Won</div>
          <div className="stat-value stat-accent">€{(totals.total / 100).toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Paid Out</div>
          <div className="stat-value" style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-display)', fontSize: '2rem' }}>€{(totals.paid / 100).toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-display)', fontSize: '2rem' }}>€{(totals.pending / 100).toFixed(2)}</div>
        </div>
      </div>

      {/* Winnings list */}
      {!data?.winnings?.length ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏆</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 8 }}>NO WINS YET</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Keep logging your scores — your first win could be next month!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.winnings.map((item, i) => {
            const { badge, label } = STATUS_STYLES[item.winner?.paymentStatus] || STATUS_STYLES.pending;
            const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return (
              <div key={i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                        {MONTHS[item.month - 1]} {item.year}
                      </h3>
                      <span className={`badge ${badge}`}>{label}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                      {item.drawNumbers?.map((n, j) => (
                        <div key={j}
                          className={`number-ball ${item.winner?.matchedNumbers?.includes(n) ? 'matched' : ''}`}
                          style={{ width: 36, height: 36, fontSize: '0.82rem' }}
                        >{n}</div>
                      ))}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Match type: <strong style={{ color: 'var(--text-primary)' }}>{item.winner?.matchType}</strong>
                      &nbsp;·&nbsp;
                      Matched numbers: <strong style={{ color: 'var(--accent-green)' }}>{item.winner?.matchedNumbers?.join(', ')}</strong>
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: 140 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--accent-green)', marginBottom: 4 }}>
                      €{((item.winner?.prizeAmount || 0) / 100).toFixed(2)}
                    </div>

                    {/* Upload proof if pending and no proof uploaded */}
                    {item.winner?.paymentStatus === 'pending' && !item.winner?.proofUpload && (
                      <div style={{ marginTop: 12 }}>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                          Upload score proof to claim prize
                        </p>
                        <label style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                          background: 'var(--accent-green-dim)', color: 'var(--accent-green)',
                          border: '1px solid rgba(0,232,122,0.3)', cursor: 'pointer',
                          fontSize: '0.82rem', fontWeight: 500, transition: 'var(--transition)'
                        }}>
                          <FiUpload size={13} />
                          {uploading === item.winner?._id ? 'Uploading...' : 'Upload Proof'}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            style={{ display: 'none' }}
                            onChange={e => handleProofUpload(item._id, item.winner._id, e.target.files[0])}
                            disabled={!!uploading}
                          />
                        </label>
                      </div>
                    )}

                    {item.winner?.proofUpload && item.winner?.paymentStatus === 'pending' && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', marginTop: 8 }}>
                        📎 Proof submitted — awaiting admin review
                      </p>
                    )}

                    {item.winner?.paymentStatus === 'paid' && item.winner?.paidAt && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                        Paid on {new Date(item.winner.paidAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WinningsPage;
