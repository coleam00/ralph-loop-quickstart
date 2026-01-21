'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Habit } from '@/lib/db';

interface HabitCardProps {
  habit: Habit;
  isCompleted?: boolean;
  streak?: number;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  onCompletionChange?: (habitId: string, isCompleted: boolean) => void;
}

export function HabitCard({
  habit,
  isCompleted = false,
  streak = 0,
  onEdit,
  onDelete,
  onCompletionChange
}: HabitCardProps) {
  const [completing, setCompleting] = useState(false);
  const [optimisticCompleted, setOptimisticCompleted] = useState(isCompleted);

  const handleToggleCompletion = async () => {
    if (completing) return;

    setCompleting(true);
    const previousState = optimisticCompleted;

    // Optimistic update
    setOptimisticCompleted(!previousState);

    try {
      if (previousState) {
        // Uncomplete
        const response = await fetch(`/api/habits/${habit.id}/completions`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to uncomplete habit');
        }

        toast.success('Habit marked as incomplete');
      } else {
        // Complete
        const response = await fetch(`/api/habits/${habit.id}/completions`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          if (data.error === 'Habit already completed for this period') {
            setOptimisticCompleted(true);
            toast.info('Habit already completed for this period');
            return;
          }
          throw new Error(data.error || 'Failed to complete habit');
        }

        toast.success('Habit completed!');
      }

      onCompletionChange?.(habit.id, !previousState);
    } catch (error) {
      // Revert optimistic update
      setOptimisticCompleted(previousState);
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setCompleting(false);
    }
  };

  // Sync with prop when it changes
  if (isCompleted !== optimisticCompleted && !completing) {
    setOptimisticCompleted(isCompleted);
  }

  return (
    <Card className={`transition-all duration-200 ${optimisticCompleted ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleCompletion}
              disabled={completing}
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                optimisticCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-muted-foreground/50 hover:border-green-500'
              } ${completing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label={optimisticCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {optimisticCompleted && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <CardTitle className={`text-lg ${optimisticCompleted ? 'text-green-700 dark:text-green-400' : ''}`}>
              {habit.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-secondary px-2 py-1 rounded-full capitalize">
              {habit.frequency}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(habit)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
              <span className="sr-only">Edit habit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(habit)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
              <span className="sr-only">Delete habit</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {habit.description && (
          <p className={`text-sm mb-3 ${optimisticCompleted ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
            {habit.description}
          </p>
        )}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-orange-500"
            >
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
            <span className="font-medium">
              {streak} {habit.frequency === 'daily' ? 'day' : 'week'} streak
            </span>
          </div>
          {optimisticCompleted && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              Completed
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
