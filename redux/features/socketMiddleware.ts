import { Middleware } from "redux";
// Actions
import { Deck, MemberInfo, Room, RoomCreatedInfo, RoomInfo, socketActions } from "./socketSlice";
// Socket Factory
import SocketFactory from "@/sockets/SocketFactory";
import type { SocketInterface } from "@/sockets/SocketFactory";
import * as Member from '@/sockets/@types/Member';
import * as Monster from '@/sockets/@types/Monster';
import { connect } from "./authSlice";

enum SocketEvent {
  // Native events
  Connect = "connect",
  Disconnect = "disconnect",
  // Emit events
  CreateMember = "createMember",
  DeleteMember = "deleteMember",
  CreateNewRoom = "createNewRoom",
  JoinRoom = "joinRoom",
  LeaveRoom = "leaveRoom",
  AddMonsters = "addMonsters",
  SelectWeaponAndDeck = "selectWeaponAndDeck",
  RemoveMonsters = "removeMonsters",
  StartFigh = "startFigh",
  AcceptFight = "acceptFight",
  SelectSkill = "selectSkill",
  // On events
  Error = "err",
  MemberCreated = "memberCreated",
  MemberDeleted = "memberDeleted",
  NewRoomCreated = "newRoomCreated",
  RoomJoined = "roomJoined",
  RoomLeft = "roomLeft",
  MemberAdded = "memberAdded",
  MemberRemoved = "memberRemoved",
  MonstersAdded = "monstersAdded",
  MonstersRemoved = "monstersRemoved",
  WeaponAdded = "weaponAdded",
  WeaponRemoved = "weaponRemoved",
  DeckAdded = "deckAdded",
  DeckRemoved = "DeckRemoved",
  FightStarted = "fightStarted",
  AcceptedFight = "acceptedFight",
  SkillSelected = "skillSelected",
  AllSkillsSelected = "allSkillsSelected",
  AllEntities = "allEntities"
}

