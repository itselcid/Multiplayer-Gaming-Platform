
import amqp, { Channel, ConsumeMessage } from 'amqplib';
import { MatchResult } from '../types/user.types';
import { saveMatch } from '../db';
import { env } from '../config/env';

class RabbitMQService {
    private connection: any = null;
    private channel: Channel | null = null;
    private readonly QUEUE_NAME = 'match_finished';

    //  --------- -------------- -------------- ------------- ------------- ------------- ------------- ----------- //
    async initialize() {
        try {
            // Connect to RabbitMQ
            const rabbitUrl = env.RABBITMQ_URL || 'amqp://localhost';  // add RABBITMQ_URL to your env vars later
            this.connection = await amqp.connect(rabbitUrl);
            this.channel = await this.connection.createChannel();

            // Assert Queue (make sure it exists)
            await this.channel.assertQueue(this.QUEUE_NAME, {
                durable: true // Queue survives broker restart
            });

            console.log(`Connected to RabbitMQ, listening on ${this.QUEUE_NAME}`);  //! logs

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
                    if (matchData.player1Id)
                        matchData.player1Id = Number(matchData.player1Id);
                    if (matchData.player2Id)
                        matchData.player2Id = Number(matchData.player2Id);
                    await saveMatch(matchData);

                    // Acknowledge message (remove from queue)
                    this.channel?.ack(msg);
                } catch (err) {
                    console.error('Error processing match result:', err);
                    // we drop the message if it fails to process, data not really thet important lol
                    this.channel?.ack(msg);
                }
            }
        });
    }

    // public async publishMatch(data: MatchResult) {
    //     if (!this.channel) throw new Error("RabbitMQ Channel not initialized");
    //     this.channel.sendToQueue(this.QUEUE_NAME, Buffer.from(JSON.stringify(data)), {
    //         persistent: true
    //     });
    //     console.log(`📤 Published match result to ${this.QUEUE_NAME}`, data);   //! logs
    // }

}

export const rabbitMQService = new RabbitMQService();
