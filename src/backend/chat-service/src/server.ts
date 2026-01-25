import Fastify from "fastify";
import cors from "@fastify/cors";
import { Server } from "socket.io";
import { setupSocket } from "./utils/socket.js";
import { chatRoutes } from "./route_chat.js";

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: number;
    };
  }
}

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: true, // Allow all origins for now, or specify your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  credentials: true
});

// Middleware to populate req.user from x-user-id header (Temporary solution)
fastify.addHook('preHandler', async (req, reply) => {
  const userId = req.headers['x-user-id'];
  if (userId) {
    req.user = { id: Number(userId) };
  } else {
    // For testing purposes, if no header, maybe don't crash but let the route handle it?
    // But the route expects req.user.id.
    // Let's initialize it to avoid crash, but it might be 0 or undefined.
    // req.user = { id: 0 }; 
  }
});

const io = new Server(fastify.server, {
  cors: { origin: "*" }
});

setupSocket(io);

fastify.register(chatRoutes);

// Health check endpoint
fastify.get('/health', async () => ({ status: 'ok', service: 'chat-service' }));

const PORT = Number(process.env.CHAT_PORT) || 4000;
fastify.listen({ port: PORT, host: '0.0.0.0' }, () => {
  console.log(`Chat service running on http://0.0.0.0:${PORT}`);
});
