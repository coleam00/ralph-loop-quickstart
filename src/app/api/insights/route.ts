import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatInsights } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const insights = await db
      .select()
      .from(chatInsights)
      .where(eq(chatInsights.userId, userId))
      .orderBy(desc(chatInsights.createdAt))
      .limit(20);

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { insight, context } = body;

    if (!insight || typeof insight !== "string") {
      return NextResponse.json(
        { error: "Insight text is required" },
        { status: 400 }
      );
    }

    const [newInsight] = await db
      .insert(chatInsights)
      .values({
        userId,
        insight: insight.trim(),
        context: context || null,
      })
      .returning();

    return NextResponse.json(newInsight, { status: 201 });
  } catch (error) {
    console.error("Error creating insight:", error);
    return NextResponse.json(
      { error: "Failed to create insight" },
      { status: 500 }
    );
  }
}
