/**
 * Urgency Algorithm for Smart Student Reminder
 *
 * Calculates a composite "urgency score" for each task based on:
 *   1. Time remaining until the deadline (fewer hours = more urgent)
 *   2. Priority level (High = 3, Medium = 2, Low = 1)
 *
 * Formula:
 *   urgencyScore = priorityWeight * (1 / hoursRemaining)
 *
 * Higher scores mean the task should appear first.
 */

// Map priority labels to numeric weights
const PRIORITY_WEIGHTS = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Calculate the urgency score for a single task.
 * @param {Object} task - A task with `deadline` (ISO string) and `priority` ('high'|'medium'|'low').
 * @returns {number} The urgency score. Higher = more urgent.
 */
export function getUrgencyScore(task) {
  const now = Date.now();
  const deadlineMs = new Date(task.deadline).getTime();
  const hoursRemaining = Math.max((deadlineMs - now) / (1000 * 60 * 60), 0.1); // Floor at 0.1 to avoid infinity

  const priorityWeight = PRIORITY_WEIGHTS[task.priority] || 1;

  // Inverse relationship: less time remaining → higher score
  return priorityWeight * (100 / hoursRemaining);
}

/**
 * Sort an array of tasks by urgency (most urgent first).
 * Completed tasks are always pushed to the bottom.
 * @param {Array} tasks - Array of task objects.
 * @returns {Array} A new array sorted by urgency descending.
 */
export function sortByUrgency(tasks) {
  return [...tasks].sort((a, b) => {
    // Completed tasks go to the bottom
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    if (a.completed && b.completed) return 0;

    return getUrgencyScore(b) - getUrgencyScore(a);
  });
}

/**
 * Get a human-readable urgency label.
 * @param {Object} task
 * @returns {'overdue'|'urgent'|'upcoming'|'relaxed'}
 */
export function getUrgencyLabel(task) {
  const now = Date.now();
  const deadlineMs = new Date(task.deadline).getTime();
  const hoursRemaining = (deadlineMs - now) / (1000 * 60 * 60);

  if (hoursRemaining <= 0) return 'overdue';
  if (hoursRemaining <= 24) return 'urgent';
  if (hoursRemaining <= 72) return 'upcoming';
  return 'relaxed';
}
