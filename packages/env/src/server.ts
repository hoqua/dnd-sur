import { z } from 'zod';

// Server environment schema - minimal required variables
const serverEnvSchema = z.object({
  // Database
  POSTGRES_URL: z.string().url('Invalid PostgreSQL URL'),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const getServerEnv = () => serverEnvSchema.parse(process.env);