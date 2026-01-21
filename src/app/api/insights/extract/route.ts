import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatInsights } from "@/lib/db/schema";
import { extractInsightFromConversation } from "@/lib/ai/insight-extraction";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userMessage, assistantResponse } = body;

    if (!userMessage || !assistantResponse) {
      return NextResponse.json(
        { error: "Both userMessage and assistantResponse are required" },
        { status: 400 }
      );
    }

    // Extract insight from the conversation
    const extractedInsight = await extractInsightFromConversation(
      userMessage,
      assistantResponse
    );

    if (!extractedInsight) {
      return NextResponse.json({ saved: false, reason: "No insight extracted" });
    }

    // Save the insight to the database
    const [newInsight] = await db
      .insert(chatInsights)
      .values({
        userId,
        insight: extractedInsight.insight,
        context: extractedInsight.context,
      })
      .returning();

    return NextResponse.json({
      saved: true,
      insight: newInsight,
    });
  } catch (error) {
    console.error("Error extracting/saving insight:", error);
    return NextResponse.json(
      { error: "Failed to extract insight" },
      { status: 500 }
    );
  }
}
