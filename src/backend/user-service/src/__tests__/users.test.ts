import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { createTestServer, closeTestServer } from './helpers/test-server';

describe('User Protected Routes', () => {
    let server: FastifyInstance;

    beforeAll(async () => {
        server = await createTestServer();
    });

    afterAll(async () => {
        await closeTestServer(server);
    });

    describe('GET /api/users/me', () => {
        it('should return 401 when no authorization header is provided', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/users/me',
            });
            expect(response.statusCode).toBe(401);
        });
    });

    describe('GET /api/friends', () => {
        it('should return 401 when unauthorized', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/friends',
            });
            expect(response.statusCode).toBe(401);
        });
    });

    describe('PUT /api/users/me', () => {
        it('should return 401 when unauthorized', async () => {
            const response = await server.inject({
                method: 'PUT',
                url: '/api/users/me',
                payload: { username: 'ghost' },
            });
            expect(response.statusCode).toBe(401);
        });
    });
});
