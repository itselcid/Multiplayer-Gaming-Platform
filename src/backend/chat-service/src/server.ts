import Fastify from "fastify";
import { Server } from "socket.io";
import { setupSocket } from "./utils_socket/socket.js";

const fastify = Fastify({ logger: true });

const io = new Server(fastify.server, {
  cors: { origin: "*" }
});

setupSocket(io);

fastify.listen({ port: 4000 }, () => {
  console.log("Backend running on http://localhost:4000");
});
