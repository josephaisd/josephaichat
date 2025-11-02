import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { AI_MODE_CONFIGS, AI_MODES, type AiMode } from "../shared/ai-modes.js";

const githubToken = process.env.GITHUB_TOKEN;
const openrouterToken = process.env.OPENROUTER_API_KEY;

const githubClient = githubToken ? new OpenAI({ 
  baseURL: "https://models.github.ai/inference", 
  apiKey: githubToken 
}) : null;

const openrouterClient = openrouterToken ? new OpenAI({ 
  baseURL: "https://openrouter.ai/api/v1", 
  apiKey: openrouterToken 
}) : null;

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string | null;
}

async function tryGenerateWithClient(
  client: OpenAI,
  modelName: string,
  formattedMessages: ChatCompletionMessageParam[],
  modeConfig: any
): Promise<string> {
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
}

export async function generateAIResponse(messages: Message[], mode: AiMode = AI_MODES.STANDARD): Promise<string> {
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

  const modeConfig = AI_MODE_CONFIGS[mode] || AI_MODE_CONFIGS[AI_MODES.STANDARD];

  // Try GitHub AI first
  if (githubClient) {
    try {
      console.log("[AI] Trying GitHub AI...");
      const response = await tryGenerateWithClient(
        githubClient,
        "openai/gpt-4o",
        formattedMessages,
        modeConfig
      );
      console.log("[AI] GitHub AI succeeded");
      return response;
    } catch (error: any) {
      console.log("[AI] GitHub AI failed:", error.status || error.message);
      
      // If GitHub fails, try OpenRouter as fallback
      if (openrouterClient) {
        try {
          console.log("[AI] Falling back to OpenRouter...");
          const response = await tryGenerateWithClient(
            openrouterClient,
            "openai/gpt-4o",
            formattedMessages,
            modeConfig
          );
          console.log("[AI] OpenRouter succeeded");
          return response;
        } catch (openrouterError) {
          console.error("[AI] OpenRouter also failed:", openrouterError);
          throw new Error("Failed to generate AI response from both providers");
        }
      } else {
        console.error("[AI] No fallback available (OpenRouter not configured)");
        throw error;
      }
    }
  } else if (openrouterClient) {
    // If no GitHub token, use OpenRouter directly
    try {
      console.log("[AI] Using OpenRouter (GitHub not configured)...");
      const response = await tryGenerateWithClient(
        openrouterClient,
        "openai/gpt-4o",
        formattedMessages,
        modeConfig
      );
      return response;
    } catch (error) {
      console.error("[AI] OpenRouter error:", error);
      throw new Error("Failed to generate AI response");
    }
  } else {
    throw new Error("No AI providers configured. Please set GITHUB_TOKEN or OPENROUTER_API_KEY");
  }
}
