import { useState } from 'react';
import { X, Edit3, Trash2, Check, FileText, Calendar, Flag, Download, Clock, Repeat, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDateStatus, formatDate, formatTime, getCategoryLabel, getCategoryColor } from '../utils/taskUtils';

export default function TaskDetailModal({ task, onClose, onEdit }) {
  const { toggleComplete, deleteTask, deleteFile, toggleSubtask } = useApp();
  const [confirm, setConfirm] = useState(false);
  const [viewImg, setViewImg] = useState(null);
  const dateStatus = getDateStatus(task.dueDate);
  const subtasksDone = (task.subtasks || []).filter(s => s.completed).length;
  const subtasksTotal = (task.subtasks || []).length;

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  const handleToggle = () => {
    toggleComplete(task.id);
    onClose();
  };

  if (viewImg) {
    return (
      <div className="image-viewer-overlay" onClick={() => setViewImg(null)}>
        <img src={viewImg} alt="Preview" className="image-viewer-img" />
      </div>
    );
  }

  if (confirm) {
    return (
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setConfirm(false)}>
        <div className="modal confirm-dialog">
          <h3>Delete this task?</h3>
          <p>This action cannot be undone. All files attached to this task will also be removed.</p>
          <div className="confirm-actions">
            <button className="btn btn-secondary" onClick={() => setConfirm(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontFamily: 'var(--font-display)', fontSize: 18, flex: 1, marginRight: 16, lineHeight: 1.3 }}>
            {task.title}
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-icon" onClick={onEdit}><Edit3 size={16} /></button>
            <button className="btn-icon" onClick={() => setConfirm(true)} style={{ color: 'var(--high)' }}><Trash2 size={16} /></button>
            <button className="btn-icon" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        <div className="modal-body">
          {/* Meta row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            <span className={`badge badge-${task.priority}`}>
              <Flag size={11} /> {task.priority}
            </span>
            {task.category && (
              <span className="badge" style={{ background: getCategoryColor(task.category) + '18', color: getCategoryColor(task.category) }}>
                <Tag size={11} /> {getCategoryLabel(task.category)}
              </span>
            )}
            {task.dueDate && (
              <span className={`date-badge ${dateStatus}`}>
                <Calendar size={11} />
                {formatDate(task.dueDate)}
                {task.dueTime && <> · <Clock size={10} /> {formatTime(task.dueTime)}</>}
                {dateStatus === 'overdue' && ' · Overdue'}
                {dateStatus === 'today' && ' · Today'}
              </span>
            )}
            {task.recurrence && (
              <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                <Repeat size={11} /> {task.recurrence}
              </span>
            )}
            <span style={{ fontSize: 12, color: 'var(--text3)', padding: '3px 8px', background: 'var(--bg3)', borderRadius: 6 }}>
              {task.status === 'completed' ? '✓ Completed' : task.status === 'in_progress' ? '◐ In Progress' : '● Pending'}
            </span>
          </div>

          {/* Description */}
          {task.description ? (
            <div style={{ marginBottom: 24 }}>
              <div className="form-label">Description</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text2)', whiteSpace: 'pre-wrap' }}>
                {task.description}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text3)', fontStyle: 'italic', marginBottom: 24 }}>
              No description added.
            </p>
          )}

          {/* Subtasks */}
          {subtasksTotal > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div className="form-label" style={{ marginBottom: 8 }}>
                Subtasks ({subtasksDone}/{subtasksTotal})
              </div>
              <div className="subtask-progress-bar">
                <div className="subtask-progress-fill" style={{ width: `${subtasksTotal > 0 ? (subtasksDone / subtasksTotal) * 100 : 0}%` }} />
              </div>
              <div className="subtask-list-detail">
                {task.subtasks.map(s => (
                  <div key={s.id} className={`subtask-row-detail ${s.completed ? 'done' : ''}`} onClick={() => toggleSubtask(s.id, s.completed)}>
                    <div className={`subtask-check ${s.completed ? 'checked' : ''}`}>
                      {s.completed && '✓'}
                    </div>
                    <span>{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {task.files?.length > 0 && (
            <div>
              <div className="form-label" style={{ marginBottom: 12 }}>
                Attachments ({task.files.length})
              </div>
              <div className="file-list">
                {task.files.map(f => (
                  <div key={f.id} className="file-item">
                    {f.type === 'image' ? (
                      <img
                        src={f.url}
                        alt={f.name}
                        className="file-thumb"
                        style={{ cursor: 'zoom-in' }}
                        onClick={() => setViewImg(f.url)}
                      />
                    ) : (
                      <div className="file-icon"><FileText size={18} /></div>
                    )}
                    <div className="file-info">
                      <div className="file-name">{f.name}</div>
                      <div className="file-size">{f.size}</div>
                    </div>
                    <a href={f.url} download={f.name} className="btn-icon" onClick={e => f.url === '#' && e.preventDefault()}>
                      <Download size={14} />
                    </a>
                    <button className="btn-icon" style={{ color: 'var(--high)' }} onClick={() => deleteFile(task.id, f.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className={`btn ${task.status === 'completed' ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleToggle}
          >
            {task.status === 'completed' ? (
              <><X size={15} /> Mark Incomplete</>
            ) : (
              <><Check size={15} /> Mark Complete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
