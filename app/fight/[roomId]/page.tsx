'use client'

import { MutableRefObject, useEffect, useRef, useState } from 'react';
import styles from '@/app/page.module.css';

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import Entity from '@/components/Entity';
import Chat from '@/components/Chat';
import AbilityCard from '@/components/AbilityCard';
import { Ability, fromRawAbilityToAbility } from '@/scripts/abilities';
import { Monster, Weapon } from '@/scripts/entities';
import { Action, END_OF_TURN } from '@/scripts/actions';
import { resolveActions } from '@/scripts/fight';
import { Text, useDisclosure } from '@chakra-ui/react';
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

enum GAME_PHASES {
  WAIT_BEFORE_START,
  PLAYER_CHOOSE_ABILITY,
  PLAYER_CHOOSE_ABILITY_COMBO,
  RESOLUTION,
}

export default function Page({params}: {params: {roomId: string}}) {
  const [socket, setSocket] = useState<Socket | null>(null);

  const pathname = usePathname();
  const room = useAppSelector((state) => state.socketReducer.room);
  const userId = useAppSelector((state) => state.authReducer.address);
  const isInTheRoom = pathname.split('/')[2] === room.id;
  const allWeapons = useAllWeapons(false);
  const allMonsters = useMonstersWorld(false);
  const [hand, setHand] = useState<Ability[]>([]);
  const [deck, setDeck] = useState<Ability[]>([]);
  const [discard, setDiscard] = useState<Ability[]>([]);
  const [weapon, setWeapon] = useState<Weapon | undefined>(undefined);
  const [monster, setMonster] = useState<Monster | undefined>(undefined);
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
  const addActions = (newActions: Action[]) => {
    setActions(currentActions => {
      return [
        ...newActions.reduce((acc, newAction) => {
          // Remove any existing action from the same caster
          const filtered = acc.filter(existing => existing.caster.uid !== newAction.caster.uid);
          // Add the new action
          return [...filtered, newAction];
        }, currentActions)
      ];
    });
  };

  // Socket init
  useEffect(() => {
    if (!weapon || socket != null || !monster)
      return;
    const socketInstance = SocketFactory.create().socket; // socket should be created already, otherwise things will explode here
    setSocket(socketInstance);

    // Listen to events related to hand, deck and discard
    socketInstance.on('setDeck', (cards: {[key: number]: number}) => {
      console.log('setDeck', cards);
      const deckToSet: Ability[] = fromRawAbilityToAbility(cards, weapon!.abilities);
      setDeck(deckToSet);
    });
    socketInstance.on('setHand', (cards: {[key: number]: number}) => {
      console.log('setHand', cards);
      const handToSet: Ability[] = fromRawAbilityToAbility(cards, weapon!.abilities);
      setHand(handToSet);
    });

    socketInstance.on('drawCards', (cards: {[key: number]: number}) => {
      console.log('drawCards', cards);
      const cardToDraw: Ability[] = fromRawAbilityToAbility(cards, weapon!.abilities);
      setHand((currentHand) => [...currentHand, ...cardToDraw]);
      setDeck((currentDeck) => currentDeck.filter(ability => !cardToDraw.includes(ability)));
    });
    socketInstance.on('discardCards', (cards: {[key: number]: number}) => {
      console.log('discardCards', cards);
      const cardToDiscard: Ability[] = fromRawAbilityToAbility(cards, weapon!.abilities);
      setDiscard((currentDiscard) => [...currentDiscard, ...cardToDiscard]);
      setHand((currentHand) => currentHand.filter(ability => !cardToDiscard.includes(ability)));
    });
    socketInstance.on('startFight', () => {
      setPhase(GAME_PHASES.PLAYER_CHOOSE_ABILITY);
    });
    // tmp create map for weapon and monster as only one supported
    socketInstance.on('monstersActions', (monstersRawDataAction: RawDataAction[]) => {
      const weaponMap = new Map<string, Weapon>();
      weaponMap.set(weapon.uid, weapon);
      const monsterMap = new Map<string, Monster>();
      monsterMap.set(monster.uid, monster);
      console.log('weaponMap', weaponMap);
      console.log('monsterMap', monsterMap);  
      console.log('monstersActions', monstersRawDataAction);
      const monstersActions: Action[] = monstersRawDataAction
      .map(rawDataAction => {
        return actionManager.current.createActionFromRawData(rawDataAction, weaponMap, monsterMap);
      })
      .filter((action): action is Action => action !== null);
      if (monstersActions.length > 0) {
        // addActions(monstersActions);
      }
    });

    // Trigger the init Hand and deck
    socketInstance.emit('initHandAndDeck');

    // socketInstance.on('fightFinished', () => {
    //   console.log('Fight finished');
    // });

    // Cleanup on unmount
    return () => {
      // socketInstance.off('fightFinished');
      socketInstance.off('setDeck');
      socketInstance.off('setHand');
      socketInstance.off('drawCards');
      socketInstance.off('discardCards');
      socketInstance.off('startFight');
      socketInstance.off('monstersActions');
    };
  }, [weapon, monster]);

  // update from the room
  useEffect(() => {
    // console.log("here is the new update of the room:", room);
  }, [room]);


  // Set the Weapon at begining (only user itself supported for the moment)
  // is the deck part needed on the weapon client side?
  useEffect(() => {
    if (!allWeapons)
      return;
    const weaponData = allWeapons.find(weapon => weapon.id === parseInt(room.weapons[userId]))?.clone();
    if (!weapon && weaponData) {
      // weaponData.setLogger(setInfo);
      const userDeck = room.decks[userId];
      const deckToAttach: Ability[] = []
      weaponData.abilities.forEach(ability => {
        for (let i = 0; i < userDeck[ability.id]; i++)
          deckToAttach.push(ability);
      });
      weaponData.fillDeck(deckToAttach);
      weaponData.uid = userId;
      setWeapon(weaponData);
    }
  }, [allWeapons, weapon]);

  // Set monster at begining (only one supported for the moment)
  useEffect(() => {
    if (!allMonsters || allMonsters.length === 0)
      return;
    let monsterData = allMonsters.find(monster => monster.id === room.monsters[0]?.id)?.clone();
    if (!monsterData) {
      console.error("Monster not found");
      return;
    }
    monsterData.uid = room.monsters[0]?.uid;
    setMonster(monsterData);
  }, [allMonsters]);

  const launchAbility = (ability: Ability, fluxesUsed: number = 0) => {
    // if (phase !== GAME_PHASES.PLAYER_CHOOSE_ABILITY && !weapon?.isEntityAbleToPlay())
    //   return;
    // actions.current.push(new Action({ caster: weapon!, ability: ability, target: monster!, hasBeenDone: false, isCombo: isPlayerCombo.current, fluxesUsed: fluxesUsed, info: setInfo, currentTurn: turn }));
    // weapon?.discardFromHand(ability);
    // console.log(actions);
    // resolve
    // resolveLoop();


  };

  const execAbilityModal = (fluxeSelected: number) => {
    if (abilitySelected.current) {
      weapon?.useFluxes(fluxeSelected);
      launchAbility(abilitySelected.current, fluxeSelected);
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
      launchAbility(abilityClicked, 0);
  };

  const phasePrinter = () => {
    switch (phase) {
      case GAME_PHASES.WAIT_BEFORE_START:
        return "Waiting for all the players to be ready";
      case GAME_PHASES.PLAYER_CHOOSE_ABILITY:
        return "Choose an ability";
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
                {/* {actions.length > 0 ? 
                  actions?.map(action => (
                    <div key={action.uid}>
                      <p>{action?.caster.name}: {action?.ability.name} {"->"} {action?.target.name}</p>
                    </div>
                  ))
                  : <p>No actions</p>
                } */}
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
                <p>deck: {deck.length}</p>
                <p>discard: {discard.length}</p>
              </div>
              <div className={styles.abilitiesCointainer}>
                {/* {weapon?.abilities.map(ability => <AbilityCard key={ability.id} onClick={() => onAbilityClick(ability)} ability={ability}/>)} */}
                {hand.map((ability, index) => <AbilityCard key={index} onClick={() => onAbilityClick(ability)} ability={ability} />)}
              </div>
            </div>
          </div>
          {monster && weapon && <EndOfFightModal isOpen={endOfFightModal.isOpen} onClose={endOfFightModal.onClose} weaponId={weapon!.id} difficulty={monster!.difficulty} isWinner={won.current} />}
          {monster && weapon && <SelectFluxesModal isOpen={fluxeModal.isOpen} onClose={fluxeModal.onClose} launchAbility={execAbilityModal} fluxesAvailables={weapon.fluxes} />}
        </>
      )}
    </main>
  );
};