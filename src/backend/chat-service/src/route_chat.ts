import { FastifyInstance } from 'fastify';
import { blockuser, unblockuser } from './utils/block_user.js';
import { prisma } from "./prisma.js";

export async function chatRoutes(fastify: FastifyInstance) {
  // Block a user
  fastify.post<{ Body: { userId: number } }>('/block', async (req, reply) => {
    const me = req.user.id;
    const userId = req.body.userId;

    try {
      await blockuser(me, userId);
      return { success: true, message: 'User blocked' };
    } catch (err) {
      reply.code(400).send({ error: 'Failed to block user' });
    }
  });

  // Unblock a user
  fastify.post<{ Body: { userId: number } }>('/unblock', async (req, reply) => {
    const me = req.user.id;
    const userId = req.body.userId;

    try {
      await unblockuser(me, userId);
      return { success: true, message: 'User unblocked' };
    } catch (err) {
      reply.code(400).send({ error: 'Failed to unblock user' });
    }
  });

  // Send a message
  fastify.post<{ Body: { receiverId: number; content: string } }>('/messages', async (req, reply) => {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return reply.code(400).send({ error: 'Invalid data' });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content
      }
    });

    return message;
  });

  // Get messages with a user
  fastify.get<{ Params: { userId: string } }>('/messages/:userId', async (req, reply) => {
    const me = req.user.id;
    const other = Number(req.params.userId);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: me, receiverId: other },
          { senderId: other, receiverId: me }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return messages;
  });

  // Get older messages (pagination)
  fastify.get<{ Params: { userId: string }, Querystring: { cursor: string } }>('/messages/:userId/older', async (req, reply) => {
    const me = req.user.id;
    const other = Number(req.params.userId);
    const cursor = Number(req.query.cursor);

    if (!cursor) return [];

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: me, receiverId: other },
          { senderId: other, receiverId: me }
        ],
        id: { lt: cursor } // only older messages
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return messages;
  });

  // Get latest message for a list of users (for inbox preview)
  fastify.post<{ Body: { userIds: number[] } }>('/messages/latest-batch', async (req, reply) => {
    const me = req.user.id;
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return reply.code(400).send({ error: 'Invalid userIds' });
    }

    const results: Record<number, any> = {};

    for (const otherId of userIds) {
      const lastMsg = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: me, receiverId: otherId },
            { senderId: otherId, receiverId: me }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
      
      if (lastMsg) {
        results[otherId] = lastMsg;
      }
    }

    return results;
  });
}
