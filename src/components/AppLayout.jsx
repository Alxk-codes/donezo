import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ToastContainer from '../components/ToastContainer';
import OnboardingTour from '../components/OnboardingTour';
import Confetti from '../components/Confetti';
import { useApp } from '../context/AppContext';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { tasks, addToast } = useApp();
  const [showConfetti, setShowConfetti] = useState(false);
  const prevPending = useRef(null);

  // Confetti when all tasks completed
  useEffect(() => {
    const pending = tasks.filter(t => t.status !== 'completed').length;
    if (prevPending.current !== null && prevPending.current > 0 && pending === 0 && tasks.length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
    prevPending.current = pending;
  }, [tasks]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Don't fire when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'd': navigate('/dashboard'); break;
        case 't': navigate('/tasks'); break;
        case 'p': navigate('/profile'); break;
        case 'a': navigate('/analytics'); break;
        case 'c': navigate('/calendar'); break;
        case 'k': navigate('/kanban'); break;
        case '?':
          addToast('Shortcuts: D=Dashboard T=Tasks A=Analytics C=Calendar K=Kanban P=Profile', 'info');
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, addToast]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Schedule notifications for due tasks
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    tasks.forEach(task => {
      if (task.status === 'completed') return;
      if (task.dueDate === today && task.dueTime && task.dueTime > currentTime) {
        const [h, m] = task.dueTime.split(':');
        const dueMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(h), parseInt(m)).getTime();
        const delay = dueMs - now.getTime();
        if (delay > 0 && delay < 86400000) {
          const timer = setTimeout(() => {
            new Notification('Donezo — Task Due!', {
              body: task.title,
              icon: '/favicon.svg',
            });
          }, delay);
          return () => clearTimeout(timer);
        }
      }
    });
  }, [tasks]);

  return (
    <div className="app-layout">
      <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
        <Menu size={20} />
      </button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-content">
        <Outlet />
      </main>

      <ToastContainer />
      <OnboardingTour />
      {showConfetti && <Confetti />}
    </div>
  );
}
