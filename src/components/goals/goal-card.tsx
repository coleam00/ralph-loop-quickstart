'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Goal } from '@/lib/db';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onToggleComplete: (goal: Goal) => void;
}

const categoryColors: Record<string, string> = {
  health: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  productivity: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  learning: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  fitness: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  mindfulness: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  finance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  relationships: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  career: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
};

export function GoalCard({ goal, onEdit, onDelete, onToggleComplete }: GoalCardProps) {
  const categoryClass = goal.category
    ? categoryColors[goal.category.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    : null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = goal.targetDate && !goal.isCompleted && new Date(goal.targetDate) < new Date();

  return (
    <Card className={`transition-all ${goal.isCompleted ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {categoryClass && goal.category && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryClass}`}>
                  {goal.category}
                </span>
              )}
              {goal.isCompleted && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 font-medium">
                  Completed
                </span>
              )}
              {isOverdue && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 font-medium">
                  Overdue
                </span>
              )}
            </div>
            <CardTitle className={`text-lg ${goal.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
              {goal.name}
            </CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onToggleComplete(goal)}
              title={goal.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {goal.isCompleted ? (
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
                  className="text-green-600"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
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
                  className="text-muted-foreground"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(goal)}
              title="Edit goal"
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
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(goal)}
              title="Delete goal"
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
            </Button>
          </div>
        </div>
        {goal.description && (
          <CardDescription className="mt-2">{goal.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {goal.targetDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span className={isOverdue ? 'text-red-600 dark:text-red-400' : ''}>
              Target: {formatDate(goal.targetDate)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
