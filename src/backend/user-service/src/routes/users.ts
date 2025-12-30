import { FastifyInstance } from "fastify";
import { deleteUser, getAllUsers, getUserById, updateUser } from "../db";
import createHttpError from "http-errors";

const UserIdSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', pattern: '^[0-9]+$' }
        }
    }
} as const;

const UpdateProfileSchema = {
    body: {
        type: 'object',
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
            role: { type: 'string' }
        }
    }
} as const;

export default async function userRoutes(server: FastifyInstance): Promise<void> {

    // get all users
    server.get('/', {
        preHandler: [server.authenticate]
    }, async (_request, _reply) => {
        const users = await getAllUsers();

        return { users };
    });

    // get logged in user data
    server.get('/me', {
        preHandler: [server.authenticate]
    }, async (request, _reply) => {
        const user = await getUserById(request.user!.userId);

        if (!user)
            throw createHttpError(404, 'User not found');

        return { user };
    });

    // update logged in user data
    server.put<{
        Body: { email: string }  // only email updates available for now
    }>('/me', {
        preHandler: [server.authenticate],
        schema: UpdateProfileSchema
    }, async (request, reply) => {
        try {

            const { email } = request.body;

            if (!email) {
                return reply.code(400).send({
                    error: 'Provide email to update'
                });
            }

            const user = await updateUser(request.user!.userId, { email });

            return reply.send({
                message: 'Profile updated successfully',
                user
            });

        } catch (err) {
            return reply.code(400).send({ error: 'Email already exists or update failed' });
        }
    });

    // delete logged in user account
    server.delete('/me', {
        preHandler: [server.authenticate]
    }, async (request, reply) => {
        try {

            await deleteUser(request.user!.userId);

            return reply.send({ message: 'Account deleted successfully' });

        } catch (error) {
            return reply.code(500).send({ error: 'Internal server error' });
        }
    })

    // get user by id
    server.get<{
        Params: { id: string }
    }>('/:id', {
        preHandler: [server.authenticate],
        schema: UserIdSchema
    }, async (request, reply) => {
        try {

            const userId = parseInt(request.params.id, 10);

            if (isNaN(userId)) {
                return reply.code(400).send({
                    error: 'Invalid user ID'
                });
            }

            const user = await getUserById(userId);

            if (!user) {
                return reply.code(404).send({ error: 'User not found' });
            }

            return reply.send({ user });

        } catch (error) {
            return reply.code(500).send({ error: 'Internal server error' });
        }
    });

}

