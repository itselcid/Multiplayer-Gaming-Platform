/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   server.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/20 17:15:36 by ckhater           #+#    #+#             */
/*   Updated: 2026/01/15 10:02:12 by ckhater          ###   ########.fr       */
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



function generateroom(): string{
  const crypto = require("crypto");
  const byteLength = Math.floor(Math.random() * (8 - 4 + 1)) + 4;
  const id = crypto.randomBytes(Math.ceil(byteLength/2)).toString("hex");
  return id;
}  
  
const games:Map<string,PongGame> = new Map;
const logames:Map<string,PongGame> = new Map;


setInterval(() => {
  for (const [roomId, game] of games) {
    game.update();
    io.to(roomId).emit('state', game.getState());
  }
  for (const [roomId, logame] of logames) {
    logame.update();
    io.to(roomId).emit('state', logame.getState());
  }
}, 1000 / 30);


io.on('connection', (socket) => {
  console.log(`client connected ${socket.id}`);
  
 socket.once('joinroom',(id)=>{
    socket.join(id);
    socket.data.roomId = id;
  });
  
  socket.on('setroom',(room,fct)=>{
    room.id = generateroom();
    rooms.set(room.id, room);
    games.set(room.id,new PongGame);
    fct(room.id);
  });

  socket.on('logame', () => {const id = generateroom();
    logames.set(id,new PongGame);
    socket.data.roomId = id;
    socket.join(id);
  });
  
  socket.on('input', (input) => {
    const id = socket.data.roomId;
    if (!id) return;
    const game = games.get(id);
    const logame = logames.get(id);
    if (game){
      Object.assign(game.input, input);
      game.move = true;
    }
    else if (logame){
      Object.assign(logame.input, input);
      logame.move = true;
    }
  });
  
  socket.on('getroom', (id, fct) => {fct(rooms.get(id));});
  
  socket.on('verifyroom',(id,fct)=>{fct(rooms.has(id));});
  
  socket.on('gameOver',()=>{
     const id = socket.data.roomId;
     const game = games.get(id);
     const logame = logames.get(id);
     socket.leave(id);
     if(game && game.input.mode === "remote"){
       rooms.delete(id);
       games.delete(id);
     }
     else if (logame ){
       logames.delete(id);
      }
  });
  
  socket.on('disconnect', () => {
   
    console.log(`Client disconnected ${socket.id}`)
  });
})

const PORT = Number(process.env.PORT) || 3500
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Game service running on http://0.0.0.0:${PORT}`)
})
