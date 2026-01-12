import { FastifyInstance } from "fastify";
import { userController } from "../controllers/user.controller";

const UserIdSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', pattern: '^[0-9]+$' }
        }
    }
} as const;

const UsernameSchema = {
    body: {
        type: 'object',
        required: ['username'],
        properties: {
            username: { type: 'string', minLength: 3, maxLength: 16 }
        }
    }
} as const;

const UpdateProfileSchema = {
    body: {
        type: 'object',
        properties: {
            email: { type: 'string', format: 'email' },
            username: { type: 'string', minLength: 3, maxLength: 16 },
            password: {
                type: 'object',
                properties: {
                    oldpassword: { type: 'string' },
                    newpassword: { type: 'string' },
                    repeatednewpasswd: { type: 'string' }
                },
                required: ['oldpassword', 'newpassword', 'repeatednewpasswd']
            }
        }
    }
} as const;

type updateLoggedInUserBody = {
    email?: string;
    username?: string;
    password?: {
        oldpassword: string;
        newpassword: string;
        repeatednewpasswd: string;
    };
}

export default async function userRoutes(server: FastifyInstance): Promise<void> {

    // get all users
    server.get('/', { preHandler: [server.authenticate] }, userController.getAllUsers);
    // get logged in user data
    server.get('/me', { preHandler: [server.authenticate] }, userController.getLoggedInUser);
    //! update logged in user data only email available for now
    server.put<{ Body: updateLoggedInUserBody }>('/me', { preHandler: [server.authenticate], schema: UpdateProfileSchema }, userController.updateLoggedInUser);
    // delete logged in user account
    server.delete('/me', { preHandler: [server.authenticate] }, userController.deleteLoggedInUser);
    // get user by id
    server.get<{ Params: { id: string } }>('/:id', { preHandler: [server.authenticate], schema: UserIdSchema }, userController.getUserById);
    // upload avatar
    server.post<{ Body: { file: File } }>('/me/avatar', { preHandler: [server.authenticate] }, userController.uploadAvatar);
    // search users
    server.get<{ Querystring: { username: string } }>('/search', { preHandler: [server.authenticate] }, userController.searchUsers);
    // is username taken
    server.post<{ Body: { username: string } }>('/istaken', { schema: UsernameSchema }, userController.isUsernameTaken);
}

