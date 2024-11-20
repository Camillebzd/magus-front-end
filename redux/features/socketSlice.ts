// Slice of store that manages Socket connections
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as Member from '@/sockets/@types/Member';
import * as Monster from '@/sockets/@types/Monster';
import { DEFAULT_ADMIN_ID, DEFAULT_ROOM_ID, RoomId } from '@/sockets/@types/Room';
import { Skill } from '@/sockets/@types/Skill';

export type Room = {
  id: RoomId,
  password: string
  adminId: string,
  skillsSelected: { [id: Member.ID]: Skill }
  entities: Member.FrontInstance[]
  monsters: Monster.Instance[]
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
  entities: Member.FrontInstance[] // fort the moment only members
  monsters: Monster.Instance[] // only monster id stored
};

export type MemberInfo = {
  uid: string,
  name: string
}

export type SkillsSelected = {
  [id: Member.ID]: Skill
};

const DefaultRoom = {
  id: DEFAULT_ROOM_ID,
  password: "",
  adminId: DEFAULT_ADMIN_ID,
  skillsSelected: {},
  entities: [],
  monsters: []
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
      // not store for the request, waiting for the server to confirm before leaving
      return;
    },
    removeMonsters: (state, action: PayloadAction<Monster.Instance[]>) => {
      // not store for the request, waiting for the server to confirm before leaving
      return;
    },
    enterFight: (state, action: PayloadAction<RoomId>) => {
      // not store for the request, waiting for the server to confirm before leaving
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
      state.room.entities.push(action.payload.you);
      return;
    },
    roomJoined: (state, action: PayloadAction<RoomInfo>) => {
      // After the socket receive the event from the server in the middleware
      state.room.id = action.payload.id;
      state.room.adminId = action.payload.adminId;
      state.room.password = action.payload.password;
      state.room.entities = action.payload.entities;
      // state.room.skillsSelected = new Map<Member.ID, Skill>();
      // state.room.entities = new Map<Member.ID, Member.Instance>();
      return;
    },
    roomLeft: (state, action: PayloadAction<string>) => {
      // After the socket receive the event from the server in the middleware
      state.room = DefaultRoom;
      return;
    },
    memberAdded: (state, action: PayloadAction<Member.FrontInstance>) => {
      // After the socket receive the event from the server in the middleware
      state.room.entities.push(action.payload);
      return;
    },
    memberRemoved: (state, action: PayloadAction<Member.FrontInstance>) => {
      // After the socket receive the event from the server in the middleware
      // Find the index of the item with the matching id
      const index = state.room.entities.findIndex((entity) => entity.uid === action.payload.uid);
      // Remove the item if it exists
      if (index !== -1) {
        state.room.entities.splice(index, 1);
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