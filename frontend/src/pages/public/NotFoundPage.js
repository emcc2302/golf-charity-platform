import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 20px',
    background: 'var(--bg-primary)'
  }}>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(6rem, 20vw, 12rem)', lineHeight: 1, color: 'var(--accent-green)', opacity: 0.15 }}>
      404
    </div>
    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: 12, marginTop: -20 }}>
      PAGE NOT FOUND
    </h1>
    <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 400 }}>
      Looks like this hole doesn't exist on the course. Let's get you back to the fairway.
    </p>
    <Link to="/" className="btn btn-primary">Back to Home</Link>
  </div>
);

export default NotFoundPage;
