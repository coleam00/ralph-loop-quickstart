'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { Goal } from '@/lib/db';

interface DeleteGoalDialogProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalDeleted: () => void;
}

export function DeleteGoalDialog({
  goal,
  open,
  onOpenChange,
  onGoalDeleted,
}: DeleteGoalDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!goal) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete goal');
      }

      toast.success('Goal deleted successfully!');
      onOpenChange(false);
      onGoalDeleted();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Goal</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{goal?.name}&quot;? This action cannot
            be undone and will also remove any habit associations with this goal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
