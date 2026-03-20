/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { adminGetWinners, adminUpdateWinnerStatus } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_FLOW = { pending: ['verified', 'rejected'], verified: ['paid', 'rejected'], paid: [], rejected: [] };
const STATUS_BADGE = { pending: 'badge-gold', verified: 'badge-green', paid: 'badge-green', rejected: 'badge-red' };
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const AdminWinnersPage = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const { data } = await adminGetWinners(params);
      setWinners(data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchWinners(); }, [filterStatus]);

  const handleStatusUpdate = async (drawId, winnerId, status) => {
    setUpdating(winnerId);
    try {
      await adminUpdateWinnerStatus(drawId, winnerId, { status });
      toast.success(`Winner marked as ${status}`);
      fetchWinners();
    } catch {
      toast.error('Failed to update status');
    }
    setUpdating(null);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 2 }}>WINNERS</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Verify and process prize payouts.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['', 'pending', 'verified', 'paid', 'rejected'].map(s => (
            <button key={s || 'all'} onClick={() => setFilterStatus(s)}
              className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="page-loader"><div className="spinner" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {winners.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              No winners found{filterStatus ? ` with status "${filterStatus}"` : ''}.
            </div>
          ) : winners.map((item, i) => {
            const w = item.winner;
            const user = item.winner?.userDetails?.[0];
            const nextStatuses = STATUS_FLOW[w?.paymentStatus] || [];

            return (
              <div key={i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                        {MONTHS[item.month - 1]} {item.year}
                      </h4>
                      <span className={`badge ${STATUS_BADGE[w?.paymentStatus] || 'badge-gray'}`}>{w?.paymentStatus}</span>
                      <span className="badge badge-gold">{w?.matchType}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>WINNER</div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>PRIZE AMOUNT</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--accent-green)' }}>
                          €{((w?.prizeAmount || 0) / 100).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>MATCHED NUMBERS</div>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {w?.matchedNumbers?.map((n, j) => (
                            <div key={j} className="number-ball matched" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>{n}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {w?.proofUpload && (
                      <div style={{ marginBottom: 10 }}>
                        <a href={`${process.env.REACT_APP_API_URL?.replace('/api', '')}${w.proofUpload}`}
                          target="_blank" rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-green)', fontSize: '0.82rem', padding: '6px 12px', background: 'var(--accent-green-dim)', borderRadius: 6, border: '1px solid rgba(0,232,122,0.2)' }}>
                          📎 View Proof Upload
                        </a>
                      </div>
                    )}
                    {!w?.proofUpload && w?.paymentStatus === 'pending' && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', marginBottom: 8 }}>
                        ⏳ Waiting for winner to upload proof
                      </p>
                    )}
                  </div>

                  {nextStatuses.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 140 }}>
                      {nextStatuses.map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(item._id, w._id, status)}
                          className={`btn btn-sm ${status === 'paid' ? 'btn-primary' : status === 'verified' ? 'btn-gold' : 'btn-danger'}`}
                          disabled={updating === w?._id}
                        >
                          {updating === w?._id ? '...' : `Mark ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminWinnersPage;
