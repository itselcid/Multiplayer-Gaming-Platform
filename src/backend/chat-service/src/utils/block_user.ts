import { prisma} from "../prisma.js"

export async function blockuser(blockerId:number , blockedId :number)
{
    if(blockedId === blockerId)
    {
        throw new Error("can't block yourself");
    }
    return prisma.block.create({
        data:{
            blockerId,
            blockedId
        }
    });
}
export async function unblockuser(blockerId:number , blockedId :number)
{
    if(blockedId === blockerId)
    {
        throw new Error("can't block yourself");
    }
    return prisma.block.delete({
        where:{
            blockerId_blockedId: {
                blockerId,
                blockedId
            }
        }
    });
}

/// is the reciever blocker block the sender ??

export async function isBlocked(senderId:number ,receiverId :number)
{
    const block = await prisma.block.findUnique({
        where:{
            blockerId_blockedId:
            {
                blockerId : receiverId,
                blockedId : senderId
            }
        }
    });
    return block;
}
