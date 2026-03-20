import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCharities } from '../../services/api';
import toast from 'react-hot-toast';
import './AuthPages.css';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', country: 'IE', selectedCharity: '', charityContributionPercent: 10 });
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCharities().then(r => setCharities(r.data.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to GolfGives, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard/subscribe');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb" />
      </div>
      <div className="auth-card card" style={{ maxWidth: 520 }}>
        <Link to="/" className="auth-logo">⛳ GOLF<span>GIVES</span></Link>
        <h1 className="auth-title">JOIN THE PLATFORM</h1>
        <p className="auth-subtitle">Create your account and start playing, winning, and giving back.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" placeholder="John Doe" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="Min. 8 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Country</label>
            <select className="form-input" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}>
              <option value="IE">Ireland</option>
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
              <option value="AU">Australia</option>
              <option value="CA">Canada</option>
              <option value="ZA">South Africa</option>
            </select>
          </div>

          {charities.length > 0 && (
            <>
              <div className="form-group">
                <label className="form-label">Choose Your Charity (optional)</label>
                <select className="form-input" value={form.selectedCharity} onChange={e => setForm({ ...form, selectedCharity: e.target.value })}>
                  <option value="">Select a charity...</option>
                  {charities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              {form.selectedCharity && (
                <div className="form-group">
                  <label className="form-label">Charity Contribution: {form.charityContributionPercent}%</label>
                  <input type="range" min={10} max={50} step={5} value={form.charityContributionPercent}
                    onChange={e => setForm({ ...form, charityContributionPercent: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--accent-green)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Min 10%</span><span>50%</span>
                  </div>
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
