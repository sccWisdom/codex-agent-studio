import { db } from "@/lib/db/client";

export async function checkDatabaseHealth() {
  try {
    await db.$queryRaw`SELECT 1`;
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

