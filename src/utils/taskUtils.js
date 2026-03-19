import { isToday, isPast, parseISO, format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, addWeeks, addMonths } from 'date-fns';

export function getDateStatus(dateStr) {
  if (!dateStr) return 'none';
  const date = parseISO(dateStr);
  if (isToday(date)) return 'today';
  if (isPast(date)) return 'overdue';
  return 'future';
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return format(parseISO(dateStr), 'dd MMM yyyy');
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function priorityOrder(p) {
  return { high: 0, medium: 1, low: 2 }[p] ?? 3;
}

export function filterTasks(tasks, filter, search) {
  const today = format(new Date(), 'yyyy-MM-dd');
  let result = [...tasks];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q)
    );
  }

  switch (filter) {
    case 'pending': return result.filter(t => t.status === 'pending');
    case 'in_progress': return result.filter(t => t.status === 'in_progress');
    case 'completed': return result.filter(t => t.status === 'completed');
    case 'high': return result.filter(t => t.priority === 'high');
    case 'today': return result.filter(t => t.dueDate === today);
    case 'overdue': return result.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate < today);
    default:
      // Category filters
      if (filter && filter.startsWith('cat:')) {
        const cat = filter.slice(4);
        return result.filter(t => t.category === cat);
      }
      return result;
  }
}

export function getTaskStats(tasks) {
  const today = format(new Date(), 'yyyy-MM-dd');
  return {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate < today).length,
  };
}

// ── Analytics helpers ────────────────────────────

export const CATEGORIES = [
  { key: 'work', label: 'Work', color: '#6366f1' },
  { key: 'personal', label: 'Personal', color: '#ec4899' },
  { key: 'school', label: 'School', color: '#f59e0b' },
  { key: 'health', label: 'Health', color: '#22c55e' },
  { key: 'finance', label: 'Finance', color: '#3b82f6' },
  { key: 'other', label: 'Other', color: '#8b5cf6' },
];

export function getCategoryColor(cat) {
  return CATEGORIES.find(c => c.key === cat)?.color || '#9ca3af';
}

export function getCategoryLabel(cat) {
  return CATEGORIES.find(c => c.key === cat)?.label || cat || 'None';
}

export function getAnalyticsData(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Priority distribution
  const priorities = { high: 0, medium: 0, low: 0 };
  tasks.forEach(t => { if (priorities[t.priority] !== undefined) priorities[t.priority]++; });

  // Category distribution
  const categories = {};
  tasks.forEach(t => {
    const cat = t.category || 'none';
    categories[cat] = (categories[cat] || 0) + 1;
  });

  // Tasks per week (last 8 weeks)
  const weeklyData = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = startOfWeek(subDays(new Date(), i * 7));
    const weekEnd = endOfWeek(weekStart);
    const weekLabel = format(weekStart, 'MMM d');
    const count = tasks.filter(t => {
      if (!t.createdAt) return false;
      const d = parseISO(t.createdAt);
      return d >= weekStart && d <= weekEnd;
    }).length;
    weeklyData.push({ label: weekLabel, count });
  }
  const maxWeekly = Math.max(...weeklyData.map(w => w.count), 1);

  // Streak (consecutive days with at least one completed task)
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const day = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const hasCompleted = tasks.some(t => t.status === 'completed' && t.dueDate === day);
    if (i === 0 && !hasCompleted) continue; // today doesn't break streak
    if (hasCompleted) streak++;
    else if (i > 0) break;
  }

  return { total, completed, completionRate, priorities, categories, weeklyData, maxWeekly, streak };
}

// ── Activity heatmap (last 30 days) ──────────────

export function getActivityData(tasks) {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const created = tasks.filter(t => t.createdAt && format(parseISO(t.createdAt), 'yyyy-MM-dd') === dateStr).length;
    const done = tasks.filter(t => t.status === 'completed' && t.dueDate === dateStr).length;
    days.push({ date, dateStr, label: format(date, 'EEE d'), count: created + done });
  }
  const max = Math.max(...days.map(d => d.count), 1);
  return { days, max };
}

// ── Calendar helpers ─────────────────────────────

export function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay(); // 0=Sun
  const days = [];

  // padding days from previous month
  for (let i = startPad - 1; i >= 0; i--) {
    const d = subDays(firstDay, i + 1);
    days.push({ date: d, dateStr: format(d, 'yyyy-MM-dd'), isCurrentMonth: false });
  }

  // days of current month
  const interval = eachDayOfInterval({ start: firstDay, end: lastDay });
  interval.forEach(d => {
    days.push({ date: d, dateStr: format(d, 'yyyy-MM-dd'), isCurrentMonth: true });
  });

  // padding days for next month to fill grid (6 rows)
  while (days.length < 42) {
    const d = addDays(lastDay, days.length - interval.length - startPad + 1);
    days.push({ date: d, dateStr: format(d, 'yyyy-MM-dd'), isCurrentMonth: false });
  }

  return days;
}

// ── Recurring helpers ────────────────────────────

export function getNextRecurrenceDate(dueDate, recurrence) {
  if (!dueDate || !recurrence) return null;
  const date = parseISO(dueDate);
  switch (recurrence) {
    case 'daily': return format(addDays(date, 1), 'yyyy-MM-dd');
    case 'weekly': return format(addWeeks(date, 1), 'yyyy-MM-dd');
    case 'monthly': return format(addMonths(date, 1), 'yyyy-MM-dd');
    default: return null;
  }
}

// ── Export helpers ────────────────────────────────

export function exportTasksCSV(tasks) {
  const headers = ['Title', 'Description', 'Status', 'Priority', 'Category', 'Due Date', 'Due Time', 'Recurrence', 'Subtasks'];
  const rows = tasks.map(t => [
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.status,
    t.priority,
    t.category || '',
    t.dueDate || '',
    t.dueTime || '',
    t.recurrence || '',
    (t.subtasks || []).map(s => `${s.completed ? '✓' : '○'} ${s.title}`).join(' | '),
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `donezo-tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTasksPDF(tasks) {
  const win = window.open('', '_blank');
  const html = `<!DOCTYPE html><html><head><title>Donezo Tasks Export</title>
<style>body{font-family:system-ui;padding:40px;max-width:800px;margin:0 auto}
h1{font-size:24px;margin-bottom:4px}
.sub{color:#666;font-size:14px;margin-bottom:24px}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{border:1px solid #ddd;padding:8px;text-align:left}
th{background:#f5f5f5;font-weight:600}
.done{text-decoration:line-through;color:#999}
.badge{display:inline-block;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600}
.high{background:#fef2f2;color:#ef4444}.medium{background:#fff7ed;color:#f97316}.low{background:#eff6ff;color:#3b82f6}
</style></head><body>
<h1>Donezo — Task Export</h1>
<p class="sub">${format(new Date(), 'MMMM d, yyyy')} · ${tasks.length} tasks</p>
<table><thead><tr><th>Task</th><th>Status</th><th>Priority</th><th>Category</th><th>Due Date</th></tr></thead><tbody>
${tasks.map(t => `<tr class="${t.status === 'completed' ? 'done' : ''}">
<td>${t.title}</td><td>${t.status}</td>
<td><span class="badge ${t.priority}">${t.priority}</span></td>
<td>${t.category || '—'}</td><td>${t.dueDate || '—'}</td></tr>`).join('')}
</tbody></table></body></html>`;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 300);
}
