import { useState, useRef } from 'react';
import { X, Upload, FileText, Image, Trash2, Plus, GripVertical } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../utils/taskUtils';

const EMPTY = { title: '', description: '', dueDate: '', dueTime: '', priority: 'medium', category: '', recurrence: '', files: [], subtasks: [] };

export default function TaskModal({ task, onClose }) {
  const { addTask, updateTask, deleteFile, addToast } = useApp();
  const isEdit = !!task;
  const [form, setForm] = useState(isEdit ? {
    ...task,
    subtasks: (task.subtasks || []).map(s => ({ ...s })),
  } : EMPTY);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removedFileIds, setRemovedFileIds] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const fileRef = useRef();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { addToast('Title is required.', 'error'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        for (const fileId of removedFileIds) {
          await deleteFile(task.id, fileId);
        }
        await updateTask(task.id, form);
      } else {
        await addTask(form);
      }
      onClose();
    } catch {
      addToast('Failed to save task.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFiles = (fileList) => {
    const added = [];
    for (const f of fileList) {
      const isImage = f.type.startsWith('image/');
      const url = isImage ? URL.createObjectURL(f) : '#';
      added.push({
        id: (Date.now() + Math.random()).toString(),
        name: f.name,
        type: isImage ? 'image' : 'pdf',
        url,
        size: formatSize(f.size),
        _isNew: true,
        _blob: f,
      });
    }
    set('files', [...form.files, ...added]);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const removeFile = (id) => {
    const file = form.files.find(f => f.id === id);
    if (file && !file._isNew) {
      setRemovedFileIds(prev => [...prev, id]);
    }
    set('files', form.files.filter(f => f.id !== id));
  };

  // Subtask handlers
  const addSubtaskItem = () => {
    if (!newSubtask.trim()) return;
    set('subtasks', [...form.subtasks, { id: `new-${Date.now()}`, title: newSubtask.trim(), completed: false, _isNew: true }]);
    setNewSubtask('');
  };

  const removeSubtask = (id) => {
    set('subtasks', form.subtasks.filter(s => s.id !== id));
  };

  const toggleSubtaskLocal = (id) => {
    set('subtasks', form.subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                className="form-input"
                placeholder="What needs to be done?"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Add details..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.dueDate}
                  onChange={e => set('dueDate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={form.dueTime}
                  onChange={e => set('dueTime', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={form.priority}
                  onChange={e => set('priority', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                >
                  <option value="">None</option>
                  {CATEGORIES.map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Repeat</label>
                <select
                  className="form-select"
                  value={form.recurrence}
                  onChange={e => set('recurrence', e.target.value)}
                >
                  <option value="">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* Subtasks */}
            <div className="form-group">
              <label className="form-label">Subtasks</label>
              {form.subtasks.map(s => (
                <div key={s.id} className="subtask-row">
                  <button type="button" className={`subtask-check ${s.completed ? 'checked' : ''}`} onClick={() => toggleSubtaskLocal(s.id)}>
                    {s.completed && '✓'}
                  </button>
                  <span className={`subtask-text ${s.completed ? 'done' : ''}`}>{s.title}</span>
                  <button type="button" className="btn-icon" onClick={() => removeSubtask(s.id)} style={{ width: 28, height: 28 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <div className="subtask-add">
                <input
                  className="form-input"
                  placeholder="Add a subtask..."
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtaskItem(); } }}
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-secondary" onClick={addSubtaskItem} style={{ padding: '8px 12px' }}>
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* File upload */}
            <div className="form-group">
              <label className="form-label">Attachments</label>
              <div
                className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                onClick={() => fileRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFiles(e.dataTransfer.files);
                }}
              >
                <Upload size={20} style={{ margin: '0 auto 8px', display: 'block' }} />
                <div style={{ fontWeight: 600 }}>Drop files or click to browse</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Images, PDFs, documents</div>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={e => handleFiles(e.target.files)}
                />
              </div>

              {form.files.length > 0 && (
                <div className="file-list">
                  {form.files.map(f => (
                    <div key={f.id} className="file-item">
                      {f.type === 'image' ? (
                        <img src={f.url} alt={f.name} className="file-thumb" />
                      ) : (
                        <div className="file-icon"><FileText size={18} /></div>
                      )}
                      <div className="file-info">
                        <div className="file-name">{f.name}</div>
                        <div className="file-size">{f.size}</div>
                      </div>
                      <button type="button" className="btn-icon" onClick={() => removeFile(f.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
