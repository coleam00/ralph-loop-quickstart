import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, habits, habitCompletions } from '@/lib/db';
import { eq, and, gte, lte } from 'drizzle-orm';

// Helper to get the start of the current period (day or week)
function getPeriodStart(frequency: 'daily' | 'weekly'): Date {
  const now = new Date();
  if (frequency === 'daily') {
    // Start of today (midnight)
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else {
    // Start of current week (Sunday)
    const dayOfWeek = now.getDay();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
    return start;
  }
}

// Helper to get the end of the current period
function getPeriodEnd(frequency: 'daily' | 'weekly'): Date {
  const start = getPeriodStart(frequency);
  if (frequency === 'daily') {
    // End of today (23:59:59.999)
    return new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59, 999);
  } else {
    // End of week (Saturday 23:59:59.999)
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
  }
}

// GET - Check if habit is completed for current period
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

    const periodStart = getPeriodStart(habit.frequency as 'daily' | 'weekly');
    const periodEnd = getPeriodEnd(habit.frequency as 'daily' | 'weekly');

    // Check for completion in current period
    const completions = await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, id),
          gte(habitCompletions.completedAt, periodStart),
          lte(habitCompletions.completedAt, periodEnd)
        )
      );

    return NextResponse.json({
      isCompleted: completions.length > 0,
      completion: completions[0] || null,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
    });
  } catch (error) {
    console.error('Error checking habit completion:', error);
    return NextResponse.json({ error: 'Failed to check completion status' }, { status: 500 });
  }
}

// POST - Mark habit as complete for current period
export async function POST(
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

    const periodStart = getPeriodStart(habit.frequency as 'daily' | 'weekly');
    const periodEnd = getPeriodEnd(habit.frequency as 'daily' | 'weekly');

    // Check if already completed for this period
    const existingCompletions = await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, id),
          gte(habitCompletions.completedAt, periodStart),
          lte(habitCompletions.completedAt, periodEnd)
        )
      );

    if (existingCompletions.length > 0) {
      return NextResponse.json(
        { error: 'Habit already completed for this period', completion: existingCompletions[0] },
        { status: 400 }
      );
    }

    // Create new completion
    const [completion] = await db
      .insert(habitCompletions)
      .values({
        habitId: id,
        periodStart: periodStart.toISOString().split('T')[0], // Store as date string
      })
      .returning();

    return NextResponse.json({ completion, isCompleted: true }, { status: 201 });
  } catch (error) {
    console.error('Error completing habit:', error);
    return NextResponse.json({ error: 'Failed to complete habit' }, { status: 500 });
  }
}

// DELETE - Uncomplete habit for current period
export async function DELETE(
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

    const periodStart = getPeriodStart(habit.frequency as 'daily' | 'weekly');
    const periodEnd = getPeriodEnd(habit.frequency as 'daily' | 'weekly');

    // Delete completion for current period
    const deleted = await db
      .delete(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, id),
          gte(habitCompletions.completedAt, periodStart),
          lte(habitCompletions.completedAt, periodEnd)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'No completion found for this period' }, { status: 404 });
    }

    return NextResponse.json({ success: true, isCompleted: false });
  } catch (error) {
    console.error('Error uncompleting habit:', error);
    return NextResponse.json({ error: 'Failed to uncomplete habit' }, { status: 500 });
  }
}
