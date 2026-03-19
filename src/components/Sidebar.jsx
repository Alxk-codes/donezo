import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, User, LogOut, Moon, Sun, BarChart3, CalendarDays, Columns3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTaskStats } from '../utils/taskUtils';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, tasks, darkMode, setDarkMode, logout } = useApp();
  const stats = getTaskStats(tasks);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'My Tasks', badge: stats.overdue > 0 ? stats.overdue : null },
    { path: '/kanban', icon: Columns3, label: 'Kanban' },
    { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const name     = profile?.name || profile?.email || 'User';
  const email    = profile?.email || '';
  const avatar   = profile?.avatar_url || null;
  const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const go = (path) => { navigate(path); onClose?.(); };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }}
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">Dz</div>
            <span className="logo-text">Donezo</span>
          </div>
          <button
            className="btn-icon dark-toggle"
            onClick={() => setDarkMode(d => !d)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => go(item.path)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {avatar ? <img src={avatar} alt="" /> : initials}
            </div>
            <div className="user-details">
              <div className="user-name">{name}</div>
              <div className="user-email">{email}</div>
            </div>
          </div>
          <button className="nav-item logout-btn" onClick={handleLogout} style={{ width: '100%', marginTop: 4 }}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
