/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   server.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/20 17:15:36 by ckhater           #+#    #+#             */
/*   Updated: 2026/01/12 04:20:48 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Fastify from 'fastify'
import http from 'http'
import { Server } from 'socket.io'
import { PongGame} from './game_logique'

interface Room{
  id:number;
  player1:string;
  avatar1:string;
  pid1:number;
  player2:string;
  avatar2:string;
  pid2:number;
}

var rooms:Map<number,Room> = new Map();


const fastify = Fastify()
const server = http.createServer(fastify.server)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const game = new PongGame()

// Health check endpoint
fastify.get('/health', async () => ({ status: 'ok', service: 'game-service' }))


setInterval(() => {
  game.update()
  io.emit('state', game.getState())
}, 1000 / 60)

io.on('connection', (socket) => {
  socket.on('bot',()=>{game.mode = "bot"});
  socket.on('local',()=>{game.mode = "local"});
  console.log('Client connected')
  socket.on('input', (input) => {
    Object.assign(game.input, input)
    if(!game.move)
      game.starTime = Date.now();
    game.move = true;
  })

  
  socket.on('pause',()=>{
    game.stop = true;
  })
  

    socket.on('resume',()=>{
    game.stop = false;
  })
  
  socket.on('disconnect', () => {
    console.log('Client disconnected')
    game.reset()
  })
})

const PORT = Number(process.env.PORT) || 3500
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Game service running on http://0.0.0.0:${PORT}`)
})
