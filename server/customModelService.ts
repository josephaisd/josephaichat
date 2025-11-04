import { storage } from "./storage";
import type { AiMode } from "../shared/ai-modes.js";
import { z } from "zod";

const eventTriggerSchema = z.object({
  trigger: z.string(),
  response: z.string(),
});

export interface ProcessResult {
  shouldUseCustom: boolean;
  customResponse?: string;
  injectedMessage?: string;
  basePrompt?: string;
}

function checkEventTriggers(
  userMessage: string,
  eventTriggers: Array<{ trigger: string; response: string }>
): string | null {
  if (!eventTriggers || eventTriggers.length === 0) {
    return null;
  }

  const normalizedMessage = userMessage.toLowerCase().trim();

  for (const trigger of eventTriggers) {
    const normalizedTrigger = trigger.trigger.toLowerCase().trim();
    
    if (normalizedMessage.includes(normalizedTrigger)) {
      return trigger.response;
    }
  }

  return null;
}

function getRandomInjection(
  randomInjections: string[]
): string | null {
  if (!randomInjections || randomInjections.length === 0) {
    return null;
  }

  const randomValue = Math.random();
  const shouldInject = randomValue < 0.15;
  
  console.log(`[CustomModel] Random injection check: ${randomValue.toFixed(3)} < 0.99 = ${shouldInject}`);
  console.log(`[CustomModel] Available injections: ${randomInjections.length}`);
  
  if (shouldInject) {
    const randomIndex = Math.floor(Math.random() * randomInjections.length);
    const selectedMessage = randomInjections[randomIndex];
    console.log(`[CustomModel] Injecting message: "${selectedMessage}"`);
    return selectedMessage;
  }

  return null;
}

export async function processWithCustomModel(
  modeKey: string,
  userMessage: string,
  personalityMode: AiMode
): Promise<ProcessResult> {
  try {
    console.log(`[CustomModel] Processing request for mode: ${modeKey}`);
    const config = await storage.getCustomModelConfig(modeKey);

    if (!config) {
      console.log(`[CustomModel] No config found for mode: ${modeKey}`);
      return {
        shouldUseCustom: false,
      };
    }
    
    console.log(`[CustomModel] Config loaded for ${modeKey}:`, {
      hasBasePrompt: !!config.basePrompt,
      eventTriggersCount: Array.isArray(config.eventTriggers) ? config.eventTriggers.length : 0,
      randomInjectionsCount: Array.isArray(config.randomInjections) ? config.randomInjections.length : 0,
    });

    let eventTriggers: Array<{ trigger: string; response: string }> = [];
    let randomInjections: string[] = [];

    if (Array.isArray(config.eventTriggers)) {
      eventTriggers = config.eventTriggers.map((item: any) => {
        const parsed = eventTriggerSchema.safeParse(item);
        return parsed.success ? parsed.data : null;
      }).filter((item): item is { trigger: string; response: string } => item !== null);
    }

    if (Array.isArray(config.randomInjections)) {
      randomInjections = config.randomInjections.filter(
        (item): item is string => typeof item === "string"
      );
    }

    const eventResponse = checkEventTriggers(userMessage, eventTriggers);
    if (eventResponse) {
      return {
        shouldUseCustom: true,
        customResponse: eventResponse,
      };
    }

    const injectedMessage = getRandomInjection(randomInjections);
    
    const hasCustomBasePrompt = config.basePrompt && config.basePrompt.trim().length > 0;
    
    if (injectedMessage || hasCustomBasePrompt) {
      return {
        shouldUseCustom: true,
        injectedMessage: injectedMessage || undefined,
        basePrompt: hasCustomBasePrompt ? config.basePrompt : undefined,
      };
    }

    return {
      shouldUseCustom: false,
    };
  } catch (error) {
    console.error("Error in processWithCustomModel:", error);
    return {
      shouldUseCustom: false,
    };
  }
}
