import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, changePassword as apiUpdatePassword } from '../../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', country: user?.country || 'IE' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await updateProfile(profile);
      updateUser(data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setSavingProfile(false);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    setSavingPassword(true);
    try {
      await apiUpdatePassword(passwords);
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
    setSavingPassword(false);
  };

  const COUNTRIES = [
    ['IE', 'Ireland'], ['GB', 'United Kingdom'], ['US', 'United States'],
    ['AU', 'Australia'], ['CA', 'Canada'], ['ZA', 'South Africa']
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 600 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 4 }}>PROFILE</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Manage your personal details and account settings.</p>

      {/* Avatar block */}
      <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-green)', color: '#070d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 700, flexShrink: 0 }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 2 }}>{user?.name}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
          <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
            <span className={`badge ${user?.subscription?.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
              {user?.subscription?.status || 'No subscription'}
            </span>
            <span className="badge badge-gray">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 20 }}>PERSONAL INFORMATION</h3>
        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" value={user?.email} disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email cannot be changed</span>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-input" placeholder="+353 ..." value={profile.phone}
              onChange={e => setProfile({ ...profile, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Country</label>
            <select className="form-input" value={profile.country} onChange={e => setProfile({ ...profile, country: e.target.value })}>
              {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingProfile} style={{ alignSelf: 'flex-start' }}>
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 20 }}>CHANGE PASSWORD</h3>
        <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={passwords.currentPassword}
              onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" placeholder="Min. 8 characters"
              value={passwords.newPassword}
              onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-secondary" disabled={savingPassword} style={{ alignSelf: 'flex-start' }}>
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
