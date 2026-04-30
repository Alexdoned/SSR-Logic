import { useTasks } from '../context/TaskContext';

/**
 * TaskAlert — A popup container that appears when a deadline is imminent.
 * Contains: Activity name, set time, and an Acknowledge button.
 */
export default function TaskAlert() {
  const { activeAlert, dismissAlert } = useTasks();

  if (!activeAlert) return null;

  const formattedTime = new Date(activeAlert.deadline).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card p-8 w-full max-w-md text-center shadow-[0_0_50px_rgba(99,102,241,0.3)] border-primary-500/50">
        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <span className="text-4xl text-rose-500">🔔</span>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">
          Deadline Imminent!
        </h2>
        
        <div className="space-y-2 mb-8">
          <p className="text-surface-200/60 text-xs font-medium uppercase tracking-widest">Activity Name</p>
          <p className="text-xl font-semibold text-primary-300">{activeAlert.title}</p>
          
          <div className="pt-4">
            <p className="text-surface-200/60 text-xs font-medium uppercase tracking-widest">Set Time</p>
            <p className="text-2xl font-mono font-bold text-white">{formattedTime}</p>
          </div>
        </div>

        <button
          id="acknowledge-alert-btn"
          onClick={dismissAlert}
          className="btn-glow w-full py-4 text-lg shadow-xl shadow-primary-600/20 hover:scale-[1.02] transition-transform active:scale-95"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}