const socketMiddleware: Middleware = (store) => {
  let socket: SocketInterface;

  return (next) => (action) => {
    // Middleware logic for the `initSocket` action
    if (socketActions.initSocket.match(action)) {
      if (!socket && typeof window !== "undefined") {
        // Client-side-only code
        // Create/ Get Socket Socket
        socket = SocketFactory.create();

        socket.socket.on(SocketEvent.Connect, () => {
          store.dispatch(socketActions.connectionEstablished());
          console.log("socket connected.");
        });

        // handle all Error events
        socket.socket.on(SocketEvent.Error, (message) => {
          console.error(message);
          // TODO dispatch errors and create an error provider at
          // the route of the project to handle them
        });

        // Handle disconnect event
        socket.socket.on(SocketEvent.Disconnect, (reason) => {
          store.dispatch(socketActions.connectionLost());
          console.log("socket disconnected.");
        });

        // Handle the creation of member
        socket.socket.on(SocketEvent.MemberCreated, (data: MemberInfo) => {
          store.dispatch(socketActions.memberCreated(data));
          console.log("Member created correctly:", data);
        });

        // Handle the deletion of member
        socket.socket.on(SocketEvent.MemberDeleted, () => {
          store.dispatch(socketActions.memberDeleted());
          console.log("Member deleted");
        });

        // Handle the creation of a room
        socket.socket.on(SocketEvent.NewRoomCreated, (data: RoomCreatedInfo) => {
          store.dispatch(socketActions.newRoomCreated(data));
          console.log("Room created + joined:", data.id);
        });

        // Handle the joining of a room
        socket.socket.on(SocketEvent.RoomJoined, (data: RoomInfo) => {
          store.dispatch(socketActions.roomJoined(data));
          console.log("Room joined:", data.id);
        });

        // Handle the leaving of a room
        socket.socket.on(SocketEvent.RoomLeft, (roomId) => {
          store.dispatch(socketActions.roomLeft(roomId));
          console.log("Room left:", roomId);
        });

        // Handle the addition of a member in the room
        socket.socket.on(SocketEvent.MemberAdded, (member: Member.FrontInstance) => {
          store.dispatch(socketActions.memberAdded(member));
          console.log("member added:", member.uid);
        });

        // Handle the deletion of a member in the room
        socket.socket.on(SocketEvent.MemberRemoved, (member: Member.FrontInstance) => {
          store.dispatch(socketActions.memberRemoved(member));
          console.log("member removed:", member.uid);
        });

        // Handle the addition of monsters in the room
        socket.socket.on(SocketEvent.MonstersAdded, (monsters: Monster.Instance[]) => {
          store.dispatch(socketActions.monstersAdded(monsters));
          console.log("monsters added:", monsters);
        });

        // Handle the deletion of monsters in the room
        socket.socket.on(SocketEvent.MonstersRemoved, (monsters: Monster.Instance[]) => {
          store.dispatch(socketActions.monstersRemoved(monsters));
          console.log("monsters removed:", monsters);
        });

        // Handle the selection of weapon in the room
        socket.socket.on(SocketEvent.WeaponAdded, (data: { memberId: string, weaponId: string }) => {
          store.dispatch(socketActions.weaponAdded(data));
          console.log(`Member ${data.memberId} selected weapon ${data.weaponId}`);
        });

        // Handle the deletion of weapon in the room
        socket.socket.on(SocketEvent.WeaponRemoved, (data: { memberId: string, weaponId: string }) => {
          store.dispatch(socketActions.weaponRemoved(data));
          console.log(`Member ${data.memberId} unselected weapon ${data.weaponId} `);
        });

        // Handle the selection of deck in the room
        socket.socket.on(SocketEvent.DeckAdded, (data: { memberId: string, deck: Deck }) => {
          store.dispatch(socketActions.deckAdded(data));
          console.log(`Member ${data.memberId} selected a deck ${data.deck}`);
        });

        // Handle the deletion of deck in the room
        socket.socket.on(SocketEvent.DeckRemoved, (data: { memberId: string, deck: Deck }) => {
          store.dispatch(socketActions.deckRemoved(data));
          console.log(`Member ${data.memberId} unselected a deck ${data.deck}`);
        });

        // Handle the start fight
        socket.socket.on(SocketEvent.FightStarted, (roomId: string) => {
          console.log(`Fight starting, move to the fight page with id ${roomId}`);
          store.dispatch(socketActions.fightStarted(roomId));
        });

        // Handle the accept fight phase answers
        socket.socket.on(SocketEvent.AcceptedFight, (memberID: string) => {
          console.log(`User accepted the fight: ${memberID}`);
          store.dispatch(socketActions.acceptedFight(memberID));
        });

        // Handle the selection of a skill by a player in the room
        socket.socket.on(SocketEvent.SkillSelected, (data) => {
          store.dispatch(socketActions.skillSelected(data));
          console.log("Skill selected:", data);
        });

        // Retrieve all the skills from all the players
        socket.socket.on(SocketEvent.AllSkillsSelected, (data) => {
          store.dispatch(socketActions.allSkillsSelected(data));
          console.log("Update all the skills:", data);
        });

        // Retrieve all the members
        socket.socket.on(SocketEvent.AllEntities, (data) => {
          store.dispatch(socketActions.allEntities(data));
          console.log("Retrieved all the members:", data);
        });
      }
    }

    // DEPRECATED: the wallet will be connected first, then the socket will so handle manually
    // Listen for the user to connect using the auth Slice to create the user on the server
    // if (connect.match(action) && socket) {
    //   socket.socket.emit(SocketEvent.CreateMember, action.payload);
    // }

    // handle create a member
    if (socketActions.createMember.match(action) && socket) {
      // Ask to create the user to the server
      socket.socket.emit(SocketEvent.CreateMember, action.payload);
    }

    // handle delete a member
    if (socketActions.deleteMember.match(action) && socket) {
      // Ask to create the user to the server
      socket.socket.emit(SocketEvent.DeleteMember, action.payload);
    }


    // handle create a room action
    if (socketActions.createNewRoom.match(action) && socket) {
      // Ask to create a room to the server
      socket.socket.emit(SocketEvent.CreateNewRoom, action.payload.password);
    }

    // handle the joinRoom action
    if (socketActions.joinRoom.match(action) && socket) {
      const roomId = action.payload.id;
      const password = action.payload.password;
      // Join room
      socket.socket.emit(SocketEvent.JoinRoom, { roomId, password });
      // Then Pass on to the next middleware to handle state
      // ...
    }

    // handle leaveRoom action
    if (socketActions.leaveRoom.match(action) && socket) {
      let room = action.payload;
      socket.socket.emit(SocketEvent.LeaveRoom, room);
      // Then Pass on to the next middleware to handle state
      // ...
    }

    // handle addMonsters action
    if (socketActions.addMonsters.match(action) && socket) {
      socket.socket.emit(SocketEvent.AddMonsters, action.payload);
      // Then Pass on to the next middleware to handle state
      // ...
    }

    // handle removeMonsters action
    if (socketActions.removeMonsters.match(action) && socket) {
      socket.socket.emit(SocketEvent.RemoveMonsters, action.payload);
      // Then Pass on to the next middleware to handle state
      // ...
    }

    // handle selectWeaponAndDeck action
    if (socketActions.selectWeaponAndDeck.match(action) && socket) {
      socket.socket.emit(SocketEvent.SelectWeaponAndDeck, action.payload);
      // Then Pass on to the next middleware to handle state
      // ...
    }

    // handle startFigh action
    if (socketActions.startFigh.match(action) && socket) {
      socket.socket.emit(SocketEvent.StartFigh);
      // Then Pass on to the next middleware to handle state
      // ...
    }

    // handle startFigh action
    if (socketActions.acceptFight.match(action) && socket) {
      socket.socket.emit(SocketEvent.AcceptFight);
      // Then Pass on to the next middleware to handle state
      // ...
    }

    // handle selectSkill action
    if (socketActions.selectSkill.match(action) && socket) {
      socket.socket.emit(SocketEvent.SelectSkill, action.payload);
      // Then Pass on to the next middleware to handle state
      // ...
    }

    next(action);
  };
};

export default socketMiddleware;