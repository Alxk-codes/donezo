import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Zap, Paperclip, RefreshCw, ArrowRight,
  Moon, Sun, Github, Twitter, Mail, Shield, Clock,
  SlidersHorizontal, Smartphone, Star
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Landing() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useApp();

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="logo-mark">
          <div className="logo-icon">Dz</div>
          <span className="logo-text">Donezo</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn-icon dark-toggle"
            onClick={() => setDarkMode(d => !d)}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>Login</button>
          <button className="btn btn-primary" onClick={() => navigate('/signup')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-eyebrow">
          <Zap size={13} />
          Personal task management, done right
        </div>

        <h1 className="hero-title">
          Get things <span>done</span>.<br />
          Stay in control.
        </h1>

        <p className="hero-sub">
          Donezo helps you capture tasks, attach files, set priorities, and never miss a deadline — all synced in real time across every device.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary btn-large" onClick={() => navigate('/signup')}>
            Start for free <ArrowRight size={16} />
          </button>
          <button className="btn btn-secondary btn-large" onClick={() => navigate('/login')}>
            Try the demo
          </button>
        </div>

        <div className="hero-social-proof">
          <div className="stars">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
          </div>
          <span>Loved by students & professionals</span>
        </div>
      </section>

      {/* Features strip */}
      <section className="features-strip" id="features">
        {[
          { icon: CheckCircle2, title: 'Smart Priorities', desc: 'Tag tasks as Low, Medium, or High. Never lose sight of what matters most.' },
          { icon: Paperclip,   title: 'File Attachments', desc: 'Attach images, PDFs, and docs directly to tasks. Preview right in the app.' },
          { icon: RefreshCw,   title: 'Real-time Sync',   desc: 'Open on your phone, laptop, or any tab — changes appear instantly everywhere.' },
          { icon: SlidersHorizontal, title: 'Search & Filter', desc: 'Find any task in milliseconds. Filter by status, priority, or due date.' },
          { icon: Clock,       title: 'Due Dates & Overdue', desc: 'Color-coded deadlines so you always know what needs attention today.' },
          { icon: Smartphone,  title: 'Mobile Ready',    desc: 'Fully responsive layout. Looks great and works perfectly on every screen size.' },
        ].map(f => (
          <div key={f.title} className="feature-card">
            <div className="feature-card-icon">
              <f.icon size={20} />
            </div>
            <h3 className="feature-card-title">{f.title}</h3>
            <p className="feature-card-desc">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-eyebrow">How it works</div>
        <h2 className="section-heading">From signup to done in seconds</h2>
        <div className="steps-grid">
          {[
            { n: '01', title: 'Create an account', desc: 'Sign up with email or Google in one click. No credit card required.' },
            { n: '02', title: 'Add your tasks',    desc: 'Hit the + button, fill in a title, set priority and due date, attach files.' },
            { n: '03', title: 'Stay on track',     desc: 'Check off tasks as you finish them. Dashboard shows your progress at a glance.' },
          ].map(s => (
            <div key={s.n} className="step-card">
              <div className="step-number">{s.n}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="logo-mark" style={{ marginBottom: 10 }}>
              <div className="logo-icon">Dz</div>
              <span className="logo-text">Donezo</span>
            </div>
            <p className="footer-tagline">
              Your personal task manager. Clean, fast, and always in sync.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Twitter"><Twitter size={16} /></a>
              <a href="#" className="social-link" aria-label="Github"><Github size={16} /></a>
              <a href="#" className="social-link" aria-label="Email"><Mail size={16} /></a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <div className="footer-col-title">Product</div>
              <a href="#features" className="footer-link">Features</a>
              <a href="#how-it-works" className="footer-link">How It Works</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Account</div>
              <span className="footer-link" onClick={() => navigate('/login')}>Login</span>
              <span className="footer-link" onClick={() => navigate('/signup')}>Sign up</span>
              <a href="#" className="footer-link">Reset password</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Company</div>
              <a href="#" className="footer-link">About</a>
              <a href="#" className="footer-link">Blog</a>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Donezo. All rights reserved.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text3)' }}>
            <Shield size={13} /> Privacy-first · No ads · No tracking
          </div>
        </div>
      </footer>
    </div>
  );
}
