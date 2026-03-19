import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCalendarDays, getCategoryColor, formatTime } from '../utils/taskUtils';
import { format, isToday } from 'date-fns';
import TaskDetailModal from '../components/TaskDetailModal';
import TaskModal from '../components/TaskModal';

export default function Calendar() {
  const { tasks } = useApp();
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const year = date.getFullYear();
  const month = date.getMonth();
  const days = getCalendarDays(year, month);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prev = () => setDate(new Date(year, month - 1, 1));
  const next = () => setDate(new Date(year, month + 1, 1));
  const goToday = () => { setDate(new Date()); setSelectedDate(format(new Date(), 'yyyy-MM-dd')); };

  const getTasksForDate = (dateStr) => tasks.filter(t => t.dueDate === dateStr);
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const task = selectedTask ? tasks.find(t => t.id === selectedTask) : null;
  const editing = editingTask ? tasks.find(t => t.id === editingTask) : null;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Calendar</h1>
      </div>

      <div className="page-body">
        <div className="calendar-container">
          {/* Header */}
          <div className="calendar-header">
            <button className="btn-icon" onClick={prev}><ChevronLeft size={20} /></button>
            <h2 className="calendar-month">{format(date, 'MMMM yyyy')}</h2>
            <button className="btn btn-secondary" onClick={goToday} style={{ padding: '5px 12px', fontSize: 12 }}>Today</button>
            <button className="btn-icon" onClick={next}><ChevronRight size={20} /></button>
          </div>

          {/* Weekday headers */}
          <div className="calendar-grid">
            {weekDays.map(d => (
              <div key={d} className="calendar-weekday">{d}</div>
            ))}

            {/* Day cells */}
            {days.map((d, idx) => {
              const dayTasks = getTasksForDate(d.dateStr);
              const isSelected = selectedDate === d.dateStr;
              return (
                <div
                  key={idx}
                  className={`calendar-day ${!d.isCurrentMonth ? 'other-month' : ''} ${isToday(d.date) ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(d.dateStr)}
                >
                  <span className="calendar-day-num">{d.date.getDate()}</span>
                  {dayTasks.length > 0 && (
                    <div className="calendar-dots">
                      {dayTasks.slice(0, 3).map(t => (
                        <span
                          key={t.id}
                          className={`calendar-dot ${t.status === 'completed' ? 'done' : ''}`}
                          style={{ background: t.category ? getCategoryColor(t.category) : 'var(--accent)' }}
                        />
                      ))}
                      {dayTasks.length > 3 && <span className="calendar-dot-more">+{dayTasks.length - 3}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected date panel */}
          {selectedDate && (
            <div className="calendar-panel">
              <h3 className="calendar-panel-title">
                {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')}
                <span className="calendar-panel-count">{selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}</span>
              </h3>
              {selectedDateTasks.length === 0 ? (
                <p style={{ color: 'var(--text3)', fontSize: 14 }}>No tasks on this day.</p>
              ) : (
                <div className="calendar-task-list">
                  {selectedDateTasks.map(t => (
                    <div
                      key={t.id}
                      className={`calendar-task-item ${t.status === 'completed' ? 'done' : ''}`}
                      onClick={() => setSelectedTask(t.id)}
                    >
                      <span
                        className="category-dot"
                        style={{ background: t.category ? getCategoryColor(t.category) : 'var(--accent)' }}
                      />
                      <span className="calendar-task-title">{t.title}</span>
                      {t.dueTime && <span className="calendar-task-time">{formatTime(t.dueTime)}</span>}
                      <span className={`badge badge-${t.priority}`} style={{ fontSize: 10, padding: '1px 6px' }}>{t.priority}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {task && !editingTask && (
        <TaskDetailModal
          task={task}
          onClose={() => setSelectedTask(null)}
          onEdit={() => { setEditingTask(selectedTask); setSelectedTask(null); }}
        />
      )}
      {editing && (
        <TaskModal
          task={editing}
          onClose={() => setEditingTask(null)}
        />
      )}
    </>
  );
}
