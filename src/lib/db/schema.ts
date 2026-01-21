import { pgTable, uuid, text, timestamp, boolean, date, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const frequencyEnum = pgEnum('frequency', ['daily', 'weekly']);

// Habits table
export const habits = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  frequency: frequencyEnum('frequency').notNull().default('daily'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// HabitCompletions table
export const habitCompletions = pgTable('habit_completions', {
  id: uuid('id').primaryKey().defaultRandom(),
  habitId: uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
  periodStart: date('period_start'),
});

// Goals table
export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  targetDate: date('target_date'),
  isCompleted: boolean('is_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// HabitGoals junction table
export const habitGoals = pgTable('habit_goals', {
  habitId: uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  goalId: uuid('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
});

// ChatInsights table for hybrid storage
export const chatInsights = pgTable('chat_insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  insight: text('insight').notNull(),
  context: jsonb('context'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const habitsRelations = relations(habits, ({ many }) => ({
  completions: many(habitCompletions),
  habitGoals: many(habitGoals),
}));

export const habitCompletionsRelations = relations(habitCompletions, ({ one }) => ({
  habit: one(habits, {
    fields: [habitCompletions.habitId],
    references: [habits.id],
  }),
}));

export const goalsRelations = relations(goals, ({ many }) => ({
  habitGoals: many(habitGoals),
}));

export const habitGoalsRelations = relations(habitGoals, ({ one }) => ({
  habit: one(habits, {
    fields: [habitGoals.habitId],
    references: [habits.id],
  }),
  goal: one(goals, {
    fields: [habitGoals.goalId],
    references: [goals.id],
  }),
}));

// Types for use in the application
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type NewHabitCompletion = typeof habitCompletions.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type HabitGoal = typeof habitGoals.$inferSelect;
export type NewHabitGoal = typeof habitGoals.$inferInsert;
export type ChatInsight = typeof chatInsights.$inferSelect;
export type NewChatInsight = typeof chatInsights.$inferInsert;
