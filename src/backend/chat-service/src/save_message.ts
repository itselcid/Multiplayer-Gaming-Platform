import { FastifyInstance } from 'fastify';
import { prisma } from "./prisma.js";

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: number;
    };
  }
}

export async function messageRoutes(fastify: FastifyInstance) {
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
