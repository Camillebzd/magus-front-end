import { MiddlewareAPI } from "redux";
import { socketActions } from "@/redux/features/socketSlice";
import { SocketInterface } from "@/sockets/SocketFactory";
import { Notify } from "notiflix";
import { SocketEventsListener } from "./socketEvents";

// Types
import { MemberInfo, RoomCreatedInfo, RoomInfo } from "@/redux/features/socketSlice";
import * as Member from '@/sockets/@types/Member';
import * as Monster from '@/sockets/@types/Monster';
import { RawDataAbilities } from "@/scripts/abilities";

type EventHandler = {
  [key in SocketEventsListener]: (data: any, store: MiddlewareAPI) => void;
};

export const socketEventManager: EventHandler = {
  [SocketEventsListener.Connect]: (_, store) => {
    store.dispatch(socketActions.connectionEstablished());
    console.log("socket connected.");
  },

  [SocketEventsListener.Disconnect]: (_, store) => {
    store.dispatch(socketActions.connectionLost());
    console.log("socket disconnected.");
  },

  [SocketEventsListener.Error]: (message: string) => {
    console.error(message);
    Notify.failure(message);
  },

  [SocketEventsListener.MemberCreated]: (data: MemberInfo, store) => {
    store.dispatch(socketActions.memberCreated(data));
    console.log("Member created correctly:", data);
  },

  [SocketEventsListener.MemberDeleted]: (_, store) => {
    store.dispatch(socketActions.memberDeleted());
    console.log("Member deleted");
  },

  [SocketEventsListener.NewRoomCreated]: (data: RoomCreatedInfo, store) => {
    store.dispatch(socketActions.newRoomCreated(data));
    console.log("Room created + joined:", data.id);
    console.log("password:", data.password);
  },

  [SocketEventsListener.RoomJoined]: (data: RoomInfo, store) => {
    store.dispatch(socketActions.roomJoined(data));
    console.log("Room joined:", data);
  },

  [SocketEventsListener.RoomLeft]: (roomId: string, store) => {
    store.dispatch(socketActions.roomLeft(roomId));
    console.log("Room left:", roomId);
  },

  [SocketEventsListener.MemberAdded]: (member: Member.FrontInstance, store) => {
    store.dispatch(socketActions.memberAdded(member));
    console.log("member added:", member.uid);
  },

  [SocketEventsListener.MemberRemoved]: (member: Member.FrontInstance, store) => {
    store.dispatch(socketActions.memberRemoved(member));
    console.log("member removed:", member.uid);
  },


  [SocketEventsListener.MonstersAdded]: (monsters: Monster.Instance[], store) => {
    store.dispatch(socketActions.monstersAdded(monsters));
    console.log("monsters added:", monsters);
  },

  [SocketEventsListener.MonstersRemoved]: (monsters: Monster.Instance[], store) => {
    store.dispatch(socketActions.monstersRemoved(monsters));
    console.log("monsters removed:", monsters);
  },

  [SocketEventsListener.WeaponAdded]: (data: { memberId: string, weaponId: string }, store) => {
    store.dispatch(socketActions.weaponAdded(data));
    console.log(`Member ${data.memberId} selected weapon ${data.weaponId}`);
  },

  [SocketEventsListener.WeaponRemoved]: (data: { memberId: string, weaponId: string }, store) => {
    store.dispatch(socketActions.weaponRemoved(data));
    console.log(`Member ${data.memberId} unselected weapon ${data.weaponId} `);
  },

  [SocketEventsListener.DeckAdded]: (data: { memberId: string, deck: RawDataAbilities }, store) => {
    store.dispatch(socketActions.deckAdded(data));
    console.log(`Member ${data.memberId} selected a deck ${data.deck}`);
  },

  [SocketEventsListener.DeckRemoved]: (data: { memberId: string, deck: RawDataAbilities }, store) => {
    store.dispatch(socketActions.deckRemoved(data));
    console.log(`Member ${data.memberId} unselected a deck ${data.deck}`);
  },

  [SocketEventsListener.EnterFight]: (roomId: string, store) => {
    console.log(`Fight starting, move to the fight page with id ${roomId}`);
    store.dispatch(socketActions.enterFight(roomId));
  },

  [SocketEventsListener.AcceptedFight]: (memberID: string, store) => {
    store.dispatch(socketActions.acceptedFight(memberID));
    console.log(`User accepted the fight: ${memberID}`);
  },

  [SocketEventsListener.RejectedFight]: (memberID: string, store) => {
    store.dispatch(socketActions.rejectedFight(memberID));
    console.log(`User rejected the fight: ${memberID}`);
  },

  [SocketEventsListener.SkillSelected]: (data: any, store) => {
    store.dispatch(socketActions.skillSelected(data));
    console.log("Skill selected:", data);
  },

  [SocketEventsListener.AllSkillsSelected]: (data: any, store) => {
    store.dispatch(socketActions.allSkillsSelected(data));
    console.log("Update all the skills:", data);
  },

  [SocketEventsListener.AllEntities]: (data: any, store) => {
    store.dispatch(socketActions.allEntities(data));
    console.log("Retrieved all entities:", data);
  },
};
