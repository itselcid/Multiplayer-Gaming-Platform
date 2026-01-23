import createHttpError from "http-errors";
import { acceptFriendRequest, blockFriend, getBlockedFriends, getFriends, getFriendship, getReceivedFriendRequests, getSentFriendRequests, getUserById, removeFriend, sendFriendRequest, unblockFriend } from "../db";
import { Friend } from "../types";
import { socketService } from "../services/socket.service";


export const friendController = {
    getFriends: async (request: any, reply: any) => {

        const friends: Friend[] = await getFriends(request.user!.userId);

        return reply.send({ friends });
    },

    getFriendRequests: async (request: any, reply: any) => {
        const friendRequests: Friend[] = await getReceivedFriendRequests(request.user!.userId);

        return reply.send({ friends: friendRequests });
    },

    getSentFriendRequests: async (request: any, reply: any) => {
        const sentFriendRequests: Friend[] = await getSentFriendRequests(request.user!.userId);

        return reply.send({ friends: sentFriendRequests });
    },

    sendFriendRequest: async (request: any, reply: any) => {
        const friendId = request.params.friendId;

        if (friendId === request.user!.userId)
            throw createHttpError(400, 'You cannot send a friend request to yourself');

        const friend = await getUserById(friendId);
        if (!friend)
            throw createHttpError(404, 'Friend not found');

        const friendship = await getFriendship(request.user!.userId, friendId);
        if (friendship)
            throw createHttpError(400, 'Friendship already exists, it may be pending or accepted');

        await sendFriendRequest(request.user!.userId, friendId);

        return reply.send({ message: 'Friend request sent successfully' });
    },

    acceptFriendRequest: async (request: any, reply: any) => {
        const friendId = request.params.friendId;
        await acceptFriendRequest(request.user!.userId, friendId);

        return reply.send({ message: 'Friend request accepted successfully' });
    },

    removeFriendship: async (request: any, reply: any) => {
        const friendId = request.params.friendId;
        await removeFriend(request.user!.userId, friendId);

        return reply.send({ message: 'Friendship removed successfully' });
    },

    blockUser: async (request: any, reply: any) => {
        const friendId = request.params.friendId;

        const friendship = await getFriendship(request.user!.userId, friendId);
        if (!friendship)
            throw createHttpError(404, 'Friendship not found');

        if (friendship.status === 'ACCEPTED')
            await blockFriend(request.user!.userId, friendId);

        return reply.send({ message: 'User blocked successfully' });
    },

    unblockUser: async (request: any, reply: any) => {
        const friendId = request.params.friendId;

        const friendship = await getFriendship(request.user!.userId, friendId);

        if (!friendship)
            throw createHttpError(404, 'Friendship not found');

        if (friendship.status === 'BLOCKED')
            await unblockFriend(request.user!.userId, friendId);

        return reply.send({ message: 'User unblocked successfully' });
    },

    getBlockedUsers: async (request: any, reply: any) => {
        const blockedUsers: Friend[] = await getBlockedFriends(request.user!.userId);

        return reply.send({ friends: blockedUsers });
    },

    getOnlineFriends: async (request: any, reply: any) => {
        const friends = await getFriends(request.user!.userId);

        console.log(friends);
        let onlineFriends: Friend[] = [];
        for (const friend of friends) {
            if (socketService.isUserOnline(friend.id)) {
                onlineFriends.push(friend);
            }
        }

        return reply.send({ friends: onlineFriends });
    }

}