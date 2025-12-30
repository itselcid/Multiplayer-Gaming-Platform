
import { FastifyInstance } from 'fastify';
import { acceptFriendRequest, blockFriend, getBlockedFriends, getFriends, getFriendship, getReceivedFriendRequests, getSentFriendRequests, getUserById, removeFriend, sendFriendRequest, unblockFriend } from '../db';
import { Friend } from '../types';


const GetFriendsSchema = {
    response: {
        200: {
            type: 'object',
            properties: {
                friends: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            username: { type: 'string' },
                            avatar: { type: 'string' }
                        }
                    }
                }
            }
        }
    }
} as const;

const ManageFriendSchema = {
    params: {
        type: 'object',
        required: ['friendId'],
        properties: {
            friendId: { type: 'number' }
        }
    }
} as const;


export default function friendsRoutes(server: FastifyInstance) {


    // get all friends
    server.get<{
        Body: { friends: Friend[] }
    }>('', {
        preHandler: [server.authenticate],
        schema: GetFriendsSchema
    }, async (request, reply) => {

        const rawFriends = await getFriends(request.user!.userId);
        // Map nested objects to flat structure, checking if it's already flat or needs unwrapping
        const friends = rawFriends.map(f => (f as any).addressee || f);

        return reply.send({ friends });
    });

    // get friend requests
    server.get<{
        Body: { friendRequests: Friend[] }
    }>('/requests/received', {
        preHandler: [server.authenticate],
        schema: GetFriendsSchema
    }, async (request, reply) => {

        const rawRequests = await getReceivedFriendRequests(request.user!.userId);
        const friendRequests = rawRequests.map(r => r.requester);

        return reply.send({ friends: friendRequests });
    });

    // get sent friend requests
    server.get<{
        Reply: { friends: Friend[] }
    }>('/requests/sent', {
        preHandler: [server.authenticate],
        schema: GetFriendsSchema
    }, async (request, reply) => {
        const rawRequests = await getSentFriendRequests(request.user!.userId);
        const friends = rawRequests.map(r => r.addressee);

        return reply.send({ friends });
    });

    // send a friend request
    server.put<{
        Params: { friendId: number }
    }>('/requests/send/:friendId', {
        preHandler: [server.authenticate],
        schema: ManageFriendSchema
    }, async (request, reply) => {

        const friendId = request.params.friendId;

        if (friendId === request.user!.userId) {
            return reply.code(400).send({ error: 'You cannot send a friend request to yourself' });
        }

        const friend = await getUserById(friendId);
        if (!friend) {
            return reply.code(404).send({ error: 'Friend not found' });
        }

        const friendship = await getFriendship(request.user!.userId, friendId);
        if (friendship) {
            return reply.code(400).send({ error: 'Friendship already exists, it may be pending or accepted' });
        }

        await sendFriendRequest(request.user!.userId, friendId);

        return reply.send({ message: 'Friend request sent successfully' });
    });

    // accept friend request
    server.put<{
        Params: { friendId: number }
    }>('/requests/accept/:friendId', {
        preHandler: [server.authenticate],
        schema: ManageFriendSchema
    }, async (request, reply) => {
        const friendId = request.params.friendId;

        await acceptFriendRequest(request.user!.userId, friendId);

        return reply.send({ message: 'Friend request accepted successfully' });
    });

    // reject friend request
    server.post<{
        Params: { friendId: number }
    }>('/requests/reject/:friendId', {
        preHandler: [server.authenticate],
        schema: ManageFriendSchema
    }, async (request, reply) => {
        const friendId = request.params.friendId;

        await removeFriend(request.user!.userId, friendId);

        return reply.send({ message: 'Friend request rejected successfully' });
    });

    // remove friend
    server.delete<{
        Params: { friendId: number }
    }>('/remove/:friendId', {
        preHandler: [server.authenticate],
        schema: ManageFriendSchema
    }, async (request, reply) => {
        const friendId = request.params.friendId;

        await removeFriend(request.user!.userId, friendId);

        return reply.send({ message: 'Friend removed successfully' });
    });

    // block user
    server.put<{
        Params: { friendId: number }
    }>('/block/:friendId', {
        preHandler: [server.authenticate],
        schema: ManageFriendSchema
    }, async (request, reply) => {
        const friendId = request.params.friendId;

        const friendship = await getFriendship(request.user!.userId, friendId);
        if (!friendship) {
            return reply.code(404).send({ error: 'Friendship not found' });
        }

        if (friendship.status === 'ACCEPTED') {
            await blockFriend(request.user!.userId, friendId);
        }

        return reply.send({ message: 'User blocked successfully' });
    });

    // unblock user
    server.put<{
        Params: { friendId: number }
    }>('/unblock/:friendId', {
        preHandler: [server.authenticate],
        schema: ManageFriendSchema
    }, async (request, reply) => {
        const friendId = request.params.friendId;

        const friendship = await getFriendship(request.user!.userId, friendId);

        if (!friendship) {
            return reply.code(404).send({ error: 'Friendship not found' });
        }

        if (friendship.status === 'BLOCKED') {
            await unblockFriend(request.user!.userId, friendId);
        }

        return reply.send({ message: 'User unblocked successfully' });
    });

    // get blocked users
    server.get<{
        Body: { blockedUsers: Friend[] }
    }>('/blocked', {
        preHandler: [server.authenticate],
        schema: GetFriendsSchema
    }, async (request, reply) => {
        const rawBlocked = await getBlockedFriends(request.user!.userId);
        const blockedUsers = rawBlocked.map(b => b.addressee);

        return reply.send({ friends: blockedUsers });
    });


}



