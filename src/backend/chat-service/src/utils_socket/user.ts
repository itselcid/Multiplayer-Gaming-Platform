// link users_id with socket_id , each users have a socket 
const user_socket = new Map<number, string>();

export function adduser(userId: number, socket_id: string)
{
    user_socket.set(userId, socket_id)
}

export function getsocket_id(userId: number)
{
    return user_socket.get(userId);
}

export function delete_user(socket_id: string)
{
    for(let [userId, id] of user_socket.entries())
    {
        if(id == socket_id)
        {
            user_socket.delete(userId);
            return;
        }    
    }
}

export function getRoomName(userA: number, userB: number) {
  return `conversation:${Math.min(userA, userB)}-${Math.max(userA, userB)}`;
}
