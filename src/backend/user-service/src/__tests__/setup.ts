import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { prisma } from '../config/db';

beforeAll(async () => {
    // Connect to test database
    await prisma.$connect();
    console.log('Test database connected');
});

afterAll(async () => {
    // Cleanup and disconnect
    await prisma.$disconnect();
    console.log('Test database disconnected');
});

beforeEach(async () => {
    // Clean database before each test to ensure test isolation
    // Delete in order respecting foreign key constraints
    await prisma.twoFactorCode.deleteMany();
    await prisma.userTwoFactor.deleteMany();
    await prisma.passwordReset.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.friendship.deleteMany();
    await prisma.match.deleteMany();
    await prisma.user.deleteMany();
});
