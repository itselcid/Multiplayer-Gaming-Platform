import { FastifyInstance } from "fastify";
import jwt from '@fastify/jwt';
import { env } from '../env';
import fastifyCookie from "@fastify/cookie";
import fp from 'fastify-plugin';


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

    server.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify() // Auto-verifies token from cookie/header

            if (request.user.requires2FA) {
                return reply.code(403).send({ error: '2FA required' })
            }
        } catch (err) {
            return reply.code(401).send({ error: 'Invalid token' })
        }
    })

    server.decorate('authenticate2FA', async (request, reply) => {
        try {
            await request.jwtVerify() // Uses authToken cookie by default

            if (!request.user.requires2FA) {
                return reply.code(403).send({ error: '2FA not required' })
            }

        } catch (err) {
            return reply.code(401).send({ error: 'Invalid or expired token' })
        }
    })
});