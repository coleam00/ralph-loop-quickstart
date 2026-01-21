import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, habits, goals, habitCompletions } from '@/lib/db';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { createChatCompletion } from '@/lib/ai/openrouter';

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

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const todayStart = getStartOfDay(now);
    const todayEnd = getEndOfDay(now);

    // Fetch user's habits
    const userHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.isActive, true)));

    // Fetch user's active goals
    const userGoals = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.isCompleted, false)));

    // Check today's completions
    const dailyHabits = userHabits.filter((h) => h.frequency === 'daily');
    let completedToday = 0;

    for (const habit of dailyHabits) {
      const todayCompletion = await db
        .select()
        .from(habitCompletions)
        .where(
          and(
            eq(habitCompletions.habitId, habit.id),
            gte(habitCompletions.completedAt, todayStart),
            lte(habitCompletions.completedAt, todayEnd)
          )
        )
        .limit(1);

      if (todayCompletion.length > 0) {
        completedToday++;
      }
    }

    // Calculate best streak
    let bestStreak = 0;
    for (const habit of userHabits) {
      const completions = await db
        .select()
        .from(habitCompletions)
        .where(eq(habitCompletions.habitId, habit.id))
        .orderBy(desc(habitCompletions.completedAt));

      if (completions.length > 0) {
        // Simple streak calculation - count recent consecutive days
        let streak = 0;
        const uniqueDays = new Set<string>();
        for (const c of completions) {
          const dateKey = new Date(c.completedAt).toISOString().split('T')[0];
          uniqueDays.add(dateKey);
        }
        streak = uniqueDays.size;
        bestStreak = Math.max(bestStreak, streak);
      }
    }

    // Build context for AI
    const context = {
      totalHabits: userHabits.length,
      dailyHabits: dailyHabits.length,
      completedToday,
      totalGoals: userGoals.length,
      bestStreak,
      habitNames: userHabits.slice(0, 5).map((h) => h.name),
      goalNames: userGoals.slice(0, 3).map((g) => g.name),
    };

    // Generate motivational message using AI
    const systemPrompt = `You are an encouraging AI habit coach. Generate a short, personalized motivational message (2-3 sentences max) based on the user's progress. Be warm and supportive, not generic. Reference their specific habits or goals if relevant.

User context:
- Total habits: ${context.totalHabits}
- Daily habits: ${context.dailyHabits}
- Completed today: ${context.completedToday}
- Active goals: ${context.totalGoals}
- Best streak: ${context.bestStreak} days
- Some habits: ${context.habitNames.join(', ') || 'none yet'}
- Some goals: ${context.goalNames.join(', ') || 'none yet'}

Respond with ONLY the motivational message, no quotes or extra formatting.`;

    try {
      const response = await createChatCompletion([
        { role: 'user', content: 'Give me a motivational message for today.' },
      ], systemPrompt);

      const message = response.choices[0]?.message?.content || getDefaultMessage(context);

      return NextResponse.json({ message, context });
    } catch (aiError) {
      console.error('AI error, using default message:', aiError);
      return NextResponse.json({ message: getDefaultMessage(context), context });
    }
  } catch (error) {
    console.error('Error generating motivation:', error);
    return NextResponse.json(
      { message: 'Keep pushing forward! Every small step counts.', context: null },
      { status: 200 }
    );
  }
}

function getDefaultMessage(context: {
  totalHabits: number;
  completedToday: number;
  dailyHabits: number;
  bestStreak: number;
}): string {
  if (context.totalHabits === 0) {
    return "Welcome! Start your journey by adding your first habit. Small, consistent actions lead to big changes.";
  }

  if (context.completedToday === context.dailyHabits && context.dailyHabits > 0) {
    return "Amazing work! You've completed all your habits for today. Consistency like this builds lasting change.";
  }

  if (context.bestStreak >= 7) {
    return `You're on fire with a ${context.bestStreak}-day streak! Keep that momentum going - you're building real habits.`;
  }

  if (context.completedToday > 0) {
    return `Great start today! You've completed ${context.completedToday} habit${context.completedToday > 1 ? 's' : ''}. Keep going!`;
  }

  return "Today is a new opportunity. Take that first step - your future self will thank you.";
}
