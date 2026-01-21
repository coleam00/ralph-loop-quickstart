import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, goals, habitGoals, habits, habitCompletions } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Verify the goal belongs to the user
    const [goal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Get all habits associated with this goal
    const associatedHabits = await db
      .select({
        id: habits.id,
        name: habits.name,
        description: habits.description,
        frequency: habits.frequency,
        isActive: habits.isActive,
        createdAt: habits.createdAt,
      })
      .from(habitGoals)
      .innerJoin(habits, eq(habitGoals.habitId, habits.id))
      .where(eq(habitGoals.goalId, id));

    // For each habit, get the completion status for today/this week
    const habitsWithCompletion = await Promise.all(
      associatedHabits.map(async (habit) => {
        const now = new Date();
        let periodStart: Date;
        let periodEnd: Date;

        if (habit.frequency === 'daily') {
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          periodEnd = new Date(periodStart);
          periodEnd.setDate(periodEnd.getDate() + 1);
        } else {
          // Weekly - start of week (Sunday)
          const dayOfWeek = now.getDay();
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
          periodEnd = new Date(periodStart);
          periodEnd.setDate(periodEnd.getDate() + 7);
        }

        const completions = await db
          .select()
          .from(habitCompletions)
          .where(eq(habitCompletions.habitId, habit.id))
          .orderBy(desc(habitCompletions.completedAt));

        const isCompletedToday = completions.some((c) => {
          const completedAt = new Date(c.completedAt);
          return completedAt >= periodStart && completedAt < periodEnd;
        });

        return {
          ...habit,
          isCompleted: isCompletedToday,
          totalCompletions: completions.length,
        };
      })
    );

    // Calculate progress
    const totalHabits = habitsWithCompletion.length;
    const completedHabits = habitsWithCompletion.filter((h) => h.isCompleted).length;
    const progress = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    return NextResponse.json({
      habits: habitsWithCompletion,
      progress,
      totalHabits,
      completedHabits,
    });
  } catch (error) {
    console.error('Error fetching goal habits:', error);
    return NextResponse.json({ error: 'Failed to fetch goal habits' }, { status: 500 });
  }
}
