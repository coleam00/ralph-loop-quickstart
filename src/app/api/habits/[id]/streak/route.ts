import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, habits, habitCompletions } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { calculateStreak, getStreakMilestone, getStreakMilestoneColor } from '@/lib/utils/streak';

// GET - Get streak information for a habit
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Get the habit to verify ownership and get frequency
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)));

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Get all completions for this habit
    const completions = await db
      .select()
      .from(habitCompletions)
      .where(eq(habitCompletions.habitId, id));

    // Calculate streak
    const completionDates = completions.map(c => new Date(c.completedAt));
    const streakResult = calculateStreak(completionDates, habit.frequency as 'daily' | 'weekly');

    // Get milestone info
    const milestone = getStreakMilestone(streakResult.currentStreak);
    const milestoneColor = getStreakMilestoneColor(streakResult.currentStreak);

    return NextResponse.json({
      ...streakResult,
      milestone,
      milestoneColor,
      frequency: habit.frequency,
    });
  } catch (error) {
    console.error('Error calculating streak:', error);
    return NextResponse.json({ error: 'Failed to calculate streak' }, { status: 500 });
  }
}
