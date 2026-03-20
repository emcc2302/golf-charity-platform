/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { adminGetCharities, adminCreateCharity, adminUpdateCharity, adminDeleteCharity } from '../../services/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

const BLANK = { name: '', description: '', shortDescription: '', category: 'health', country: 'Ireland', website: '', isFeatured: false };
const CATEGORIES = ['health','education','environment','poverty','sports','children','animals','other'];

const AdminCharitiesPage = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCharity, setEditingCharity] = useState(null); // null = create mode, object = edit mode
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const fetchCharities = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminGetCharities();
      setCharities(data.data || []);
    } catch (err) {
      console.error('Failed to fetch charities:', err);
      toast.error('Failed to load charities');
      setCharities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCharities(); }, [fetchCharities]);

  const openCreate = () => {
    setForm(BLANK);
    setEditingCharity(null);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setForm({
      name: c.name,
      description: c.description,
      shortDescription: c.shortDescription || '',
      category: c.category,
      country: c.country || '',
      website: c.website || '',
      isFeatured: c.isFeatured
    });
    setEditingCharity(c);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCharity(null);
    setForm(BLANK);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Charity name is required');
    if (!form.description.trim()) return toast.error('Description is required');

    setSaving(true);
    try {
      if (editingCharity) {
        await adminUpdateCharity(editingCharity._id, form);
        toast.success('Charity updated successfully');
      } else {
        await adminCreateCharity(form);
        toast.success('Charity created successfully');
      }
      closeModal();
      await fetchCharities();
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.response?.data?.message || 'Failed to save charity');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"? It will be hidden from the platform.`)) return;
    try {
      await adminDeleteCharity(id);
      toast.success('Charity deactivated');
      fetchCharities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 2 }}>CHARITIES</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{charities.length} charities</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <FiPlus size={15} /> Add Charity
        </button>
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : charities.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏛️</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 8 }}>NO CHARITIES YET</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Add your first charity to get started.</p>
          <button onClick={openCreate} className="btn btn-primary"><FiPlus size={15} /> Add First Charity</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {charities.map(c => (
            <div key={c._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 10, flex: 1 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--accent-green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--accent-green)', flexShrink: 0, fontSize: '1.1rem' }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: 4 }}>{c.name}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span className="badge badge-gray" style={{ fontSize: '0.68rem' }}>{c.category}</span>
                      {c.isFeatured && <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>⭐ Featured</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(c)}
                    title="Edit"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6, borderRadius: 4, transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-green)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <FiEdit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id, c.name)}
                    title="Deactivate"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6, borderRadius: 4, transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                {c.shortDescription || c.description?.slice(0, 100)}{c.description?.length > 100 ? '...' : ''}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <span>{c.subscriberCount || 0} supporters</span>
                <span>€{((c.totalReceived || 0) / 100).toFixed(0)} received</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000 }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
                {editingCharity ? 'EDIT CHARITY' : 'ADD CHARITY'}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Charity Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Irish Cancer Society"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Short Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(shown on cards)</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="One-liner, max 200 characters"
                  value={form.shortDescription}
                  onChange={e => setForm({ ...form, shortDescription: e.target.value })}
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Description *</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Describe what this charity does and its impact..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  required
                  style={{ resize: 'vertical', minHeight: 100 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ireland"
                    value={form.country}
                    onChange={e => setForm({ ...form, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Website URL <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://example.com"
                  value={form.website}
                  onChange={e => setForm({ ...form, website: e.target.value })}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)', padding: '4px 0' }}>
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
                />
                ⭐ Feature this charity on the homepage
              </label>

              <div style={{ display: 'flex', gap: 10, marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ flex: 1 }}
                >
                  {saving ? '⏳ Saving...' : editingCharity ? '✅ Update Charity' : '✅ Create Charity'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCharitiesPage;