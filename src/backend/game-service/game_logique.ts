/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game_logique.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/13 17:23:50 by ckhater           #+#    #+#             */
/*   Updated: 2026/01/07 09:31:47 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class PongGame {
  paddleLeftY = 0
  paddleRightY = 0
  ballx = 0
  bally = 0
  ballVX = 0.2
  ballVY = 0.08
  move = false;
  starTime = 0
  left=0
  right=0
  min=1
  sec=30
  stop = false;
  mode = "bot";
  delta = 0;

  readonly Duration = 90000
  readonly PADDLE_HEIGHT = 2.6;
  readonly PLAY_AREA_WIDTH = 40 - 1;
  readonly PLAY_AREA_HEIGHT = 18;
  readonly MAX_p_Y = (this.PLAY_AREA_HEIGHT / 2) - (this.PADDLE_HEIGHT / 2);
  readonly MAX_b_Y = (this.PLAY_AREA_HEIGHT / 2) - 0.25;
  readonly PADDLE_SPEED = 0.3;
  input = {
    leftUp: false,
    leftDown: false,
    rightUp: false,
    rightDown: false,
    timeout: true,
  }


  update() {
    if(this.mode == "local"){
      if (this.input.leftUp) this.paddleLeftY += this.PADDLE_SPEED
      if (this.input.leftDown) this.paddleLeftY -= this.PADDLE_SPEED
    }
    
    if (this.input.rightUp) this.paddleRightY += this.PADDLE_SPEED
    if (this.input.rightDown) this.paddleRightY -= this.PADDLE_SPEED

    
    if(this.mode == "bot"){
      if(this.ballx <= 0){
        // if(this.delta === 0)
        //     this.delta = (Math.random() < 0.5 ? 0 : 1.7)
        if(this.bally - this.delta > (this.paddleLeftY + (this.PADDLE_HEIGHT/4))  ){
          this.paddleLeftY += this.PADDLE_SPEED
        }
        else if (this.bally + this.delta < (this.paddleLeftY - (this.PADDLE_HEIGHT/4)) ){
          this.paddleLeftY -= this.PADDLE_SPEED
        }
      }
    }

    this.paddleLeftY = Math.max(-this.MAX_p_Y, Math.min(this.MAX_p_Y, this.paddleLeftY))
    this.paddleRightY = Math.max(-this.MAX_p_Y, Math.min(this.MAX_p_Y, this.paddleRightY))

    if(this.stop){
      this.ballx = 0;
      this.bally = 0;
      return;
    }
    
    if(!this.move) return;
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
        // this.delta = 0;
      }
      else if (this.bally >= this.paddleRightY - this.PADDLE_HEIGHT/2 && 
      this.bally <= this.paddleRightY + this.PADDLE_HEIGHT/2 &&
      this.ballx  >= this.PLAY_AREA_WIDTH/2){
      this.ballVX *= -1;
      this.ballx +=  this.ballVX
      this.bally += this.ballVY
      this.delta = (Math.random()  < 0.5 ? 0 : 0.7);
      // console.log(this.delta);
    }
    else if (this.ballx < -this.PLAY_AREA_WIDTH/2 ) {
      this.right++;
      this.ballVX = 0.2 * (Math.random() < 0.5 ? 1 : -1)
      this.ballVY = 0.08 *(Math.random() < 0.5 ? 1 : -1)
      this.ballx = this.ballVX;
      this.bally = this.ballVY;
      // this.delta = 0;
    }
    else if (this.ballx > this.PLAY_AREA_WIDTH/2){
      this.left++;
      this.ballVX = 0.2 * (Math.random() < 0.5 ? 1 : -1)
      this.ballVY = 0.08 *(Math.random() < 0.5 ? 1 : -1)
      this.ballx = this.ballVX;
      this.bally = this.ballVY;
      this.delta = (Math.random() < 0.5 ? 0 : 0.7);
      // console.log(this.delta);
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
    this.stop = false;
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
    };
  }
}
//npm install fastify socket.io
