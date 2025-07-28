import Fastify from 'fastify';
import cors from '@fastify/cors';
import { worldRoutes } from './routes/world.js';

const fastify = Fastify({
  logger: true
});

// Register CORS
await fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production' ? false : true
});

// Register routes
await fastify.register(worldRoutes, { prefix: '/api/world' });

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 World server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();