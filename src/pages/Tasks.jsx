import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, CheckSquare, Trash2, Flag, Download, ListChecks } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import { filterTasks, priorityOrder, CATEGORIES, exportTasksCSV, exportTasksPDF } from '../utils/taskUtils';

export default function Tasks() {
  const { tasks, bulkAction } = useApp();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [sort, setSort] = useState('priority');
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const selectedTask = tasks.find(t => t.id === selected);
  const editingTask = tasks.find(t => t.id === editing);

  // Bulk selection
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Drag & drop
  const [dragId, setDragId] = useState(null);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(t => t.id)));
  };

  const handleBulkAction = async (action, value) => {
    if (selectedIds.size === 0) return;
    await bulkAction([...selectedIds], action, value);
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const filtered = useMemo(() => {
    const list = filterTasks(tasks, filter, search);
    switch (sort) {
      case 'priority': return list.sort((a, b) => priorityOrder(a.priority) - priorityOrder(b.priority));
      case 'date': return list.sort((a, b) => (a.dueDate || 'z').localeCompare(b.dueDate || 'z'));
      case 'title': return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'status': return list.sort((a, b) => a.status.localeCompare(b.status));
      default: return list;
    }
  }, [tasks, filter, search, sort]);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'high', label: '🔴 High' },
    { key: 'overdue', label: 'Overdue' },
    ...CATEGORIES.map(c => ({ key: `cat:${c.key}`, label: c.label })),
  ];

  const handleDrop = (targetId) => {
    if (!dragId || dragId === targetId) return;
    const ids = filtered.map(t => t.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    setDragId(null);
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">My Tasks</h1>
      </div>

      <div className="page-body">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            className="form-input search-input"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-bar" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {filters.map(f => (
            <button
              key={f.key}
              className={`filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="tasks-toolbar">
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <select className="form-select" style={{ width: 'auto', fontSize: 12, padding: '5px 8px' }} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="priority">Sort: Priority</option>
              <option value="date">Sort: Date</option>
              <option value="title">Sort: Title</option>
              <option value="status">Sort: Status</option>
            </select>
            <button
              className={`filter-btn ${bulkMode ? 'active' : ''}`}
              onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
            >
              <ListChecks size={13} /> Bulk
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="filter-btn" onClick={() => exportTasksCSV(filtered)}>
              <Download size={12} /> CSV
            </button>
            <button className="filter-btn" onClick={() => exportTasksPDF(filtered)}>
              <Download size={12} /> PDF
            </button>
          </div>
        </div>

        {/* Bulk actions bar */}
        {bulkMode && selectedIds.size > 0 && (
          <div className="bulk-bar">
            <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedIds.size} selected</span>
            <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => handleBulkAction('complete')}>
              <CheckSquare size={13} /> Complete
            </button>
            <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => handleBulkAction('delete')}>
              <Trash2 size={13} /> Delete
            </button>
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: 12, padding: '4px 8px' }}
              defaultValue=""
              onChange={e => { if(e.target.value) handleBulkAction('priority', e.target.value); e.target.value = ''; }}
            >
              <option value="" disabled>Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        )}

        {bulkMode && (
          <div style={{ textAlign: 'right', marginBottom: 8 }}>
            <button className="filter-btn" onClick={selectAll} style={{ fontSize: 11 }}>
              {selectedIds.size === filtered.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 6 }}>
              {search ? 'No matching tasks' : 'No tasks yet'}
            </h3>
            <p style={{ color: 'var(--text3)', fontSize: 14 }}>
              {search ? 'Try a different search term.' : 'Create your first task to get started!'}
            </p>
          </div>
        ) : (
          <div className="task-list">
            {filtered.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => !bulkMode && setSelected(task.id)}
                selectable={bulkMode}
                selected={selectedIds.has(task.id)}
                onSelect={toggleSelect}
                draggable={sort === 'manual'}
                onDragStart={setDragId}
                onDragOver={() => {}}
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </div>

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
