import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ListTodo, Clock, CheckSquare, AlertCircle, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import { getTaskStats, getActivityData, filterTasks, priorityOrder } from '../utils/taskUtils';
import { format } from 'date-fns';

export default function Dashboard() {
  const { tasks, user, profile } = useApp();
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const selectedTask = tasks.find(t => t.id === selected);
  const editingTask = tasks.find(t => t.id === editing);

  const stats = getTaskStats(tasks);
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks.filter(t => t.dueDate === today).sort((a, b) => priorityOrder(a.priority) - priorityOrder(b.priority));
  const recentPending = tasks.filter(t => t.status === 'pending').sort((a, b) => priorityOrder(a.priority) - priorityOrder(b.priority)).slice(0, 5);
  const activity = getActivityData(tasks);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: ListTodo, color: '#6366f1', bg: '#eef2ff' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: '#f97316', bg: '#fff7ed' },
    { label: 'Completed', value: stats.completed, icon: CheckSquare, color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: '#ef4444', bg: '#fef2f2', danger: stats.overdue > 0 },
  ];

  return (
    <>
      <div className="page-header">
        <div className="welcome-section">
          <div className="welcome-greeting">{greeting}, {profile?.name || 'there'}! 👋</div>
          <div className="welcome-sub">
            {stats.pending > 0
              ? `You have ${stats.pending} pending task${stats.pending > 1 ? 's' : ''}${stats.overdue > 0 ? ` — ${stats.overdue} overdue` : ''}.`
              : tasks.length > 0
                ? '🎉 All tasks done! You\'re on fire!'
                : 'Create your first task to get started.'
            }
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="stats-grid">
          {statCards.map(s => (
            <div key={s.label} className={`stat-card ${s.danger ? 'stat-danger' : ''}`}>
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                <s.icon size={20} />
              </div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity heatmap */}
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <div className="section-title" style={{ marginBottom: 14 }}>
            <span><TrendingUp size={15} style={{ marginRight: 6 }} /> Activity (Last 30 Days)</span>
          </div>
          <div className="activity-bar-chart">
            {activity.days.map(d => (
              <div key={d.dateStr} className="activity-bar-col" title={`${d.label}: ${d.count} tasks`}>
                <div
                  className="activity-bar"
                  style={{ height: `${Math.max((d.count / activity.max) * 100, 4)}%`, opacity: d.count === 0 ? 0.15 : 1 }}
                />
                {activity.days.indexOf(d) % 5 === 0 && (
                  <span className="activity-bar-label">{format(d.date, 'dd')}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-sections">
          <div>
            <div className="section-title">
              Today's Tasks
              <span className="section-link" onClick={() => navigate('/tasks?filter=today')}>View all</span>
            </div>
            {todayTasks.length === 0 ? (
              <div className="card" style={{ padding: '32px 20px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text3)', fontSize: 14 }}>No tasks due today!</p>
              </div>
            ) : (
              <div className="task-list">
                {todayTasks.map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => setSelected(task.id)} />
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="section-title">
              Pending Tasks
              <span className="section-link" onClick={() => navigate('/tasks?filter=pending')}>View all</span>
            </div>
            {recentPending.length === 0 ? (
              <div className="card" style={{ padding: '32px 20px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text3)', fontSize: 14 }}>No pending tasks!</p>
              </div>
            ) : (
              <div className="task-list">
                {recentPending.map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => setSelected(task.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Single FAB only — no header button */}
      <button className="fab" onClick={() => setAddOpen(true)}>
        <Plus size={22} />
      </button>

      {addOpen && <TaskModal onClose={() => setAddOpen(false)} />}

      {selected && !editing && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelected(null)}
          onEdit={() => { setEditing(selected); setSelected(null); }}
        />
      )}
      {editing && editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
