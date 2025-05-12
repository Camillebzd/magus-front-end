'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/app/page.module.css';

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Chat from '@/components/Chat';
import AbilityCard from '@/components/AbilityCard';
import { Ability, fromRawAbilitiesToAbilities, RawDataAbilities } from '@/scripts/abilities';
import { Monster, Weapon } from '@/scripts/entities';
import { Action, ActionInstructions } from '@/scripts/actions';
import { Box, Button, Flex, Text, useDisclosure } from '@chakra-ui/react';
import EndOfFightModal from '@/components/EndOfFightModal';
import { useAllWeapons, useMonstersWorld } from '@/scripts/customHooks';
import SelectFluxesModal from '@/components/SelectFluxesModal';
import { usePathname } from 'next/navigation'
import { HistoricSystem } from '@/scripts/historic';
import { socketActions } from '@/redux/features/socketSlice';
import ActionManager, { RawDataAction } from '@/scripts/ActionManager';
import UniqueIdGenerator from '@/scripts/UniqueIdGenerator';
import { useSocket } from '@/sockets/socketContext';
import { useRouter } from "next/navigation";
import EntityList from './components/EntityList';
import CheatBox from './components/CheatBox';

enum GAME_PHASES {
  WAIT_BEFORE_START,
  PLAYER_CHOOSE_ABILITY,
  PLAYER_WAIT_FOR_OTHERS,
  PLAYER_CHOOSE_ABILITY_COMBO,
  RESOLUTION,
}

