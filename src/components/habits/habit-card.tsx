'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Habit } from '@/lib/db';

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{habit.name}</CardTitle>
          <span className="text-xs bg-secondary px-2 py-1 rounded-full capitalize">
            {habit.frequency}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {habit.description && (
          <p className="text-sm text-muted-foreground mb-3">{habit.description}</p>
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
            <span className="font-medium">0 day streak</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
