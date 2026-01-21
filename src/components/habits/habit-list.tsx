'use client';

import { useEffect, useState, useCallback } from 'react';
import { HabitCard } from './habit-card';
import { AddHabitDialog } from './add-habit-dialog';
import { EditHabitDialog } from './edit-habit-dialog';
import { DeleteHabitDialog } from './delete-habit-dialog';
import type { Habit } from '@/lib/db';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  milestone: string | null;
  milestoneColor: string;
}

interface HabitWithCompletion extends Habit {
  isCompleted: boolean;
  streakData: StreakData | null;
}

export function HabitList() {
  const [habits, setHabits] = useState<HabitWithCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchCompletionStatus = useCallback(async (habitId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/habits/${habitId}/completions`);
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      return data.isCompleted;
    } catch {
      return false;
    }
  }, []);

  const fetchStreakData = useCallback(async (habitId: string): Promise<StreakData | null> => {
    try {
      const response = await fetch(`/api/habits/${habitId}/streak`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch {
      return null;
    }
  }, []);

  const fetchHabits = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/habits');
      if (!response.ok) {
        throw new Error('Failed to fetch habits');
      }
      const habitsData: Habit[] = await response.json();

      // Fetch completion status and streak data for each habit in parallel
      const habitsWithData = await Promise.all(
        habitsData.map(async (habit) => {
          const [isCompleted, streakData] = await Promise.all([
            fetchCompletionStatus(habit.id),
            fetchStreakData(habit.id),
          ]);
          return { ...habit, isCompleted, streakData };
        })
      );

      setHabits(habitsWithData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  }, [fetchCompletionStatus, fetchStreakData]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditDialogOpen(true);
  };

  const handleDelete = (habit: Habit) => {
    setDeletingHabit(habit);
    setDeleteDialogOpen(true);
  };

  const handleCompletionChange = (habitId: string, isCompleted: boolean) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === habitId ? { ...habit, isCompleted } : habit
      )
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
            <p className="text-muted-foreground">
              Manage your daily and weekly habits.
            </p>
          </div>
          <AddHabitDialog onHabitAdded={fetchHabits} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
            <p className="text-muted-foreground">
              Manage your daily and weekly habits.
            </p>
          </div>
          <AddHabitDialog onHabitAdded={fetchHabits} />
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={fetchHabits}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">
            Manage your daily and weekly habits.
          </p>
        </div>
        <AddHabitDialog onHabitAdded={fetchHabits} />
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto text-muted-foreground mb-4"
          >
            <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <h3 className="text-lg font-medium mb-1">No habits yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first habit to start building consistency.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isCompleted={habit.isCompleted}
              streak={habit.streakData?.currentStreak ?? 0}
              milestone={habit.streakData?.milestone ?? null}
              milestoneColor={habit.streakData?.milestoneColor ?? 'text-muted-foreground'}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCompletionChange={handleCompletionChange}
            />
          ))}
        </div>
      )}

      <EditHabitDialog
        habit={editingHabit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onHabitUpdated={fetchHabits}
      />

      <DeleteHabitDialog
        habit={deletingHabit}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onHabitDeleted={fetchHabits}
      />
    </div>
  );
}
