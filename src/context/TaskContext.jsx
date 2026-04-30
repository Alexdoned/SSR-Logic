import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ===== Create the Task Context =====
const TaskContext = createContext(null);

// ===== localStorage helpers =====
const STORAGE_KEY = 'ssr_tasks';

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ===== Generate a unique ID =====
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * TaskProvider — wraps the app tree and provides task CRUD operations
 * plus localStorage persistence.
 */
export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(loadTasks);

  const [activeAlert, setActiveAlert] = useState(null);

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // ===== Deadline Monitoring =====
  useEffect(() => {
    const checkDeadlines = () => {
      const now = Date.now();
      
      setTasks(prevTasks => {
        let updated = false;
        const newTasks = prevTasks.map(task => {
          if (task.completed || task.alerted) return task;
          
          const deadlineTime = new Date(task.deadline).getTime();
          const diff = deadlineTime - now;
          
          // Trigger if between 0 and 60 seconds remaining
          if (diff > 0 && diff <= 60000) {
            setActiveAlert(task);
            updated = true;
            
            // Play sound
            try {
              const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
              gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
              oscillator.start();
              oscillator.stop(audioCtx.currentTime + 2);
            } catch (e) { console.error("Audio error:", e); }

            return { ...task, alerted: true };
          }
          return task;
        });

        return updated ? newTasks : prevTasks;
      });
    };

    const interval = setInterval(checkDeadlines, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [tasks.length]); // Re-run if task count changes

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  // ===== CRUD Operations =====

  /** Add a new task */
  const addTask = useCallback((task) => {
    const newTask = {
      id: generateId(),
      title: task.title,
      subject: task.subject || '',
      description: task.description || '',
      deadline: task.deadline,
      priority: task.priority || 'medium',
      completed: false,
      alerted: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  /** Update an existing task by ID */
  const updateTask = useCallback((id, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, alerted: updates.deadline ? false : t.alerted } : t))
    );
  }, []);

  /** Toggle a task's completed status */
  const toggleTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  /** Delete a task by ID */
  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** Clear all completed tasks */
  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, []);

  const value = {
    tasks,
    activeAlert,
    dismissAlert,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    clearCompleted,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

/**
 * Custom hook to consume the TaskContext.
 * Must be used inside a <TaskProvider>.
 */
export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return ctx;
}
