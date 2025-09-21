import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "mysql",
  dbCredentials: {
    host:
      process.env.MARIADB_HOST ??
      (() => {
        throw new Error("MARIADB_HOST is not set");
      })(),
    port: process.env.MARIADB_PORT ? Number(process.env.MARIADB_PORT) : 3306,
    database:
      process.env.MARIADB_DB ??
      (() => {
        throw new Error("MARIADB_DB is not set");
      })(),
    user: process.env.MARIADB_USER ?? "",
    password: process.env.MARIADB_PASSWORD ?? "",
  },
} satisfies Config;
