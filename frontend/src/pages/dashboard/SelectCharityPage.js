/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCharities, selectCharity, updateCharityPercent } from '../../services/api';
import toast from 'react-hot-toast';
import { FiCheck, FiSearch } from 'react-icons/fi';

const SelectCharityPage = () => {
  const { user, updateUser } = useAuth();
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selecting, setSelecting] = useState(null);
  const [percent, setPercent] = useState(user?.charityContributionPercent || 10);
  const [savingPercent, setSavingPercent] = useState(false);

  const fetchCharities = useCallback(async () => {
    try {
      const params = search ? { search } : {};
      const { data } = await getCharities(params);
      setCharities(data.data);
    } catch {}
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchCharities(); }, [fetchCharities]);

  const handleSelect = async (charityId) => {
    setSelecting(charityId);
    try {
      await selectCharity(charityId, { contributionPercent: percent });
      updateUser({ selectedCharity: charities.find(c => c._id === charityId), charityContributionPercent: percent });
      toast.success('Charity updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to select charity');
    }
    setSelecting(null);
  };

  const handleSavePercent = async () => {
    setSavingPercent(true);
    try {
      await updateCharityPercent({ percent });
      updateUser({ charityContributionPercent: percent });
      toast.success('Contribution percentage updated!');
    } catch {
      toast.error('Failed to update percentage');
    }
    setSavingPercent(false);
  };

  const selectedId = user?.selectedCharity?._id || user?.selectedCharity;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 4 }}>MY CHARITY</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Choose a charity to receive a portion of your subscription.</p>

      {/* Current selection */}
      {selectedId && (
        <div className="card card-glow" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 6 }}>Currently Supporting</p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--accent-green)', marginBottom: 4 }}>
                {user?.selectedCharity?.name || 'Selected Charity'}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {user?.charityContributionPercent}% of your subscription goes to this cause.
              </p>
            </div>
            <span className="badge badge-green">✅ Active</span>
          </div>

          {/* Percent slider */}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <label className="form-label">Adjust Contribution: <strong style={{ color: 'var(--accent-green)' }}>{percent}%</strong></label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
              <input
                type="range" min={10} max={50} step={5} value={percent}
                onChange={e => setPercent(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-green)' }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSavePercent}
                disabled={savingPercent || percent === user?.charityContributionPercent}
              >
                {savingPercent ? 'Saving...' : 'Save'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <span>Min 10%</span><span>50%</span>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input" placeholder="Search charities..."
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchCharities()}
            style={{ paddingLeft: 40 }}
          />
        </div>
        <button className="btn btn-secondary" onClick={fetchCharities}>Search</button>
      </div>

      {/* Charity grid */}
      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {charities.map(c => {
            const isSelected = selectedId === c._id;
            return (
              <div key={c._id} className="card" style={{
                border: isSelected ? '1px solid var(--accent-green)' : '1px solid var(--border)',
                background: isSelected ? 'var(--accent-green-dim)' : 'var(--bg-card)',
                transition: 'var(--transition)',
                display: 'flex', flexDirection: 'column', gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: isSelected ? 'rgba(0,232,122,0.2)' : 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', color: 'var(--accent-green)', fontWeight: 700, overflow: 'hidden'
                  }}>
                    {c.logo ? <img src={c.logo} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : c.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </div>
                    <span className="badge badge-gray" style={{ fontSize: '0.7rem', marginTop: 2 }}>{c.category}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                  {c.shortDescription || c.description?.slice(0, 90)}...
                </p>

                <button
                  onClick={() => !isSelected && handleSelect(c._id)}
                  className={`btn btn-sm ${isSelected ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ width: '100%' }}
                  disabled={selecting === c._id || isSelected}
                >
                  {isSelected
                    ? <><FiCheck size={13} /> Selected</>
                    : selecting === c._id
                      ? 'Selecting...'
                      : 'Select This Charity'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectCharityPage;
