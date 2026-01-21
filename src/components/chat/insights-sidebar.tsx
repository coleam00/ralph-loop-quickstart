"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InsightContext {
  relatedHabits?: string[];
  relatedGoals?: string[];
  topic?: string;
}

interface Insight {
  id: string;
  insight: string;
  context: InsightContext | null;
  createdAt: string;
}

function getTopicColor(topic: string | undefined): string {
  switch (topic) {
    case "motivation":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "challenges":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "progress":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "planning":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface InsightsSidebarProps {
  refreshTrigger?: number;
}

export function InsightsSidebar({ refreshTrigger }: InsightsSidebarProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/insights");
      if (!response.ok) {
        throw new Error("Failed to fetch insights");
      }
      const data = await response.json();
      setInsights(data);
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError("Failed to load insights");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchInsights}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
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
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Insights
          {insights.length > 0 && (
            <span className="text-xs text-muted-foreground font-normal">
              ({insights.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-3 px-3">
        {insights.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547Z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">No insights yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Chat with your coach to generate insights
            </p>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-2"
            >
              <p className="text-sm leading-relaxed">{insight.insight}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {insight.context?.topic && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getTopicColor(
                      insight.context.topic
                    )}`}
                  >
                    {insight.context.topic}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDate(insight.createdAt)}
                </span>
              </div>
              {insight.context?.relatedHabits &&
                insight.context.relatedHabits.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {insight.context.relatedHabits.map((habit, i) => (
                      <span
                        key={i}
                        className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                      >
                        {habit}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
