// Slice of store that manages Socket connections
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as Member from '@/sockets/@types/Member';
import * as Monster from '@/sockets/@types/Monster';
import { DEFAULT_ADMIN_ID, DEFAULT_ROOM_ID, RoomId } from '@/sockets/@types/Room';
import { Skill } from '@/sockets/@types/Skill';

export type Deck = { [key: number]: number };

export type Room = {
  id: RoomId,
  password: string,
  adminId: string,
  skillsSelected: { [id: Member.ID]: Skill },
  members: Member.FrontInstance[],
  monsters: Monster.Instance[],
  weapons: { [member: Member.ID]: string },
  decks: { [member: Member.ID]: Deck },
  acceptedMembers: Member.ID[],
  goToRoomId: RoomId
};

export type RoomCreatedInfo = {
  id: RoomId,
  password: string,
  you: Member.FrontInstance
}

export type RoomInfo = {
  id: RoomId,
  adminId: string,
  password: string
  members: Member.FrontInstance[] // fort the moment only members
  monsters: Monster.Instance[] // only monster id stored
  weapons: { [member: Member.ID]: string },
  decks: { [member: Member.ID]: Deck },

};

export type MemberInfo = {
  uid: string,
  name: string
}

export type SkillsSelected = {
  [id: Member.ID]: Skill
};

const DefaultRoom: Room = {
  id: DEFAULT_ROOM_ID,
  password: "",
  adminId: DEFAULT_ADMIN_ID,
  skillsSelected: {},
  members: [],
  monsters: [],
  weapons: {},
  decks: {},
  acceptedMembers: [],
  goToRoomId: DEFAULT_ROOM_ID
};

const DefaultMemberInformation: MemberInfo = {
  uid: "NO_ID",
  name: "NO_NAME",
};

export interface SocketState {
  isConnected: boolean; // represent if the socket itself is connected to the server
  isCreated: boolean; // represent if the user is created on the server (after wallet connection)
  member: MemberInfo; // represent the user info as member from the server
  room: Room;
};

const initialState: SocketState = {
  isConnected: false,
  isCreated: false,
  member: DefaultMemberInformation,
  room: DefaultRoom
};

