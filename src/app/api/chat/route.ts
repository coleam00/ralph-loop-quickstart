import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Placeholder response - will be replaced with OpenRouter integration in Task 13
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || "";

    // Simple placeholder responses based on keywords
    let response =
      "I'm your AI habit coach! I'm here to help you build better habits and achieve your goals. " +
      "Once fully connected, I'll be able to see your habits, goals, and progress to give you personalized advice.";

    if (userMessage.toLowerCase().includes("habit")) {
      response =
        "Building good habits is all about consistency and starting small. " +
        "Focus on making your habits easy to start and rewarding to complete. " +
        "Would you like some specific suggestions based on your goals?";
    } else if (userMessage.toLowerCase().includes("streak")) {
      response =
        "Maintaining streaks is a powerful motivator! The key is to never miss twice in a row. " +
        "If you slip up one day, get back on track immediately the next day. " +
        "What streak are you working on maintaining?";
    } else if (userMessage.toLowerCase().includes("goal")) {
      response =
        "Setting clear, achievable goals is the first step to success! " +
        "I recommend breaking big goals into smaller milestones and linking specific habits to each goal. " +
        "What goal would you like to work towards?";
    } else if (
      userMessage.toLowerCase().includes("morning") ||
      userMessage.toLowerCase().includes("routine")
    ) {
      response =
        "A solid morning routine sets the tone for your entire day! " +
        "Consider starting with just 2-3 habits: maybe hydration, a brief meditation, and reviewing your goals. " +
        "The key is consistency over complexity.";
    } else if (
      userMessage.toLowerCase().includes("productivity") ||
      userMessage.toLowerCase().includes("productive")
    ) {
      response =
        "To boost productivity, I recommend focusing on these habits: " +
        "1) Planning your day the night before, 2) Tackling your most important task first thing, " +
        "3) Taking regular breaks to maintain focus. Which area would you like to improve first?";
    } else if (
      userMessage.toLowerCase().includes("stress") ||
      userMessage.toLowerCase().includes("relax")
    ) {
      response =
        "Managing stress is crucial for long-term success! " +
        "Consider adding these habits: deep breathing exercises, a short daily walk, " +
        "or a 5-minute journaling practice. Small moments of calm add up over time.";
    }

    return NextResponse.json({ content: response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
