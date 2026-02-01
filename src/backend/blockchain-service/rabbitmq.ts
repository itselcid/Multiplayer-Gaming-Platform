import amqp, { Channel , ConsumeMessage} from 'amqplib';
import {Player} from './contract/contracts';
import { transact } from './automation/tournamentBot';

export interface MatchMsg{
    id:`0x${string}`;
	player1: Player;
	player1Score: number;
    player2: Player;
    player2Score: number;
}

export class rabbitmq {
  private channel_match: Channel | null = null;
  private consum_match: Channel | null = null;
  private conne_match: any = null;
  private readonly QUEUE_MATCH = 'match_finished';
  private readonly QUEUE_CREAT = 'match_created';
  
	async start() {
		try {
		const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost'; 
		this.conne_match = await amqp.connect(rabbitUrl, {rejectUnauthorized: false});
		this.channel_match= await this.conne_match.createChannel();
		this.consum_match= await this.conne_match.createChannel();
		await this.consum_match?.assertQueue(this.QUEUE_MATCH, {durable: true });
		this.getMatch();
		console.log(`Connected to RabbitMQ, listening on ${this.QUEUE_MATCH}`);
		}
		catch(error){
		console.error('RabbitMQ Connection Failed:', error);
			setTimeout(() => this.start(), 5000);
		}     
	}
	

	publishMatch(data: MatchMsg){
		const jsonresult = JSON.stringify(data,null,2);
		this.channel_match?.sendToQueue(this.QUEUE_CREAT,  Buffer.from(jsonresult),{persistent: true});
		console.log(`match published: `, data);
		
	}
  
	getMatch() {
		if (!this.consum_match) return;

		this.consum_match.consume(this.QUEUE_MATCH, async (msg: ConsumeMessage | null) => {
			if (msg !== null) {
				try {
					const content = msg.content.toString();
					const matchData: MatchMsg = JSON.parse(content);

					console.log('Received match result:', matchData); //! logs

					// Save to DB
					await transact('submitMatchScore', [matchData.id, BigInt(matchData.player1Score), BigInt(matchData.player2Score)]);

					// Acknowledge message (remove from queue)
					this.consum_match?.ack(msg);
				} catch (err) {
					console.error('Error processing match result:', err);
					// we drop the message if it fails to process, data not really thet important lol
					this.consum_match?.ack(msg);
				}
			}
		})
	}
}