// Now create the slice
const socketSlice = createSlice({
  name: "socket",
  initialState,
  // Reducers: Functions we can call on the store
  reducers: {
    initSocket: (state) => {
      return;
    },
    connectionEstablished: (state) => {
      state.isConnected = true;
    },
    connectionLost: (state) => {
      state.isConnected = false;
    },

    createMember: (state, action: PayloadAction<string>) => {
      // not store for the request of user creation
      return;
    },
    deleteMember: (state, action: PayloadAction<string>) => {
      // not store for the request of user creation
      return;
    },
    createNewRoom: (state, action: PayloadAction<{ password: string }>) => {
      // not store for the request, waiting for the server to confirm before joining
      return;
    },
    joinRoom: (state, action: PayloadAction<{ id: string; password: string; }>) => {
      // not store for the request, waiting for the server to confirm before joining
      return;
    },
    leaveRoom: (state, action: PayloadAction<string>) => {
      // not store for the request, waiting for the server to confirm before leaving
      return;
    },
    addMonsters: (state, action: PayloadAction<number[]>) => {
      // not store for the request, waiting for the server to confirm before adding monster
      return;
    },
    removeMonsters: (state, action: PayloadAction<Monster.Instance[]>) => {
      // not store for the request, waiting for the server to confirm before removing monster
      return;
    },
    selectWeaponAndDeck: (state, action: PayloadAction<{weaponId: string, deck: {[key: number]: number;}}>) => {
      // not store for the request, waiting for the server to confirm before adding weapon and deck
      return;
    },
    startFigh: (state, action: PayloadAction) => {
      // not store for the request, waiting for the server to confirm before moving user
      return;
    },
    acceptFight: (state, action: PayloadAction) => {
      // not store for the request, waiting for the server to confirm before confirming the user in fight
      return;
    },
    rejectFight: (state, action: PayloadAction) => {
      // not store for the request, waiting for the server to confirm before confirming the user in fight
      return;
    },
    selectSkill: (state, action: PayloadAction<Skill>) => {
      // not store for the request, waiting for the server to confirm before leaving
      return;
    },

    memberCreated: (state, action: PayloadAction<MemberInfo>) => {
      state.isCreated = true;
      state.member = action.payload;
    },
    memberDeleted: (state) => {
      state.isCreated = false;
      state.member = DefaultMemberInformation;
    },
    newRoomCreated: (state, action: PayloadAction<RoomCreatedInfo>) => {
      // After the socket receive the event from the server in the middleware
      state.room.id = action.payload.id;
      state.room.adminId = state.member.uid; // you are the admin when you create the room
      state.room.password = action.payload.password;
      state.room.members.push(action.payload.you);
      return;
    },
    roomJoined: (state, action: PayloadAction<RoomInfo>) => {
      // After the socket receive the event from the server in the middleware
      state.room.id = action.payload.id;
      state.room.adminId = action.payload.adminId;
      state.room.password = action.payload.password;
      state.room.members = action.payload.members;
      state.room.monsters = action.payload.monsters;
      state.room.weapons = action.payload.weapons;
      state.room.decks = action.payload.decks;
      // state.room.skillsSelected = new Map<Member.ID, Skill>();
      return;
    },
    roomLeft: (state, action: PayloadAction<string>) => {
      // After the socket receive the event from the server in the middleware
      state.room = DefaultRoom;
      return;
    },
    memberAdded: (state, action: PayloadAction<Member.FrontInstance>) => {
      // After the socket receive the event from the server in the middleware
      state.room.members.push(action.payload);
      return;
    },
    memberRemoved: (state, action: PayloadAction<Member.FrontInstance>) => {
      // After the socket receive the event from the server in the middleware
      // Find the index of the item with the matching id
      const index = state.room.members.findIndex((member) => member.uid === action.payload.uid);
      // Remove the item if it exists
      if (index !== -1) {
        state.room.members.splice(index, 1);
      }
      return;
    },
    monstersAdded: (state, action: PayloadAction<Monster.Instance[]>) => {
      // After the socket receive the event from the server in the middleware
      state.room.monsters.push(...action.payload);
      return;
    },
    monstersRemoved: (state, action: PayloadAction<Monster.Instance[]>) => {
      // After the socket receive the event from the server in the middleware
      action.payload.forEach(monsterToRemove => {
        // Find the index of the item with the matching id
        const index = state.room.monsters.findIndex((monsterInRoom) => monsterInRoom.uid === monsterToRemove.uid);
        // Remove the item if it exists
        if (index !== -1) {
          state.room.monsters.splice(index, 1);
        }
      });
      return;
    },
    weaponAdded: (state, action: PayloadAction<{memberId: string, weaponId: string}>) => {
      // After the socket receive the event from the server in the middleware
      state.room.weapons[action.payload.memberId] = action.payload.weaponId;
    },
    weaponRemoved: (state, action: PayloadAction<{memberId: string, weaponId: string}>) => {
      // After the socket receive the event from the server in the middleware
      delete state.room.weapons[action.payload.memberId];
    },
    deckAdded: (state, action: PayloadAction<{memberId: string, deck: Deck}>) => {
      // After the socket receive the event from the server in the middleware
      state.room.decks[action.payload.memberId] = action.payload.deck;
    },
    deckRemoved: (state, action: PayloadAction<{memberId: string, deck: Deck}>) => {
      // After the socket receive the event from the server in the middleware
      delete state.room.decks[action.payload.memberId];
    },
    enterFight: (state, action: PayloadAction<string>) => {
      // After the socket receive the event from the server in the middleware
      const roomId = action.payload

      if (roomId == state.room.id) {
        // clear accepted members
        state.room.acceptedMembers = [];
        // Can't change the page from here so listen to the state in the component and change from it
        // Router.push(`fight/?roomid=${roomId}&weaponid=${state.room.weapons[state.member.uid]}&monsterid=${0}`);
        state.room.goToRoomId = roomId;
      }
    },
    acceptedFight: (state, action: PayloadAction<string>) => {
      // After the socket receive the event from the server in the middleware
      const memberId = action.payload

      if (!state.room.acceptedMembers.includes(memberId))
        state.room.acceptedMembers.push(memberId);
    },
    rejectedFight: (state, action: PayloadAction<string>) => {
      // After the socket receive the event from the server in the middleware
      const memberId = action.payload

      state.room.acceptedMembers = [];
    },
    resetGoToRoomId: (state, action: PayloadAction) => {
      // not in the middleware because it is just to reset the state after the enterFight event.
      state.room.goToRoomId = DEFAULT_ROOM_ID;
    },
    skillSelected: (state, action: PayloadAction<SkillsSelected>) => {
      // After the socket receive the event from the server in the middleware
      state.room.skillsSelected = { ...state.room.skillsSelected, ...action.payload };
      return;
    },
    allSkillsSelected: (state, action: PayloadAction<SkillsSelected>) => {
      // After the socket receive the event from the server in the middleware
      state.room.skillsSelected = action.payload;
      return;
    },
    allEntities: (state, action: PayloadAction<{ [id: Member.ID]: Member.FrontInstance }>) => {
      // After the socket receive the event from the server in the middleware
      // state.room.entities = action.payload;
      return;
    },
  },
});

// Don't have to define actions, they are automatically generated
export const socketActions = socketSlice.actions;
// Export the reducer for this slice
export default socketSlice.reducer;