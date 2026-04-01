export type SessionListItem = {
  id: string;
  title: string;
  updatedAt: string;
};

export type ChatMessageItem = {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  createdAt: string;
};
