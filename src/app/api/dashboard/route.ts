import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, habits, goals, habitCompletions } from '@/lib/db';
import { eq, and, gte, desc } from 'drizzle-orm';
import { calculateStreak } from '@/lib/utils/streak';

function getStartOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getEndOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
}

function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const todayStart = getStartOfDay(now);
    const todayEnd = getEndOfDay(now);
    const weekStart = getStartOfWeek(now);
    const weekEnd = getEndOfWeek(now);

    // Fetch all active habits
    const userHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.isActive, true)))
      .orderBy(habits.createdAt);

    // Fetch all active goals
    const userGoals = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.isCompleted, false)))
      .orderBy(goals.createdAt);

    // For each habit, check completion status and calculate streak
    const habitsWithStatus = await Promise.all(
      userHabits.map(async (habit) => {
        // Get all completions for streak calculation
        const allCompletions = await db
          .select()
          .from(habitCompletions)
          .where(eq(habitCompletions.habitId, habit.id))
          .orderBy(desc(habitCompletions.completedAt));

        // Check if completed in current period
        let isCompleted = false;
        if (habit.frequency === 'daily') {
          const todayCompletion = allCompletions.find((c) => {
            const completedAt = new Date(c.completedAt);
            return completedAt >= todayStart && completedAt <= todayEnd;
          });
          isCompleted = !!todayCompletion;
        } else {
          const weekCompletion = allCompletions.find((c) => {
            const completedAt = new Date(c.completedAt);
            return completedAt >= weekStart && completedAt <= weekEnd;
          });
          isCompleted = !!weekCompletion;
        }

        // Calculate streak
        const completionDates = allCompletions.map((c) => new Date(c.completedAt));
        const streakResult = calculateStreak(completionDates, habit.frequency);

        return {
          ...habit,
          isCompleted,
          streak: streakResult.currentStreak,
        };
      })
    );

    // Calculate stats
    const dailyHabits = habitsWithStatus.filter((h) => h.frequency === 'daily');
    const weeklyHabits = habitsWithStatus.filter((h) => h.frequency === 'weekly');

    const completedToday = dailyHabits.filter((h) => h.isCompleted).length;
    const totalDailyHabits = dailyHabits.length;

    const completedThisWeek = weeklyHabits.filter((h) => h.isCompleted).length;
    const totalWeeklyHabits = weeklyHabits.length;

    const bestStreak = Math.max(...habitsWithStatus.map((h) => h.streak), 0);
    const totalActiveHabits = userHabits.length;
    const totalActiveGoals = userGoals.length;

    // Get recent completions for activity feed
    const recentCompletions = await db
      .select({
        completion: habitCompletions,
        habit: habits,
      })
      .from(habitCompletions)
      .innerJoin(habits, eq(habitCompletions.habitId, habits.id))
      .where(
        and(
          eq(habits.userId, userId),
          gte(habitCompletions.completedAt, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
        )
      )
      .orderBy(desc(habitCompletions.completedAt))
      .limit(10);

    return NextResponse.json({
      stats: {
        activeHabits: totalActiveHabits,
        completedToday,
        totalDailyHabits,
        completedThisWeek,
        totalWeeklyHabits,
        bestStreak,
        activeGoals: totalActiveGoals,
      },
      todaysHabits: habitsWithStatus.filter((h) => h.frequency === 'daily'),
      weeklyHabits: habitsWithStatus.filter((h) => h.frequency === 'weekly'),
      goals: userGoals,
      recentActivity: recentCompletions.map((r) => ({
        id: r.completion.id,
        habitName: r.habit.name,
        completedAt: r.completion.completedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
