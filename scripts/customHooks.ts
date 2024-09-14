import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Monster, Weapon, WeaponData, Identity } from "./entities";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { MonsterDataSerilizable, fillMonstersWorldData } from "@/redux/features/monsterSlice";
import { fillStoreAbilities } from "@/redux/features/abilitySlice";
import { Ability, AbilityData } from "./abilities";
import { AttributeOnNFT, WeaponNFT, fillUserWeapons, weapons } from "@/redux/features/weaponSlice";
import { createContract, fetchFromDB, getAllAbilitiesIdForWeapon } from "./utils";
import { Draft } from "immer";
import { Notify } from "notiflix";
import { STARTERS_NAME } from "./systemValues";

function createMonsters(monstersData: MonsterDataSerilizable[], abilities: Ability[]) {
  let monsters: Monster[] = [];
  monstersData.forEach(monsterData => {
    let monsterAbilities: Ability[] = [];
    monsterData.abilities.forEach(abilityId => {
      let realAbility = abilities.find(ability => ability.id === abilityId);
      if (realAbility)
        monsterAbilities.push(realAbility);
      else
        console.log("Error: a monster data id doesn't have a supported ability.");
    });
    monsters.push(new Monster({
      id: monsterData.id,
      name: monsterData.name,
      image: monsterData.image,
      description: monsterData.description,
      difficulty: monsterData.difficulty,
      level: monsterData.level,
      health: monsterData.health,
      speed: monsterData.speed,
      mind: monsterData.mind,
      sharpDmg: monsterData.sharpDmg,
      bluntDmg: monsterData.bluntDmg,
      burnDmg: monsterData.burnDmg,
      sharpRes: monsterData.sharpRes,
      bluntRes: monsterData.bluntRes,
      burnRes: monsterData.burnRes,
      handling: monsterData.handling,
      pierce: monsterData.pierce,
      guard: monsterData.guard,
      lethality: monsterData.lethality,
      stage: 1,
      abilities: monsterAbilities
    }));
  });
  return monsters;
}

// TODO Create the same but directly with specific ID in order to avoid full creation monsters...
export function useMonstersWorld(forceFill: boolean = false) {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const monstersData = useAppSelector((state) => state.monsterReducer.monstersWorld);
  const abilities = useAbilities(false); // care to not update from weapon slice or this will trigger here
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fillMonstersWorldData(forceFill));
  }, []);

  useEffect(() => {
    if (monstersData.length < 1 || abilities.length < 1)
      return;
    let dataToSet: Monster[] = createMonsters(monstersData, abilities);
    dataToSet.sort((a, b) => a.difficulty - b.difficulty);
    setMonsters(dataToSet);
  }, [monstersData, abilities]);

  return monsters;
}

function getGearAttributeInfo(attributes: AttributeOnNFT[], trait_type: string): string | string[] | Identity {
  for (let i = 0; i < attributes.length; i++) {
    if (attributes[i].trait_type === trait_type)
      return attributes[i].value;
  }
  return "";
}

function createWeapon(weaponsDataNFT: WeaponNFT, abilities: Ability[]) {
  let weaponAbilities: Ability[] = [];
  let weaponAbilitiesNames = getGearAttributeInfo(weaponsDataNFT.attributes, "Abilities");
  if (Array.isArray(weaponAbilitiesNames))
    weaponAbilitiesNames.forEach((abilityName) => {
      const ability = abilities.find((abilitie) => abilitie.name === abilityName);
      if (ability)
        weaponAbilities.push(ability);
      else
        console.log("Warning an ability on a weapon is not a valid ability: ", abilityName);
    });
  let data: WeaponData = {
    name: weaponsDataNFT.name,
    id: parseInt(weaponsDataNFT.tokenId),
    description: weaponsDataNFT.description,
    image: weaponsDataNFT.image,
    level: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Level") as string),
    stage: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Stage") as string),
    health: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Health") as string),
    speed: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Speed") as string),
    mind: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Mind") as string),
    sharpDmg: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Sharp Damage") as string),
    bluntDmg: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Blunt Damage") as string),
    burnDmg: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Burn Damage") as string),
    sharpRes: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Sharp Resistance") as string),
    bluntRes: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Blunt Resistance") as string),
    burnRes: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Burn Resistance") as string),
    pierce: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Pierce") as string),
    handling: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Handling") as string),
    guard: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Guard") as string),
    lethality: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Lethality") as string),
    abilities: weaponAbilities as Ability[],
    xp: parseInt(getGearAttributeInfo(weaponsDataNFT.attributes, "Experience") as string),
    identity: getGearAttributeInfo(weaponsDataNFT.attributes, "Identity") as Identity,
  };
  return new Weapon(data);
}

