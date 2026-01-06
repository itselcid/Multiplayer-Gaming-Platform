import { FastifyInstance, FastifyRequest } from "fastify";
import jwt from '@fastify/jwt';
import { env } from '../config/env';
import fastifyCookie from "@fastify/cookie";
import fp from 'fastify-plugin';
import createHttpError from "http-errors";


export default fp(function authPlugin(server: FastifyInstance) {

    server.register(fastifyCookie, {
        // IMPORTANT: Use a strong, unique secret from environment variables in a real app
        secret: env.COOKIE_SECRET
    });

    server.register(jwt, {
        secret: env.JWT_SEC,
        cookie: {
            cookieName: 'authToken', // Tell it where to find the token
            signed: false
        }
    });

    const verifyJwt = async (req: FastifyRequest) => {
        try {
            await req.jwtVerify();
        } catch (err) {
            if (err instanceof createHttpError.HttpError)
                throw err;
            throw createHttpError(401, 'Invalid or expired token');
        }
    };

    server.decorate('authenticate', async (request: FastifyRequest) => {
        await verifyJwt(request);
        if (request.user.requires2FA)
            throw createHttpError(403, '2FA required');
    });

    server.decorate('authenticate2FA', async (request: FastifyRequest) => {
        await verifyJwt(request);
        if (!request.user.requires2FA)
            throw createHttpError(403, '2FA not required');
    });
});