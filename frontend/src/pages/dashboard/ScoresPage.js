/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getScores, addScore, editScore, deleteScore } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FiEdit2, FiTrash2, FiPlus, FiCheck, FiX } from 'react-icons/fi';

const ScoresPage = () => {
  const { isSubscribed } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newScore, setNewScore] = useState({ score: '', date: new Date().toISOString().split('T')[0] });
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState({});
  const [adding, setAdding] = useState(false);

  const fetchScores = async () => {
    try {
      const { data } = await getScores();
      setScores(data.data.scores);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { if (isSubscribed) fetchScores(); else setLoading(false); }, [isSubscribed]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const s = parseInt(newScore.score);
    if (isNaN(s) || s < 1 || s > 45) return toast.error('Score must be between 1 and 45');
    setAdding(true);
    try {
      await addScore({ score: s, date: newScore.date });
      toast.success('Score added!');
      setNewScore({ score: '', date: new Date().toISOString().split('T')[0] });
      fetchScores();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add score');
    }
    setAdding(false);
  };

  const handleEdit = async (id) => {
    const s = parseInt(editVal.score);
    if (isNaN(s) || s < 1 || s > 45) return toast.error('Score must be 1–45');
    try {
      await editScore(id, { score: s, date: editVal.date });
      toast.success('Score updated');
      setEditingId(null);
      fetchScores();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this score?')) return;
    try {
      await deleteScore(id);
      toast.success('Score removed');
      fetchScores();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (!isSubscribed) {
    return (
      <div className="animate-fade-in">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 8 }}>MY SCORES</h1>
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
          <h3 style={{ marginBottom: 12 }}>Subscription Required</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Subscribe to start logging your Stableford scores and entering monthly draws.</p>
          <Link to="/dashboard/subscribe" className="btn btn-primary">Subscribe Now</Link>
        </div>
      </div>
    );
  }

  const avgScore = scores.length ? (scores.reduce((a, s) => a + s.score, 0) / scores.length).toFixed(1) : null;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 4 }}>MY SCORES</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Enter your Stableford golf scores (1–45). Last 5 are kept — oldest auto-removed.</p>

      {/* Stats bar */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-label">Stored</div><div className="stat-value stat-accent">{scores.length}<span style={{ fontSize: '1rem', fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>/5</span></div></div>
        <div className="stat-card"><div className="stat-label">Average</div><div className="stat-value stat-accent">{avgScore || '—'}</div></div>
        <div className="stat-card"><div className="stat-label">Highest</div><div className="stat-value stat-accent">{scores.length ? Math.max(...scores.map(s => s.score)) : '—'}</div></div>
        <div className="stat-card"><div className="stat-label">Latest</div><div className="stat-value stat-accent">{scores[0]?.score || '—'}</div></div>
      </div>

      {/* Add score form */}
      {scores.length < 5 ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16 }}>ADD NEW SCORE</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
              <label className="form-label">Stableford Score</label>
              <input type="number" className="form-input" placeholder="e.g. 28" min={1} max={45}
                value={newScore.score} onChange={e => setNewScore({ ...newScore, score: e.target.value })} required />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
              <label className="form-label">Date Played</label>
              <input type="date" className="form-input" value={newScore.date}
                onChange={e => setNewScore({ ...newScore, date: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={adding} style={{ flexShrink: 0 }}>
              <FiPlus size={16} /> {adding ? 'Adding...' : 'Add Score'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: 24, fontSize: '0.88rem', color: 'var(--accent-gold)' }}>
          ⚠️ You have 5 scores stored. Adding a new one will remove the oldest.
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <input type="number" className="form-input" placeholder="Score (1–45)" min={1} max={45}
              value={newScore.score} onChange={e => setNewScore({ ...newScore, score: e.target.value })} style={{ width: 140 }} required />
            <input type="date" className="form-input" value={newScore.date}
              onChange={e => setNewScore({ ...newScore, date: e.target.value })} style={{ width: 160 }} required />
            <button type="submit" className="btn btn-primary btn-sm" disabled={adding}>
              <FiPlus size={14} /> {adding ? '...' : 'Add & Replace Oldest'}
            </button>
          </form>
        </div>
      )}

      {/* Scores list */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16 }}>STORED SCORES</h3>
        {loading ? <div className="spinner" /> : scores.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No scores yet. Add your first Stableford score above.</p>
        ) : (
          <div>
            {scores.map((s, i) => (
              <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: i < scores.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="number-ball" style={{ flexShrink: 0 }}>{s.score}</div>
                {editingId === s._id ? (
                  <div style={{ flex: 1, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="number" className="form-input" min={1} max={45} value={editVal.score}
                      onChange={e => setEditVal({ ...editVal, score: e.target.value })} style={{ width: 100 }} />
                    <input type="date" className="form-input" value={editVal.date}
                      onChange={e => setEditVal({ ...editVal, date: e.target.value })} style={{ width: 160 }} />
                    <button onClick={() => handleEdit(s._id)} className="btn btn-primary btn-sm"><FiCheck size={14} /></button>
                    <button onClick={() => setEditingId(null)} className="btn btn-secondary btn-sm"><FiX size={14} /></button>
                  </div>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.score} pts</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{format(new Date(s.date), 'EEEE, dd MMM yyyy')}</div>
                    </div>
                    {i === 0 && <span className="badge badge-green">Latest</span>}
                    {i === scores.length - 1 && scores.length === 5 && <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>Next to go</span>}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setEditingId(s._id); setEditVal({ score: s.score, date: s.date.split('T')[0] }); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition)', padding: 4 }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-green)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(s._id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition)', padding: 4 }} onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoresPage;
