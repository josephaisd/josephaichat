import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}` : 'http://localhost:5000',
    'X-Title': 'Replit Chat App',
  },
});

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string | null;
}

export async function generateAIResponse(messages: Message[]): Promise<string> {
  try {
    const formattedMessages: ChatCompletionMessageParam[] = messages.map((msg) => {
      if (msg.imageUrl && msg.role === "user") {
        return {
          role: msg.role,
          content: [
            {
              type: "text" as const,
              text: msg.content || "What's in this image?"
            },
            {
              type: "image_url" as const,
              image_url: {
                url: msg.imageUrl
              }
            }
          ]
        };
      }
      return {
        role: msg.role,
        content: msg.content
      };
    });

    const result = await openai.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 4096,
    });

    return result.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("AI API error:", error);
    throw new Error("Failed to generate AI response");
  }
}
