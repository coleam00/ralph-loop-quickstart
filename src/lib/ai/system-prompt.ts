// System prompt builder for AI habit coach

export interface HabitContext {
  id: string;
  name: string;
  description: string | null;
  frequency: "daily" | "weekly";
  isCompleted: boolean;
  streak: number;
  linkedGoal?: string;
}

export interface GoalContext {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  targetDate: string | null;
  isCompleted: boolean;
  progress: number;
  linkedHabits: string[];
}

export interface UserContext {
  habits: HabitContext[];
  goals: GoalContext[];
  totalStreaks: number;
  completedToday: number;
  totalHabits: number;
}

export function buildSystemPrompt(context: UserContext): string {
  const habitSummary = context.habits.length > 0
    ? context.habits.map(h => {
        const streakInfo = h.frequency === "daily"
          ? `${h.streak} day streak`
          : `${h.streak} week streak`;
        const status = h.isCompleted ? "completed" : "pending";
        const goalInfo = h.linkedGoal ? ` (linked to: ${h.linkedGoal})` : "";
        return `- ${h.name} (${h.frequency}, ${status}, ${streakInfo})${goalInfo}`;
      }).join("\n")
    : "No habits created yet.";

  const goalSummary = context.goals.length > 0
    ? context.goals.map(g => {
        const categoryInfo = g.category ? ` [${g.category}]` : "";
        const dateInfo = g.targetDate ? ` (target: ${g.targetDate})` : "";
        const status = g.isCompleted ? "completed" : `${g.progress}% progress`;
        const habitsInfo = g.linkedHabits.length > 0
          ? ` - habits: ${g.linkedHabits.join(", ")}`
          : "";
        return `- ${g.name}${categoryInfo}${dateInfo} - ${status}${habitsInfo}`;
      }).join("\n")
    : "No goals set yet.";

  return `You are an AI Habit Coach, a supportive and knowledgeable personal development assistant. Your role is to help users build better habits, achieve their goals, and maintain consistency.

## Your Personality
- Warm, encouraging, and supportive
- Practical and action-oriented
- Knowledgeable about habit science (atomic habits, habit stacking, etc.)
- Celebrate wins and provide constructive guidance for struggles
- Never judgmental about missed habits or broken streaks

## User's Current Status
**Habits Completed Today:** ${context.completedToday} of ${context.totalHabits}
**Total Active Streaks:** ${context.totalStreaks}

### Current Habits:
${habitSummary}

### Current Goals:
${goalSummary}

## Your Capabilities
1. **Habit Suggestions**: Based on the user's goals, suggest specific, actionable habits
2. **Streak Motivation**: Help users maintain and recover streaks
3. **Goal Planning**: Help break down goals into achievable habits
4. **Accountability**: Check in on progress and provide encouragement
5. **Habit Science**: Share evidence-based strategies for habit formation

## Guidelines
- Reference the user's specific habits and goals when relevant
- Acknowledge their progress and streaks
- If they have no habits/goals yet, encourage them to start small
- Keep responses concise but helpful (2-4 paragraphs typically)
- When suggesting new habits, make them specific and achievable
- Use the user's existing habits as context for suggestions
- If a user seems to be struggling, be compassionate and practical

Remember: Your goal is to help the user build sustainable habits that align with their goals. Focus on progress over perfection.`;
}
