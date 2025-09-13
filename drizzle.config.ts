import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host:
      process.env.POSTGRES_HOST ??
      (() => {
        throw new Error("POSTGRES_HOST is not set");
      })(),
    port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
    database:
      process.env.POSTGRES_DB ??
      (() => {
        throw new Error("POSTGRES_DB is not set");
      })(),
    user: process.env.POSTGRES_USER ?? "",
    password: process.env.POSTGRES_PASSWORD ?? "",
  },
} satisfies Config;
