import { FastifyInstance } from 'fastify';
import buildServer from '../../app';

export async function createTestServer(): Promise<FastifyInstance> {
    const server = await buildServer();
    await server.ready();
    return server;
}

export async function closeTestServer(server: FastifyInstance): Promise<void> {
    await server.close();
}
