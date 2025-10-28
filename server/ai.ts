import OpenAI from "openai";

const api = new OpenAI({
  baseURL: 'https://api.aimlapi.com/v1',
  apiKey: process.env.AIMLAPI_API_KEY,
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function generateAIResponse(messages: Message[]): Promise<string> {
  try {
    const result = await api.chat.completions.create({
      model: 'deepseek/deepseek-thinking-v3.2-exp',
      messages: messages,
      temperature: 0.7,
      top_p: 0.7,
      frequency_penalty: 1,
      max_tokens: 4096,
    });

    return result.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("AI API error:", error);
    throw new Error("Failed to generate AI response");
  }
}
