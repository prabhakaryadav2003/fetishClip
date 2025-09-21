import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise"; // MySQL/MariaDB driver
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

// Create a MariaDB/MySQL connection pool
export const client = mysql.createPool({
  host: process.env.MARIADB_HOST,
  port: process.env.MARIADB_PORT ? Number(process.env.MARIADB_PORT) : 3306,
  database: process.env.MARIADB_DB,
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize Drizzle with the MySQL/MariaDB client
export const db = drizzle(client, { schema, mode: "default" });
