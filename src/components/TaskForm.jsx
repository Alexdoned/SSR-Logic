import { useState } from 'react';
import { useTasks } from '../context/TaskContext';

/**
 * TaskForm — Add or edit an assignment/task.
 * Fields: title, subject, description, deadline, priority.
 */
export default function TaskForm({ editingTask, onClose }) {
  const { addTask, updateTask } = useTasks();

  // Pre-fill form if editing an existing task
  const [form, setForm] = useState({
    title: editingTask?.title || '',
    subject: editingTask?.subject || '',
    description: editingTask?.description || '',
    deadline: editingTask?.deadline || '',
    priority: editingTask?.priority || 'medium',
  });

  const [errors, setErrors] = useState({});

  /** Handle input changes */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /** Validate form fields */
  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.deadline) newErrors.deadline = 'Deadline is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Handle form submission */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingTask) {
      updateTask(editingTask.id, form);
    } else {
      addTask(form);
    }

    // Reset form & close modal
    setForm({ title: '', subject: '', description: '', deadline: '', priority: 'medium' });
    setErrors({});
    if (onClose) onClose();
  };

  const priorities = [
    { value: 'high', label: 'High', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
    { value: 'medium', label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    { value: 'low', label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  ];

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-surface-200/80 mb-1.5">
            Assignment Title <span className="text-rose-400">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Calculus Homework Ch.5"
            className={`form-input ${errors.title ? 'border-rose-500/60' : ''}`}
          />
          {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="task-subject" className="block text-sm font-medium text-surface-200/80 mb-1.5">
            Subject / Course
          </label>
          <input
            id="task-subject"
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="e.g. Mathematics 201"
            className="form-input"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="task-desc" className="block text-sm font-medium text-surface-200/80 mb-1.5">
            Description
          </label>
          <textarea
            id="task-desc"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Add any extra notes..."
            rows={3}
            className="form-input resize-none"
          />
        </div>

        {/* Deadline */}
        <div>
          <label htmlFor="task-deadline" className="block text-sm font-medium text-surface-200/80 mb-1.5">
            Deadline <span className="text-rose-400">*</span>
          </label>
          <input
            id="task-deadline"
            type="datetime-local"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            className={`form-input ${errors.deadline ? 'border-rose-500/60' : ''}`}
          />
          {errors.deadline && <p className="text-rose-400 text-xs mt-1">{errors.deadline}</p>}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-surface-200/80 mb-2">Priority Level</label>
          <div className="flex gap-2">
            {priorities.map((p) => (
              <button
                key={p.value}
                type="button"
                id={`priority-${p.value}`}
                onClick={() => setForm((prev) => ({ ...prev, priority: p.value }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-300 cursor-pointer ${
                  form.priority === p.value
                    ? `${p.bg} ${p.color} scale-[1.02]`
                    : 'bg-transparent border-white/10 text-surface-200/50 hover:border-white/20'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="submit" id="task-submit-btn" className="btn-glow flex-1 py-3 text-sm">
            {editingTask ? '✏️ Update Task' : '✨ Add Task'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl text-sm font-medium text-surface-200/60 hover:text-white hover:bg-white/5 border border-white/10 transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
