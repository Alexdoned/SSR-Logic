import { useMemo } from 'react';

/**
 * ProgressCircle — A multi-segment donut chart showing the
 * percentage breakdown between Completed, Pending, and Overdue tasks.
 */
export default function ProgressCircle({ tasks }) {
  const { completed, pending, overdue, total, percents } = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const overdue = tasks.filter(
      (t) => !t.completed && new Date(t.deadline) < new Date()
    ).length;
    const pending = total - completed - overdue;

    const percents = {
      completed: total > 0 ? Math.round((completed / total) * 100) : 0,
      pending: total > 0 ? Math.round((pending / total) * 100) : 0,
      overdue: total > 0 ? Math.round((overdue / total) * 100) : 0,
    };

    return { completed, pending, overdue, total, percents };
  }, [tasks]);

  // SVG donut math
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Segments: completed → pending → overdue
  const segments = [
    { key: 'completed', value: completed, percent: percents.completed, color: '#10B981', label: 'Completed' },
    { key: 'pending', value: pending, percent: percents.pending, color: '#F59E0B', label: 'Pending' },
    { key: 'overdue', value: overdue, percent: percents.overdue, color: '#F43F5E', label: 'Overdue' },
  ];

  // Calculate stroke dash offsets for each segment
  let cumulativePercent = 0;
  const arcs = segments.map((seg) => {
    const dashLength = (seg.percent / 100) * circumference;
    const gapLength = circumference - dashLength;
    const offset = -(cumulativePercent / 100) * circumference;
    cumulativePercent += seg.percent;
    return { ...seg, dashLength, gapLength, offset };
  });

  // Overall completion percentage for center display
  const completionRate = percents.completed;

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h3 className="text-sm font-semibold text-surface-200/70 uppercase tracking-wider mb-5 text-center">
        Activity Progress
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {total > 0 &&
              arcs.map((arc) =>
                arc.percent > 0 ? (
                  <circle
                    key={arc.key}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${arc.dashLength} ${arc.gapLength}`}
                    strokeDashoffset={arc.offset}
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 6px ${arc.color}40)` }}
                  />
                ) : null
              )}
          </svg>

          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{completionRate}%</span>
            <span className="text-[0.65rem] text-surface-200/50 font-medium uppercase tracking-wider">
              Done
            </span>
          </div>
        </div>

        {/* Legend & Breakdown */}
        <div className="flex-1 w-full space-y-4">
          {segments.map((seg) => (
            <div key={seg.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: seg.color, boxShadow: `0 0 8px ${seg.color}50` }}
                  />
                  <span className="text-sm text-surface-200/80 font-medium">{seg.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{seg.value}</span>
                  <span className="text-xs text-surface-200/40">({seg.percent}%)</span>
                </div>
              </div>
              {/* Linear progress bar */}
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${seg.percent}%`,
                    backgroundColor: seg.color,
                    boxShadow: `0 0 10px ${seg.color}40`,
                  }}
                />
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-surface-200/40 uppercase tracking-wider">Total Tasks</span>
            <span className="text-lg font-bold text-white">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
