import { useState } from 'react';
import { TaskProvider } from './context/TaskContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PomodoroTimer from './components/PomodoroTimer';
import InstallPWA from './components/InstallPWA';
import TaskAlert from './components/TaskAlert';

/**
 * App — Root component.
 * Manages tab-based navigation between Dashboard and Pomodoro views.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <TaskProvider>
      {/* Animated background particles */}
      <div className="bg-particles" />

      {/* Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'pomodoro' && <PomodoroTimer />}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-surface-200/30">
        <p>Smart Student Reminder &copy; {new Date().getFullYear()} &middot; Built with ❤️ for focused students</p>
      </footer>

      {/* Overlays */}
      <TaskAlert />
      <InstallPWA />
    </TaskProvider>
  );
}
