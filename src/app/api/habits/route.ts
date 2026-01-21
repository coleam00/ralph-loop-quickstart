import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, habits, habitGoals, type NewHabit } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, userId))
      .orderBy(habits.createdAt);

    return NextResponse.json(userHabits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, frequency, goalId } = body;

    if (!name || !frequency) {
      return NextResponse.json(
        { error: 'Name and frequency are required' },
        { status: 400 }
      );
    }

    if (frequency !== 'daily' && frequency !== 'weekly') {
      return NextResponse.json(
        { error: 'Frequency must be "daily" or "weekly"' },
        { status: 400 }
      );
    }

    const newHabit: NewHabit = {
      userId,
      name,
      description: description || null,
      frequency,
    };

    const [createdHabit] = await db.insert(habits).values(newHabit).returning();

    // Create habit-goal association if goalId is provided
    if (goalId) {
      await db.insert(habitGoals).values({
        habitId: createdHabit.id,
        goalId: goalId,
      });
    }

    return NextResponse.json(createdHabit, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
  }
}
