import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { createTestServer, closeTestServer } from './helpers/test-server';

describe('Server Health Check', () => {
    let server: FastifyInstance;

    beforeAll(async () => {
        server = await createTestServer();
    });

    afterAll(async () => {
        await closeTestServer(server);
    });

    describe('GET /health', () => {
        it('should return status ok', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/health',
            });

            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual({ status: 'ok' });
        });
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/api/auth/register',
                payload: {
                    email: 'test@example.com',
                    password: 'Test123!@#',
                    username: 'testuser',
                },
            });

            expect(response.statusCode).toBe(201);
            expect(response.json().user).toHaveProperty('id');
            expect(response.json().user).toHaveProperty('username');
        });

        it('should reject duplicate email', async () => {
            // First registration
            await server.inject({
                method: 'POST',
                url: '/api/auth/register',
                payload: {
                    email: 'duplicate@example.com',
                    password: 'Test123!@#',
                    username: 'user1',
                },
            });

            // Duplicate registration (same username)
            const response = await server.inject({
                method: 'POST',
                url: '/api/auth/register',
                payload: {
                    email: 'duplicate2@example.com',
                    password: 'Test123!@#',
                    username: 'user1',
                },
            });

            expect(response.statusCode).toBe(409);
            expect(response.json()).toHaveProperty('error');
        });

        it('should validate password requirements', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/api/auth/register',
                payload: {
                    email: 'weak@example.com',
                    password: '123',
                    username: 'weakuser',
                },
            });

            expect(response.statusCode).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            // Register user first
            await server.inject({
                method: 'POST',
                url: '/api/auth/register',
                payload: {
                    email: 'login@example.com',
                    password: 'Test123!@#',
                    username: 'loginuser',
                },
            });

            // Login using username (not email - as per LoginSchema)
            const response = await server.inject({
                method: 'POST',
                url: '/api/auth/login',
                payload: {
                    username: 'loginuser',
                    password: 'Test123!@#',
                },
            });

            expect(response.statusCode).toBe(200);
            expect(response.json()).toHaveProperty('message');
        });

        it('should reject invalid credentials', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/api/auth/login',
                payload: {
                    username: 'wronguser',
                    password: 'WrongPassword',
                },
            });

            expect(response.statusCode).toBe(401);
        });
    });
});
