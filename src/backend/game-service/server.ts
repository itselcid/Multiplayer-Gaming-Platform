/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   server.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/20 17:15:36 by ckhater           #+#    #+#             */
/*   Updated: 2026/01/14 07:56:21 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Fastify from 'fastify'
import http from 'http'
import { Server } from 'socket.io'
import { PongGame} from './game_logique'

interface Room{
  id:string;
  player1:string;
  pid1:number;
  player2:string;
  pid2:number;
}

var rooms:Map<string,Room> = new Map();

function generateroom(): string{
  // const chars: string = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  // let id :string = "";
  // const l = (Math.random() < 0.5 ? 5 : 8);
  
  // for(let j = 0; j < l; j++){
  //    const i = Math.floor(Math.random() * chars.length);
  //   id += chars[i];
  // }
  const crypto = require("crypto");
const byteLength = Math.floor(Math.random() * (6 - 4 + 1)) + 4;
  const id = crypto.randomBytes(Math.ceil(byteLength/2)).toString("hex");
  // console.log(id);
  return id;
}

const fastify = Fastify()
const server = http.createServer(fastify.server)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})


// Health check endpoint
fastify.get('/health', async () => ({ status: 'ok', service: 'game-service' }))



io.on('connection', (socket) => {
  console.log(`client connected ${socket.id}`);
  const game = new PongGame()
  
  setInterval(() => {
    game.update()
    socket.emit('state', game.getState())
  }, 1000 / 30);
  
  socket.on('setroom',(room)=>{
    console.log("fchkeeel");
    console.log(room);
    room.id = generateroom();
    rooms.set(room.id, room);
    console.log(rooms);
    console.log(room.id);
    socket.emit('id',room.id);
  });

  socket.on('input', (input) => {
    Object.assign(game.input, input)
    // if(!game.move)
    //   game.starTime = Date.now();
    game.move = true;
  });


    socket.on('mode',(mode)=>{game.mode = mode});
    
  socket.on('verifyroom',(id)=>{const exist:boolean = rooms.has(id);
    // console.log(exist);
    socket.emit('verified',exist);
  });
  
  socket.on('pause',()=>{
    game.stop = true;
  });
  

    socket.on('resume',()=>{
    game.stop = false;
  });
  
  socket.on('gameOver',()=>{
    game.reset();
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected ${socket.id}`)
  })
})

const PORT = Number(process.env.PORT) || 3500
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Game service running on http://0.0.0.0:${PORT}`)
})
