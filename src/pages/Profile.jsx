import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Moon, Sun, LogOut, CheckSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTaskStats } from '../utils/taskUtils';

export default function Profile() {
  const { profile, tasks, darkMode, setDarkMode, logout, updateUserProfile, uploadAvatar } = useApp();
  const navigate  = useNavigate();
  const [name, setName]     = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const stats   = getTaskStats(tasks);
  const initials = (profile?.name || 'U').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) await uploadAvatar(file);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await updateUserProfile({ name: name.trim() });
    setSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Profile & Settings</div>
          <div className="page-subtitle">Manage your account preferences</div>
        </div>
      </div>

      <div className="page-body" style={{ maxWidth: 600 }}>
        <div className="profile-avatar-section">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div className="profile-avatar-large">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="avatar" /> : initials}
            </div>
            <button style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 28, height: 28,
              background: 'var(--text)', color: 'var(--bg)',
              border: '2px solid var(--bg2)', borderRadius: '99px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }} onClick={() => fileRef.current.click()}>
              <Camera size={13} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              {profile?.name}
            </div>
            <div style={{ color: 'var(--text2)', fontSize: 14, marginTop: 2 }}>{profile?.email}</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                <strong style={{ color: 'var(--text)' }}>{stats.total}</strong> tasks created
              </span>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                <strong style={{ color: 'var(--success)' }}>{stats.completed}</strong> completed
              </span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
            Account Info
          </h3>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email</label>
            <input className="form-input" value={profile?.email || ''} disabled style={{ opacity: 0.55 }} />
          </div>
          <div style={{ marginTop: 18 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}
              style={{ opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
            Preferences
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {darkMode ? <Moon size={18} color="var(--text2)" /> : <Sun size={18} color="var(--text2)" />}
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Dark Mode</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Switch between light and dark theme</div>
              </div>
            </div>
            <button onClick={() => setDarkMode(d => !d)} style={{
              width: 44, height: 24, borderRadius: 99,
              background: darkMode ? 'var(--accent)' : 'var(--border)',
              border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
            }}>
              <span style={{
                position: 'absolute', top: 2, left: darkMode ? 22 : 2,
                width: 20, height: 20, background: 'white', borderRadius: '99px',
                transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
            <CheckSquare size={18} color="var(--text2)" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Task Stats</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{stats.pending} pending · {stats.overdue} overdue</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--high)' }}>
            Danger Zone
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16 }}>
            Once you sign out, you'll need to sign in again to access your tasks.
          </p>
          <button className="btn btn-danger" onClick={handleLogout}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );
}