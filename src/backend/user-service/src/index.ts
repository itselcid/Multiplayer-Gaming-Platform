
import buildServer from './app';
import { createTestUserIfNeeded } from './db';
import { env } from './env';
import { testEmailConnection } from './services/email';

async function start() {
    try {
        const server = await buildServer();

        await server.listen({
            port: Number(env.PORT),
            host: '127.0.0.1'   // change to 0.0.0.0 for production
        });

        console.log(`🚀 Server ready at http://localhost:${env.PORT}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

await testEmailConnection();
await createTestUserIfNeeded();
start();




