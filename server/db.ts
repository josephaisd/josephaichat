import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "@shared/schema";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// Check for DATABASE_URL - it should be set when database is provisioned
if (!process.env.DATABASE_URL) {
  console.warn(
    "⚠️  DATABASE_URL not found. Database functionality will not work.",
    "Please provision a PostgreSQL database in Replit."
  );
}

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/placeholder"
});

export const db = drizzle({ client: pool, schema });
