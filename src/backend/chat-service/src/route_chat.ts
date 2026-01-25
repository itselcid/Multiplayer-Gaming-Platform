import { FastifyInstance } from 'fastify';
import { blockuser, unblockuser, isBlocked } from './utils/block_user.js';
import { prisma } from "./prisma.js";

export async function chatRoutes(fastify: FastifyInstance) {
  // Block a user
  fastify.post<{ Body: { userId: number } }>('/block', async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    const me = req.user.id;
    const userId = req.body.userId;

    if (!userId) {
      return reply.code(400).send({ error: 'userId is required' });
    }

    try {
      await blockuser(me, userId);
      return { success: true, message: 'User blocked' };
    } catch (err: any) {
      reply.code(400).send({ error: err.message || 'Failed to block user' });
    }
  });

  // Unblock a user
  fastify.post<{ Body: { userId: number } }>('/unblock', async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    const me = req.user.id;
    const userId = req.body.userId;

    if (!userId) {
      return reply.code(400).send({ error: 'userId is required' });
    }

    try {
      await unblockuser(me, userId);
      return { success: true, message: 'User unblocked' };
    } catch (err: any) {
      reply.code(400).send({ error: err.message || 'Failed to unblock user' });
    }
  });

  // Get list of blocked users
  fastify.get('/blocked', async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    const me = req.user.id;

    const blockedUsers = await prisma.block.findMany({
      where: { blockerId: me },
      select: { blockedId: true }
    });

    return { blockedIds: blockedUsers.map(b => b.blockedId) };
  });

  // Send a message
  fastify.post<{ Body: { receiverId: number; content: string } }>('/messages', async (req, reply) => {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return reply.code(400).send({ error: 'Invalid data' });
    }

    // Check if sender is blocked by receiver
    const blocked = await isBlocked(senderId, receiverId);
    if (blocked) {
      return reply.code(403).send({ error: 'You are blocked by this user' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        sender: {
          connectOrCreate: {
            where: { id: senderId },
            create: { id: senderId, username: `user_${senderId}` }
          }
        },
        receiver: {
          connectOrCreate: {
            where: { id: receiverId },
            create: { id: receiverId, username: `user_${receiverId}` }
          }
        }
      }
    });

    // Emit the message via WebSocket to receiver
    fastify.io.to(receiverId.toString()).emit('receive-message', {
      id: message.id,
      content: message.content,
      from: message.senderId,
      to: message.receiverId,
      createdAt: message.createdAt
    });

    // Emit to sender for multi-tab synchronization
    fastify.io.to(senderId.toString()).emit('receive-message', {
      id: message.id,
      content: message.content,
      from: message.senderId,
      to: message.receiverId,
      createdAt: message.createdAt
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
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }
    const me = req.user.id;
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return reply.code(400).send({ error: 'Invalid userIds' });
    }

    const results: Record<number, any> = {};

    for (const id of userIds) {
      const otherId = Number(id);  // Convert to number to fix Prisma type error
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
