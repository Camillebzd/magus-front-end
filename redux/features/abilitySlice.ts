import { AbilityData } from "@/scripts/abilities";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import abilitiesData from '@/data/abilities/abilities.json';
import { RootState } from "../store";
import { Notify } from "notiflix";
import { fetchFromDB } from "@/scripts/utils";

type AbilityState = {
  abilities: AbilityData[],
  isLoading: boolean,
};

const initialState = {
    abilities: [],
    isLoading: false
} as AbilityState;

export const fillStoreAbilities = createAsyncThunk<AbilityData[], boolean, {state: RootState} >(
  'abilities/fillStoreAbilities',
  async (forceReaload: boolean, thunkAPI) => {
    if (thunkAPI.getState().abilityReducer.abilities.length > 0 && !forceReaload)
      return thunkAPI.getState().abilityReducer.abilities;
    console.log("starting of fillStoreAbilities");
    const abilitiesData = fetchFromDB("abilities/abilities");
    if (abilitiesData == undefined) {
      console.log("Failed to fetch abilities data from db");
      return [];
    }
    return abilitiesData;
  }
);

export const abilities = createSlice({
  name: "abilities",
  initialState,
  reducers: {
    reset: () => initialState,
    // fillStoreAbilities: (state, action: PayloadAction<boolean>) => {
    //   if (state.abilities.length > 0 && !action.payload)
    //     return;
    //   state.abilities = JSON.parse(JSON.stringify(abilitiesData));
    //   console.log("abilities pulled");
    // },
  },
  extraReducers: (builder) => {
    builder.addCase(fillStoreAbilities.pending, (state, action) => {
      state.isLoading = true;
    }),
    builder.addCase(fillStoreAbilities.fulfilled, (state, action) => {
      state.abilities = action.payload;
      state.isLoading = false;
    }),
    builder.addCase(fillStoreAbilities.rejected, (state, action) => {
      state.isLoading = false;
    })
  }
});

export const {
  reset,
  // fillStoreAbilities,
} = abilities.actions;
export default abilities.reducer;