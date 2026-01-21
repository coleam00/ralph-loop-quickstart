"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export interface HabitSuggestion {
  name: string;
  description: string;
  frequency: "daily" | "weekly";
  reasoning: string;
  linkedGoalName?: string;
  linkedGoalId?: string;
}

interface HabitSuggestionCardProps {
  suggestion: HabitSuggestion;
  onAccepted?: () => void;
}

export function HabitSuggestionCard({ suggestion, onAccepted }: HabitSuggestionCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);

    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: suggestion.name,
          description: suggestion.description,
          frequency: suggestion.frequency,
          goalId: suggestion.linkedGoalId || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create habit");
      }

      setIsAccepted(true);
      toast.success(`Habit "${suggestion.name}" created!`);
      onAccepted?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create habit");
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <Card className={isAccepted ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{suggestion.name}</CardTitle>
          <span className={`text-xs px-2 py-1 rounded-full ${
            suggestion.frequency === "daily"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
          }`}>
            {suggestion.frequency}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <span className="font-medium">Why this habit: </span>
          {suggestion.reasoning}
        </div>
        {suggestion.linkedGoalName && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 13V2l8 4-8 4" />
              <path d="M20.55 10.23A9 9 0 1 1 8 4.94" />
              <path d="M8 10a5 5 0 1 0 8.9 2.02" />
            </svg>
            <span>Supports goal: {suggestion.linkedGoalName}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleAccept}
          disabled={isAccepting || isAccepted}
          className="w-full"
          variant={isAccepted ? "outline" : "default"}
        >
          {isAccepted ? (
            <>
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
                className="mr-2 text-green-600"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Added to Habits
            </>
          ) : isAccepting ? (
            "Creating..."
          ) : (
            <>
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
                className="mr-2"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Accept Suggestion
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
