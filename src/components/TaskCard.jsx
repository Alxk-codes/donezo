import { Check, Paperclip, Calendar, Clock, Repeat, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDateStatus, formatDate, formatTime, getCategoryColor } from '../utils/taskUtils';

export default function TaskCard({ task, onClick, selectable, selected, onSelect, draggable, onDragStart, onDragOver, onDrop }) {
  const { toggleComplete } = useApp();
  const dateStatus = getDateStatus(task.dueDate);
  const subtasksDone = (task.subtasks || []).filter(s => s.completed).length;
  const subtasksTotal = (task.subtasks || []).length;

  const handleCheck = (e) => {
    e.stopPropagation();
    toggleComplete(task.id);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect?.(task.id);
  };

  return (
    <div
      className={`task-card priority-${task.priority} ${task.status === 'completed' ? 'completed' : ''}`}
      onClick={() => onClick?.(task)}
      draggable={draggable}
      onDragStart={e => { e.dataTransfer.setData('text/plain', task.id); onDragStart?.(task.id); }}
      onDragOver={e => { e.preventDefault(); onDragOver?.(task.id); }}
      onDrop={e => { e.preventDefault(); onDrop?.(task.id); }}
    >
      {selectable && (
        <input
          type="checkbox"
          className="bulk-checkbox"
          checked={selected}
          onChange={handleSelect}
          onClick={e => e.stopPropagation()}
        />
      )}

      <button
        className={`task-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
        onClick={handleCheck}
        aria-label="Toggle complete"
      >
        {task.status === 'completed' && <Check size={12} strokeWidth={3} />}
      </button>

      <div className="task-content">
        <div className="task-title">{task.title}</div>
        {task.description && (
          <div className="task-desc">{task.description}</div>
        )}
        <div className="task-meta">
          <span className={`badge badge-${task.priority}`}>
            {task.priority}
          </span>

          {task.category && (
            <span className="category-dot" style={{ background: getCategoryColor(task.category) }} title={task.category} />
          )}

          {task.dueDate && (
            <span className={`date-badge ${dateStatus}`}>
              <Calendar size={11} />
              {formatDate(task.dueDate)}
              {task.dueTime && <> · {formatTime(task.dueTime)}</>}
            </span>
          )}

          {task.recurrence && (
            <span className="file-indicator" title={`Repeats ${task.recurrence}`}>
              <Repeat size={11} />
            </span>
          )}

          {subtasksTotal > 0 && (
            <span className={`file-indicator ${subtasksDone === subtasksTotal ? 'subtasks-done' : ''}`}>
              ☐ {subtasksDone}/{subtasksTotal}
            </span>
          )}

          {task.files?.length > 0 && (
            <span className="file-indicator">
              <Paperclip size={12} />
              {task.files.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
