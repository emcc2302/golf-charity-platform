/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminGetUserDetail, adminUpdateUser, adminEditUserScores } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';

const AdminUserDetailPage = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editScores, setEditScores] = useState(false);
  const [scores, setScores] = useState([]);
  const [savingScores, setSavingScores] = useState(false);

  const fetch = async () => {
    try {
      const { data } = await adminGetUserDetail(id);
      setUserData(data.data);
      setScores(data.data.scores?.scores || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [id]);

  const handleUpdateStatus = async (status) => {
    try {
      await adminUpdateUser(id, { 'subscription.status': status });
      toast.success(`Subscription set to ${status}`);
      fetch();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSaveScores = async () => {
    setSavingScores(true);
    try {
      await adminEditUserScores(id, { scores });
      toast.success('Scores updated');
      setEditScores(false);
      fetch();
    } catch {
      toast.error('Failed to save scores');
    }
    setSavingScores(false);
  };

  const addScoreRow = () => {
    if (scores.length >= 5) return toast.error('Max 5 scores');
    setScores([{ score: '', date: new Date().toISOString().split('T')[0] }, ...scores]);
  };

  const removeScore = (i) => setScores(scores.filter((_, idx) => idx !== i));

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!userData) return <div>User not found.</div>;

  const { user, transactions } = userData;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800 }}>
      <Link to="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
        <FiArrowLeft size={14} /> Back to Users
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 24 }}>{user.name}</h1>

      {/* User card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            ['Email', user.email],
            ['Country', user.country || '—'],
            ['Role', user.role],
            ['Joined', format(new Date(user.createdAt), 'dd MMM yyyy')],
            ['Last Login', user.lastLogin ? format(new Date(user.lastLogin), 'dd MMM yyyy') : '—'],
            ['Status', user.isActive ? '✅ Active' : '❌ Inactive'],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Subscription management */}
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>Subscription Controls</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`badge ${user.subscription?.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
              {user.subscription?.status || 'none'} · {user.subscription?.plan || '—'}
            </span>
            {['active', 'inactive', 'cancelled'].map(s => (
              <button key={s} onClick={() => handleUpdateStatus(s)}
                className="btn btn-secondary btn-sm"
                disabled={user.subscription?.status === s}>
                Set {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>GOLF SCORES</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {editScores ? (
              <>
                <button onClick={addScoreRow} className="btn btn-secondary btn-sm"><FiPlus size={13} /> Add Row</button>
                <button onClick={handleSaveScores} className="btn btn-primary btn-sm" disabled={savingScores}>
                  {savingScores ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditScores(false); setScores(userData.scores?.scores || []); }} className="btn btn-secondary btn-sm">Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditScores(true)} className="btn btn-secondary btn-sm">Edit Scores</button>
            )}
          </div>
        </div>

        {scores.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No scores recorded.</p>
        ) : editScores ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scores.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="number" className="form-input" min={1} max={45} placeholder="Score"
                  value={s.score} onChange={e => { const ns = [...scores]; ns[i] = { ...ns[i], score: e.target.value }; setScores(ns); }}
                  style={{ width: 100 }} />
                <input type="date" className="form-input" value={s.date?.split('T')[0] || ''}
                  onChange={e => { const ns = [...scores]; ns[i] = { ...ns[i], date: e.target.value }; setScores(ns); }}
                  style={{ width: 160 }} />
                <button onClick={() => removeScore(i)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                  <FiTrash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {scores.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '8px 14px' }}>
                <div className="number-ball" style={{ width: 34, height: 34, fontSize: '0.82rem' }}>{s.score}</div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.date ? format(new Date(s.date), 'dd MMM yy') : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent transactions */}
      {transactions?.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 16 }}>TRANSACTION HISTORY</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{format(new Date(t.createdAt), 'dd MMM yyyy')}</td>
                    <td style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{t.type?.replace('_', ' ')}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontSize: '0.85rem' }}>€{((t.amount || 0) / 100).toFixed(2)}</td>
                    <td><span className={`badge ${t.status === 'completed' ? 'badge-green' : 'badge-gray'}`}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetailPage;
