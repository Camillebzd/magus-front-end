'use client'

import { act, MutableRefObject, use, useEffect, useRef, useState } from 'react';
import styles from '@/app/page.module.css';

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Entity from '@/components/Entity';
import Chat from '@/components/Chat';
import AbilityCard from '@/components/AbilityCard';
import { Ability, fromRawAbilitiesToAbilities, RawDataAbilities } from '@/scripts/abilities';
import { Monster, Weapon } from '@/scripts/entities';
import { Action, ActionInstructions, END_OF_TURN } from '@/scripts/actions';
import { resolveActions } from '@/scripts/fight';
import { Button, Text, useDisclosure } from '@chakra-ui/react';
import EndOfFightModal from '@/components/EndOfFightModal';
import { useAbilities, useAllWeapons, useMonstersWorld, useUserWeapons, useWeaponDeck } from '@/scripts/customHooks';
import SelectFluxesModal from '@/components/SelectFluxesModal';
import { HAND_SIZE } from '@/scripts/systemValues';
import { usePathname, useSearchParams } from 'next/navigation'
import { HistoricSystem, Turn } from '@/scripts/historic';
import { socketActions } from '@/redux/features/socketSlice';
import SocketFactory from '@/sockets/SocketFactory';
import { Socket } from 'socket.io-client';
import ActionManager, { RawDataAction } from '@/scripts/ActionManager';
import UniqueIdGenerator from '@/scripts/UniqueIdGenerator';
import { useSocket } from '@/sockets/socketContext';

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

  const pathname = usePathname();
  const room = useAppSelector((state) => state.socketReducer.room);
  const userId = useAppSelector((state) => state.authReducer.address);
  const isInTheRoom = pathname.split('/')[2] === room.id;
  const allWeapons = useAllWeapons(false);
  const allMonsters = useMonstersWorld(false);
  const [weapon, setWeapon] = useState<Weapon | undefined>(undefined);
  const [monster, setMonster] = useState<Monster | undefined>(undefined);
  const weaponRef = useRef<Weapon | undefined>(undefined);
  const monsterRef = useRef<Monster | undefined>(undefined);
  // const monster = useMonstersWorld(false).find(monster => monster.id === room.monsters[0]?.id)?.clone(); // only taking the first one atm
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

  // First useEffect remains the same - just for socket initialization
  useEffect(() => {
    if (!socket || isSocketInitialized.current) return;

    isSocketInitialized.current = true;

    return () => {
      console.log('cleaning up socket connections');
      socket.off('setDeck');
      socket.off('setHand');
      socket.off('drawCards');
      socket.off('discardCards');
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
    monsterRef.current = monster;
  }, [monster]);

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  // Socket init
  useEffect(() => {
    if (!socket || !weapon || !monster || !isSocketInitialized.current || listenersInitialized.current)
      return;

    listenersInitialized.current = true;

    // Listen to events related to hand, deck and discard
    socket.on('setDeck', (cards: RawDataAbilities) => {
      console.log('setDeck', cards);
      setWeapon((currentWeapon) => {
        if (!currentWeapon) return currentWeapon;
        const deckToSet: Ability[] = fromRawAbilitiesToAbilities(cards, currentWeapon.abilities);
        const weaponCopied = currentWeapon.clone();
        weaponCopied.deck = deckToSet;
        return weaponCopied;
      });
    });
    socket.on('setHand', (cards: RawDataAbilities) => {
      console.log('setHand', cards);
      setWeapon((currentWeapon) => {
        if (!currentWeapon) return currentWeapon;
        const handToSet: Ability[] = fromRawAbilitiesToAbilities(cards, currentWeapon.abilities);
        const weaponCopied = currentWeapon.clone();
        weaponCopied.hand = handToSet;
        return weaponCopied;
      });
    });

    socket.on('drawCards', (cards: RawDataAbilities) => {
      console.log('drawCards', cards);
      setWeapon((currentWeapon) => {
        if (!currentWeapon) return currentWeapon;
        const cardsToDraw: Ability[] = currentWeapon.deck.filter(ability => {
          // check if current ability is in the cards to draw
          const uids = cards[ability.id];
          if (!uids) return false;
          return uids.includes(ability.uid);
        });
        const weaponCopied = currentWeapon.clone();
        cardsToDraw.forEach(cardToDraw => weaponCopied.drawOneFromDeck(cardToDraw));
        return weaponCopied;
      });
    });
    socket.on('discardCards', (cards: RawDataAbilities) => {
      console.log('discardCards', cards);
      setWeapon((currentWeapon) => {
        if (!currentWeapon) return currentWeapon;
        const cardsToDiscard: Ability[] = currentWeapon.hand.filter(ability => {
          // check if current ability is in the cards to discard
          const uids = cards[ability.id];
          if (!uids) return false;
          return uids.includes(ability.uid);
        });
        const weaponCopied = currentWeapon.clone();
        cardsToDiscard.forEach(cardToDiscard => weaponCopied.discardFromHand(cardToDiscard));
        return weaponCopied;
      });

    });
    socket.on('startFight', () => {
      setPhase(GAME_PHASES.PLAYER_CHOOSE_ABILITY);
    });
    // tmp create map for weapon and monster as only one supported
    socket.on('actionUpdated', (rawDataActions: RawDataAction[]) => {
      // Get the latest weapon and monster for the maps
      const currentWeapon = weaponRef.current;
      const currentMonster = monsterRef.current;

      if (!currentWeapon || !currentMonster) return;

      const weaponMap = new Map<string, Weapon>();
      weaponMap.set(currentWeapon.uid, currentWeapon);

      const monsterMap = new Map<string, Monster>();
      monsterMap.set(currentMonster.uid, currentMonster);

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
      instructions.forEach(instruction => {
        const action = actionsRef.current?.find(action => action.uid === instruction.actionUid);
        if (!action) {
          console.error('Action not found for instruction', instruction);
          return;
        }
        action.resolve(instruction);
      });
      console.log('monster after resolve', monsterRef.current);
      console.log('weapon after resolve', weaponRef.current);
      setActions([]);
      setTurn(turn + 1);
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
  }, [weapon, monster, socket]);

  // Set the Weapon at begining (only user itself supported for the moment)
  // is the deck part needed on the weapon client side?
  useEffect(() => {
    if (!allWeapons || weapon)
      return;
    const weaponData = allWeapons.find(weapon => weapon.id === parseInt(room.weapons[userId]))?.clone();
    if (weaponData) {
      // weaponData.setLogger(setInfo);
      // const userDeck = room.decks[userId];
      // const deckToAttach: Ability[] = []
      // weaponData.abilities.forEach(ability => {
      //   for (let i = 0; i < userDeck[ability.id]; i++)
      //     deckToAttach.push(ability);
      // });
      // weaponData.fillDeck(deckToAttach);
      weaponData.uid = userId;
      setWeapon(weaponData);
    }
  }, [allWeapons, weapon]);

  // Set monster at begining (only one supported for the moment)
  useEffect(() => {
    if (!allMonsters || allMonsters.length === 0 || monster)
      return;
    let monsterData = allMonsters.find(monster => monster.id === room.monsters[0]?.id)?.clone();
    if (!monsterData) {
      console.error("Monster not found");
      return;
    }
    monsterData.uid = room.monsters[0]?.uid;
    monsterData.abilities.forEach(ability => {
      ability.uid = room.monsters[0]?.abilities[ability.id][0];
    });
    monsterData.deck = monsterData.abilities; // for the moment the deck is the same as the abilities
    setMonster(monsterData);
    console.log("monsterData", monsterData);
  }, [allMonsters]);

  const cleanEndOfFight = () => {
    // clean sockets
    socket.off('setDeck');
    socket.off('setHand');
    socket.off('drawCards');
    socket.off('discardCards');
    socket.off('startFight');
    socket.off('actionUpdated');
    socket.off('actionValidated');
    socket.off('turnInstructions');
    socket.off('fightFinished');
    // clean redux state
    dispatch(socketActions.cleanEndOfFight());
  };

  const selectAbility = (ability: Ability, fluxesUsed: number = 0) => {
    // if (phase !== GAME_PHASES.PLAYER_CHOOSE_ABILITY && !weapon?.isEntityAbleToPlay())
    //   return;
    if (!socket || !weapon || !monster)
      return;
    // TODO Create the raw data of an action and send it to the server
    const actionData: RawDataAction = {
      uid: UniqueIdGenerator.getInstance().generateSnowflakeId(2),
      caster: weapon.uid,
      target: monster.uid,
      ability: ability.uid,
      fluxesUsed: fluxesUsed,
      currentTurn: turn,
      hasBeenValidated: false,
    };
    console.log('actionData', actionData);
    socket.emit('selectAbility', actionData);
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
      <h1 className={styles.pageTitle}>Fight</h1>
      {!isInTheRoom ? (
        <div>
          <Text>Not in the room.</Text>
        </div>
      ) : (
        <>
          <div className={styles.principalFightContainer}>
            <div className={styles.fightersContainer}>
              <div>
                <Entity
                  entity={weapon}
                  isModifiersOnRight={true}
                />
              </div>
              <div>
                {actions.length > 0 ?
                  actions?.map(action => (
                    <div key={action.uid}>
                      <p>{action?.caster.name}: {action?.ability.name} {"->"} {action?.target.name} {action?.hasBeenValidated ? '✓' : 'x'}</p>
                    </div>
                  ))
                  : <p>No actions</p>
                }
              </div>
              <div>
                <Entity
                  entity={monster}
                  isModifiersOnRight={false}
                />
              </div>
            </div>
            <div className={styles.bottomFightContainer}>
              <div className={styles.infoChatContainer}>
                <Chat lignes={info} />
              </div>
              <div className={styles.phasePrinter}>
                <p>{phasePrinter()}</p>
                <p>Actual turn: {turn}</p>
                <p>deck: {weapon?.deck.length}</p>
                <p>discard: {weapon?.discard.length}</p>
              </div>
              <div className={styles.abilitiesCointainer}>
                <Button onClick={() => {
                  if (phase === GAME_PHASES.PLAYER_CHOOSE_ABILITY) {
                    socket.emit('validateAbility');
                  }
                }}>
                  Validate
                </Button>
                {weapon?.hand.map((ability) => <AbilityCard key={ability.uid} onClick={() => onAbilityClick(ability)} ability={ability} />)}
              </div>
            </div>
          </div>
          {monster && weapon && <EndOfFightModal isOpen={endOfFightModal.isOpen} onClose={endOfFightModal.onClose} weaponId={weapon!.id} difficulty={monster!.difficulty} isWinner={won.current} cleanEndOfFight={cleanEndOfFight}/>}
          {monster && weapon && <SelectFluxesModal isOpen={fluxeModal.isOpen} onClose={fluxeModal.onClose} selectAbility={execAbilityModal} fluxesAvailables={weapon.fluxes} />}
        </>
      )}
    </main>
  );
};