import amqp, { Channel , ConsumeMessage} from 'amqplib';
import {Player} from './contract/contracts';

export interface MatchMsg{
    id:`0x${string}`;
	player1: Player;
	player1Score: number;
    player2: Player;
    player2Score: number;
}

export class rabbitmq {
  private channel_match: Channel | null = null;
  private conne_match: any = null;
  private readonly QUEUE_MATCH = 'match_finished';
  
  async start() {
    try {
      const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost'; 
      this.conne_match = await amqp.connect(rabbitUrl);
      this.channel_match= await this.conne_match.createChannel();
      await this.channel_match.assertQueue(this.QUEUE_MATCH, {durable: true });
      console.log(`Connected to RabbitMQ, listening on ${this.QUEUE_MATCH}`);
    }
    catch(error){
       console.error('RabbitMQ Connection Failed:', error);
        setTimeout(() => this.start(), 5000);
    }     
  }
  

  publishMatch(data: MatchMsg){
    const jsonresult = JSON.stringify(data,null,2);
    this.channel_match.sendToQueue(this.QUEUE_MATCH,  Buffer.from(jsonresult),{persistent: true});
    console.log(`match published: `, data);
    
  }
  
  getMatch() {
    if (!this.channel_match) return;

        this.channel_match.consume(this.QUEUE_MATCH, async (msg: ConsumeMessage | null) => {
            if (msg !== null) {
                try {
                    const content = msg.content.toString();
                    const matchData: MatchMsg = JSON.parse(content);

                    console.log('Received match result:', matchData); //! logs

                    // Save to DB

                    // Acknowledge message (remove from queue)
                    this.channel_match.ack(msg);
                } catch (err) {
                    console.error('Error processing match result:', err);
                    // we drop the message if it fails to process, data not really thet important lol
                    this.channel_match.ack(msg);
                }
            }
  
})
  }
}