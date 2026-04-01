export const SUPPORTED_KNOWLEDGE_EXTENSIONS = ["txt", "md"] as const;
const MAX_FILE_BYTES = 1_000_000;

export class KnowledgeFileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KnowledgeFileValidationError";
  }
}

export type ParsedKnowledgeFile = {
  name: string;
  type: "txt" | "md";
  content: string;
};

function getExtension(fileName: string): string {
  const index = fileName.lastIndexOf(".");
  if (index < 0) {
    return "";
  }
  return fileName.slice(index + 1).toLowerCase();
}

function isSupportedExtension(ext: string): ext is "txt" | "md" {
  return (SUPPORTED_KNOWLEDGE_EXTENSIONS as readonly string[]).includes(ext);
}

export async function parseKnowledgeFile(file: File): Promise<ParsedKnowledgeFile> {
  if (!file || typeof file.name !== "string") {
    throw new KnowledgeFileValidationError("No upload file found.");
  }

  if (file.size <= 0) {
    throw new KnowledgeFileValidationError("Uploaded file is empty.");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new KnowledgeFileValidationError("File is too large. Max size is 1MB.");
  }

  const extension = getExtension(file.name);
  if (!isSupportedExtension(extension)) {
    throw new KnowledgeFileValidationError(
      "Unsupported file type. Only .txt and .md are allowed.",
    );
  }

  const rawText = await file.text();
  const normalized = rawText.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    throw new KnowledgeFileValidationError("Uploaded file has no readable text.");
  }

  return {
    name: file.name,
    type: extension,
    content: normalized,
  };
}
