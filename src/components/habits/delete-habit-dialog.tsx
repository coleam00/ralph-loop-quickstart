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
import type { Habit } from '@/lib/db';

interface DeleteHabitDialogProps {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitDeleted: () => void;
}

export function DeleteHabitDialog({
  habit,
  open,
  onOpenChange,
  onHabitDeleted,
}: DeleteHabitDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!habit) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete habit');
      }

      toast.success('Habit deleted successfully!');
      onOpenChange(false);
      onHabitDeleted();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Habit</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{habit?.name}&quot;? This action cannot
            be undone. All completion history for this habit will also be deleted.
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
