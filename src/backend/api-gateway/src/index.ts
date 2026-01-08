import Fastify from 'fastify';
import cors from '@fastify/cors';
import proxy from '@fastify/http-proxy';

const PORT = Number(process.env.PORT) || 3000;

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});


await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
});


await fastify.register(import('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '1 minute',
});


fastify.get('/health', async () => ({ status: 'ok', service: 'api-gateway' }));

// Proxy to user-service (auth, users, 2fa, friends)
await fastify.register(proxy, {
  upstream: process.env.USER_SERVICE_URL || 'http://user-service:3001',
  prefix: '/api/auth',
  rewritePrefix: '/api/auth',
});

await fastify.register(proxy, {
  upstream: process.env.USER_SERVICE_URL || 'http://user-service:3001',
  prefix: '/api/users',
  rewritePrefix: '/api/users',
});

await fastify.register(proxy, {
  upstream: process.env.USER_SERVICE_URL || 'http://user-service:3001',
  prefix: '/api/2fa',
  rewritePrefix: '/api/2fa',
});

await fastify.register(proxy, {
  upstream: process.env.USER_SERVICE_URL || 'http://user-service:3001',
  prefix: '/api/friends',
  rewritePrefix: '/api/friends',
});

// Proxy to chat-service
await fastify.register(proxy, {
  upstream: process.env.CHAT_SERVICE_URL || 'http://chat-service:4000',
  prefix: '/api/chat',
  rewritePrefix: '/api/chat',
});

// Start server
try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(` API Gateway running on port ${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
