import { Server, Socket } from "socket.io";
import { prisma } from "../prisma.js";
import { adduser, delete_user, getRoomName } from "./user.js";
import { register_message } from "./message.js";

interface CustomSocket extends Socket {
  userId?: number;
}

export function setupSocket(io: Server) {
  io.on("connection", (socket: CustomSocket) => {
    console.log("socket conected")

    socket.on("join", async (payload: any) => {
      const userId = typeof payload === 'object' && 'id' in payload ? Number(payload.id) : Number(payload);

      if (isNaN(userId)) {
        console.error("Invalid userId received:", payload);
        return;
      }

      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          // You need a username. For now, we can create a placeholder.
          // Ideally, the client would send the username along with the ID.
          username: `user_${userId}`,
        },
      });
      socket.userId = userId;
      socket.join(userId.toString()); // Join a room with the user's ID
      adduser(userId, socket.id)
      console.log(`User ${userId} connected and joined room ${userId}`);
    });
    ///// all logic her

    // join private room 
    socket.on("join-conversation", (otherUserId: number) => {
      try {
        if (!socket.userId) {
          console.warn(`Socket ${socket.id} tried to join conversation but has no userId`);
          return;
        }
        const room = getRoomName(socket.userId, otherUserId);
        socket.join(room); // <--- join the room
        console.log(`User ${socket.userId} joined room ${room}`);
      } catch (err) {
        console.error("Error joining conversation:", err);
      }
    });
    // register
    register_message(io, socket);

    socket.on("disconnect", () => {
      delete_user(socket.id);
    });

  });
}
