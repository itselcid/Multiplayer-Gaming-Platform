// everythink related to database
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export function createMessage(senderID: number, receiverID: number, content: string)
{
    return prisma.message.create({
        data:{
            senderId: senderID,
            receiverId: receiverID,
            content: content,
        }
    });
}