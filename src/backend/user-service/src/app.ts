
import Fastify from 'fastify';
import cors from '@fastify/cors';
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import twoFactorRoutes from './routes/2fa';
import { env } from './config/env';
import friendsRoutes from './routes/friends';
import swaggerPlugin from './plugins/swagger';
import authPlugin from './plugins/auth';
import { globalErrorHandler } from './middleware/error';
import path from 'node:path';

export default async function buildServer() {
    const fastifyServer = Fastify({
        logger: true,
    });

    fastifyServer.setErrorHandler(globalErrorHandler);
    await fastifyServer.register(authPlugin);
    await fastifyServer.register(swaggerPlugin);
    await fastifyServer.register(import('@fastify/rate-limit'), {
        max: 100,
        timeWindow: '1 minute',
        keyGenerator: (request) => {
            return request.user?.userId || request.ip;
        }
    });
    await fastifyServer.register(import('@fastify/static'), {
        root: path.join(process.cwd(), 'public/uploads'),
        prefix: '/public/',
    });
    await fastifyServer.register(import('@fastify/multipart'), { limits: { fileSize: 1024 * 1024 * 2 } }); // 2MB
    // the following code is a fix for the options request check for Cross Origin Resource Sharing
    // Register CORS 
    await fastifyServer.register(cors, {
        origin: [env.FRONTEND_URL],   // diffrent host is needed for 127.0.0.1
        credentials: true,  // for siting cookies to work 
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    });

    // registering Routes
    fastifyServer.register(userRoutes, { prefix: '/api/users' });
    fastifyServer.register(authRoutes, { prefix: '/api/auth' });
    fastifyServer.register(twoFactorRoutes, { prefix: '/api/2fa' });
    fastifyServer.register(friendsRoutes, { prefix: '/api/friends' });


    // health check
    fastifyServer.get('/health', async (_request, _reply) => { return { status: 'ok' } });
    // register end;

    return fastifyServer;
}