export default function Page({ params }: { params: { roomId: string } }) {
  const socket = useSocket();
  const isSocketInitialized = useRef(false);
  const listenersInitialized = useRef(false);
  const router = useRouter();

  const pathname = usePathname();
  const room = useAppSelector((state) => state.socketReducer.room);
  const userId = useAppSelector((state) => state.authReducer.address);
  const isInTheRoom = pathname.split('/')[2] === room.id;
  const allWeapons = useAllWeapons(false);
  const allMonsters = useMonstersWorld(false);

  const [weapons, setWeapons] = useState<Weapon[] | undefined>(undefined); // all the weapons (including the player)
  const weapon = useMemo(() => {
    return weapons?.find((w) => w.uid === userId);
  }, [weapons, userId]); // the player weapon
  const updateWeaponProperty = (uid: string, property: keyof Weapon, value: any) => {
    setWeapons((currentWeapons) => {
      if (!currentWeapons) return currentWeapons;
      return currentWeapons.map((currentWeapon) => {
        if (currentWeapon.uid !== uid) return currentWeapon;  
        const weaponCopied = currentWeapon.clone();
        (weaponCopied[property] as any) = value;
        return weaponCopied;
      });
    });
  };
  const [monsters, setMonsters] = useState<Monster[] | undefined>(undefined);
  // Refs used in actions to avoid re-renders and multiple triggring
  const weaponsRef = useRef<Weapon[] | undefined>(undefined);
  const weaponRef = useRef<Weapon | undefined>(undefined);
  const monstersRef = useRef<Monster[] | undefined>(undefined);
  const actionManager = useRef<ActionManager>(new ActionManager());

  const historic = useRef<HistoricSystem>(new HistoricSystem([]));
  // const isConnected = useAppSelector((state) => state.authReducer.isConnected);
  const dispatch = useAppDispatch();

  const endOfFightModal = useDisclosure();
  const fluxeModal = useDisclosure();
  let abilitySelected = useRef<Ability | null>(null);
  let won = useRef(false);

  const [info, setInfo] = useState<string[]>([]);
  const [phase, setPhase] = useState(GAME_PHASES.WAIT_BEFORE_START);
  const [turn, setTurn] = useState(1);
  let isPlayerCombo = useRef(false);
  let [actions, setActions] = useState<Action[]>([]);
  const actionsRef = useRef<Action[] | undefined>(undefined);

  const [entitiesSelected, setEntitiesSelected] = useState<string[]>([]);

  const getDefaultTargets = (ability: Ability): string[] => {
    switch (ability.target) {
      case "SELF":
        return weapon ? [weapon.uid] : [];
      case "ENEMY":
        return monsters ? [monsters.filter(monster => !monster.isDead())[0].uid] : []; // Default to the first monster alive
      case "ALLY":
        return weapons ? [weapons.filter(weapon => !weapon.isDead())[0].uid] : []; // Default to the first weapon alive
      case "ALLY_TEAM":
        return weapons ? weapons.filter(weapon => !weapon.isDead()).map(weapon => weapon.uid) : [];
      case "ENEMY_TEAM":
        return monsters ? monsters.filter(monster => !monster.isDead()).map(monster => monster.uid) : [];
      case "ALL":
        let allEntities: string[] = [];
        if (monsters) {
          allEntities = monsters.filter(monster => !monster.isDead()).map(monster => monster.uid);
        }
        if (weapons) {
          allEntities.push(...weapons.filter(weapon => !weapon.isDead()).map(weapon => weapon.uid));
        }
        return allEntities;
      case "NONE":
      default:
        return [];
    }
  };
  const areEntitiesValid = (ability: Ability, selectedEntities: string[]): boolean => {
    // check if one of the entities is dead
    for (const selectedEntity of selectedEntities) {
      const entity = monsters?.find(monster => monster.uid === selectedEntity) || weapon;
      if (entity?.isDead())
        return false;
    }

    switch (ability.target) {
      case "ALLY_TEAM":
        return weapons?.filter(weapon => !weapon.isDead()).every(weapon => selectedEntities.includes(weapon.uid)) || false;
      case "ENEMY_TEAM":
        return monsters?.filter(monster => !monster.isDead()).every(monster => selectedEntities.includes(monster.uid)) || false;
      case "ALL":
        // For should select all monsters alive and the weapons
        const correctEntities = monsters?.filter(monster => !monster.isDead()).map(monster => monster.uid) || [];
        correctEntities.push(...weapons?.filter(weapon => !weapon.isDead()).map(weapon => weapon.uid) || []);
        return correctEntities.every(entity => selectedEntities.includes(entity));
      case "ENEMY":
        // For single-target abilities, at least one correct entity must be selected
        return monsters?.filter(monster => !monster.isDead()).some(monster => selectedEntities.includes(monster.uid)) || false;
      case "ALLY":
        // For single-target abilities, at least one correct entity must be selected
        return weapons?.filter(weapon => !weapon.isDead()).some(weapon => selectedEntities.includes(weapon.uid)) || false;
      case "SELF":
        return weapon?.uid === selectedEntities[0] || false;
      default:
        console.warn("Unsupported ability target type:", ability.target);
        return false;
    }
  };

  // First useEffect remains the same - just for socket initialization
  useEffect(() => {
    if (!socket || isSocketInitialized.current) return;

    isSocketInitialized.current = true;

    return () => {
      console.log('cleaning up socket connections');
      socket.off('setDeck');
      socket.off('setHand');
      socket.off('discardRefillAndDraw');
      socket.off('startFight');
      socket.off('actionUpdated');
      socket.off('actionValidated');
      socket.off('turnInstructions');
      socket.off('fightFinished');

      // Reset the listeners flag on cleanup
      listenersInitialized.current = false;
    };
  }, [socket]);

  // Update refs whenever state changes
  useEffect(() => {
    weaponRef.current = weapon;
  }, [weapon]);

  useEffect(() => {
    weaponsRef.current = weapons;
  }, [weapons]);

  useEffect(() => {
    monstersRef.current = monsters;
  }, [monsters]);

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  // Socket init
  useEffect(() => {
    if (!socket || !weapon || !weapons || !monsters || !isSocketInitialized.current || listenersInitialized.current)
      return;

    listenersInitialized.current = true;

    // Listen to events related to hand, deck and discard
    socket.on('setDeck', (cards: RawDataAbilities) => {
      console.log('setDeck', cards);
      const deckToSet: Ability[] = fromRawAbilitiesToAbilities(cards, weapon!.abilities);
      updateWeaponProperty(userId, 'deck', deckToSet);
    });

    socket.on('setHand', (cards: RawDataAbilities) => {
      console.log('setHand', cards);
      const handToSet: Ability[] = fromRawAbilitiesToAbilities(cards, weapon!.abilities);
      updateWeaponProperty(userId, 'hand', handToSet);
    });

    socket.on('discardRefillAndDraw', (instructions: { discard: RawDataAbilities, shouldRefillDeck: boolean, draw: RawDataAbilities }) => {
      console.log('discard cards', instructions.discard);
      console.log('shouldRefillDeck', instructions.shouldRefillDeck);
      console.log('draw cards', instructions.draw);
      setWeapons((currentWeapons) => {
        if (!currentWeapons) return currentWeapons;
        return currentWeapons.map((currentWeapon) => {
          if (currentWeapon.uid !== userId) return currentWeapon;
          // first discard
          const cardsToDiscard: Ability[] = currentWeapon.hand.filter(ability => {
            // check if current ability is in the cards to discard
            const uids = instructions.discard[ability.id];
            if (!uids) return false;
            return uids.includes(ability.uid);
          });
          const weaponCopied = currentWeapon.clone();
          cardsToDiscard.forEach(cardToDiscard => weaponCopied.discardFromHand(cardToDiscard));
          // then refill the deck if needed
          if (instructions.shouldRefillDeck) {
            weaponCopied.refillDeckFromDiscard();
          }
          // then draw the cards
          const cardsToDraw: Ability[] = currentWeapon.deck.filter(ability => {
            // check if current ability is in the cards to draw
            const uids = instructions.draw[ability.id];
            if (!uids) return false;
            return uids.includes(ability.uid);
          });
          cardsToDraw.forEach(cardToDraw => weaponCopied.drawOneFromDeck(cardToDraw));
          return weaponCopied;
        });
      });
    });
    socket.on('startFight', () => {
      setPhase(GAME_PHASES.PLAYER_CHOOSE_ABILITY);
      // first logs
      setInfo(currentInfo => {
        const newInfo = [...currentInfo];
        newInfo.push(`####### Turn ${turn} #######`);
        return newInfo;
      })
    });
    // tmp create map for weapon and monster as only one supported
    socket.on('actionUpdated', (rawDataActions: RawDataAction[]) => {
      // Get the latest weapon and monster for the maps
      const currentWeapons = weaponsRef.current;
      const currentMonsters = monstersRef.current;

      if (!currentWeapons || !currentMonsters) return;

      const weaponMap = new Map<string, Weapon>();
      currentWeapons.forEach(weapon => {
        weaponMap.set(weapon.uid, weapon);
      });

      const monsterMap = new Map<string, Monster>();
      currentMonsters.forEach(monster => {
        monsterMap.set(monster.uid, monster);
      });
      console.log('weaponMap', weaponMap);
      console.log('monsterMap', monsterMap);
      console.log('receivedActions raw', rawDataActions);

      const receivedActions: Action[] = rawDataActions
        .map(rawDataAction => {
          return actionManager.current.createActionFromRawData(
            rawDataAction, weaponMap, monsterMap
          );
        })
        .filter((action): action is Action => action !== null);

      console.log('receivedActions', receivedActions);
      if (receivedActions.length > 0) {
        setActions(receivedActions);
      }
    });

    socket.on('actionValidated', (rawDataActions: RawDataAction[]) => {
      // update the action list
      setActions(currentActions => {
        return currentActions.map(action => {
          const validatedAction = rawDataActions.find(rawDataAction => rawDataAction.uid === action.uid);
          if (validatedAction) {
            action.hasBeenValidated = true;
            // set the phase to wait if action is validated for the player
            if (action.caster.uid === weapon?.uid) {
              setPhase(GAME_PHASES.PLAYER_WAIT_FOR_OTHERS);
            }
          }
          return action;
        });
      });
    });

    socket.on('turnInstructions', (instructions: ActionInstructions[]) => {
      console.log('turnInstructions', instructions);
      // resolve the actions
      instructions.forEach(instruction => {
        const action = actionsRef.current?.find(action => action.uid === instruction.actionUid);
        if (!action) {
          console.error('Action not found for instruction', instruction);
          return;
        }
        action.info = setInfo;
        action.resolve(instruction);
      });
      console.log('monsters after resolve', monstersRef.current);
      console.log('weapons after resolve', weaponsRef.current);
      // emit turn instructions executed
      socket.emit('turnInstructionsExecuted');
    });

    socket.on('endOfTurn', () => {
      setActions([]);
      setTurn((currentTurn) => currentTurn + 1);
      setPhase(GAME_PHASES.PLAYER_CHOOSE_ABILITY);
    });

    socket.on('fightFinished', (entity: "draw" | "weapons" | "monsters") => {
      console.log('fightFinished', entity);
      won.current = entity === "weapons";
      endOfFightModal.onOpen();
    });

    // Trigger the init Hand and deck
    socket.emit('initHandAndDeck');

    // Cleanup on unmount
    return () => {
    };
  }, [weapon, weapons, monsters, socket]);

  // Set the Weapons at begining
  useEffect(() => {
    if (!allWeapons || allWeapons.length < 1 || !room || !userId || (weapons && weapons.length > 0))
      return;
    const weaponsData = Object.entries(room.weapons).map(([memberId, weaponId]) => {
      const weaponData = allWeapons.find(weapon => weapon.id === parseInt(weaponId))?.clone();
      if (!weaponData) {
        console.error("Weapon not found with id:", weapon);
        return null;
      }
      weaponData.uid = memberId;
      const deckToSet: Ability[] = fromRawAbilitiesToAbilities(room.decks[memberId], weaponData.abilities);
      if (deckToSet.length < 1) {
        console.error("Deck not found for weapon with id:", weaponId);
        return null;
      }
      weaponData.deck = deckToSet;
      return weaponData;
    }).filter((weaponData: Weapon | null) => weaponData !== null) as Weapon[];
    if (weaponsData.length > 0) {
      setWeapons(weaponsData);
    }
  }, [allWeapons, room, userId]);

  // Set monster at begining (only one supported for the moment)
  useEffect(() => {
    if (!allMonsters || allMonsters.length === 0 || monsters)
      return;

    const monstersData = room.monsters.map(monster => {
      const monsterData = allMonsters.find(monsterData => monsterData.id === monster.id)?.clone();
      if (!monsterData) {
        console.error("Monster not found with id:", monster.id);
        return null;
      }
      monsterData.uid = monster.uid;
      monsterData.abilities.forEach(ability => {
        ability.uid = monster.abilities[ability.id][0];
      });
      monsterData.deck = monsterData.abilities; // for the moment the deck is the same as the abilities
      return monsterData;
    }).filter(monsterData => monsterData !== null) as Monster[];
    setMonsters(monstersData);
    console.log("monstersData", monstersData);
  }, [allMonsters]);

  // End of turn logs
  useEffect(() => {
    if (turn < 2)
      return;
    setInfo(currentInfo => {
      const newInfo = [...currentInfo];
      newInfo.push(`####### Turn ${turn} #######`);
      return newInfo;
    })
  }, [turn]);

  const goToWorld = () => {
    // clean sockets
    socket.off('setDeck');
    socket.off('setHand');
    socket.off('discardRefillAndDraw');
    socket.off('startFight');
    socket.off('actionUpdated');
    socket.off('actionValidated');
    socket.off('turnInstructions');
    socket.off('endOfTurn');
    socket.off('fightFinished');
    // clean redux state
    dispatch(socketActions.cleanEndOfFight());

    // if user is admin, remove monsters
    if (room.adminId === userId) {
      dispatch(socketActions.removeMonsters(room.monsters));
    }

    router.push('/');
  };

  const selectAbility = (ability: Ability, fluxesUsed: number = 0) => {
    if (phase !== GAME_PHASES.PLAYER_CHOOSE_ABILITY /*&& !weapon?.isEntityAbleToPlay()*/)
      return;
    if (!socket || !weapon || !weapons || !monsters)
      return;
    const updateTargets = (ability: Ability) => {
      const defaultTargets = getDefaultTargets(ability);
      if (entitiesSelected.length === 0) {
        // No entities selected, use the correct targets
        setEntitiesSelected(defaultTargets);
        return defaultTargets;
      }
      // Check if the selected entities are valid
      if (areEntitiesValid(ability, entitiesSelected)) {
        return entitiesSelected;
      }
      // Reset to correct targets if the selection is invalid
      setEntitiesSelected(defaultTargets);
      return defaultTargets;
    };
    let targets: string[] = updateTargets(ability);
    // Create the raw data of an action and send it to the server
    const actionData: RawDataAction = {
      uid: UniqueIdGenerator.getInstance().generateSnowflakeId(2),
      caster: weapon.uid,
      targets: targets,
      ability: ability.uid,
      fluxesUsed: fluxesUsed,
      currentTurn: turn,
      hasBeenValidated: false,
    };
    console.log('actionData', actionData);
    socket.emit('selectAbility', actionData);
  };

  const selectTarget = (target: string) => {
    // if an ability is selected and during choose phase, select the target and emit the action
    if (phase !== GAME_PHASES.PLAYER_CHOOSE_ABILITY || !weapon || !weapons || !monsters)
      return;
    if (actionsRef.current && actionsRef.current.length > 0) {
      const userAction = actionsRef.current.find(action => action.caster.uid === weapon.uid);
      if (!userAction) {
        setEntitiesSelected([target]);
        return;
      }

      // Skip selection if the target is already selected
      if (entitiesSelected.includes(target)) {
        console.log("Target already selected, skipping selection.");
        return;
      }

      let shoudEmitNewAction = false;
      if (areEntitiesValid(userAction.ability, [target])) {
        shoudEmitNewAction = true;
        setEntitiesSelected([target]);
      }
      if (!shoudEmitNewAction)
        return;
      const actionData: RawDataAction = {
        uid: UniqueIdGenerator.getInstance().generateSnowflakeId(2),
        caster: weapon.uid,
        targets: [target],
        ability: userAction.ability.uid,
        fluxesUsed: 0,
        currentTurn: turn,
        hasBeenValidated: false,
      };
      console.log('new target selected, actionData', actionData);
      socket.emit('selectAbility', actionData);
    }
  };

  const execAbilityModal = (fluxeSelected: number) => {
    if (abilitySelected.current) {
      weapon?.useFluxes(fluxeSelected);
      selectAbility(abilitySelected.current, fluxeSelected);
      abilitySelected.current = null;
    }
    fluxeModal.onClose();
  };

  const onAbilityClick = (abilityClicked: Ability) => {
    if (phase !== GAME_PHASES.PLAYER_CHOOSE_ABILITY)
      return;
    if (abilityClicked.isMagical) {
      if (weapon!.fluxes < 1)
        return;
      abilitySelected.current = abilityClicked;
      fluxeModal.onOpen();
    }
    else
      selectAbility(abilityClicked, 0);
  };

  const phasePrinter = () => {
    switch (phase) {
      case GAME_PHASES.WAIT_BEFORE_START:
        return "Waiting for all the players to be ready";
      case GAME_PHASES.PLAYER_CHOOSE_ABILITY:
        return "Choose an ability";
      case GAME_PHASES.PLAYER_WAIT_FOR_OTHERS:
        return "Wait for the others";
      case GAME_PHASES.PLAYER_CHOOSE_ABILITY_COMBO:
        return "Choose an ability for the COMBO";
      case GAME_PHASES.RESOLUTION:
        return "Wait for the resolve";
      default:
        return "Error";
    }
  }

  return (
    <main className={styles.mainFightContainer}>
      {!isInTheRoom ? (
        <>
          <Text>Not in the room.</Text>
        </>
      ) : (
        <>
          {weaponRef.current && <CheatBox weapon={weaponRef.current} setInfo={setInfo}/>}
          <Flex
            direction={"column"}
            justify={"space-between"}
            grow={1}
            gap={5}
          >
            <Flex
              direction={"row"}
              justify={"space-around"}
              align={"center"}
              grow={1}
            >
              {weapons && <EntityList entities={weapons.filter(weapon => !weapon.isDead())} isModifiersOnRight={true} selected={entitiesSelected} selectTarget={selectTarget} />}
              <Box>
                {actions.length > 0 ?
                  actions?.map(action => (
                    <Box key={action.uid}>
                      <Text>{action?.caster.name}: {action?.ability.name} {"->"} {action?.targets.map(target => target.name).join(', ')} {action?.hasBeenValidated ? '✓' : 'x'}</Text>
                    </Box>
                  ))
                  : <Text>No actions</Text>
                }
              </Box>
              {monsters && <EntityList entities={monsters.filter(monster => !monster.isDead())} isModifiersOnRight={false} selected={entitiesSelected} selectTarget={selectTarget} />}
            </Flex>
            <Flex
              height={"10rem"}
              direction={"row"}
              justify={"space-between"}
              border={"2px solid"}
              borderColor={'profoundgrey.400'}
              borderRadius={"5px"}
              p='1'
            >
              <Flex height={"100%"} width={"20rem"}>
                <Chat lignes={info} />
              </Flex>
              <Flex direction={"column"} justifyContent={"center"} alignItems={"center"} >
                <Text>{phasePrinter()}</Text>
                <Text>Actual turn: {turn}</Text>
                <Text>deck: {weapon?.deck.length}</Text>
                <Text>discard: {weapon?.discard.length}</Text>
              </Flex>
              <Flex
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
                gap={"1rem"}
              >
                <Button onClick={() => {
                  if (phase === GAME_PHASES.PLAYER_CHOOSE_ABILITY) {
                    socket.emit('validateAbility');
                  }
                }}>
                  Validate
                </Button>
                {weapon?.hand.map((ability) => <AbilityCard key={ability.uid} onClick={() => onAbilityClick(ability)} ability={ability} />)}
              </Flex>
            </Flex>
          </Flex>
          {monsters && weapon && <EndOfFightModal isOpen={endOfFightModal.isOpen} onClose={endOfFightModal.onClose} weaponId={weapon!.id} difficulty={monsters[0]!.difficulty} isWinner={won.current} goToWorld={goToWorld} />}
          {monsters && weapon && <SelectFluxesModal isOpen={fluxeModal.isOpen} onClose={fluxeModal.onClose} selectAbility={execAbilityModal} fluxesAvailables={weapon.fluxes} />}
        </>
      )}
    </main>
  );
};