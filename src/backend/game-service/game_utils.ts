/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game_utils.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/13 17:23:50 by ckhater           #+#    #+#             */
/*   Updated: 2026/01/31 19:41:08 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import amqp, { Channel , ConsumeMessage} from 'amqplib';
import { setroom } from './server';

export interface MatchResult {
    player1Id?: number;
    player2Id?: number;
    score1: number;
    score2: number;
    startedAt: string;
}

export interface Player {
    addr?: string;
    username: string;
}

export interface Match {
  id:string;
	player1: Player;
	player1Score: number;
  player2: Player;
	player2Score: number;
}

export interface Room{
  id:string;
  player1:string;
  wallet1:string | undefined;
  pid1:number | undefined;
  player2:string;
  wallet2:string | undefined;
  pid2:number | undefined;
  join1:number;
  join2:number;
  startedAt: string;
  created:number;
}

export class rabbitmq {
  private channel_match: Channel | null = null;
  private channel_game: Channel | null = null;
  private consume_match: Channel | null = null;
  private conne_match: any = null;
  private conne_game: any = null;
  private readonly QUEUE_GAME = 'game_finished';
  private readonly QUEUE_MATCH = 'match_finished';
  private readonly QUEUE_CREAT = 'match_created';
  
  async start() {
    try {
      const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost'; 
      this.conne_game = await amqp.connect(rabbitUrl, {rejectUnauthorized: false});
      this.channel_game= await this.conne_game.createChannel();
      await this.channel_game!.assertQueue(this.QUEUE_GAME, {durable: true });
      console.log(`Connected to RabbitMQ, listening on ${this.QUEUE_GAME}`);
      this.conne_match = await amqp.connect(rabbitUrl, {rejectUnauthorized: false});
      this.channel_match= await this.conne_match.createChannel();
      this.consume_match = await this.conne_match.createChannel();
      await this.consume_match?.assertQueue(this.QUEUE_CREAT, {durable: true });
      console.log(`Connected to RabbitMQ, listening on ${this.QUEUE_MATCH}`);
      this.getMatch();
    }
    catch(error){
       console.error('RabbitMQ Connection Failed:', error);
        setTimeout(() => this.start(), 5000);
    }     
  }
  
  publishGame(data: MatchResult){
    const jsonresult = JSON.stringify(data,null,2);
    this.channel_game?.sendToQueue(this.QUEUE_GAME,  Buffer.from(jsonresult),{persistent: true});
    console.log(`game published: `, data);
  }

  async publishMatch(data: Match){
    const jsonresult = JSON.stringify(data,null,2);
    await this.channel_match?.sendToQueue(this.QUEUE_MATCH,  Buffer.from(jsonresult),{persistent: true});
    console.log(`match published: `, data);
    
  }
  
  getMatch(){
     if (!this.consume_match) return;

        this.consume_match.consume(this.QUEUE_CREAT, async (msg: ConsumeMessage | null) => {
            if (msg !== null) {
                try {
                    const content = msg.content.toString();
                    const matchData: Match = JSON.parse(content);
                    const room : Room = {id : matchData.id, join1:0, join2:0, created:Date.now(),
                      player1:matchData.player1.username, player2:matchData.player2.username,pid1:undefined,
                      pid2:undefined, wallet1:matchData.player1.addr, wallet2:matchData.player2.addr,startedAt:new Date().toISOString(),
                    };
                    setroom(room);
                    this.consume_match?.ack(msg);
                } catch (err) {
                    console.error('Error processing match result:', err);
                    this.consume_match?.ack(msg);
                }
        }
  
})
  }
  
}

export class PongGame {
  starTime = Date.now();
  paddleLeftY = 0;
  paddleRightY = 0;
  ballx = 0;
  bally = 0;
  ballVX = 0.22; 
  ballVY = 0.12; 
  move = false;
  start = false;
  stop = true;
  left = 0;
  right = 0;
  min = 1;
  sec = 30;
  delta = 0;
  gameOver = false;
  updt = 0;

  readonly Duration = 7000;
  readonly PADDLE_HEIGHT = 2.3;
  readonly PLAY_AREA_WIDTH = 38;
  readonly PLAY_AREA_HEIGHT = 16;
  readonly MAX_p_Y = (this.PLAY_AREA_HEIGHT / 2) - (this.PADDLE_HEIGHT / 2);
  readonly MAX_b_Y = (this.PLAY_AREA_HEIGHT / 2) - 0.35;
  readonly PADDLE_SPEED = 0.35;

  input = {
    leftUp: false,
    leftDown: false,
    rightUp: false,
    rightDown: false,
    mode: "bot",
  }

  private calculateBounce(paddleY: number, ballY: number) {
    const relativeIntersectY = (ballY - paddleY) / (this.PADDLE_HEIGHT / 2);
    this.ballVX *= -1.03; 
    this.ballVY = relativeIntersectY * 0.12; 
  }

  update() {
    if (!this.move) return;

    if (this.input.mode !== "bot") {
      if (this.input.leftUp) this.paddleLeftY += this.PADDLE_SPEED;
      if (this.input.leftDown) this.paddleLeftY -= this.PADDLE_SPEED;
    } else if (this.ballx <= 0){
        if(this.bally - this.delta > (this.paddleLeftY + (this.PADDLE_HEIGHT/4))  ){
          this.paddleLeftY += this.PADDLE_SPEED
        }
        else if (this.bally + this.delta < (this.paddleLeftY - (this.PADDLE_HEIGHT/4)) ){
          this.paddleLeftY -= this.PADDLE_SPEED
        }
      }

    if (this.input.rightUp) this.paddleRightY += this.PADDLE_SPEED;
    if (this.input.rightDown) this.paddleRightY -= this.PADDLE_SPEED;

    this.paddleLeftY = Math.max(-this.MAX_p_Y, Math.min(this.MAX_p_Y, this.paddleLeftY));
    this.paddleRightY = Math.max(-this.MAX_p_Y, Math.min(this.MAX_p_Y, this.paddleRightY));

    if (this.stop) return;

    const elapsed = Date.now() - this.starTime;
    const remain = Math.max(0, Math.floor((this.Duration - elapsed) / 1000));
    this.min = Math.floor(remain / 60);
    this.sec = remain % 60;

    if (remain <= 0 && this.right !== this.left) {
      this.gameOver = true;
      return;
    }

    if(this.updt % 2 !== 0) return;
    
    this.ballx += this.ballVX;
    this.bally += this.ballVY;
    
    if (Math.abs(this.bally) >= this.MAX_b_Y) {
      this.ballVY *= -1;
      this.bally = Math.sign(this.bally) * this.MAX_b_Y; 
    }

    if (this.ballx <= -this.PLAY_AREA_WIDTH / 2 && 
        this.bally >= this.paddleLeftY - this.PADDLE_HEIGHT/2 && 
        this.bally <= this.paddleLeftY + this.PADDLE_HEIGHT/2) {
      this.calculateBounce(this.paddleLeftY, this.bally);
      this.ballx = -this.PLAY_AREA_WIDTH / 2 + 0.1;
      this.delta = (Math.random()  < 0.5 ? 0.2 : 1);
    }
    else if (this.ballx >= this.PLAY_AREA_WIDTH / 2 && 
             this.bally >= this.paddleRightY - this.PADDLE_HEIGHT/2 && 
             this.bally <= this.paddleRightY + this.PADDLE_HEIGHT/2) {
      this.calculateBounce(this.paddleRightY, this.bally);
      this.ballx = this.PLAY_AREA_WIDTH / 2 - 0.1;
      this.delta = (Math.random()  < 0.5 ? 0.2 : 1.4);
    }

    if (this.ballx < -this.PLAY_AREA_WIDTH / 2 ) {
      this.right++;
      this.resetPoint(1);
      this.delta = (Math.random()  < 0.5 ? 0.2 : 1);
    } else if (this.ballx > this.PLAY_AREA_WIDTH / 2 ) {
      this.left++;
      this.resetPoint(-1);
      this.delta = (Math.random()  < 0.5 ? 0.2 : 1.4);
    }
  }

  resetPoint(direction: number) {
    this.ballx = 0;
    this.bally = 0;
    this.ballVX = 0.20 * direction;
    this.ballVY = (Math.random() - 0.5) * 0.12;
  }

  reset(){
    this.paddleLeftY = 0;
    this.paddleRightY = 0;
    this.input.leftUp = false;
    this.input.leftDown = false;
    this.input.rightDown = false ;
    this.input.rightUp = false;
    this.ballx = 0;
    this.bally = 0;
    this.min = 1;
    this.sec = 30;
    this.left = 0;
    this.right = 0;
    this.move = false;
    this.start = false;
  }
  getState() {
    return {
      paddleLeftY: this.paddleLeftY,
      paddleRightY: this.paddleRightY,
      ballx: this.ballx,
      bally: this.bally,
      left: this.left,
      right: this.right,
      min: this.min,
      sec: this.sec,
      start: this.start,
      move: this.move,
      stop: this.stop,
      gameOver: this.gameOver
    };
  }
}

