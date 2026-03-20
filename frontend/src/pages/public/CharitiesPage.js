/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { getCharities } from '../../services/api';
import { FiSearch } from 'react-icons/fi';

const CATEGORIES = ['', 'health', 'education', 'environment', 'poverty', 'sports', 'children', 'animals', 'other'];

const CharitiesPage = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchCharities = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      const { data } = await getCharities(params);
      setCharities(data.data);
    } catch { }
    setLoading(false);
  }, [search, category]);

  useEffect(() => { fetchCharities(); }, [fetchCharities]);

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="container">
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <span className="section-tag">Make It Meaningful</span>
            <h1 style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', margin: '12px 0' }}>CHOOSE YOUR CAUSE</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Every subscription supports one of these verified charities. You choose who benefits.
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 36, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                placeholder="Search charities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchCharities()}
                style={{ paddingLeft: 40 }}
              />
            </div>
            <select
              className="form-input"
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ width: 'auto', minWidth: 160 }}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c ? c.charAt(0).toUpperCase() + c.slice(1) : 'All Categories'}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : charities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              No charities found. Try adjusting your search.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {charities.map(c => (
                <Link
                  key={c._id}
                  to={`/charities/${c.slug || c._id}`}
                  className="card"
                  style={{ display: 'flex', flexDirection: 'column', gap: 14, textDecoration: 'none', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {c.isFeatured && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <span className="badge badge-gold">⭐ Featured</span>
                    </div>
                  )}
                  <div style={{ width: 56, height: 56, borderRadius: 10, background: 'var(--accent-green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--accent-green)', fontWeight: 700, overflow: 'hidden' }}>
                    {c.logo
                      ? <img src={c.logo} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : c.name.charAt(0)}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.03em', color: 'var(--text-primary)' }}>{c.name}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, flex: 1 }}>
                    {c.shortDescription || c.description.slice(0, 120)}...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-gray">{c.category}</span>
                    {c.subscriberCount > 0 && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.subscriberCount} supporters</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CharitiesPage;
