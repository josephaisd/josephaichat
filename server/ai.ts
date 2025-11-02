import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { AI_MODE_CONFIGS, AI_MODES, type AiMode } from "../shared/ai-modes.js";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const modelName = "openai/gpt-4o";

const client = new OpenAI({ 
  baseURL: endpoint, 
  apiKey: token 
});

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string | null;
}

export async function generateAIResponse(messages: Message[], mode: AiMode = AI_MODES.STANDARD): Promise<string> {
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
                url: msg.imageUrl,
                detail: "low" as const
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

    // Get system prompt based on mode
    const modeConfig = AI_MODE_CONFIGS[mode] || AI_MODE_CONFIGS[AI_MODES.STANDARD];
    
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        { 
          role: "system", 
          content: modeConfig.systemPrompt
        },
        ...formattedMessages
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("AI API error:", error);
    throw new Error("Failed to generate AI response");
  }
}
