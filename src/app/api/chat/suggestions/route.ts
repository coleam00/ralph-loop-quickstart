import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { habits, habitCompletions, goals, habitGoals } from "@/lib/db/schema";
import { eq, and, gte, lt, desc } from "drizzle-orm";
import { createChatCompletion, ChatMessage } from "@/lib/ai/openrouter";
import {
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

export interface HabitSuggestion {
  name: string;
  description: string;
  frequency: "daily" | "weekly";
  reasoning: string;
  linkedGoalName?: string;
}

function buildSuggestionPrompt(context: UserContext): string {
  const habitList = context.habits.length > 0
    ? context.habits.map(h => `- ${h.name} (${h.frequency})`).join("\n")
    : "No habits created yet.";

  const goalList = context.goals.length > 0
    ? context.goals.map(g => `- ${g.name}${g.category ? ` [${g.category}]` : ""}${g.description ? `: ${g.description}` : ""}`).join("\n")
    : "No goals set yet.";

  return `You are an AI Habit Coach. Analyze the user's goals and current habits, then suggest 3 NEW habits that would help them achieve their goals.

## User's Current Habits:
${habitList}

## User's Current Goals:
${goalList}

## Instructions:
1. Suggest 3 specific, actionable habits that align with the user's goals
2. Do NOT suggest habits that are similar to ones they already have
3. Make each habit specific and achievable (not vague like "exercise more")
4. Explain WHY each habit would help with their goals
5. If the user has no goals, suggest foundational habits for personal development

## Response Format:
You MUST respond with ONLY a valid JSON array. No other text. Format:

[
  {
    "name": "Short habit name",
    "description": "Detailed description of the habit",
    "frequency": "daily" or "weekly",
    "reasoning": "Why this habit helps with their goals",
    "linkedGoalName": "Name of the goal this supports (or null)"
  }
]

Remember: Return ONLY the JSON array, no markdown code blocks, no other text.`;
}

export async function POST(_request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user context
    const userContext = await getUserContext(userId);

    // Build the suggestion prompt
    const suggestionPrompt = buildSuggestionPrompt(userContext);

    // Prepare messages for OpenRouter
    const chatMessages: ChatMessage[] = [
      { role: "system", content: suggestionPrompt },
      { role: "user", content: "Please suggest 3 habits that would help me achieve my goals." },
    ];

    // Get non-streaming response for structured data
    const response = await createChatCompletion(chatMessages, {
      stream: false,
    });

    const content = response.choices[0]?.message?.content || "";

    // Try to parse the JSON response
    try {
      // Clean up the response - remove any markdown code blocks if present
      let jsonStr = content.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      const suggestions: HabitSuggestion[] = JSON.parse(jsonStr);

      // Validate the suggestions structure
      const validatedSuggestions = suggestions.map((s) => ({
        name: String(s.name || ""),
        description: String(s.description || ""),
        frequency: s.frequency === "weekly" ? "weekly" : "daily" as const,
        reasoning: String(s.reasoning || ""),
        linkedGoalName: s.linkedGoalName ? String(s.linkedGoalName) : undefined,
      }));

      // Find goal IDs for linking
      const suggestionsWithGoalIds = validatedSuggestions.map((suggestion) => {
        if (suggestion.linkedGoalName) {
          const goal = userContext.goals.find(
            (g) => g.name.toLowerCase() === suggestion.linkedGoalName?.toLowerCase()
          );
          return {
            ...suggestion,
            linkedGoalId: goal?.id,
          };
        }
        return suggestion;
      });

      return NextResponse.json({ suggestions: suggestionsWithGoalIds });
    } catch {
      // If JSON parsing fails, return the raw content for display
      console.error("Failed to parse suggestions JSON:", content);
      return NextResponse.json({
        error: "Failed to parse suggestions",
        rawContent: content
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Suggestions API error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
