import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      (() => {
        throw new Error("POSTGRES_URL is not set");
      })(),
  },
} satisfies Config;
