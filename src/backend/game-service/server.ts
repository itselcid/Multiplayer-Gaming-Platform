/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   server.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/20 17:15:36 by ckhater           #+#    #+#             */
/*   Updated: 2026/01/06 08:31:53 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Fastify from 'fastify'
import http from 'http'
import { Server } from 'socket.io'
import { PongGame} from './game_logique'




const fastify = Fastify()
const server = http.createServer(fastify.server)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const game = new PongGame()


setInterval(() => {
  game.update()
  io.emit('state', game.getState())
}, 1000 / 64)

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

server.listen(3500, () => {
  console.log('Server running on http://localhost:3500')
})
