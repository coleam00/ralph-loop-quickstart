/**
 * Streak calculation utilities for habit tracking
 */

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
}

/**
 * Get the start of a day (midnight)
 */
function getStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Get the start of a week (Sunday)
 */
function getStartOfWeek(date: Date): Date {
  const dayOfWeek = date.getDay();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayOfWeek);
}

/**
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add weeks to a date
 */
function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Calculate streak for daily habits
 *
 * A daily streak counts consecutive days where the habit was completed.
 * The streak can include today if completed, or yesterday if today is not yet completed.
 */
export function calculateDailyStreak(completions: Date[]): StreakResult {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompletions: 0 };
  }

  // Sort completions by date descending (most recent first)
  const sortedDates = completions
    .map(d => getStartOfDay(new Date(d)))
    .sort((a, b) => b.getTime() - a.getTime());

  // Remove duplicates (only count one completion per day)
  const uniqueDates: Date[] = [];
  for (const date of sortedDates) {
    if (uniqueDates.length === 0 || !isSameDay(date, uniqueDates[uniqueDates.length - 1])) {
      uniqueDates.push(date);
    }
  }

  const today = getStartOfDay(new Date());
  const yesterday = addDays(today, -1);

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = today;

  // Check if today or yesterday has a completion to start the streak
  if (uniqueDates.length > 0) {
    const mostRecent = uniqueDates[0];
    if (isSameDay(mostRecent, today) || isSameDay(mostRecent, yesterday)) {
      checkDate = mostRecent;
    } else {
      // Most recent completion is older than yesterday, no current streak
      checkDate = addDays(today, -999); // Set to impossible date
    }
  }

  // Count consecutive days backwards
  for (const date of uniqueDates) {
    if (isSameDay(date, checkDate)) {
      currentStreak++;
      checkDate = addDays(checkDate, -1);
    } else if (date.getTime() < checkDate.getTime()) {
      // Gap found, stop counting
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  // Process in chronological order for longest streak
  const chronological = [...uniqueDates].reverse();
  for (const date of chronological) {
    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const expectedDate = addDays(prevDate, 1);
      if (isSameDay(date, expectedDate)) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    prevDate = date;
  }

  return {
    currentStreak,
    longestStreak,
    totalCompletions: uniqueDates.length,
  };
}

/**
 * Calculate streak for weekly habits
 *
 * A weekly streak counts consecutive weeks where the habit was completed at least once.
 * The streak can include this week if completed, or last week if this week is not yet completed.
 */
export function calculateWeeklyStreak(completions: Date[]): StreakResult {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompletions: 0 };
  }

  // Convert to week starts
  const weekStarts = completions.map(d => getStartOfWeek(new Date(d)));

  // Sort by week descending (most recent first)
  const sortedWeeks = weekStarts.sort((a, b) => b.getTime() - a.getTime());

  // Remove duplicates (only count one completion per week)
  const uniqueWeeks: Date[] = [];
  for (const week of sortedWeeks) {
    if (uniqueWeeks.length === 0 || !isSameDay(week, uniqueWeeks[uniqueWeeks.length - 1])) {
      uniqueWeeks.push(week);
    }
  }

  const thisWeek = getStartOfWeek(new Date());
  const lastWeek = addWeeks(thisWeek, -1);

  // Calculate current streak
  let currentStreak = 0;
  let checkWeek = thisWeek;

  // Check if this week or last week has a completion to start the streak
  if (uniqueWeeks.length > 0) {
    const mostRecent = uniqueWeeks[0];
    if (isSameDay(mostRecent, thisWeek) || isSameDay(mostRecent, lastWeek)) {
      checkWeek = mostRecent;
    } else {
      // Most recent completion is older than last week, no current streak
      checkWeek = addWeeks(thisWeek, -999);
    }
  }

  // Count consecutive weeks backwards
  for (const week of uniqueWeeks) {
    if (isSameDay(week, checkWeek)) {
      currentStreak++;
      checkWeek = addWeeks(checkWeek, -1);
    } else if (week.getTime() < checkWeek.getTime()) {
      // Gap found, stop counting
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevWeek: Date | null = null;

  // Process in chronological order for longest streak
  const chronological = [...uniqueWeeks].reverse();
  for (const week of chronological) {
    if (prevWeek === null) {
      tempStreak = 1;
    } else {
      const expectedWeek = addWeeks(prevWeek, 1);
      if (isSameDay(week, expectedWeek)) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    prevWeek = week;
  }

  return {
    currentStreak,
    longestStreak,
    totalCompletions: uniqueWeeks.length,
  };
}

/**
 * Calculate streak based on habit frequency
 */
export function calculateStreak(
  completions: Date[],
  frequency: 'daily' | 'weekly'
): StreakResult {
  if (frequency === 'daily') {
    return calculateDailyStreak(completions);
  }
  return calculateWeeklyStreak(completions);
}

/**
 * Get milestone text for a streak value
 */
export function getStreakMilestone(streak: number): string | null {
  if (streak >= 365) return 'Year Champion';
  if (streak >= 100) return 'Century Achiever';
  if (streak >= 50) return 'Half Century';
  if (streak >= 30) return 'Monthly Master';
  if (streak >= 21) return 'Habit Formed';
  if (streak >= 14) return 'Two Weeks Strong';
  if (streak >= 7) return 'One Week';
  if (streak >= 3) return 'Getting Started';
  return null;
}

/**
 * Get milestone icon color based on streak
 */
export function getStreakMilestoneColor(streak: number): string {
  if (streak >= 100) return 'text-purple-500';
  if (streak >= 50) return 'text-yellow-500';
  if (streak >= 30) return 'text-orange-500';
  if (streak >= 21) return 'text-red-500';
  if (streak >= 7) return 'text-blue-500';
  if (streak >= 3) return 'text-green-500';
  return 'text-muted-foreground';
}
