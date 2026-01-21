import { ChatMessage, createChatCompletion } from "./openrouter";

export interface ExtractedInsight {
  insight: string;
  context: {
    relatedHabits?: string[];
    relatedGoals?: string[];
    topic?: string;
  };
}

const INSIGHT_EXTRACTION_PROMPT = `You are an insight extraction assistant. Your job is to analyze conversations between a user and their AI habit coach and extract key insights that should be remembered.

Extract insights that are:
1. Personal realizations or commitments the user made
2. Challenges or obstacles the user mentioned
3. Progress updates or achievements shared
4. Goals or intentions the user expressed
5. Patterns in their behavior they mentioned

Return a JSON object with the following structure:
{
  "hasInsight": boolean,
  "insight": string (if hasInsight is true, a concise 1-2 sentence summary of the key insight),
  "context": {
    "relatedHabits": string[] (names of habits mentioned, if any),
    "relatedGoals": string[] (names of goals mentioned, if any),
    "topic": string (brief topic category like "motivation", "challenges", "progress", "planning")
  }
}

Only extract insights that are meaningful and worth remembering. If the conversation is just a greeting or simple question/answer, set hasInsight to false.`;

export async function extractInsightFromConversation(
  userMessage: string,
  assistantResponse: string
): Promise<ExtractedInsight | null> {
  try {
    const messages: ChatMessage[] = [
      { role: "system", content: INSIGHT_EXTRACTION_PROMPT },
      {
        role: "user",
        content: `Analyze this conversation exchange and extract any key insights:

User: ${userMessage}

AI Coach: ${assistantResponse}`,
      },
    ];

    const response = await createChatCompletion(messages, {
      stream: false,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return null;
    }

    // Try to parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.hasInsight || !parsed.insight) {
      return null;
    }

    return {
      insight: parsed.insight,
      context: {
        relatedHabits: parsed.context?.relatedHabits || [],
        relatedGoals: parsed.context?.relatedGoals || [],
        topic: parsed.context?.topic || "general",
      },
    };
  } catch (error) {
    console.error("Error extracting insight:", error);
    return null;
  }
}
