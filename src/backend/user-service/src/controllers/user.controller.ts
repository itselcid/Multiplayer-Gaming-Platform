import createHttpError from "http-errors";
import { deleteUser, getAllUsers, getMatchHistory, getUserById, getUserByUsername, searchUsers, updateUser } from "../db";
import path from "node:path";
import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import { MatchHistory } from "../types";


export const userController = {
    getAllUsers: async (_request: any, _reply: any) => {
        const users = await getAllUsers();
        return { users };
    },

    getLoggedInUser: async (request: any, _reply: any) => {
        const user = await getUserById(request.user!.userId);

        if (!user)
            throw createHttpError(404, 'User not found');

        return { user };
    },

    updateLoggedInUser: async (request: any, reply: any) => {
        const { email, username, password } = request.body;

        if (!email && !username && !password)
            throw createHttpError(400, 'Provide fields to update');

        const user = await updateUser(request.user!.userId, { email, username, password });

        return reply.send({
            message: 'Profile updated successfully',
            user
        });
    },

    deleteLoggedInUser: async (request: any, reply: any) => {
        await deleteUser(request.user!.userId);
        return reply.send({ message: 'Account deleted successfully' });
    },

    getUserById: async (request: any, reply: any) => {
        const userId = parseInt(request.params.id, 10);

        if (isNaN(userId))
            throw createHttpError(400, 'Invalid user ID');

        const user = await getUserById(userId);

        if (!user)
            throw createHttpError(404, 'User not found');

        return reply.send({ user });
    },

    uploadAvatar: async (request: any, reply: any) => {
        const data = await request.file();

        if (!data)
            throw createHttpError(400, 'Provide avatar to upload');
        if (data.mimetype !== 'image/jpeg' && data.mimetype !== 'image/png')
            throw createHttpError(400, 'Invalid file type');

        // ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `${request.user!.userId}-${Date.now()}${path.extname(data.filename)}`;
        const savePath = path.join(uploadDir, filename);

        // write file
        await pipeline(data.file, fs.createWriteStream(savePath));

        // Public URL to store in DB
        const avatarUrl = `/public/${filename}`;

        const userTmp = await getUserById(request.user!.userId);
        if (!userTmp)
            throw createHttpError(404, 'User not found');

        // Cleanup old avatar if it's a local file (starts with /public/)
        if (userTmp.avatar && userTmp.avatar.startsWith('/public/uploads/')) {
            const oldFilename = path.basename(userTmp.avatar);
            const oldPath = path.join(uploadDir, oldFilename);
            if (fs.existsSync(oldPath)) {
                try {
                    fs.unlinkSync(oldPath);
                } catch (e) {
                    console.error('Failed to delete old avatar:', e);
                }
            }
        }

        const user = await updateUser(request.user!.userId, { avatar: avatarUrl });

        return reply.send({
            message: 'Avatar uploaded successfully',
            user
        });
    },

    searchUsers: async (request: any, reply: any) => {
        const username = request.query.username;

        if (!username)
            throw createHttpError(400, 'Provide search query');

        const users = await searchUsers(username);

        return reply.send({ users });
    },

    isUsernameTaken: async (request: any, reply: any) => {
        const username = request.body.username;

        if (!username)
            throw createHttpError(400, 'Provide username');

        const user = await getUserByUsername(username);

        if (user)
            return reply.code(409).send({ message: 'Username is already taken' });

        return reply.code(200).send({ message: 'Username is available' });
    },

    getMatchHistory: async (request: any, reply: any) => {
        const userId = parseInt(request.params.id, 10) || request.user!.userId;
        const page = parseInt(request.query.page, 10) || 1;
        const limit = parseInt(request.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        if (isNaN(userId))
            throw createHttpError(400, 'Invalid user ID');

        const user = await getUserById(userId);
        if (!user)
            throw createHttpError(404, 'User not found');
        const historyData: MatchHistory[] = await getMatchHistory(userId, offset, limit);

        return reply.send({ historyData });
    }

}