import { Middleware } from "redux";
import { socketActions } from "../redux/features/socketSlice";
import SocketFactory, { SocketInterface } from "@/sockets/SocketFactory";
import { socketEventManager } from "@/sockets/socketEventManager";
import { SocketEventsListener, SocketEventsEmitter } from "@/sockets/socketEvents";

let socket: SocketInterface;

const socketMiddleware: Middleware = (store) => (next) => (action) => {
  // Create socket and initialize it + attach all event listeners
  if (socketActions.initSocket.match(action)) {
    if (!socket && typeof window !== "undefined") {
      socket = SocketFactory.create();
      socket.socket.connect();

      // Attach all event listeners
      Object.values(SocketEventsListener).forEach((event) => {
        socket.socket.on(event, (data: any) => {
          const handler = socketEventManager[event];
          if (handler) {
            handler(data, store);
          }
        });
      });
    }
  }

  // Emitters
  if (socket) {
    const { type, payload } = action as any;

    switch (type) {
      case socketActions.createMember.type:
        socket.socket.emit(SocketEventsEmitter.CreateMember, payload);
        break;

      case socketActions.deleteMember.type:
        socket.socket.emit(SocketEventsEmitter.DeleteMember, payload);
        break;

      case socketActions.createNewRoom.type:
        socket.socket.emit(SocketEventsEmitter.CreateNewRoom, payload);
        break;

      case socketActions.joinRoom.type:
        const roomId = payload.id;
        const password = payload.password;
        socket.socket.emit(SocketEventsEmitter.JoinRoom, { roomId, password });
        break;

      case socketActions.leaveRoom.type:
        socket.socket.emit(SocketEventsEmitter.LeaveRoom, payload);
        break;

      case socketActions.addMonsters.type:
        socket.socket.emit(SocketEventsEmitter.AddMonsters, payload);
        break;
      case socketActions.removeMonsters.type:
        socket.socket.emit(SocketEventsEmitter.RemoveMonsters, payload);
        break;
      case socketActions.selectWeaponAndDeck.type:
        socket.socket.emit(SocketEventsEmitter.SelectWeaponAndDeck, payload);
        break;
      case socketActions.startFigh.type:
        socket.socket.emit(SocketEventsEmitter.StartFigh);
        break;
      case socketActions.acceptFight.type:
        socket.socket.emit(SocketEventsEmitter.AcceptFight);
        break;
      case socketActions.rejectFight.type:
        socket.socket.emit(SocketEventsEmitter.RejectFight);
        break;
      case socketActions.selectSkill.type:
        socket.socket.emit(SocketEventsEmitter.SelectSkill, payload);
        break;
    }
  }

  next(action);
};

export default socketMiddleware;