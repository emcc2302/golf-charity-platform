/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⛳</span>
          <span className="logo-text">GOLF<span className="logo-accent">GIVES</span></span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/how-it-works" className="nav-link">How It Works</Link>
          <Link to="/charities" className="nav-link">Charities</Link>

          {!user ? (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Now</Link>
            </div>
          ) : (
            <div className="nav-user" onClick={() => setDropOpen(!dropOpen)}>
              <div className="nav-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <span className="nav-name">{user.name.split(' ')[0]}</span>
              {dropOpen && (
                <div className="nav-dropdown">
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="dropdown-item">
                    <FiUser size={14} /> Dashboard
                  </Link>
                  <Link to="/dashboard/profile" className="dropdown-item">
                    <FiSettings size={14} /> Settings
                  </Link>
                  <div className="dropdown-divider" />
                  <button onClick={logout} className="dropdown-item text-red">
                    <FiLogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
