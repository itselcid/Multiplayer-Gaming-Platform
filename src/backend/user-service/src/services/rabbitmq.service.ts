
import amqp, { Channel, ConsumeMessage } from 'amqplib';
import { prisma } from '../config/db';

interface MatchResult {
    player1Id: number;
    player2Id?: number; // Optional, might be null if guest
    score1: number;
    score2: number;
    startedAt: string; // ISO string
}

class RabbitMQService {
    private connection: any = null;
    private channel: Channel | null = null;
    private readonly QUEUE_NAME = 'match_finished';

    async initialize() {
        try {
            // Connect to RabbitMQ
            const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';  // add RABBITMQ_URL to your env vars later
            this.connection = await amqp.connect(rabbitUrl);
            this.channel = await this.connection.createChannel();

            // Assert Queue (make sure it exists)
            await this.channel.assertQueue(this.QUEUE_NAME, {
                durable: true // Queue survives broker restart
            });

            console.log(`🐰 Connected to RabbitMQ, listening on ${this.QUEUE_NAME}`);  //! logs

            // Start consuming
            this.consume();
        } catch (error) {
            console.error('RabbitMQ Connection Failed:', error);
            // Retry logic could go here
            setTimeout(() => this.initialize(), 5000);
        }
    }

    private consume() {
        if (!this.channel) return;

        this.channel.consume(this.QUEUE_NAME, async (msg: ConsumeMessage | null) => {
            if (msg !== null) {
                try {
                    const content = msg.content.toString();
                    const matchData: MatchResult = JSON.parse(content);

                    console.log('Received match result:', matchData); //! logs

                    // Save to DB
                    await this.saveMatch(matchData);

                    // Acknowledge message (remove from queue)
                    this.channel?.ack(msg);
                } catch (err) {
                    console.error('Error processing match result:', err);
                    // If strictly malformed, maybe ack to discard. 
                    // If DB error, maybe nack to retry? 
                    // For now, we ack to avoid infinite looks on bad data.
                    this.channel?.ack(msg);
                }
            }
        });
    }

    public async publishMatch(data: MatchResult) {
        if (!this.channel) throw new Error("RabbitMQ Channel not initialized");
        this.channel.sendToQueue(this.QUEUE_NAME, Buffer.from(JSON.stringify(data)), {
            persistent: true
        });
        console.log(`📤 Published match result to ${this.QUEUE_NAME}`, data);   //! logs
    }

    private async saveMatch(data: MatchResult) {       // finish this logic
        try {
            // Verify player 1 exists
            const player1 = await prisma.user.findUnique({ where: { id: data.player1Id } });  //! add this to db.ts
            if (!player1) {
                console.warn(`User ${data.player1Id} not found, skipping match save.`);
                return;
            }

            // Verify player 2 if provided
            let player2Id: number | null = null;
            if (data.player2Id) {
                const player2 = await prisma.user.findUnique({ where: { id: data.player2Id } });
                if (player2) {
                    player2Id = player2.id;
                }
            }

            await prisma.match.create({
                data: {
                    player1Id: data.player1Id,
                    player2Id: player2Id,
                    score1: data.score1,
                    score2: data.score2,
                    startedAt: new Date(data.startedAt)
                }
            });
            console.log(`✅ Match saved to DB`, data); //! logs
        } catch (e) {
            console.error('Prisma Error saving match:', e);
            throw e; // Re-throw to handle in consume (nack vs ack)
        }
    }
}

export const rabbitMQService = new RabbitMQService();
