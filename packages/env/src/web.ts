import { z } from 'zod';

// Web environment schema - all variables
const webEnvSchema = z.object({
  // Database
  POSTGRES_URL: z.string().url('Invalid PostgreSQL URL'),
  
  // Authentication
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // AI APIs
  OPENAI_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),
  
  // Storage
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  REDIS_URL: z.string().optional(),
  
  // World server
  WORLD_SERVER_URL: z.string().url().default('http://localhost:3001'),
  NEXT_PUBLIC_WORLD_SERVER_URL: z.string().url().default('http://localhost:3001'),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

export const webEnv = webEnvSchema.parse(process.env);