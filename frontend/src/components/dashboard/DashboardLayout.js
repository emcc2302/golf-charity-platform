import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiTarget, FiCreditCard, FiGift,
  FiHeart, FiUser, FiLogOut, FiMenu, FiX, FiTrendingUp
} from 'react-icons/fi';
import './DashboardLayout.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: FiHome, label: 'Overview', end: true },
  { to: '/dashboard/scores', icon: FiTarget, label: 'My Scores' },
  { to: '/dashboard/draws', icon: FiTrendingUp, label: 'Draw History' },
  { to: '/dashboard/winnings', icon: FiGift, label: 'Winnings' },
  { to: '/dashboard/charity', icon: FiHeart, label: 'My Charity' },
  { to: '/dashboard/subscribe', icon: FiCreditCard, label: 'Subscription' },
  { to: '/dashboard/profile', icon: FiUser, label: 'Profile' },
];

const DashboardLayout = () => {
  const { user, logout, isSubscribed } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="dash-sidebar-inner">
          <Link to="/" className="dash-logo">⛳ GOLF<span>GIVES</span></Link>

          <div className="dash-user-pill">
            <div className="dash-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="dash-user-name">{user?.name}</div>
              <div className={`dash-sub-status ${isSubscribed ? 'active' : 'inactive'}`}>
                {isSubscribed ? '● Active' : '● Inactive'}
              </div>
            </div>
          </div>

          <nav className="dash-nav">
            {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={17} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <button onClick={logout} className="dash-logout">
            <FiLogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="dash-main">
        <header className="dash-topbar">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
          <div className="topbar-right">
            {!isSubscribed && (
              <Link to="/dashboard/subscribe" className="btn btn-primary btn-sm">
                Subscribe Now
              </Link>
            )}
          </div>
        </header>

        <div className="dash-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;