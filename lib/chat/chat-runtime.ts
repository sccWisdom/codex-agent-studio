import { createResponsesAgent } from "@/lib/agent/responses-agent";
import { createChatService } from "@/lib/chat/chat-service";
import { PrismaChatStore } from "@/lib/chat/prisma-chat-store";

const chatStore = new PrismaChatStore();

export function createRuntimeChatService() {
  return createChatService({
    store: chatStore,
    agent: createResponsesAgent(),
  });
}

export { chatStore };
