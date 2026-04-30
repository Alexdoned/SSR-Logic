import { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { sortByUrgency, getUrgencyLabel } from '../utils/urgency';
import TaskForm from './TaskForm';
import ProgressCircle from './ProgressCircle';

export default function Dashboard() {
  const { tasks, toggleTask, deleteTask, clearCompleted } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');

  const sortedTasks = useMemo(() => sortByUrgency(tasks), [tasks]);

  const filteredTasks = useMemo(() => {
    if (filter === 'pending') return sortedTasks.filter((t) => !t.completed);
    if (filter === 'completed') return sortedTasks.filter((t) => t.completed);
    return sortedTasks;
  }, [sortedTasks, filter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter((t) => !t.completed && new Date(t.deadline) < new Date()).length;
    return { total, completed, pending, overdue };
  }, [tasks]);

  const formatDeadline = (dateStr) => {
    const d = new Date(dateStr);
    const diff = d - new Date();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (diff < 0) return 'Overdue!';
    if (hours < 1) return `${Math.max(0, Math.floor(diff / (1000 * 60)))}m left`;
    if (hours < 24) return `${hours}h left`;
    if (days < 7) return `${days}d left`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const urgencyColors = { overdue: 'text-rose-400', urgent: 'text-amber-400', upcoming: 'text-sky-400', relaxed: 'text-emerald-400' };
  const urgencyDots = { overdue: '🔴', urgent: '🟡', upcoming: '🔵', relaxed: '🟢' };

  const handleEdit = (task) => { setEditingTask(task); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setEditingTask(null); };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: '📚', color: 'from-primary-600/20 to-primary-800/10' },
          { label: 'Pending', value: stats.pending, icon: '⏳', color: 'from-amber-600/20 to-amber-800/10' },
          { label: 'Done', value: stats.completed, icon: '✅', color: 'from-emerald-600/20 to-emerald-800/10' },
          { label: 'Overdue', value: stats.overdue, icon: '🔥', color: 'from-rose-600/20 to-rose-800/10' },
        ].map((s) => (
          <div key={s.label} className={`glass-card p-4 bg-gradient-to-br ${s.color}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-surface-200/60 font-medium uppercase tracking-wider">{s.label}</span>
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress Circle */}
      {tasks.length > 0 && <ProgressCircle tasks={tasks} />}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-surface-900/40 p-1 rounded-xl text-sm">
          {['all', 'pending', 'completed'].map((f) => (
            <button key={f} id={`filter-${f}`} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg font-medium capitalize transition-all cursor-pointer ${filter === f ? 'bg-primary-600/30 text-primary-300' : 'text-surface-200/50 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {stats.completed > 0 && (
            <button id="clear-completed-btn" onClick={clearCompleted}
              className="px-4 py-2 rounded-xl text-xs font-medium text-rose-400/80 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer">
              🗑️ Clear Done
            </button>
          )}
          <button id="add-task-btn" onClick={() => setShowForm(true)} className="btn-glow text-sm flex items-center gap-2">
            <span className="text-lg leading-none">+</span> Add Task
          </button>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="flex min-h-full items-start justify-center p-4 pt-12 sm:pt-16">
            <div className="glass-card p-6 w-full max-w-lg">
              <h2 className="text-lg font-bold text-white mb-4">{editingTask ? '✏️ Edit Task' : '✨ New Task'}</h2>
              <TaskForm editingTask={editingTask} onClose={handleCloseForm} />
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-surface-200/60 text-sm">
            {filter === 'completed' ? 'No completed tasks yet.' : filter === 'pending' ? 'All caught up!' : 'No tasks yet. Add your first assignment!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, i) => {
            const urgency = getUrgencyLabel(task);
            return (
              <div key={task.id} className={`glass-card p-4 group ${task.completed ? 'opacity-50' : ''}`} style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start gap-3">
                  <button id={`toggle-${task.id}`} onClick={() => toggleTask(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/20 hover:border-primary-400'}`}>
                    {task.completed && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`font-semibold text-white text-sm ${task.completed ? 'line-through opacity-60' : ''}`}>{task.title}</h3>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    </div>
                    {task.subject && <p className="text-xs text-primary-300/70 font-medium mb-1">{task.subject}</p>}
                    {task.description && <p className="text-xs text-surface-200/50 mb-2">{task.description}</p>}
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`font-semibold ${urgencyColors[urgency]}`}>{urgencyDots[urgency]} {formatDeadline(task.deadline)}</span>
                      <span className="text-surface-200/30">{new Date(task.deadline).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button id={`edit-${task.id}`} onClick={() => handleEdit(task)} className="p-1.5 rounded-lg hover:bg-white/10 text-surface-200/40 hover:text-white transition cursor-pointer" title="Edit">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button id={`del-${task.id}`} onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-surface-200/40 hover:text-rose-400 transition cursor-pointer" title="Delete">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
