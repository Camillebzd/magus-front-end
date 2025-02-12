import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import axios from "axios";
import { createContract, createReadContract } from "@/scripts/utils";
import { RootState } from "../store";
import { Notify } from "notiflix";
import { readContract } from "thirdweb";
import { etherlinkTestnet } from "@/app/thirdwebInfo";
import { getNFTs } from "thirdweb/extensions/erc721";

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
      const url = `${etherlinkTestnet.blockExplorers![0].apiUrl}/v2/addresses/${address}/nft?type=ERC-721`;
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
      // const contract = await createContract(address);
      const contract = await createReadContract();
      let weapons: WeaponNFT[] = [];
      // console.log("nfts:", nfts);
      await Promise.all(nfts.map(async (nft: any) => {
        if (nft.token.address.toLowerCase() == CONTRACT_ADDRESS) {
          // let weaponURI = await contract.tokenURI(nft.id);
          let weaponURI = await readContract({
            contract: contract,
            method: "function tokenURI(uint256) view returns (string)",
            params: [nft.id],
          });
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
    // const contract = await createContract(thunkAPI.getState().authReducer.address);
    const contract = await createReadContract();
    try {
      // let weaponURI = await contract.TokenURI(tokenId);
      let weaponURI = await readContract({
        contract: contract,
        method: "function tokenURI(uint256) view returns (string)",
        params: [BigInt(tokenId)],
      });
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

export const fillAllWeapons = createAsyncThunk<WeaponNFT[], boolean, { state: RootState }>(
  'weapons/fillAllWeapons',
  async (forceReaload: boolean, thunkAPI) => {
    if (thunkAPI.getState().weaponReducer.allWeapons.length > 0 && !forceReaload)
      return thunkAPI.getState().weaponReducer.allWeapons;
    console.log("starting of fillAllWeapons");
    try {
      const contract = await createReadContract();
      // TMP solution, ADD totalSupply on NFT contract
      const totalSupply = 2;
      let weapons: WeaponNFT[] = [];
      await Promise.all(Array.from({ length: totalSupply }, (_, index) => index).map(async (tokenId) => {
          let weaponURI = await readContract({
            contract: contract,
            method: "function tokenURI(uint256) view returns (string)",
            params: [BigInt(tokenId)],
          });
          let weaponObj: WeaponNFT = JSON.parse(Buffer.from(weaponURI.substring(29), 'base64').toString('ascii'));
          weaponObj.tokenId = tokenId.toString();
          weapons.push(weaponObj);
      }));
      console.log("all weapons", weapons);
      return weapons;
    } catch (e) {
      Notify.failure('An error occured during the nft data recovery.');
      console.error(e);
      return [];
    }
  }
);

type WeaponState = {
  userWeapons: WeaponNFT[],       // User weapons data
  allWeapons: WeaponNFT[],        // All weapons data
  areUserWeaponsLoading: boolean  // protection to prevent multiple call
  areAllWeaponsLoading: boolean   // protection to prevent multiple call
};

const initialState = {
  userWeapons: [],
  allWeapons: [],
  areUserWeaponsLoading: false,
  areAllWeaponsLoading: false
} as WeaponState;

export const weapons = createSlice({
  name: "weapons",
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fillUserWeapons.pending, (state, action) => {
      state.areUserWeaponsLoading = true;
    }),
      builder.addCase(fillUserWeapons.fulfilled, (state, action) => {
        state.userWeapons = action.payload;
        state.areUserWeaponsLoading = false;
      }),
      builder.addCase(fillUserWeapons.rejected, (state, action) => {
        state.areUserWeaponsLoading = false;
      }),
      builder.addCase(refreshOwnedTokenMetadata.fulfilled, (state, action) => {
        if (action.payload.newWeaponData)
          state.userWeapons[action.payload.weaponIndex] = action.payload.newWeaponData;
      }),
      builder.addCase(fillAllWeapons.pending, (state, action) => {
        state.areAllWeaponsLoading = true;
      }),
      builder.addCase(fillAllWeapons.fulfilled, (state, action) => {
        state.allWeapons = action.payload;
        state.areAllWeaponsLoading = false;
      }),
      builder.addCase(fillAllWeapons.rejected, (state, action) => {
        state.areAllWeaponsLoading = false;
      })
  }
});

export const {
  reset
} = weapons.actions;
export default weapons.reducer;