'use client';

import { useEffect, useState, useCallback } from 'react';
import { GoalCard } from './goal-card';
import { AddGoalDialog } from './add-goal-dialog';
import { EditGoalDialog } from './edit-goal-dialog';
import { DeleteGoalDialog } from './delete-goal-dialog';
import { toast } from 'sonner';
import type { Goal } from '@/lib/db';

interface LinkedHabit {
  id: string;
  name: string;
  isCompleted: boolean;
}

interface GoalWithHabits extends Goal {
  linkedHabits: LinkedHabit[];
  progress: number;
}

export function GoalList() {
  const [goals, setGoals] = useState<GoalWithHabits[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/goals');
      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }
      const goalsData: Goal[] = await response.json();

      // Fetch habits for each goal
      const goalsWithHabits = await Promise.all(
        goalsData.map(async (goal) => {
          try {
            const habitsResponse = await fetch(`/api/goals/${goal.id}/habits`);
            if (habitsResponse.ok) {
              const habitsData = await habitsResponse.json();
              return {
                ...goal,
                linkedHabits: habitsData.habits.map((h: { id: string; name: string; isCompleted: boolean }) => ({
                  id: h.id,
                  name: h.name,
                  isCompleted: h.isCompleted,
                })),
                progress: habitsData.progress,
              };
            }
          } catch {
            // If fetching habits fails, continue without them
          }
          return { ...goal, linkedHabits: [], progress: 0 };
        })
      );

      setGoals(goalsWithHabits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setEditDialogOpen(true);
  };

  const handleDelete = (goal: Goal) => {
    setDeletingGoal(goal);
    setDeleteDialogOpen(true);
  };

  const handleToggleComplete = async (goal: Goal) => {
    const newCompletedState = !goal.isCompleted;

    // Optimistic update
    setGoals((prevGoals) =>
      prevGoals.map((g) =>
        g.id === goal.id ? { ...g, isCompleted: newCompletedState } : g
      )
    );

    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: goal.name,
          description: goal.description,
          category: goal.category,
          targetDate: goal.targetDate,
          isCompleted: newCompletedState,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update goal');
      }

      toast.success(newCompletedState ? 'Goal completed!' : 'Goal marked as incomplete');
    } catch {
      // Revert on error
      setGoals((prevGoals) =>
        prevGoals.map((g) =>
          g.id === goal.id ? { ...g, isCompleted: goal.isCompleted } : g
        )
      );
      toast.error('Failed to update goal');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
            <p className="text-muted-foreground">
              Set and track your personal goals.
            </p>
          </div>
          <AddGoalDialog onGoalAdded={fetchGoals} />
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
            <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
            <p className="text-muted-foreground">
              Set and track your personal goals.
            </p>
          </div>
          <AddGoalDialog onGoalAdded={fetchGoals} />
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={fetchGoals}
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
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">
            Set and track your personal goals.
          </p>
        </div>
        <AddGoalDialog onGoalAdded={fetchGoals} />
      </div>

      {goals.length === 0 ? (
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
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
          <h3 className="text-lg font-medium mb-1">No goals yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first goal to start working towards something meaningful.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              linkedHabits={goal.linkedHabits}
              progress={goal.progress}
            />
          ))}
        </div>
      )}

      <EditGoalDialog
        goal={editingGoal}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onGoalUpdated={fetchGoals}
      />

      <DeleteGoalDialog
        goal={deletingGoal}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onGoalDeleted={fetchGoals}
      />
    </div>
  );
}
