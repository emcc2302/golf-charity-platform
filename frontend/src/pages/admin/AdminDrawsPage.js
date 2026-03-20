/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { adminGetDraws, adminSimulateDraw, adminPublishDraw } from '../../services/api';
import toast from 'react-hot-toast';
import { FiSend, FiRefreshCw } from 'react-icons/fi';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const AdminDrawsPage = () => {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(null);
  const [simForm, setSimForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    drawType: 'random'
  });

  const fetchDraws = useCallback(async () => {
    try {
      const { data } = await adminGetDraws();
      setDraws(data.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchDraws(); }, [fetchDraws]);

  const handleSimulate = async (e) => {
    e.preventDefault();
    setSimulating(true);
    try {
      await adminSimulateDraw(simForm);
      toast.success(`Draw simulated for ${MONTHS[simForm.month - 1]} ${simForm.year}`);
      fetchDraws();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Simulation failed');
    }
    setSimulating(false);
  };

  const handlePublish = async (id, month, year) => {
    if (!window.confirm(`Publish the ${MONTHS[month - 1]} ${year} draw? This will notify all winners.`)) return;
    setPublishing(id);
    try {
      await adminPublishDraw(id);
      toast.success('Draw published! Winners have been notified.');
      fetchDraws();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Publish failed');
    }
    setPublishing(null);
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 4 }}>DRAW MANAGEMENT</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Simulate, preview, and publish monthly draws.</p>

      {/* Simulate form */}
      <div className="card" style={{ marginBottom: 28 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 18 }}>RUN / SIMULATE DRAW</h3>
        <form onSubmit={handleSimulate} style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ minWidth: 120 }}>
            <label className="form-label">Month</label>
            <select className="form-input" value={simForm.month} onChange={e => setSimForm({ ...simForm, month: parseInt(e.target.value) })}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ minWidth: 100 }}>
            <label className="form-label">Year</label>
            <input type="number" className="form-input" value={simForm.year}
              onChange={e => setSimForm({ ...simForm, year: parseInt(e.target.value) })} min={2024} max={2030} />
          </div>
          <div className="form-group" style={{ minWidth: 160 }}>
            <label className="form-label">Draw Type</label>
            <select className="form-input" value={simForm.drawType} onChange={e => setSimForm({ ...simForm, drawType: e.target.value })}>
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic (score-weighted)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={simulating}>
            <FiRefreshCw size={15} /> {simulating ? 'Simulating...' : 'Simulate Draw'}
          </button>
        </form>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 12 }}>
          Simulation previews results without publishing. Review before going live.
        </p>
      </div>

      {/* Draws list */}
      {loading ? <div className="page-loader"><div className="spinner" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {draws.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              No draws yet. Run a simulation above to create your first draw.
            </div>
          ) : draws.map(draw => (
            <div key={draw._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                      {MONTHS[draw.month - 1]} {draw.year}
                    </h3>
                    <span className={`badge ${draw.status === 'published' ? 'badge-green' : draw.status === 'simulated' ? 'badge-gold' : 'badge-gray'}`}>
                      {draw.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {draw.participantCount} participants · {draw.drawType} · {draw.winners?.length || 0} winners
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {draw.status !== 'published' && (
                    <button
                      onClick={() => handlePublish(draw._id, draw.month, draw.year)}
                      className="btn btn-primary btn-sm"
                      disabled={publishing === draw._id}
                    >
                      <FiSend size={13} /> {publishing === draw._id ? 'Publishing...' : 'Publish Draw'}
                    </button>
                  )}
                </div>
              </div>

              {/* Draw numbers */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                {draw.drawNumbers?.map((n, i) => (
                  <div key={i} className="number-ball draw-ball">{n}</div>
                ))}
              </div>

              {/* Prize pools */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Jackpot (5)', amount: draw.prizePool?.fiveMatch, color: 'var(--accent-gold)' },
                  { label: '4-Match', amount: draw.prizePool?.fourMatch, color: 'var(--accent-green)' },
                  { label: '3-Match', amount: draw.prizePool?.threeMatch, color: 'var(--accent-blue)' },
                  { label: 'Total Pool', amount: draw.prizePool?.total, color: 'var(--text-primary)' },
                ].map(p => (
                  <div key={p.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{p.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', color: p.color, fontWeight: 600 }}>
                      €{((p.amount || 0) / 100).toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Winners */}
              {draw.winners?.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>Winners</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {draw.winners.map((w, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{w.user?.name || 'User'}</span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span style={{ color: 'var(--accent-gold)' }}>{w.matchType}</span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>€{((w.prizeAmount || 0) / 100).toFixed(2)}</span>
                        <span className={`badge ${w.paymentStatus === 'paid' ? 'badge-green' : w.paymentStatus === 'verified' ? 'badge-gold' : 'badge-gray'}`} style={{ fontSize: '0.68rem' }}>
                          {w.paymentStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {draw.jackpotRolledOver && (
                <div style={{ marginTop: 10, padding: '6px 12px', background: 'var(--accent-gold-dim)', borderRadius: 6, fontSize: '0.78rem', color: 'var(--accent-gold)' }}>
                  🔄 Jackpot carried over — no 5-match winner
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDrawsPage;