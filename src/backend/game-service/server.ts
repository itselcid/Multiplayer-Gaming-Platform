/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   server.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/20 17:15:36 by ckhater           #+#    #+#             */
/*   Updated: 2026/01/23 07:47:32 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Room, MatchResult, PongGame } from './game_logique';
import amqp, { Channel } from 'amqplib';
import { Server } from 'socket.io'
import Fastify from 'fastify'
import http from 'http'



const rooms:Map<string,Room> = new Map();
const games:Map<string,PongGame> = new Map;
const logames:Map<string,PongGame> = new Map;
const tour:Map<string,Room> = new Map();



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
  console.log(`in generate room ${id}`);
  return id;
}

async function publishMatch(data: MatchResult) {
  const jsonresult = JSON.stringify(data,null,2);
  try{
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost'; 
    const connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();
    channel.sendToQueue("match_finished",  Buffer.from(jsonresult),{persistent: true});
      console.log(`📤 Published match result to match_finished`, data);
  }
  catch(error){
    console.error('RabbitMQ Connection Failed:', error);
    setTimeout(() => publishMatch(data), 5000);
  }
  
}



    function sendMAtch(id: string){
      const room = rooms.get(id);
      const game = games.get(id);
      if(room && game){
        const result: MatchResult = { player1Id: room.pid1, player2Id: room.pid2, score1: game.right,
          score2: game.left,startedAt: room.startedAt};
        publishMatch(result);
        } 
    }



    // setInterval(()=>{
//   for (const [roomId, room] of rooms) {
//     if (Date.now() - room.timeout > ) 
//   }
// },60000*3)


io.on('connection', (socket) => {
  console.log(`client connected ${socket.id}`);
  
  
  socket.once('joinroom',(id, pid)=>{
    socket.join(id);
    socket.data.roomId = id;
    const game = games.get(id);

    const room = rooms.get(id);
    if (room){
      if(room.pid1 == pid){
        room.join1 += 1;
      } 
      if(room.pid2 == pid){
        room.join2 += 1;
      }
 
    }
  });
  
  socket.on('setroom',(room,fct)=>{
    room.id = generateroom();
    room.join1 = 0;
    room.join2 = 0;
    rooms.set(room.id, room);
    const game = new PongGame;
    games.set(room.id,game);
    fct(room.id);
  });

  socket.on('logame', () => {const id = generateroom();
    logames.set(id,new PongGame);
    socket.data.roomId = id;
    socket.join(id);
  });
  
  socket.on('input', (input, fct) => {
const id = socket.data.roomId;
    if (!id) return;
    const game = games.get(id);
    const room = rooms.get(id);
    const logame = logames.get(id);
    if (game){
      game.updt++;
      Object.assign(game.input, input);
      if(room && room.join1 && room.join2 && !game.move){
        io.to(id).emit('resume');
        game.move = true;
        game.start = true;
      }
      // if(game.updt %2 == 0)
        game.update();
      fct(game.getState());
    }
    else if (logame){
      Object.assign(logame.input, input);
      if(!logame.move){
        logame.move = true;
        logame.start = true;
      }
      logame.update();
      fct(logame.getState());
    }

  });
  

    socket.on('start',()=>{
    const id = socket.data.roomId;
    if (!id) return;
    const game = games.get(id);
    const room = rooms.get(id);
    const logame = logames.get(id);
    if(game && room && game.stop){
      game.starTime = Date.now();
      room.startedAt = new Date().toISOString();
      game.stop = false;
    }
    else if (logame &&logame.stop){
      logame.starTime = Date.now();
      // room.startedAt = new Date().toISOString();
      logame.stop = false;
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
      game.delet++;
      if(game.delet == 2){
          sendMAtch(id);
          rooms.delete(id);
          games.delete(id);
        
       }
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