export function useUserWeapons(forceFill: boolean = false) {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const isConnected = useAppSelector((state) => state.authReducer.isConnected);
  const weaponsDataNFT = useAppSelector((state) => state.weaponReducer.userWeapons);
  const isLoading = useAppSelector((state) => state.weaponReducer.isLoading);
  const abilities = useAbilities(false); // care to not update from monster slice or this will trigger here
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isConnected) {
      return;
    }
    if (!isLoading)
      dispatch(fillUserWeapons(forceFill));
  }, [isConnected]);

  useEffect(() => {
    if (weaponsDataNFT.length < 1 || abilities.length < 1)
      return;
    let dataToSet: Weapon[] = weaponsDataNFT.map(weaponDataNFT => createWeapon(weaponDataNFT, abilities));
    dataToSet.sort((a, b) => a.id - b.id);
    setWeapons(dataToSet);
  }, [weaponsDataNFT, abilities]);

  return weapons;
}

export function useAbilities(forceFill: boolean = false) {
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const abilitiesData = useAppSelector((state) => state.abilityReducer.abilities);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fillStoreAbilities(forceFill));
  }, []);

  useEffect(() => {
    if (abilitiesData.length < 1)
      return;
    let dataToSet: Ability[] = abilitiesData.map(abilityData => new Ability(abilityData));
    setAbilities(dataToSet);
  }, [abilitiesData]);

  return abilities;
}

export function useStarter() {
  const [weaponsStarter, setWeaponsStarter] = useState<Weapon[]>([]);
  const abilities = useAbilities(false);

  useEffect(() => {
    const createStarter = async () => {
      const weaponsAvailables = STARTERS_NAME;
      let starters: Weapon[] = [];
      let starterDataBaseStats: WeaponData[] = [];
      let starterDataImages: {id: number, name: string, image: string}[] = [];
      let abilitiesId: number[] = [];

      starterDataBaseStats = await fetchFromDB("weapons/baseStats");
      if (starterDataBaseStats === undefined) {
        console.log("Failed to fetch baseStats from db.")
        return;
      }
      starterDataImages = await fetchFromDB("weapons/images");
      if (starterDataImages === undefined) {
        console.log("Failed to fetch images of weapons from db.")
        return;
      }
      for (let i = 0; i < weaponsAvailables.length; i++) {
        // let starterWeapon: WeaponData = JSON.parse(JSON.stringify((await import(`@/data/weapons/baseStats.json`)).default.find(weapon => weapon.name == weaponsAvailables[i]))) as WeaponData;
        let starterWeapon: WeaponData | undefined = starterDataBaseStats.find(weapon => weapon.name == weaponsAvailables[i]);
        if (!starterWeapon) {
          console.log(`Error: can't find starter weapon: ${weaponsAvailables[i]}.`);
          continue;
        }
        starterWeapon["level"] = 1;
        starterWeapon["stage"] = 1;
        starterWeapon["name"] = "Basic " + weaponsAvailables[i].charAt(0).toUpperCase() + weaponsAvailables[i].slice(1);
        starterWeapon["description"] = "This is a starter weapon.";
        // const image = (await import(`@/data/weapons/images.json`)).default.find(weapon => weapon.name == weaponsAvailables[i])?.image;
        const image = starterDataImages.find(weapon => weapon.name == weaponsAvailables[i])?.image;
        if (!image) {
          console.log(`Error: can't find weapon image: ${weaponsAvailables[i]}.`);
          continue;
        }
        starterWeapon["image"] = image;
        // const abilitiesId: number[] |undefined = (await import(`@/data/weapons/abilities.json`)).default.find(weapon => weapon.name == weaponsAvailables[i])?.base;
        try {
          abilitiesId = await getAllAbilitiesIdForWeapon(weaponsAvailables[i], 1);
        } catch(e) {
          console.log(e);
          continue;
        }
        if (!abilitiesId) {
          console.log(`Error: can't find weapon abilities: ${weaponsAvailables[i]}.`);
          continue;
        }
        let weaponAbilities: Ability[] = [];
        abilitiesId.forEach((abilityId) => {
          const ability = abilities.find((ability) => ability.id === abilityId);
          if (!ability)
            console.log(`Error: can't find weapon ability with id: ${abilityId}.`);
          else
            weaponAbilities.push(ability);
        });
        starterWeapon["abilities"] = weaponAbilities;
        starterWeapon["xp"] = 0;
        starterWeapon["identity"] = weaponsAvailables[i];
        starterWeapon["id"] = i;
        starters.push(new Weapon(starterWeapon));
      }
      console.log("starter weapons pulled");
      console.log(starters);
      setWeaponsStarter(starters);
    };
    if (abilities.length > 0 && weaponsStarter.length < 1)
      createStarter();
  }, [abilities]);

  return weaponsStarter;
}

