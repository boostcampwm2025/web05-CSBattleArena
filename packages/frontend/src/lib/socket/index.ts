import { io, Socket } from 'socket.io-client';

let socket: Socket | undefined = undefined;
let currentToken: string | undefined = undefined;

export function getSocket(token: string | undefined): Socket {
  if (!socket || currentToken !== token) {
    socket?.disconnect();

    currentToken = token;
    socket = io(`/ws`, {
      transports: ['websocket'],
      auth: { token },
      autoConnect: false,
      reconnection: false,
    });
  }

  return socket;
}
