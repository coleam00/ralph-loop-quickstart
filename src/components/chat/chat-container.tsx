"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, ChatMessageSkeleton, Message } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";

const SUGGESTED_PROMPTS = [
  "What habits should I focus on to improve my productivity?",
  "How can I build a consistent morning routine?",
  "Give me tips to maintain my current streaks",
  "What small habits can help reduce stress?",
];

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

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
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex-1 flex flex-col">
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
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Suggested prompts
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
            {isLoading && <ChatMessageSkeleton />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
