import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./features/counterSlice";
import authReducer from "./features/authSlice";
import abilityReducer from "./features/abilitySlice";
import monsterReducer from "./features/monsterSlice";
import weaponReducer from "./features/weaponSlice";
import weaponDeckReducer from "./features/weaponDeckSlice";

export const store = configureStore({
  reducer: {
    authReducer,
    counterReducer,
    monsterReducer,
    abilityReducer,
    weaponReducer,
    weaponDeckReducer
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;