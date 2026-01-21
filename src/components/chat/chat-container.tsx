"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, ChatMessageSkeleton, Message } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";
import { HabitSuggestionCard, HabitSuggestion } from "./habit-suggestion-card";
import { toast } from "sonner";

const SUGGESTED_PROMPTS = [
  "What habits should I focus on to improve my productivity?",
  "How can I build a consistent morning routine?",
  "Give me tips to maintain my current streaks",
  "What small habits can help reduce stress?",
];

interface ChatContainerProps {
  onInsightSaved?: () => void;
}

export function ChatContainer({ onInsightSaved }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<HabitSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Extract and save insights from conversation
  const extractInsight = async (userMessage: string, assistantResponse: string) => {
    try {
      const response = await fetch("/api/insights/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage,
          assistantResponse,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.saved && onInsightSaved) {
          onInsightSaved();
        }
      }
    } catch (error) {
      console.error("Error extracting insight:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create a placeholder for the assistant message that will be updated with streamed content
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: false, // Use non-streaming for better compatibility
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Check if response is streaming (text/plain) or JSON
      const contentType = response.headers.get("content-type") || "";

      let finalResponse = "";

      if (contentType.includes("text/plain") && response.body) {
        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          // Update the assistant message with accumulated content
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: accumulatedContent }
                : m
            )
          );
        }
        finalResponse = accumulatedContent;
      } else {
        // Handle JSON response (fallback for non-streaming)
        const data = await response.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...m, content: data.content } : m
          )
        );
        finalResponse = data.content;
      }

      // Extract insights from the conversation (runs in background)
      if (finalResponse) {
        extractInsight(content, finalResponse);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: "I'm sorry, I encountered an error. Please try again.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleGetSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setSuggestions([]);

    try {
      const response = await fetch("/api/chat/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get suggestions");
      }

      const data = await response.json();

      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        toast.success("Here are some habit suggestions based on your goals!");
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error getting suggestions:", error);
      toast.error("Failed to get suggestions. Please try again.");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSuggestionAccepted = () => {
    // Optionally refresh suggestions or update state
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Suggestions Panel */}
      {(suggestions.length > 0 || isLoadingSuggestions) && (
        <div className="border-b bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
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
                className="text-yellow-500"
              >
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547Z" />
              </svg>
              <span className="font-medium">AI Habit Suggestions</span>
            </div>
            {suggestions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSuggestions}
                className="text-xs"
              >
                Dismiss
              </Button>
            )}
          </div>
          {isLoadingSuggestions ? (
            <div className="grid gap-3 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {suggestions.map((suggestion, index) => (
                <HabitSuggestionCard
                  key={index}
                  suggestion={suggestion}
                  onAccepted={handleSuggestionAccepted}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center space-y-6 max-w-md">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Start a conversation</p>
                <p className="text-sm text-muted-foreground">
                  Your AI coach is ready to help you build better habits.
                </p>
              </div>
              {/* Get Habit Suggestions Button */}
              <Button
                onClick={handleGetSuggestions}
                disabled={isLoadingSuggestions}
                variant="default"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                {isLoadingSuggestions ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Analyzing your goals...
                  </>
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
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547Z" />
                    </svg>
                    Get AI Habit Suggestions
                  </>
                )}
              </Button>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Or try a suggested prompt
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTED_PROMPTS.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
                      onClick={() => handleSuggestedPrompt(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading &&
              messages[messages.length - 1]?.content === "" && (
                <ChatMessageSkeleton />
              )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom action bar with Get Suggestions button */}
      <div className="border-t px-4 py-2 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGetSuggestions}
          disabled={isLoadingSuggestions || isLoading}
          className="shrink-0"
        >
          {isLoadingSuggestions ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </>
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
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547Z" />
              </svg>
              Get Suggestions
            </>
          )}
        </Button>
        <div className="flex-1">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading || isLoadingSuggestions} />
        </div>
      </div>
    </div>
  );
}
