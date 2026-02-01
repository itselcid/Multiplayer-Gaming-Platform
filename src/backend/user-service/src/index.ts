
import buildServer from './app';
import { createTestUserIfNeeded } from './db';
import { env } from './config/env';
import { testEmailConnection } from './services/email.service';
import { socketService } from './services/socket.service';
import { rabbitMQService } from './services/rabbitmq.service';

async function start() {
    try {
        const server = await buildServer();

        await server.ready();
        socketService.initialize(server.server, {
            path: '/online-status',
            cors: {
                origin: env.FRONTEND_URL,
                credentials: true,
                methods: ["GET", "POST"]
            }
        });
        await server.listen({
            port: Number(env.PORT),
            host: '0.0.0.0'
        });

        await rabbitMQService.initialize();
        console.log(`🚀 Server ready at http://localhost:${env.PORT}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

await testEmailConnection();
start();




