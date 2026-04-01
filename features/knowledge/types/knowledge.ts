export type KnowledgeSourceItem = {
  id: string;
  name: string;
  type: string;
  contentPreview: string;
  createdAt: string;
};

export type KnowledgeSearchMatch = {
  sourceId: string;
  name: string;
  type: string;
  snippet: string;
};

export type KnowledgeSearchResult = {
  query: string;
  matches: KnowledgeSearchMatch[];
};