export function useRequestAvailable() {
  const [requestAvailable, setRequestAvailable] = useState(0);
  const address = useAppSelector((state) => state.authReducer.address);

  useEffect(() => {
    if (address.length < 42)
    return;
    const updateRequestCount = async () => {
      try {
        const contract = await createContract(address);
        const maxWeaponsRequest: BigInt = await contract.maxWeaponsRequest();
        const weaponsRequested: BigInt = await contract.weaponsRequested(address);
        setRequestAvailable(Number(maxWeaponsRequest) - Number(weaponsRequested));
      } catch (e) {
        console.log(e);
        Notify.failure("Failed to retrieve free request available.");
      }
    }
    updateRequestCount();
  }, [address]);

  return requestAvailable;
}

// get the deck of a specific weapon in local storage
export function useWeaponDeck(weaponId: number) {
  const [weaponDeck, setWeaponDeck] = useState<Ability[]>([]);
  // Redux
  // const weaponDeckData = useAppSelector((state) => state.weaponDeckReducer.decks[weaponId]);
  // Local storage
  const [weaponDeckData, setWeaponDeckData] = useDeckDataStorage(weaponId);
  const abilities = useAbilities(false); // care to not update from monster slice or this will trigger here

  useEffect(() => {
    if (!weaponDeckData || weaponDeckData?.length < 1 || abilities.length < 1)
      return;
    let dataToSet: Ability[] = weaponDeckData.map(abilityData => new Ability(abilityData));
    setWeaponDeck(dataToSet);
  }, [weaponDeckData, abilities]);

  return weaponDeck;
}

export const deckBuildingInitialState: AbilityData[] = [];

export type DeckBuildingAction = { type: 'add', abilityData: AbilityData} | { type: 'remove', abilityData: AbilityData}

export function deckBuildingReducer(draft: Draft<AbilityData[]>, action: DeckBuildingAction) {
  switch(action.type) {
    case "add": {
      if (draft.filter(ability => ability.id == action.abilityData.id).length + 1 > action.abilityData.tier)
        break;
      draft.push(action.abilityData);
      draft.sort((ability1, ability2) => ability1.id - ability2.id);
      break;
    }
    case "remove": {
      const index = draft.findIndex(ability => ability.id == action.abilityData.id);
      if (index < 0)
        break;
      draft.splice(index, 1);
      draft.sort((ability1, ability2) => ability1.id - ability2.id);
      break;
    }
  }
}

// Local storage system

function getStorageValue<Type>(key: string, defaultValue: Type) {
  // getting stored value
  const saved = localStorage.getItem(key);
  let initial: Type = defaultValue;
  if (saved)
    initial = JSON.parse(saved);
  return initial || defaultValue;
}

export const useLocalStorage = <Type>(key: string, defaultValue: Type): [Type, Dispatch<SetStateAction<Type>>] => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

export const useXpStorage = (nftId: number): [number, Dispatch<SetStateAction<number>>] => {
  const [xp, setXp] = useLocalStorage<number>(`xp-${nftId}`, 0);

  return [xp, setXp];
}

export const useDeckDataStorage = (weaponId: number): [AbilityData[], Dispatch<SetStateAction<AbilityData[]>>] => {
  const [deck, setDeck] = useLocalStorage<AbilityData[]>(`deck-${weaponId}`, []);

  return [deck, setDeck];
}