import { AbilityData } from "@/scripts/abilities";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type DeckState = {
    decks: AbilityData[][];
};

const initialState = {
    decks: [],          // first key is weaponId, second key is deck of ability
} as DeckState;

export const weaponDecks = createSlice({
  name: "weaponDecks",
  initialState,
  reducers: {
    reset: () => initialState,
    setDeck: (state, action: PayloadAction<{weaponId: number, abilities: AbilityData[]}>) => {
      state.decks[action.payload.weaponId] = action.payload.abilities;
      console.log(`deck for weapon: ${action.payload.weaponId} set.`);
    },
  },
});

export const {
  reset,
  setDeck,
} = weaponDecks.actions;
export default weaponDecks.reducer;