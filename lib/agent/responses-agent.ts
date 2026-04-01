import OpenAI from "openai";
import { type AgentInputMessage, type ChatAgent } from "@/lib/chat/chat-service";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_SYSTEM_PROMPT =
  "You are Studio Assistant Agent. Provide clear and concise answers. If uncertain, say so directly.";

function mapToInput(messages: AgentInputMessage[]) {
  return messages.map((item) => ({
    role: item.role,
    content: item.content,
  }));
}

export function createResponsesAgent(): ChatAgent {
  return {
    async reply(messages) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not configured.");
      }

      const client = new OpenAI({ apiKey });

      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL ?? DEFAULT_MODEL,
        input: [
          {
            role: "system",
            content: process.env.OPENAI_SYSTEM_PROMPT ?? DEFAULT_SYSTEM_PROMPT,
          },
          ...mapToInput(messages),
        ],
      });

      const content = response.output_text?.trim();
      if (!content) {
        throw new Error("Model returned empty output.");
      }

      return content;
    },
  };
}
