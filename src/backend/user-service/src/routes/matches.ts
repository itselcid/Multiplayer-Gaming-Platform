
import { FastifyInstance } from 'fastify';
import { rabbitMQService } from '../services/rabbitmq.service';
import { z } from 'zod';

const MatchSchema = z.object({
    player1Id: z.number(),
    player2Id: z.number().optional().nullable(),
    score1: z.number(),
    score2: z.number(),
});

export default async function matchesRoutes(server: FastifyInstance) {
    server.post('/test', {
        onRequest: [server.authenticate]
    }, async (request, reply) => {
        try {
            const data = MatchSchema.parse(request.body);

            await rabbitMQService.publishMatch({
                ...data,
                startedAt: new Date().toISOString(),
                player2Id: data.player2Id || undefined
            });

            return reply.send({ message: 'Match result published to queue' });
        } catch (error) {
            return reply.status(400).send({ error: 'Invalid data' });
        }
    });
}
