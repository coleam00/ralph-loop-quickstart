"use client";

import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium">
            {isUser ? "You" : "AI Coach"}
          </span>
          <span className="text-xs opacity-70">
            {message.createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

interface ChatMessageSkeletonProps {
  isUser?: boolean;
}

export function ChatMessageSkeleton({ isUser = false }: ChatMessageSkeletonProps) {
  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3 animate-pulse",
          isUser ? "bg-primary/50" : "bg-muted"
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="h-3 w-16 bg-current opacity-20 rounded" />
          <div className="h-3 w-10 bg-current opacity-20 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-48 bg-current opacity-20 rounded" />
          <div className="h-3 w-36 bg-current opacity-20 rounded" />
        </div>
      </div>
    </div>
  );
}
