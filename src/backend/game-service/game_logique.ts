/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game_logique.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/13 17:23:50 by ckhater           #+#    #+#             */
/*   Updated: 2026/01/18 03:25:09 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class PongGame {
  paddleLeftY = 0
  paddleRightY = 0
  ballx = 0
  bally = 0
  ballVX = 0.18
  ballVY = 0.08
  move = false;
  starTime = Date.now();
  left=0;
  right=0;
  min=1;
  sec=30;
  stop = false;
  delta = 0;
  start = false;

  readonly Duration = 90000
  readonly PADDLE_HEIGHT = 2.4;
  readonly PLAY_AREA_WIDTH = 36 - 1;
  readonly PLAY_AREA_HEIGHT = 16;
  readonly MAX_p_Y = (this.PLAY_AREA_HEIGHT  / 2) - (this.PADDLE_HEIGHT / 2);
  readonly MAX_b_Y = (this.PLAY_AREA_HEIGHT / 2) - 0.35;
  readonly PADDLE_SPEED = 0.24;
  input = {
    leftUp: false,
    leftDown: false,
    rightUp: false,
    rightDown: false,
    timeout: true,
    mode: "bot",
  }


  update() {
    if(!this.move) return;
    
    if(this.input.mode != "bot"){
      if (this.input.leftUp) this.paddleLeftY += this.PADDLE_SPEED
      if (this.input.leftDown) this.paddleLeftY -= this.PADDLE_SPEED
    }
    
    if (this.input.rightUp) this.paddleRightY += this.PADDLE_SPEED
    if (this.input.rightDown) this.paddleRightY -= this.PADDLE_SPEED

      this.paddleLeftY = Math.max(-this.MAX_p_Y, Math.min(this.MAX_p_Y, this.paddleLeftY))
      this.paddleRightY = Math.max(-this.MAX_p_Y, Math.min(this.MAX_p_Y, this.paddleRightY))
    

    
    if(this.input.mode == "bot"){
      if(this.ballx <= 0){
        if(this.bally - this.delta > (this.paddleLeftY + (this.PADDLE_HEIGHT/4))  ){
          this.paddleLeftY += this.PADDLE_SPEED
        }
        else if (this.bally + this.delta < (this.paddleLeftY - (this.PADDLE_HEIGHT/4)) ){
          this.paddleLeftY -= this.PADDLE_SPEED
        }
         this.paddleLeftY = Math.max(-this.MAX_p_Y, Math.min(this.MAX_p_Y, this.paddleLeftY));
      }
    }

    
    if(this.input.timeout){
      var remain = Math.floor(((Date.now() - this.starTime) - this.Duration) / -1000)
      this.min = Math.floor(remain / 60)
      this.sec = remain % 60
    }
    
    if (this.bally > this.MAX_b_Y || this.bally < -this.MAX_b_Y) {
      this.ballVY *= -1
      this.ballx += this.ballVX
      this.bally += this.ballVY
    }
    
    else if(this.bally >= this.paddleLeftY - this.PADDLE_HEIGHT/2 && 
      this.bally <= this.paddleLeftY + this.PADDLE_HEIGHT/2 &&
      this.ballx <= -this.PLAY_AREA_WIDTH/2){
        this.ballVX *= -1;
        this.ballx +=  this.ballVX
        this.bally += this.ballVY
        this.delta = (Math.random()  < 0.5 ? 0 : 1);
    }
      else if (this.bally >= this.paddleRightY - this.PADDLE_HEIGHT/2 && 
      this.bally <= this.paddleRightY + this.PADDLE_HEIGHT/2 &&
      this.ballx  >= this.PLAY_AREA_WIDTH/2){
      this.ballVX *= -1;
      this.ballx +=  this.ballVX
      this.bally += this.ballVY
      this.delta = (Math.random()  < 0.5 ? 0 : 1);
    }
    else if (this.ballx < -this.PLAY_AREA_WIDTH/2 ) {
      this.right++;
      this.ballVX = 0.18 * (Math.random() < 0.5 ? 1 : -1)
      this.ballVY = 0.08 *(Math.random() < 0.5 ? 1 : -1)
      this.ballx = this.ballVX;
      this.bally = this.ballVY;
      this.delta = (Math.random()  < 0.5 ? 0 : 1);
    }
    else if (this.ballx > this.PLAY_AREA_WIDTH/2){
      this.left++;
      this.ballVX = 0.18 * (Math.random() < 0.5 ? 1 : -1)
      this.ballVY = 0.08 *(Math.random() < 0.5 ? 1 : -1)
      this.ballx = this.ballVX;
      this.bally = this.ballVY;
      this.delta = (Math.random()  < 0.5 ? 0 : 1);
    }
    else{
      this.ballx += this.ballVX
      this.bally += this.ballVY
    }
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
    };
  }
}
//npm install fastify socket.io
