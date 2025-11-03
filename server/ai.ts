import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { AI_MODE_CONFIGS, AI_MODES, type AiMode } from "../shared/ai-modes.js";
import { processWithCustomModel } from "./customModelService.js";

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
  modeConfig: any,
  systemPromptOverride?: string
): Promise<string> {
  const response = await client.chat.completions.create({
    model: modelName,
    messages: [
      { 
        role: "system", 
        content: systemPromptOverride || modeConfig.systemPrompt
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

  if (mode === AI_MODES.UNPROFESSIONAL || mode === AI_MODES.J_REALISTIC) {
    const lastUserMessage = messages.filter(m => m.role === "user").pop();
    if (lastUserMessage) {
      try {
        const customResult = await processWithCustomModel(
          mode,
          lastUserMessage.content,
          mode
        );

        if (customResult.shouldUseCustom && customResult.customResponse) {
          console.log("[AI] Using custom event trigger response");
          return customResult.customResponse;
        }

        if (customResult.shouldUseCustom && (customResult.injectedMessage || customResult.basePrompt)) {
          console.log("[AI] Using custom model configuration");
          
          const baseSystemPrompt = customResult.basePrompt || modeConfig.systemPrompt;
          const enhancedSystemPrompt = customResult.injectedMessage 
            ? `${customResult.injectedMessage}\n\n${baseSystemPrompt}`
            : baseSystemPrompt;
          
          if (githubClient) {
            try {
              console.log("[AI] Trying GitHub AI with injected message...");
              const response = await tryGenerateWithClient(
                githubClient,
                "openai/gpt-4o",
                formattedMessages,
                modeConfig,
                enhancedSystemPrompt
              );
              console.log("[AI] GitHub AI succeeded");
              return response;
            } catch (error: any) {
              console.log("[AI] GitHub AI failed:", error.status || error.message);
              
              if (openrouterClient) {
                try {
                  console.log("[AI] Falling back to OpenRouter with injected message...");
                  const response = await tryGenerateWithClient(
                    openrouterClient,
                    "openai/gpt-4o",
                    formattedMessages,
                    modeConfig,
                    enhancedSystemPrompt
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
            try {
              console.log("[AI] Using OpenRouter with injected message (GitHub not configured)...");
              const response = await tryGenerateWithClient(
                openrouterClient,
                "openai/gpt-4o",
                formattedMessages,
                modeConfig,
                enhancedSystemPrompt
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
      } catch (error) {
        console.error("[AI] Error processing custom model:", error);
      }
    }
  }

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
