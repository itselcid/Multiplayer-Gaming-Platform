import { createMessage } from "../prisma.js";
import { getRoomName, getsocket_id } from "./user.js";

export function register_message(io: any, socket: any)
{
    socket.on("send_message", async ({ to, content }: { to: number, content: string }) =>
    {
        const from = socket.userId;
        const room = getRoomName(from, to);
        // save message  in database
        const message = await createMessage(from, to , content);

        // emit message to room (to receiver)
        socket.to(room).emit("receive-message", {
        id: message.id,
        from,
        to,
        content: message.content,
        createdAt: message.createdAt,
        });
        
        //emit message to sender
        socket.emit("message-sent", {
        id: message.id,
        from,
        to,
        content: message.content,
        createdAt: message.createdAt,
        });
    })
}
