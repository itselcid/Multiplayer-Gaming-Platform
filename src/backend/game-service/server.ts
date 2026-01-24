/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   server.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/20 17:15:36 by ckhater           #+#    #+#             */
/*   Updated: 2026/01/24 23:23:43 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Room, MatchResult, PongGame, rabbitmq, Match, Player} from './game_utils';
import { Server } from 'socket.io'
import Fastify from 'fastify'
import http from 'http'



const rooms:Map<string,Room> = new Map();
const games:Map<string,PongGame> = new Map;
const logames:Map<string,PongGame> = new Map;
const tour:Map<string,PongGame> = new Map();
const service = new rabbitmq();


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



  function sendMAtch(id: string){
    const room = rooms.get(id);
    const game = games.get(id);
    const match = tour.get(id);
    if(room && game){
      const result: MatchResult = { player1Id: room.pid1, player2Id: room.pid2, score1: game.right,
        score2: game.left,startedAt: room.startedAt};
      service.publishGame(result);
    } 
    if(room && match){
      const Player1 :Player = {addr: room.wallet1, username:room.player1, claimed:true};
      const player2:Player = {addr: room.wallet2, username:room.player2, claimed:true};
      const result: Match = {player1:Player1, player1Score: match.right, player2:player2,
        player2Score:match.left,status:0};
      service.publishMatch(result);
    }
  }

  setInterval(()=>{
    rooms.forEach(room => {
      if (Date.now() - room.created > 1000*10*60){
        const id  = room.id;
        const game = games.get(id);
        const match = tour.get(id);
        if(game && !game.updt){
          games.delete(id);
          rooms.delete(id);
        }
        if(match && !match.updt){
          tour.delete(id);
          rooms.delete(id);
        }
      }
    });
  },10000*120);

io.on('connection', (socket) => {
  console.log(`client connected ${socket.id}`);
  
  socket.once('joinroom',(wallet,id, pid)=>{
    socket.join(id);
    socket.data.roomId = id;
    const room = rooms.get(id);
    if(!wallet){
      if (room){
        if(room.pid1 == pid){
          room.join1 += 1;
        } 
        if(room.pid2 == pid){
          room.join2 += 1;
        }
      }
    }
    else{
      if(room){
        if(room.wallet1 == wallet){
          room.join1 += 1;
        } 
        if(room.wallet2 == wallet){
          room.join2 += 1;
        }
      }  
    }
  });
  
  
  socket.on('setroom',(room,fct)=>{
    room.id = generateroom();
    room.join1 = 0;
    room.join2 = 0;
    room.created = Date.now();
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
    const match = tour.get(id);
    if(match){
      match.updt++;
      Object.assign(match.input, input);
       if(room && room.join1 && room.join2 && !match.move){
        io.to(id).emit('resume');
        match.move = true;
        match.start = true;
      }
      match.update();
      fct(match.getState());
    }
    if (game){
      game.updt++;
      Object.assign(game.input, input);
      if(room && room.join1 && room.join2 && !game.move){
        io.to(id).emit('resume');
        game.move = true;
        game.start = true;
      }
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
    const match = tour.get(id);
    const game = games.get(id);
    const room = rooms.get(id);
    const logame = logames.get(id);
    if(match && room  && match.stop){
      match.starTime = Date.now();
      room.startedAt = new Date().toISOString();
      match.stop = false;
    }
    else if(game && room && game.stop){
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
  

  socket.on('verifyroom',(mode,id,fct)=>{
    if(mode === "match"){
      fct(tour.has(id));
    }
    else
      fct(rooms.has(id));
  });
  
socket.on('gameOver',()=>{
     const id = socket.data.roomId;
     const game = games.get(id);
     const match = tour.get(id);
     socket.leave(id);
     if(game){
       game.delet++;
       if(game.delet == 2){
         sendMAtch(id);
         rooms.delete(id);
         games.delete(id);
        }
      }
      else if (match){
        sendMAtch(id);
        rooms.delete(id);
        tour.delete(id);
      }
    });
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected ${socket.id}`)
      const id = socket.data.roomId;
      const logame = logames.get(id);
      if(logame){
        logames.delete(id);
      }
  });
})

const PORT = Number(process.env.PORT) || 3500
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Game service running on http://0.0.0.0:${PORT}`)
})

service.start();

