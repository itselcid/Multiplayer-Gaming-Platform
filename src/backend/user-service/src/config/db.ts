import { PrismaClient } from "@prisma/client";

const isTest = process.env.NODE_ENV === 'test';

export const prisma = new PrismaClient({
    datasources: isTest ? {
        db: {
            url: 'file:./test.db',
        },
    } : undefined,
});
