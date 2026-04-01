import OpenAI from "openai";
import {
  type AgentInputMessage,
  type ChatAgent,
  type ToolLifecycleHooks,
} from "@/lib/chat/chat-service";
import { getRegisteredTools } from "@/lib/tools/registered-tools";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_SYSTEM_PROMPT =
  "You are Studio Assistant Agent. Use tools only when needed, prioritize knowledge_search for uploaded-document questions, and never fabricate tool results.";

function mapToInput(messages: AgentInputMessage[]) {
  return messages.map((item) => ({
    role: item.role,
    content: item.content,
  }));
}

function truncate(text: string, max = 180): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) {
    return compact;
  }
  return `${compact.slice(0, max)}...`;
}

export function createResponsesAgent(): ChatAgent {
  const tools = getRegisteredTools();
  const toolMap = new Map(tools.map((tool) => [tool.name, tool]));

  return {
    async reply(messages: AgentInputMessage[], hooks?: ToolLifecycleHooks) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not configured.");
      }

      const client = new OpenAI({ apiKey });
      const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

      const openAiTools = tools.map((tool) => ({
        type: "function" as const,
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        strict: false,
      }));

      let response = await client.responses.create({
        model,
        input: [
          {
            role: "system",
            content: process.env.OPENAI_SYSTEM_PROMPT ?? DEFAULT_SYSTEM_PROMPT,
          },
          ...mapToInput(messages),
        ],
        tools: openAiTools,
      });

      for (let step = 0; step < 8; step += 1) {
        const outputItems = Array.isArray((response as { output?: unknown[] }).output)
          ? ((response as { output: unknown[] }).output as Array<Record<string, unknown>>)
          : [];

        const functionCalls = outputItems.filter((item) => item.type === "function_call");

        if (functionCalls.length === 0) {
          break;
        }

        const toolOutputs: Array<{
          type: "function_call_output";
          call_id: string;
          output: string;
        }> = [];

        for (const call of functionCalls) {
          const callId =
            typeof call.call_id === "string" && call.call_id
              ? call.call_id
              : `${String(call.name)}-${Date.now()}`;

          const toolName = typeof call.name === "string" ? call.name : "unknown_tool";
          const rawArgs = typeof call.arguments === "string" ? call.arguments : "{}";

          let parsedArgs: unknown = {};
          try {
            parsedArgs = JSON.parse(rawArgs);
          } catch {
            parsedArgs = {};
          }

          const tool = toolMap.get(toolName);
          const startAt = new Date();
          await hooks?.onToolStart?.({
            callId,
            toolName,
            inputSummary: tool ? tool.summarizeInput(parsedArgs) : truncate(rawArgs, 120),
            startedAt: startAt,
          });

          if (!tool) {
            const message = `Tool '${toolName}' is not registered.`;
            await hooks?.onToolEnd?.({
              callId,
              status: "failed",
              outputSummary: message,
              endedAt: new Date(),
            });

            toolOutputs.push({
              type: "function_call_output",
              call_id: callId,
              output: JSON.stringify({ ok: false, error: message }),
            });
            continue;
          }

          try {
            const result = await tool.execute(parsedArgs);
            await hooks?.onToolEnd?.({
              callId,
              status: "success",
              outputSummary: result.outputSummary,
              endedAt: new Date(),
            });

            toolOutputs.push({
              type: "function_call_output",
              call_id: callId,
              output: JSON.stringify({ ok: true, result: result.output }),
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : "Tool execution failed.";

            await hooks?.onToolEnd?.({
              callId,
              status: "failed",
              outputSummary: message,
              endedAt: new Date(),
            });

            toolOutputs.push({
              type: "function_call_output",
              call_id: callId,
              output: JSON.stringify({ ok: false, error: message }),
            });
          }
        }

        response = await client.responses.create({
          model,
          previous_response_id: response.id,
          input: toolOutputs,
          tools: openAiTools,
        });
      }

      const content = response.output_text?.trim();
      if (!content) {
        throw new Error("Model returned empty output.");
      }

      return content;
    },
  };
}

