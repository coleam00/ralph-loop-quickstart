import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { habits, habitCompletions, goals, habitGoals } from "@/lib/db/schema";
import { eq, and, gte, lt, desc } from "drizzle-orm";
import {
  createStreamingChatCompletion,
  parseSSEStream,
  ChatMessage,
} from "@/lib/ai/openrouter";
import {
  buildSystemPrompt,
  HabitContext,
  GoalContext,
  UserContext,
} from "@/lib/ai/system-prompt";
import { calculateStreak } from "@/lib/utils/streak";

// Helper to get period boundaries for daily/weekly habits
function getPeriodBoundaries(frequency: "daily" | "weekly") {
  const now = new Date();
  if (frequency === "daily") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  } else {
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }
}

// Fetch user context for the AI
async function getUserContext(userId: string): Promise<UserContext> {
  // Fetch all habits for the user
  const userHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.isActive, true)))
    .orderBy(desc(habits.createdAt));

  // Fetch all goals for the user
  const userGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .orderBy(desc(goals.createdAt));

  // Fetch habit-goal associations
  const associations = await db.select().from(habitGoals);

  // Build habit contexts with completion status and streaks
  const habitContexts: HabitContext[] = await Promise.all(
    userHabits.map(async (habit) => {
      const { start, end } = getPeriodBoundaries(habit.frequency);

      // Check if completed for current period
      const completions = await db
        .select()
        .from(habitCompletions)
        .where(
          and(
            eq(habitCompletions.habitId, habit.id),
            gte(habitCompletions.completedAt, start),
            lt(habitCompletions.completedAt, end)
          )
        );

      // Get all completions for streak calculation
      const allCompletions = await db
        .select()
        .from(habitCompletions)
        .where(eq(habitCompletions.habitId, habit.id))
        .orderBy(desc(habitCompletions.completedAt));

      const streak = calculateStreak(
        allCompletions.map((c) => c.completedAt),
        habit.frequency
      );

      // Find linked goal
      const linkedGoalAssoc = associations.find((a) => a.habitId === habit.id);
      const linkedGoal = linkedGoalAssoc
        ? userGoals.find((g) => g.id === linkedGoalAssoc.goalId)?.name
        : undefined;

      return {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        isCompleted: completions.length > 0,
        streak,
        linkedGoal,
      };
    })
  );

  // Build goal contexts with progress
  const goalContexts: GoalContext[] = userGoals.map((goal) => {
    // Find habits linked to this goal
    const linkedHabitIds = associations
      .filter((a) => a.goalId === goal.id)
      .map((a) => a.habitId);

    const linkedHabits = habitContexts
      .filter((h) => linkedHabitIds.includes(h.id))
      .map((h) => h.name);

    // Calculate progress based on linked habit completions
    const completedCount = habitContexts
      .filter((h) => linkedHabitIds.includes(h.id) && h.isCompleted)
      .length;

    const progress =
      linkedHabitIds.length > 0
        ? Math.round((completedCount / linkedHabitIds.length) * 100)
        : 0;

    return {
      id: goal.id,
      name: goal.name,
      description: goal.description,
      category: goal.category,
      targetDate: goal.targetDate,
      isCompleted: goal.isCompleted,
      progress,
      linkedHabits,
    };
  });

  // Calculate summary stats
  const completedToday = habitContexts.filter((h) => h.isCompleted).length;
  const totalStreaks = habitContexts.reduce((sum, h) => sum + h.streak, 0);

  return {
    habits: habitContexts,
    goals: goalContexts,
    totalStreaks,
    completedToday,
    totalHabits: habitContexts.length,
  };
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messages, stream = true } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Fetch user context
    const userContext = await getUserContext(userId);

    // Build system prompt with user context
    const systemPrompt = buildSystemPrompt(userContext);

    // Prepare messages for OpenRouter
    const chatMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    if (stream) {
      // Streaming response
      const streamResponse = await createStreamingChatCompletion(chatMessages);
      const textStream = parseSSEStream(streamResponse);

      // Create a new ReadableStream that encodes the text for the response
      const encoder = new TextEncoder();
      const outputStream = new ReadableStream({
        async start(controller) {
          const reader = textStream.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(encoder.encode(value));
            }
          } finally {
            controller.close();
          }
        },
      });

      return new Response(outputStream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Non-streaming response (for compatibility)
      const { createChatCompletion } = await import("@/lib/ai/openrouter");
      const response = await createChatCompletion(chatMessages, {
        stream: false,
      });

      return NextResponse.json({
        content: response.choices[0]?.message?.content || "",
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
