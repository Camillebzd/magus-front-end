import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// type Address = `0x${string}`;

type AuthState = {
    address: string;
    isConnected: boolean;
};

const initialState = {
    address: "0x",
    isConnected: false,
} as AuthState;

export const auth = createSlice({
    name: "auth",
    initialState,
    reducers: {
        connect: (state, action: PayloadAction<string>) => {
            state.address = action.payload;
            state.isConnected = true;
        },
        disconnect: (state) => {
            state.address = "0x";
            state.isConnected = false;
        },
    },
});

export const {
    connect,
    disconnect,
} = auth.actions;
export default auth.reducer;