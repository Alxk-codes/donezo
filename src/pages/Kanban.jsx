import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';

const COLUMNS = [
  { key: 'pending', label: 'Pending', color: '#f97316', icon: '●' },
  { key: 'in_progress', label: 'In Progress', color: '#6366f1', icon: '◐' },
  { key: 'completed', label: 'Completed', color: '#22c55e', icon: '✓' },
];

export default function Kanban() {
  const { tasks, updateTaskStatus } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const selectedTask = tasks.find(t => t.id === selected);
  const editingTask = tasks.find(t => t.id === editing);

  const handleDrop = (status) => (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) updateTaskStatus(taskId, status);
    setDragOverCol(null);
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Kanban Board</h1>
      </div>

      <div className="page-body">
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div
                key={col.key}
                className={`kanban-column ${dragOverCol === col.key ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOverCol(col.key); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={handleDrop(col.key)}
              >
                <div className="kanban-column-header">
                  <span className="kanban-column-icon" style={{ color: col.color }}>{col.icon}</span>
                  <span className="kanban-column-title">{col.label}</span>
                  <span className="kanban-column-count">{colTasks.length}</span>
                </div>

                <div className="kanban-column-body">
                  {colTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => setSelected(task.id)}
                      draggable
                      onDragStart={() => {}}
                    />
                  ))}

                  {colTasks.length === 0 && (
                    <div className="kanban-empty">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
