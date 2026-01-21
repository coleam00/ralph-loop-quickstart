import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, habits, habitGoals, goals } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

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

    // Verify the habit belongs to the user
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)));

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Get the goal association
    const [association] = await db
      .select({
        goalId: habitGoals.goalId,
        goalName: goals.name,
      })
      .from(habitGoals)
      .innerJoin(goals, eq(habitGoals.goalId, goals.id))
      .where(eq(habitGoals.habitId, id));

    if (association) {
      return NextResponse.json({
        goalId: association.goalId,
        goalName: association.goalName,
      });
    }

    return NextResponse.json({ goalId: null, goalName: null });
  } catch (error) {
    console.error('Error fetching habit goal association:', error);
    return NextResponse.json({ error: 'Failed to fetch goal association' }, { status: 500 });
  }
}
