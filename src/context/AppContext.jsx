import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getNextRecurrenceDate } from '../utils/taskUtils';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [profile, setProfile]         = useState(null);
  const [tasks, setTasks]             = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [darkMode, setDarkMode]       = useState(() => localStorage.getItem('darkMode') === 'true');
  const [toasts, setToasts]           = useState([]);
  const realtimeRef                   = useRef(null);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // ── Toast helper ───────────────────────────────────────
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);

  // ── Load tasks + files + subtasks for a user ──────────
  const loadTasks = useCallback(async (uid) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, task_files(*), subtasks(*)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (!error && data) setTasks(data.map(normalizeTask));
  }, []);

  // ── Real-time subscription ─────────────────────────────
  const subscribeRealtime = useCallback((uid) => {
    if (realtimeRef.current) realtimeRef.current.unsubscribe();
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${uid}`
      }, () => loadTasks(uid))
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'task_files'
      }, () => loadTasks(uid))
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'subtasks'
      }, () => loadTasks(uid))
      .subscribe();
    realtimeRef.current = channel;
  }, [loadTasks]);

  // ── Auth state ─────────────────────────────────────────
  useEffect(() => {
    let didInit = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!didInit || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        didInit = true;

        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
          loadTasks(session.user.id);
          subscribeRealtime(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setTasks([]);
          if (realtimeRef.current) realtimeRef.current.unsubscribe();
        }
        setAuthLoading(false);
      }
    });

    // Fallback: unblock UI if Supabase never fires
    const timeout = setTimeout(() => {
      if (!didInit) {
        didInit = true;
        setAuthLoading(false);
      }
    }, 4000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [loadTasks, subscribeRealtime]);

  const fetchProfile = async (uid) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) setProfile(data);
  };

  // ── Auth actions ───────────────────────────────────────
  const loginWithEmail = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signupWithEmail = useCallback(async (name, email, password) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    });
    if (error) throw error;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // ── Task CRUD ──────────────────────────────────────────
  const addTask = useCallback(async (taskData) => {
    if (!user) return;
    const { files: rawFiles = [], subtasks: rawSubtasks = [], ...rest } = taskData;

    const { data: task, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: rest.title,
      description: rest.description || null,
      due_date: rest.dueDate || null,
      due_time: rest.dueTime || null,
      priority: rest.priority || 'medium',
      category: rest.category || null,
      recurrence: rest.recurrence || null,
      status: 'pending',
    }).select().single();

    if (error) { addToast('Failed to create task.', 'error'); return; }

    // Upload files
    const newFiles = rawFiles.filter(f => f._isNew && f._blob);
    for (const f of newFiles) {
      await uploadTaskFile(task.id, f);
    }

    // Add subtasks
    for (let i = 0; i < rawSubtasks.length; i++) {
      if (rawSubtasks[i].title.trim()) {
        await supabase.from('subtasks').insert({
          task_id: task.id,
          user_id: user.id,
          title: rawSubtasks[i].title.trim(),
          sort_order: i,
        });
      }
    }

    addToast('Task created!');
    await loadTasks(user.id);
    return task.id;
  }, [user, addToast, loadTasks]);

  const updateTask = useCallback(async (id, updates) => {
    if (!user) return;
    const { files: rawFiles, subtasks: rawSubtasks, ...rest } = updates;

    const dbUpdate = {};
    if (rest.title !== undefined) dbUpdate.title = rest.title;
    if (rest.description !== undefined) dbUpdate.description = rest.description || null;
    if (rest.dueDate !== undefined) dbUpdate.due_date = rest.dueDate || null;
    if (rest.dueTime !== undefined) dbUpdate.due_time = rest.dueTime || null;
    if (rest.priority !== undefined) dbUpdate.priority = rest.priority;
    if (rest.status !== undefined) dbUpdate.status = rest.status;
    if (rest.category !== undefined) dbUpdate.category = rest.category || null;
    if (rest.recurrence !== undefined) dbUpdate.recurrence = rest.recurrence || null;
    if (rest.sortOrder !== undefined) dbUpdate.sort_order = rest.sortOrder;

    if (Object.keys(dbUpdate).length) {
      const { error } = await supabase.from('tasks').update(dbUpdate).eq('id', id);
      if (error) { addToast('Failed to update task.', 'error'); return; }
    }

    // Upload any new files
    if (rawFiles) {
      const newFiles = rawFiles.filter(f => f._isNew && f._blob);
      for (const f of newFiles) await uploadTaskFile(id, f);
    }

    // Sync subtasks (if provided)
    if (rawSubtasks !== undefined) {
      // Delete removed subtasks
      const existing = tasks.find(t => t.id === id)?.subtasks || [];
      const newIds = rawSubtasks.filter(s => !s._isNew).map(s => s.id);
      for (const s of existing) {
        if (!newIds.includes(s.id)) {
          await supabase.from('subtasks').delete().eq('id', s.id);
        }
      }
      // Update existing + insert new
      for (let i = 0; i < rawSubtasks.length; i++) {
        const s = rawSubtasks[i];
        if (!s.title.trim()) continue;
        if (s._isNew) {
          await supabase.from('subtasks').insert({
            task_id: id, user_id: user.id,
            title: s.title.trim(), sort_order: i,
          });
        } else {
          await supabase.from('subtasks').update({
            title: s.title.trim(), sort_order: i, completed: s.completed || false,
          }).eq('id', s.id);
        }
      }
    }

    addToast('Task updated!');
    await loadTasks(user.id);
  }, [user, tasks, addToast, loadTasks]);

  const deleteTask = useCallback(async (id) => {
    if (!user) return;
    // Delete storage files
    const task = tasks.find(t => t.id === id);
    if (task?.files?.length) {
      const paths = task.files.map(f => f.storage_path).filter(Boolean);
      if (paths.length) await supabase.storage.from('task-files').remove(paths);
    }
    await supabase.from('tasks').delete().eq('id', id);
    addToast('Task deleted.', 'info');
    await loadTasks(user.id);
  }, [user, tasks, addToast, loadTasks]);

  const toggleComplete = useCallback(async (id) => {
    if (!user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);

    // Handle recurring task
    if (newStatus === 'completed' && task.recurrence && task.dueDate) {
      const nextDate = getNextRecurrenceDate(task.dueDate, task.recurrence);
      if (nextDate) {
        await supabase.from('tasks').insert({
          user_id: user.id,
          title: task.title,
          description: task.description || null,
          due_date: nextDate,
          due_time: task.dueTime || null,
          priority: task.priority,
          category: task.category || null,
          recurrence: task.recurrence,
          status: 'pending',
        });
        addToast(`Next ${task.recurrence} task created!`);
      }
    }

    await loadTasks(user.id);
  }, [user, tasks, addToast, loadTasks]);

  const updateTaskStatus = useCallback(async (id, status) => {
    if (!user) return;
    await supabase.from('tasks').update({ status }).eq('id', id);
    await loadTasks(user.id);
  }, [user, loadTasks]);

  const deleteFile = useCallback(async (taskId, fileId) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    const file = task?.files?.find(f => f.id === fileId);
    if (file?.storage_path) {
      await supabase.storage.from('task-files').remove([file.storage_path]);
    }
    await supabase.from('task_files').delete().eq('id', fileId);
    addToast('File removed.', 'info');
    await loadTasks(user.id);
  }, [user, tasks, addToast, loadTasks]);

  // ── Subtask actions ────────────────────────────────────
  const toggleSubtask = useCallback(async (subtaskId, completed) => {
    if (!user) return;
    await supabase.from('subtasks').update({ completed: !completed }).eq('id', subtaskId);
    await loadTasks(user.id);
  }, [user, loadTasks]);

  // ── Bulk actions ───────────────────────────────────────
  const bulkAction = useCallback(async (ids, action, value) => {
    if (!user || !ids.length) return;
    switch (action) {
      case 'complete':
        await supabase.from('tasks').update({ status: 'completed' }).in('id', ids);
        addToast(`${ids.length} tasks completed!`);
        break;
      case 'delete':
        // Delete storage files for these tasks
        for (const id of ids) {
          const task = tasks.find(t => t.id === id);
          if (task?.files?.length) {
            const paths = task.files.map(f => f.storage_path).filter(Boolean);
            if (paths.length) await supabase.storage.from('task-files').remove(paths);
          }
        }
        await supabase.from('tasks').delete().in('id', ids);
        addToast(`${ids.length} tasks deleted.`, 'info');
        break;
      case 'priority':
        await supabase.from('tasks').update({ priority: value }).in('id', ids);
        addToast(`Priority updated for ${ids.length} tasks!`);
        break;
      case 'category':
        await supabase.from('tasks').update({ category: value || null }).in('id', ids);
        addToast(`Category updated for ${ids.length} tasks!`);
        break;
    }
    await loadTasks(user.id);
  }, [user, tasks, addToast, loadTasks]);

  // ── Reorder ────────────────────────────────────────────
  const reorderTasks = useCallback(async (reorderedIds) => {
    if (!user) return;
    for (let i = 0; i < reorderedIds.length; i++) {
      await supabase.from('tasks').update({ sort_order: i }).eq('id', reorderedIds[i]);
    }
    await loadTasks(user.id);
  }, [user, loadTasks]);

  // ── File upload helper ─────────────────────────────────
  const uploadTaskFile = async (taskId, f) => {
    const path = `${user.id}/${taskId}/${f.name}`;
    const { error } = await supabase.storage.from('task-files').upload(path, f._blob, { upsert: true });
    if (error) return;
    const { data: { publicUrl } } = supabase.storage.from('task-files').getPublicUrl(path);
    await supabase.from('task_files').insert({
      task_id: taskId, user_id: user.id,
      name: f.name, type: f.type, size: f.size,
      storage_path: path, url: publicUrl,
    });
  };

  // ── Profile update ─────────────────────────────────────
  const updateUserProfile = useCallback(async (updates) => {
    if (!user) return;
    await supabase.from('profiles').update(updates).eq('id', user.id);
    setProfile(p => ({ ...p, ...updates }));
    addToast('Profile saved!');
  }, [user, addToast]);

  const uploadAvatar = useCallback(async (file) => {
    if (!user) return;
    const path = `${user.id}/avatar`;
    await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
    setProfile(p => ({ ...p, avatar_url: publicUrl }));
    addToast('Photo updated!');
    return publicUrl;
  }, [user, addToast]);

  return (
    <AppContext.Provider value={{
      user, profile, tasks, authLoading, darkMode, setDarkMode, toasts,
      loginWithEmail, signupWithEmail, loginWithGoogle, logout,
      addTask, updateTask, deleteTask, toggleComplete, updateTaskStatus,
      deleteFile, toggleSubtask,
      bulkAction, reorderTasks,
      updateUserProfile, uploadAvatar, addToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

// ── Normalize Supabase row → app shape ─────────────────
function normalizeTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    dueDate: row.due_date || '',
    dueTime: row.due_time || '',
    priority: row.priority,
    status: row.status,
    category: row.category || '',
    recurrence: row.recurrence || '',
    sortOrder: row.sort_order || 0,
    createdAt: row.created_at,
    files: (row.task_files || []).map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      size: f.size,
      url: f.url,
      storage_path: f.storage_path,
    })),
    subtasks: (row.subtasks || [])
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map(s => ({
        id: s.id,
        title: s.title,
        completed: s.completed,
        sortOrder: s.sort_order,
      })),
  };
}
