import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import axios from "axios";
import { createContract } from "@/scripts/utils";
import { RootState } from "../store";
import { Notify } from "notiflix";

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)!.toLowerCase();

export type AttributeOnNFT = {
  trait_type: string;
  value: string | string[];
};

export type WeaponNFT = {
  name: string;
  description: string;
  image: string;
  attributes: AttributeOnNFT[];
  tokenId: string; // not on the uri so should be added
};

export const fillUserWeapons = createAsyncThunk<WeaponNFT[], boolean, { state: RootState }>(
  'weapons/fillUserWeapons',
  async (forceReaload: boolean, thunkAPI) => {
    if (thunkAPI.getState().weaponReducer.userWeapons.length > 0 && !forceReaload)
      return thunkAPI.getState().weaponReducer.userWeapons;
    console.log("starting of fillUserWeapons");
    const isConnected = thunkAPI.getState().authReducer.isConnected;
    const address = thunkAPI.getState().authReducer.address;
    if (!isConnected) {
      console.log("You should be connected if you want to get your Gears!");
      return [];
    }
    try {
      const url = `https://testnet.explorer.etherlink.com/api/v2/addresses/${address}/nft?type=ERC-721`;
      const response = await axios.get(url, {
        headers: {
          'accept': 'application/json'
        }
      });
      if (response.status !== 200) {
        console.log("Bad request to retrieve the weapons!");
        return [];
      }
      const nfts = response.data.items;
      const contract = await createContract(address);
      let weapons: WeaponNFT[] = [];
      console.log("nfts:", nfts);
      await Promise.all(nfts.map(async (nft: any) => {
        if (nft.token.address.toLowerCase() == CONTRACT_ADDRESS) {
          let weaponURI = await contract.tokenURI(nft.id);
          let weaponObj: WeaponNFT = JSON.parse(Buffer.from(weaponURI.substring(29), 'base64').toString('ascii'));
          weaponObj.tokenId = nft.id;
          weapons.push(weaponObj);
        }
      }));
      console.log(weapons);
      return weapons;
    } catch (e) {
      Notify.failure('An error occured during the nft data recovery.');
      console.error(e);
      return [];
    }
  }
);

export const refreshOwnedTokenMetadata = createAsyncThunk<{ weaponIndex: number, newWeaponData: WeaponNFT | undefined }, string, { state: RootState }>(
  'weapons/refreshTokenMetadataManual',
  async (tokenId, thunkAPI) => {
    const weaponIndex = thunkAPI.getState().weaponReducer.userWeapons.findIndex((weapon) => weapon.tokenId == tokenId);
    if (weaponIndex < 0) {
      console.log("Error:can't refresh metadata on non existant or non possessed weapon.");
      return { weaponIndex, newWeaponData: undefined };
    }
    const contract = await createContract(thunkAPI.getState().authReducer.address);
    try {
      let weaponURI = await contract.TokenURI(tokenId);
      let weaponObj: WeaponNFT = JSON.parse(Buffer.from(weaponURI.substring(29), 'base64').toString('ascii'));
      weaponObj.tokenId = tokenId;
      console.log(`token with id: ${tokenId} refreshed!`);
      Notify.success('Weapon metadata refreshed.');
      return { weaponIndex, newWeaponData: weaponObj };
    }
    catch {
      console.log(`token with id: ${tokenId} refreshed!`);
      Notify.failure('An error occured during the metadata refresh.');
      return { weaponIndex, newWeaponData: undefined };
    }
  }
);

type WeaponState = {
  userWeapons: WeaponNFT[], // User weapons data
  isLoading: boolean        // protection to prevent multiple call
};

const initialState = {
  userWeapons: [],
  isLoading: false
} as WeaponState;

export const weapons = createSlice({
  name: "weapons",
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fillUserWeapons.pending, (state, action) => {
      state.isLoading = true;
    }),
      builder.addCase(fillUserWeapons.fulfilled, (state, action) => {
        state.userWeapons = action.payload;
        state.isLoading = false;
      }),
      builder.addCase(fillUserWeapons.rejected, (state, action) => {
        state.isLoading = false;
      }),
      builder.addCase(refreshOwnedTokenMetadata.fulfilled, (state, action) => {
        if (action.payload.newWeaponData)
          state.userWeapons[action.payload.weaponIndex] = action.payload.newWeaponData;
      })
  }
});

export const {
  reset
} = weapons.actions;
export default weapons.reducer;