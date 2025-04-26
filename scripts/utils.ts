import { ethers } from 'ethers';
import contractABI from "@/abi/GearFight.json";

import { Ability, RawDataAbilities } from './abilities';
import { Identity, WeaponMintStats } from './entities';
import { getContract } from 'thirdweb';
import { client, etherlinkTestnet } from '@/app/thirdwebInfo'
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { useActiveAccount } from 'thirdweb/react';

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)!.toLowerCase();
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

// Create a deep copy of an element (do not copy methods of a classe)
export function deepCopy<Type>(obj: Type) {
  return JSON.parse(JSON.stringify(obj));
}

// random num between 0 - max
export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

// min and max included 
export function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// function to create a contract ethers.js of gearFactory
export async function createContract(walletAddress: string) {
  const ethereum: any = window.ethereum; // dangerous because if network on Rabby different things explode
  const provider = new ethers.providers.Web3Provider(ethereum) // new ethers.BrowserProvider(ethereum); // V6
  const signer = await provider.getSigner(walletAddress);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
  return contract;
}

// function to create a contract thirdweb
export async function createReadContract() {
  const contract = getContract({
    client,
    chain: etherlinkTestnet,
    address: CONTRACT_ADDRESS,
    abi: contractABI.abi as any,
  });
  return contract;
}

export async function getWeaponStatsForLevelUp(identity: Identity) {
  // let stats = JSON.parse(JSON.stringify((await import(`@/data/weapons/statsGrowth.json`)).default.find(weapon => weapon.name == identity)));
  const stats = (await fetchFromDB("weapons", "statsGrowth"))?.find((weapon: any) => weapon.name == identity);
  if (!stats) {
    console.log(`Error: no level up data for: ${identity}`);
    throw new Error(`Error: no level up data for: ${identity}`);
  }
  // round for the moment bc blockchain doesn't accept float...
  for (const key in stats)
    if (stats.hasOwnProperty(key))
      stats[key] = Math.floor(stats[key]);
  let formatedStats: WeaponMintStats = {
    health: stats.health as number,
    speed: stats.speed as number,
    mind: stats.mind as number,
    offensiveStats: {
      sharpDamage: stats.sharpDmg as number,
      bluntDamage: stats.bluntDmg as number,
      burnDamage: stats.burnDmg as number,
      pierce: stats.pierce as number,
      lethality: stats.lethality as number
    },
    defensiveStats: {
      sharpResistance: stats.sharpRes as number,
      bluntResistance: stats.bluntRes as number,
      burnResistance: stats.burnRes as number,
      guard: stats.guard as number,
    },
    handling: stats.handling as number,
  }
  return formatedStats;
}

export function multiplyStatsForLevelUp(stats: WeaponMintStats, coef: number) {
  stats.health *= coef;
  stats.speed *= coef;
  stats.mind *= coef;
  stats.offensiveStats.sharpDamage *= coef;
  stats.offensiveStats.bluntDamage *= coef;
  stats.offensiveStats.burnDamage *= coef;
  stats.offensiveStats.pierce *= coef;
  stats.offensiveStats.lethality *= coef;
  stats.defensiveStats.sharpResistance *= coef;
  stats.defensiveStats.bluntResistance *= coef;
  stats.defensiveStats.burnResistance *= coef;
  stats.defensiveStats.guard *= coef;
  stats.handling *= coef;
}

// get the list of abilities for a weapon for a specific level, throw an error if an error is encoutered
export async function getAllAbilitiesIdForWeapon(identity: Identity, levelToSet: number) {
  // let allAbilities = (await import(`@/data/weapons/${identity.toLocaleLowerCase()}/abilities.json`));
  let allAbilities: { [key: string]: number[] | number | string }[] = [];
  allAbilities = await fetchFromDB("weapons", "abilities");
  if (allAbilities === undefined)
    throw new Error("Failed to fetch abilities for weapons from db.");
  const specificAbilitiesList = allAbilities.find(obj => obj.name as string === identity);
  if (!specificAbilitiesList)
    throw new Error(`Error can't find ${identity} as corresponding name in data.`);
  let wantedAbilities: number[] = [];
  for (const key in specificAbilitiesList) {
    if (key == "base" || parseInt(key) <= levelToSet)
      wantedAbilities = wantedAbilities.concat(specificAbilitiesList[key] as number);
  }
  return wantedAbilities;
}

// get the specify element from the arr1, remove it and add it in arr2, return true on success, false otherwise
export function getFromArrayToArray<Type>(arr1: Type[], arr2: Type[], element: Type) {
  const index = arr1.indexOf(element);

  if (index != -1) {
    arr2.push(element);
    arr1.splice(index, 1);
    return true;
  }
  console.log("Error: getFromArrayToArray on element that doesn't exist in array.");
  return false;
}

// retreive data from the db, return undefined if an error occured
export async function fetchFromDB(dbName: string, collectionName: string, query: object = {}) {
  try {
    const response = await fetch("/api/fetchFromDB", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ dbName, collectionName, query }),
    });

    if (!response.ok) {
      console.log(`An error occurred: ${response.statusText}`);
      return undefined;
    }

    const data = await response.json();
    return data;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

/**
 * Create a list of abilities from raw data. If the list is empty it means
 * something wrong happened.
 * @param rawDataAbilities Raw data of the abilities
 * @param abilityList List of abilities to retrieve the data from
 * @returns An array of ability or an empty array.
 */
export function createAbilityListFromRawData(rawDataAbilities: RawDataAbilities, abilityList: Ability[]): Ability[] {
  let abilities: Ability[] = [];

  for (const abilityId in rawDataAbilities) {
    const uidList = rawDataAbilities[abilityId];
    const numberOfAbility = uidList.length;
    // const ability = this.getAbility(Number(abilityId));
    const ability = abilityList.find(ability => ability.id === Number(abilityId));

    if (!ability) {
      console.log(`Error: ability with id ${abilityId} doesn't exist.`);
      break;
    }
    for (let i = 0; i < numberOfAbility; i++) {
      const newAbility = ability.clone();
      newAbility.uid = uidList[i];
      abilities.push(newAbility);
    }
  }
  return abilities;
}

/**
 * Create raw data from a list of abilities. If the object, is empty it means
 * something wrong happened.
 * @param abilities Ability array to convert
 * @returns An object containing the raw data of the deck with key the id of the ability and value the number of time it is in the deck.
 */
export function createFromRawDataAbilityList(abilities: Ability[]): RawDataAbilities {
  let rawDataAbilities: RawDataAbilities = {};

  abilities.forEach(ability => {
    const abilityId = ability.id;
    if (!rawDataAbilities[abilityId]) {
      rawDataAbilities[abilityId] = [];
    }
    rawDataAbilities[abilityId].push(ability.uid);
  });
  return rawDataAbilities;
}