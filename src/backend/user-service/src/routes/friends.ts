
import { FastifyInstance } from 'fastify';
import { Friend } from '../types';
import { friendController } from '../controllers/friend.controller';


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
                            avatar: { type: 'string' },
                            isOnline: { type: 'boolean' }
                        },
                        required: ['id', 'username', 'avatar']
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
    server.get<{ Body: { friends: Friend[] } }>('/', { preHandler: [server.authenticate], schema: GetFriendsSchema }, friendController.getFriends);
    // get friend requests
    server.get<{ Body: { friendRequests: Friend[] } }>('/requests/received', { preHandler: [server.authenticate], schema: GetFriendsSchema }, friendController.getFriendRequests);
    // get sent friend requests
    server.get<{ Reply: { friends: Friend[] } }>('/requests/sent', { preHandler: [server.authenticate], schema: GetFriendsSchema }, friendController.getSentFriendRequests);
    // send a friend request
    server.put<{ Params: { friendId: number } }>('/requests/send/:friendId', { preHandler: [server.authenticate], schema: ManageFriendSchema }, friendController.sendFriendRequest);
    // accept friend request
    server.put<{ Params: { friendId: number } }>('/requests/accept/:friendId', { preHandler: [server.authenticate], schema: ManageFriendSchema }, friendController.acceptFriendRequest);
    // reject friend request
    server.post<{ Params: { friendId: number } }>('/requests/reject/:friendId', { preHandler: [server.authenticate], schema: ManageFriendSchema }, friendController.removeFriendship);
    // remove friend
    server.delete<{ Params: { friendId: number } }>('/remove/:friendId', { preHandler: [server.authenticate], schema: ManageFriendSchema }, friendController.removeFriendship);
    // block user
    server.put<{ Params: { friendId: number } }>('/block/:friendId', { preHandler: [server.authenticate], schema: ManageFriendSchema }, friendController.blockUser);
    // unblock user
    server.put<{ Params: { friendId: number } }>('/unblock/:friendId', { preHandler: [server.authenticate], schema: ManageFriendSchema }, friendController.unblockUser);
    // get blocked users
    server.get<{ Body: { blockedUsers: Friend[] } }>('/blocked', { preHandler: [server.authenticate], schema: GetFriendsSchema }, friendController.getBlockedUsers);
    // get online friends
    server.get<{ Body: { onlineFriends: Friend[] } }>('/online', { preHandler: [server.authenticate], schema: GetFriendsSchema }, friendController.getOnlineFriends);


}



