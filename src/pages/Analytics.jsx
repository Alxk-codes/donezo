import { useApp } from '../context/AppContext';
import { getAnalyticsData, CATEGORIES, getCategoryColor, getTaskStats } from '../utils/taskUtils';
import { Flame, TrendingUp, Target, PieChart } from 'lucide-react';

export default function Analytics() {
  const { tasks } = useApp();
  const data = getAnalyticsData(tasks);
  const stats = getTaskStats(tasks);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
      </div>

      <div className="page-body">
        {/* Stat cards row */}
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#eef2ff', color: '#6366f1' }}><Target size={20} /></div>
            <div>
              <div className="stat-value">{data.completionRate}%</div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fff7ed', color: '#f97316' }}><Flame size={20} /></div>
            <div>
              <div className="stat-value">{data.streak}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}><TrendingUp size={20} /></div>
            <div>
              <div className="stat-value">{data.completed}</div>
              <div className="stat-label">Tasks Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fdf2f8', color: '#ec4899' }}><PieChart size={20} /></div>
            <div>
              <div className="stat-value">{data.total}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
          </div>
        </div>

        <div className="analytics-grid">
          {/* Completion donut */}
          <div className="card analytics-card">
            <h3 className="analytics-card-title">Completion Rate</h3>
            <div className="donut-container">
              <svg viewBox="0 0 120 120" className="donut-chart">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="var(--accent)" strokeWidth="12"
                  strokeDasharray={`${data.completionRate * 3.14} ${314 - data.completionRate * 3.14}`}
                  strokeDashoffset="78.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="donut-label">
                <span className="donut-value">{data.completionRate}%</span>
                <span className="donut-sub">done</span>
              </div>
            </div>
          </div>

          {/* Priority breakdown */}
          <div className="card analytics-card">
            <h3 className="analytics-card-title">By Priority</h3>
            <div className="bar-chart-v">
              {[
                { key: 'high', label: 'High', color: '#ef4444' },
                { key: 'medium', label: 'Medium', color: '#f97316' },
                { key: 'low', label: 'Low', color: '#3b82f6' },
              ].map(p => (
                <div key={p.key} className="bar-row">
                  <span className="bar-label">{p.label}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${data.total > 0 ? (data.priorities[p.key] / data.total) * 100 : 0}%`,
                        background: p.color,
                      }}
                    />
                  </div>
                  <span className="bar-count">{data.priorities[p.key]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="card analytics-card">
            <h3 className="analytics-card-title">By Category</h3>
            <div className="bar-chart-v">
              {CATEGORIES.map(c => {
                const count = data.categories[c.key] || 0;
                return (
                  <div key={c.key} className="bar-row">
                    <span className="bar-label">{c.label}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${data.total > 0 ? (count / data.total) * 100 : 0}%`,
                          background: c.color,
                        }}
                      />
                    </div>
                    <span className="bar-count">{count}</span>
                  </div>
                );
              })}
              {(data.categories['none'] || 0) > 0 && (
                <div className="bar-row">
                  <span className="bar-label">None</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(data.categories['none'] / data.total) * 100}%`, background: '#9ca3af' }} />
                  </div>
                  <span className="bar-count">{data.categories['none']}</span>
                </div>
              )}
            </div>
          </div>

          {/* Weekly trend */}
          <div className="card analytics-card" style={{ gridColumn: '1 / -1' }}>
            <h3 className="analytics-card-title">Tasks Created Per Week</h3>
            <div className="weekly-chart">
              {data.weeklyData.map((w, i) => (
                <div key={i} className="weekly-col">
                  <div className="weekly-bar-wrap">
                    <div
                      className="weekly-bar"
                      style={{ height: `${(w.count / data.maxWeekly) * 100}%` }}
                    />
                  </div>
                  <span className="weekly-label">{w.label}</span>
                  <span className="weekly-count">{w.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
