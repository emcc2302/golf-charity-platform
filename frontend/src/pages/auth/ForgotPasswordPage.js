import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/api';
import toast from 'react-hot-toast';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg"><div className="auth-orb" /></div>
      <div className="auth-card card">
        <Link to="/" className="auth-logo">⛳ GOLF<span>GIVES</span></Link>
        <h1 className="auth-title">FORGOT PASSWORD</h1>
        {sent ? (
          <>
            <div style={{ fontSize: '3rem', margin: '16px 0' }}>📧</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              If that email exists in our system, a reset link has been sent. Check your inbox.
            </p>
            <Link to="/login" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Back to Login
            </Link>
          </>
        ) : (
          <>
            <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email" className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit" className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="auth-switch">
              <Link to="/login">← Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
