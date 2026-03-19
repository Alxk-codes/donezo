import { useState, useEffect } from 'react';
import { X, LayoutDashboard, Plus, BarChart3, CalendarDays, Columns3, Keyboard } from 'lucide-react';

const STEPS = [
  {
    title: 'Welcome to Donezo! 🎉',
    desc: 'Your personal task & file manager. Let\'s take a quick tour of what you can do.',
    icon: '👋',
  },
  {
    title: 'Dashboard',
    desc: 'See your task stats, activity chart, and today\'s tasks at a glance.',
    icon: '📊',
  },
  {
    title: 'Create Tasks',
    desc: 'Click the + button to create tasks with priorities, categories, subtasks, due dates, and file attachments.',
    icon: '✨',
  },
  {
    title: 'Kanban Board',
    desc: 'Drag tasks between Pending, In Progress, and Completed columns for a visual workflow.',
    icon: '📋',
  },
  {
    title: 'Calendar View',
    desc: 'See all your tasks on a monthly calendar. Click any day to see what\'s due.',
    icon: '📅',
  },
  {
    title: 'Analytics',
    desc: 'Track your completion rate, streaks, and productivity trends over time.',
    icon: '📈',
  },
  {
    title: 'Keyboard Shortcuts',
    desc: 'Press D=Dashboard, T=Tasks, A=Analytics, C=Calendar, K=Kanban, P=Profile, ?=Help.',
    icon: '⌨️',
  },
  {
    title: 'You\'re all set!',
    desc: 'Start creating tasks and get things done. Happy productivity! 🚀',
    icon: '🎯',
  },
];

export default function OnboardingTour() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem('donezo_onboarded');
    if (!seen) {
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = () => {
    setShow(false);
    localStorage.setItem('donezo_onboarded', 'true');
  };

  const next = () => {
    if (step >= STEPS.length - 1) finish();
    else setStep(s => s + 1);
  };

  if (!show) return null;

  const s = STEPS[step];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <button className="btn-icon" onClick={finish} style={{ position: 'absolute', top: 12, right: 12 }}>
          <X size={16} />
        </button>
        <div className="onboarding-icon">{s.icon}</div>
        <h3 className="onboarding-title">{s.title}</h3>
        <p className="onboarding-desc">{s.desc}</p>
        <div className="onboarding-footer">
          <div className="onboarding-dots">
            {STEPS.map((_, i) => (
              <span key={i} className={`onboarding-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} style={{ padding: '7px 16px', fontSize: 13 }}>Back</button>}
            <button className="btn btn-primary" onClick={next} style={{ padding: '7px 16px', fontSize: 13 }}>
              {step >= STEPS.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
