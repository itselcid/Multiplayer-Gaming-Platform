import { FastifyInstance } from "fastify";
import { StrictRateLimit } from "./auth";
import { twoFactorController } from "../controllers/2fa.controller";

const Setup2FASchema = {
    body: {
        type: 'object',
        required: ['method', 'password'],
        properties: {
            method: { type: 'string', enum: ['email', 'totp'] },
            password: { type: 'string', minLength: 4 }  /// more than 3 characters
        }
    }
} as const;

const Confirm2FASchema = {
    body: {
        type: 'object',
        required: ['code'],
        properties: {
            code: { type: 'string' }
        }
    }
} as const;

const Delete2FASchema = {
    body: {
        type: 'object',
        required: ['password'],
        properties: {
            password: { type: 'string' }
        }
    }
} as const;

type Setup2FARequest = {
    method: 'email' | 'totp';
    password: string;
}

export default async function twoFactorRoutes(server: FastifyInstance): Promise<void> {

    // POST /2fa/setup
    server.post<{
        Body: Setup2FARequest
    }>('/setup', {
        config: StrictRateLimit,
        schema: Setup2FASchema,
        preHandler: [server.authenticate]
    }, twoFactorController.setupTwoFactorAuth);

    // POST /2fa/confirm
    server.post<{
        Body: { code: string }
    }>('/confirm', {
        config: StrictRateLimit,
        schema: Confirm2FASchema,
        preHandler: [server.authenticate]
    }, twoFactorController.confirmTwoFactorAuth);

    // DELETE /2fa/setup
    server.delete<{
        Body: { password: string }
    }>('/setup', {
        preHandler: [server.authenticate],
        config: StrictRateLimit,
        schema: Delete2FASchema
    }, twoFactorController.deleteTwoFactorAuth);

}

