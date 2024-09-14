import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import monstersData from '@/data/monsters/base.json';
import { RootState } from "../store";
import { Notify } from "notiflix";
import { fetchFromDB } from "@/scripts/utils";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export type MonsterDataSerilizable = {
  id: number;
  name: string;
  description: string;
  image: string;
  difficulty: number;
  level: number;
  health: number;
  speed: number;
  mind: number;
  sharpDmg: number;
  bluntDmg: number;
  burnDmg: number;
  sharpRes: number;
  bluntRes: number;
  burnRes: number;
  pierce: number;
  lethality: number;
  guard: number;
  handling: number;
  abilities: number[];
}

type MonsterState = {
  monstersData: MonsterDataSerilizable[],  // All the data for monsters
  monstersWorld: MonsterDataSerilizable[], // Only the monsters for the world
  isLoading: boolean,
};

const initialState = {
  monstersData: [],
  monstersWorld: [],
  isLoading: true
} as MonsterState;

export const fillMonstersWorldData = createAsyncThunk<MonsterDataSerilizable[], boolean, {state: RootState} >(
  'monsters/fillMonstersWorldData',
  async (forceReaload: boolean, thunkAPI) => {
    if (thunkAPI.getState().monsterReducer.monstersWorld.length > 0 && !forceReaload)
      return thunkAPI.getState().monsterReducer.monstersWorld;
    console.log("starting of fillMonstersWorldData");
    try {
      const monsters = fetchFromDB("monsters/");
      if (!monsters) {
        Notify.failure("Failed to retreive monsters data from the server.");
        return [];
      }
      return monsters;
    } catch (e) {
      Notify.failure('Failed to retreive monsters.');
      console.log(`An error occurred: ${e}`);
      return [];
    }
  }
);

export const monsters = createSlice({
  name: "monsters",
  initialState,
  reducers: {
    reset: () => initialState,
    fillStore: (state) => {
      state.monstersData = JSON.parse(JSON.stringify(monstersData));
      state.monstersWorld = JSON.parse(JSON.stringify(monstersData));
    },
    // fillMonstersWorldData: (state, action: PayloadAction<boolean>) => {
    //   if (state.monstersWorld.length > 0 && !action.payload)
    //     return;
    //   state.monstersWorld = JSON.parse(JSON.stringify(monstersData));
    //   console.log("monsters pulled.");
    // },
  },
  extraReducers: (builder) => {
    builder.addCase(fillMonstersWorldData.pending, (state, action) => {
      state.isLoading = true;
    }),
    builder.addCase(fillMonstersWorldData.fulfilled, (state, action) => {
      state.monstersWorld = action.payload;
      state.isLoading = false;
    }),
    builder.addCase(fillMonstersWorldData.rejected, (state, action) => {
      state.isLoading = false;
    })
  }
});

export const {
  reset,
  fillStore,
  // fillMonstersWorldData,
} = monsters.actions;
export default monsters.reducer;