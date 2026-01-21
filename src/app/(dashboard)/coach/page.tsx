"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChatContainer, InsightsSidebar } from "@/components/chat";

export default function CoachPage() {
  const [insightRefreshTrigger, setInsightRefreshTrigger] = useState(0);

  const handleInsightSaved = () => {
    setInsightRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Coach</h1>
        <p className="text-muted-foreground">
          Chat with your AI habit coach for personalized guidance.
        </p>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle>Chat</CardTitle>
            <CardDescription>
              Ask questions, get habit suggestions, or discuss your progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden p-4 pt-0">
            <ChatContainer onInsightSaved={handleInsightSaved} />
          </CardContent>
        </Card>

        <div className="w-80 hidden lg:block">
          <InsightsSidebar refreshTrigger={insightRefreshTrigger} />
        </div>
      </div>
    </div>
  );
}
