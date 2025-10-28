import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "@shared/schema";
import ws from "ws";

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL!,
  ...(typeof window === 'undefined' && { webSocketConstructor: ws })
});

export const db = drizzle(pool, { schema });
