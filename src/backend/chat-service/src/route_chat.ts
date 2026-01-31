import { FastifyInstance } from 'fastify';
import { blockuser, unblockuser, isBlocked } from './utils/block_user.js';
import { prisma } from "./prisma.js";

// System user ID for tournament notifications (using large positive ID to avoid conflicts)
const TOURNAMENT_SYSTEM_USER_ID = 999999;

export async function chatRoutes(fastify: FastifyInstance) {
  // Ensure tournament system user exists
  async function ensureTournamentSystemUser() {
    try {
      const existing = await prisma.user.findUnique({
        where: { id: TOURNAMENT_SYSTEM_USER_ID }
      });
      if (!existing) {
        console.log('Creating tournament system user with ID:', TOURNAMENT_SYSTEM_USER_ID);
        await prisma.user.create({
          data: {
            id: TOURNAMENT_SYSTEM_USER_ID,
            username: 'Tournament System'
          }
        });
        console.log('Tournament system user created successfully');
      }
    } catch (error) {
      console.error('Error ensuring tournament system user:', error);
      throw error;
    }
  }

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
    console.log('Received message send request:', req.body);
    const senderId = Number(req.user?.id);

    const { receiverId, content } = req.body;

    const receiverIdNum = Number(receiverId);

    if (!receiverIdNum || !content) {
      return reply.code(400).send({ error: 'Invalid data' });
    }

    // Check if sender is blocked by receiver
    const blocked = await isBlocked(senderId, receiverIdNum);
    if (blocked) {
      return reply.code(403).send({ error: 'You are blocked by this user' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        seen: false,
        sender: {
          connectOrCreate: {
            where: { id: senderId },
            create: { id: senderId, username: `user_${senderId}` }
          }
        },
        receiver: {
          connectOrCreate: {
            where: { id: receiverIdNum },
            create: { id: receiverIdNum, username: `user_${receiverIdNum}` }
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
      createdAt: message.createdAt,
      seen: false
    });

    // Emit to sender for multi-tab synchronization
    fastify.io.to(senderId.toString()).emit('receive-message', {
      id: message.id,
      content: message.content,
      from: message.senderId,
      to: message.receiverId,
      createdAt: message.createdAt,
      seen: true // Message is "seen" by sender
    });

    // Emit unread count update to receiver
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: receiverIdNum,
        senderId: senderId,
        seen: false
      }
    });

    fastify.io.to(receiverId.toString()).emit('unread-count-update', {
      fromUserId: senderId,
      count: unreadCount
    });

    return message;
  });

  // Get messages with a user
  fastify.get<{ Params: { userId: string }, Querystring: { markSeen?: string } }>('/messages/:userId', async (req, reply) => {
    const me = req.user.id;
    const other = Number(req.params.userId);
    const markSeen = req.query.markSeen === 'true';

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

    // Only mark messages as seen if explicitly requested
    if (markSeen) {
      const updatedMessages = await prisma.message.updateMany({
        where: {
          senderId: other,
          receiverId: me,
          seen: false
        },
        data: {
          seen: true
        }
      });

      // If any messages were marked as seen, emit unread count update
      if (updatedMessages.count > 0) {
        fastify.io.to(me.toString()).emit('unread-count-update', {
          fromUserId: other,
          count: 0
        });
      }
    }

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

      // Get unread count for this conversation
      const unreadCount = await prisma.message.count({
        where: {
          senderId: otherId,
          receiverId: me,
          seen: false
        }
      });

      if (lastMsg) {
        results[otherId] = {
          ...lastMsg,
          unreadCount
        };
      }
    }

    return results;
  });

  // ============ TOURNAMENT NOTIFICATIONS ============

  // Save a tournament notification
  fastify.post<{ Body: { tournamentId: number; round: number; opponentUsername: string; matchKey: string; matchLink: string; content: string } }>('/tournament-notifications', async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    const userId = req.user.id;
    const { tournamentId, round, opponentUsername, matchKey, matchLink, content } = req.body;

    if (!tournamentId || !content) {
      return reply.code(400).send({ error: 'Invalid data' });
    }

    try {
      // Ensure system user exists
      await ensureTournamentSystemUser();

      // Ensure current user exists
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, username: `user_${userId}` }
      });

      // Check if a notification for this match already exists for this user
      const existingNotification = await prisma.message.findFirst({
        where: {
          receiverId: userId,
          senderId: TOURNAMENT_SYSTEM_USER_ID,
          content: {
            contains: `"matchKey":"${matchKey}"`
          }
        }
      });

      if (existingNotification) {
        console.log(`Notification for match ${matchKey} already exists for user ${userId}`);
        return { success: true, message: existingNotification, duplicated: true };
      }

      // Save notification as a message from system to user
      const message = await prisma.message.create({
        data: {
          content: JSON.stringify({
            type: 'tournament_notification',
            tournamentId,
            round,
            opponentUsername,
            matchKey,
            matchLink,
            text: content
          }),
          senderId: TOURNAMENT_SYSTEM_USER_ID,
          receiverId: userId
        }
      });

      return { success: true, message };
    } catch (err: any) {
      console.error('Error saving tournament notification:', err);
      return reply.code(500).send({ error: 'Failed to save notification' });
    }
  });

  // Get tournament notifications for a user
  fastify.get('/tournament-notifications', async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    const userId = req.user.id;

    try {
      const notifications = await prisma.message.findMany({
        where: {
          senderId: TOURNAMENT_SYSTEM_USER_ID,
          receiverId: userId
        },
        orderBy: { createdAt: 'asc' }
      });

      // Parse the JSON content
      const parsedNotifications = notifications.map((n: { id: number; content: string; createdAt: Date; seen: boolean }) => {
        try {
          const data = JSON.parse(n.content);
          return {
            id: n.id,
            ...data,
            seen: n.seen,
            createdAt: n.createdAt
          };
        } catch {
          return {
            id: n.id,
            text: n.content,
            seen: n.seen,
            createdAt: n.createdAt
          };
        }
      });

      return { notifications: parsedNotifications };
    } catch (err: any) {
      console.error('Error fetching tournament notifications:', err);
      return reply.code(500).send({ error: 'Failed to fetch notifications' });
    }
  });

  // Mark messages as seen when user opens a conversation
  fastify.post<{ Body: { senderId: number } }>('/messages/mark-seen', async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    const receiverId = req.user.id;
    const { senderId } = req.body;

    if (!senderId) {
      return reply.code(400).send({ error: 'senderId is required' });
    }

    try {
      // Mark all messages from senderId to current user as seen
      const result = await prisma.message.updateMany({
        where: {
          senderId: senderId,
          receiverId: receiverId,
          seen: false
        },
        data: {
          seen: true
        }
      });

      // If any messages were marked as seen, emit unread count update
      if (result.count > 0) {
        fastify.io.to(receiverId.toString()).emit('unread-count-update', {
          fromUserId: senderId,
          count: 0
        });
      }

      return { success: true, markedCount: result.count };
    } catch (error) {
      console.error('Error marking messages as seen:', error);
      return reply.code(500).send({ error: 'Failed to mark messages as seen' });
    }
  });

  // Mark messages as seen for a specific user (simpler endpoint)
  fastify.put<{ Params: { userId: string } }>('/messages/:userId/mark-seen', async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    const receiverId = req.user.id;
    const senderId = Number(req.params.userId);

    try {
      const result = await prisma.message.updateMany({
        where: {
          senderId: senderId,
          receiverId: receiverId,
          seen: false
        },
        data: {
          seen: true
        }
      });

      // Emit unread count update
      if (result.count > 0) {
        fastify.io.to(receiverId.toString()).emit('unread-count-update', {
          fromUserId: senderId,
          count: 0
        });
      }

      return { success: true, markedCount: result.count };
    } catch (error) {
      console.error('Error marking messages as seen:', error);
      return reply.code(500).send({ error: 'Failed to mark messages as seen' });
    }
  });

  // Get unread message counts for all conversations
  fastify.get('/messages/unread-counts', async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    const userId = req.user.id;

    try {
      // Get unread message counts grouped by sender
      const unreadCounts = await prisma.message.groupBy({
        by: ['senderId'],
        where: {
          receiverId: userId,
          seen: false
        },
        _count: {
          id: true
        }
      });

      // Convert to a more convenient format
      const counts: Record<number, number> = {};
      unreadCounts.forEach(item => {
        counts[item.senderId] = item._count.id;
      });

      return { unreadCounts: counts };
    } catch (error) {
      console.error('Error getting unread counts:', error);
      return reply.code(500).send({ error: 'Failed to get unread counts' });
    }
  });

  // Get all unread counts for the current user (for page refresh)
  fastify.get('/messages/all-unread-counts', async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    const userId = req.user.id;

    try {
      const unreadCounts = await prisma.message.groupBy({
        by: ['senderId'],
        _count: { id: true },
        where: {
          receiverId: userId,
          seen: false
        }
      });

      const counts: Record<number, number> = {};
      unreadCounts.forEach(item => {
        counts[item.senderId] = item._count.id;
      });

      return { unreadCounts: counts };
    } catch (error) {
      console.error('Error getting all unread counts:', error);
      return reply.code(500).send({ error: 'Failed to get all unread counts' });
    }
  });

  // Get unread count for specific user
  fastify.get<{ Params: { userId: string } }>('/messages/unread-count/:userId', async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    const receiverId = req.user.id;
    const senderId = Number(req.params.userId);

    try {
      const count = await prisma.message.count({
        where: {
          senderId: senderId,
          receiverId: receiverId,
          seen: false
        }
      });

      return { unreadCount: count };
    } catch (error) {
      console.error('Error getting unread count:', error);
      return reply.code(500).send({ error: 'Failed to get unread count' });
    }
  });

  // Get all conversations with unread counts (for initial page load)
  fastify.get('/conversations', async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }
    const me = req.user.id;

    try {
      // Get all users I have conversations with
      const conversations = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: me },
            { receiverId: me }
          ]
        },
        select: {
          senderId: true,
          receiverId: true,
          createdAt: true,
          content: true,
          seen: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Group conversations by other user
      const conversationMap = new Map();

      for (const msg of conversations) {
        const otherId = msg.senderId === me ? msg.receiverId : msg.senderId;

        if (!conversationMap.has(otherId)) {
          // Get unread count for this conversation
          const unreadCount = await prisma.message.count({
            where: {
              senderId: otherId,
              receiverId: me,
              seen: false
            }
          });

          conversationMap.set(otherId, {
            userId: otherId,
            lastMessage: msg,
            unreadCount
          });
        }
      }

      return Array.from(conversationMap.values());
    } catch (error) {
      console.error('Error getting conversations:', error);
      return reply.code(500).send({ error: 'Failed to get conversations' });
    }
  });

  // DEBUG: Reset all messages to unseen (temporary endpoint for testing)
  fastify.post('/debug/reset-messages-unseen', async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    try {
      const result = await prisma.message.updateMany({
        where: {
          receiverId: req.user.id
        },
        data: {
          seen: false
        }
      });

      return { success: true, updatedCount: result.count };
    } catch (error) {
      console.error('Error resetting messages:', error);
      return reply.code(500).send({ error: 'Failed to reset messages' });
    }
  });

  // DEBUG: Get message seen status
  fastify.get('/debug/message-status', async (req, reply) => {
    if (!req.user?.id) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    try {
      const messages = await prisma.message.findMany({
        where: {
          receiverId: req.user.id
        },
        select: {
          id: true,
          content: true,
          seen: true,
          senderId: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      return { messages };
    } catch (error) {
      console.error('Error getting message status:', error);
      return reply.code(500).send({ error: 'Failed to get message status' });
    }
  });
}
