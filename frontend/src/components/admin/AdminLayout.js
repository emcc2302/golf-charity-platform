import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiUsers, FiTarget, FiHeart,
  FiAward, FiBarChart2, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';
import './AdminLayout.css';

const ADMIN_NAV = [
  { to: '/admin',              icon: FiGrid,     label: 'Dashboard', end: true },
  { to: '/admin/users',        icon: FiUsers,    label: 'Users' },
  { to: '/admin/draws',        icon: FiTarget,   label: 'Draws' },
  { to: '/admin/charities',    icon: FiHeart,    label: 'Charities' },
  { to: '/admin/winners',      icon: FiAward,    label: 'Winners' },
  { to: '/admin/reports',      icon: FiBarChart2,label: 'Reports' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="admin-sidebar-inner">
          <Link to="/" className="admin-logo">⛳ GOLF<span>GIVES</span><span className="admin-tag">Admin</span></Link>

          <div className="admin-user">
            <div className="admin-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', letterSpacing: '0.05em' }}>ADMINISTRATOR</div>
            </div>
          </div>

          <nav className="admin-nav">
            {ADMIN_NAV.map(({ to, icon: Icon, label, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}>
                <Icon size={16} /><span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div style={{ marginTop: 'auto' }}>
            <NavLink to="/dashboard" className="admin-nav-item" style={{ marginBottom: 4 }}>
              <FiUsers size={16} /><span>User View</span>
            </NavLink>
            <button onClick={logout} className="admin-logout">
              <FiLogOut size={15} /><span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
            {open ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>ADMIN PANEL</span>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
