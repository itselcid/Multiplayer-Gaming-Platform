import { createMessage } from "../prisma.js";
import { getRoomName, getsocket_id } from "./user.js";
import { isBlocked } from "./block_user.js";

export function register_message(io: any, socket: any)
{
    socket.on("send_message", async ({ to, content }: { to: number, content: string }) =>
    {
        try {
            const from = socket.userId;
            if (!from) {
                console.error("User ID not found on socket. Make sure 'join' event is emitted.");
                return;
            }
            
            console.log(`Processing message from ${from} to ${to}`);

            // 1. Check if the receiver has blocked the sender
            const blocked = await isBlocked(from, to);
            
            if (blocked) {
                // Option B: Send error back to sender
                socket.emit("error", { message: "You have been blocked by this user." });
                return; // STOP here. Do not save to DB, do not emit to receiver.
            }

            // save message  in database
            const message = await createMessage(from, to , content);
            console.log("Message saved to DB:", message.id);

            // emit message to receiver (using their user ID room)
            io.to(to.toString()).emit("receive-message", {
                id: message.id,
                from,
                to,
                content: message.content,
                createdAt: message.createdAt,
            });
            
            // Also emit to sender to confirm and update other tabs
            io.to(from.toString()).emit("receive-message", {
                id: message.id,
                from,
                to,
                content: message.content,
                createdAt: message.createdAt,
            });

        } catch (error) {
            console.error("Error processing send_message:", error);
        }
    })
}
