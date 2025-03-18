import { io, Socket } from "socket.io-client";

export interface SocketInterface {
  socket: Socket;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string) => void;
}

const SERVER_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3020";

class SocketConnection implements SocketInterface {
  public socket: Socket;

  constructor() {
    this.socket = io(SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      autoConnect: false,
    });

    this.registerGlobalEvents();
  }

  private registerGlobalEvents() {
    this.socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    this.socket.on("connect_timeout", () => {
      console.warn("Socket connection timeout");
    });
  }

  connect() {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  emit(event: string, data?: any) {
    if (this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("Tried to emit event while socket is disconnected.");
    }
  }

  on(event: string, callback: (data: any) => void) {
    this.socket.on(event, callback);
  }

  off(event: string) {
    this.socket.off(event);
  }
}

let socketConnection: SocketConnection | undefined;

// The SocketFactory is responsible for creating and returning a single instance of the SocketConnection class
// Implementing the singleton pattern
class SocketFactory {
  public static create(): SocketConnection {
    if (!socketConnection) {
      socketConnection = new SocketConnection();
    }
    return socketConnection;
  }
}

export default SocketFactory;