import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { getServerEnv } from '@dnd-sur/env/server';
import { worldRoutes } from './routes/world';

// Get the directory of this file and load .env.local from server root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

console.log('Loading .env.local from:', envPath);
config({ path: envPath });
const serverEnv = getServerEnv();
const fastify = Fastify({
  logger: true
});

// Register CORS
await fastify.register(cors, {
  origin: serverEnv.NODE_ENV !== 'production'
});

// Register routes
await fastify.register(worldRoutes, { prefix: '/api/world' });

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

await fastify.listen({ port: serverEnv.PORT, host: '0.0.0.0' });
console.log(`🚀 World server listening on port ${serverEnv.PORT}`);