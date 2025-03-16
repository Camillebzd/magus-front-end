'use client'

import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import WeaponCardHorizontal from "./WeaponCardHorizontal";
import { useRouter, usePathname } from "next/navigation";
import { useUserWeapons, useWeaponDeck } from "@/scripts/customHooks";
import { UserWeaponsContext } from "@/app/world/context";
import { Weapon } from "@/scripts/entities";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { socketActions } from "@/redux/features/socketSlice";
import { DEFAULT_ROOM_ID } from "@/sockets/@types/Room";
import { RawDataAbilities } from "@/scripts/abilities";
import { DECK_MAX_SIZE } from "@/scripts/systemValues";
import UniqueIdGenerator from "@/scripts/UniqueIdGenerator";

const WeaponSelectionModal = ({isOpen, onClose, monsterId}: {isOpen: boolean, onClose: () => void, monsterId: number}) => {
  const path = usePathname();
  const userWeaponsInContext = useContext(UserWeaponsContext);
  const userWeaponsInRedux = useUserWeapons(false);
  const dispatch = useAppDispatch();
  const room = useAppSelector((state) => state.socketReducer.room);
  const member = useAppSelector((state) => state.socketReducer.member);
  const [isCreatingFight, setIsCreatingFight] = useState(false);
  let userWeapons: Weapon[] = [];
  if (path.includes("world")) { // world page contains context
    userWeapons = userWeaponsInContext;
  } else {
    userWeapons = userWeaponsInRedux;
  }
  // check if memberUID selected a weapon and a deck
  const isMemberReady = (memberUID: string): boolean => (memberUID in room.weapons && memberUID in room.decks);
  // Check if all members in the room are ready
  const isEveryoneReady = (): boolean => (room.members.filter((member) => isMemberReady(member.uid)).length === room.members.length);
  const [weaponSelectedID, setWeaponSelectedID] = useState(-1);
  const deck = useWeaponDeck(weaponSelectedID);

  useEffect(() => {
    setWeaponSelectedID(-1);
  }, [isOpen]);

  // Create the room if not already created
  const goFight = () => {
    if (weaponSelectedID < 0)
      return;
    setIsCreatingFight(true);
    // check if the room is already created
    if (room.id === DEFAULT_ROOM_ID)
      dispatch(socketActions.createNewRoom({ password: "" }));
  };

  // When the room is created, add the monster and the weapon to the room
  useEffect(() => {
    if (room.id === DEFAULT_ROOM_ID || !isCreatingFight) return;
    if (weaponSelectedID >= 0 && deck.length === DECK_MAX_SIZE) {
      // push the monster to the room
      dispatch(socketActions.addMonsters([monsterId]));
      // push the weapon and deck to the room
      let rawDataDeck: RawDataAbilities = {};
      if (deck.length === DECK_MAX_SIZE) {
        deck.forEach((elem) => {
          if (!rawDataDeck[elem.id]) {
            rawDataDeck[elem.id] = [];
          }
          rawDataDeck[elem.id].push(UniqueIdGenerator.getInstance().generateSnowflakeId(200));
        });
        dispatch(socketActions.selectWeaponAndDeck({ weaponId: weaponSelectedID.toString(), deck: rawDataDeck }));
      } else {
        console.error("Error: deck is not full");
        return;
      }
    }
  }, [room.id, isCreatingFight]);

  // Launch the fight when everything is ready
  useEffect(() => {
    if (member.uid in room.weapons && member.uid in room.decks && isEveryoneReady() && room.monsters.length > 0 && isCreatingFight) {
      dispatch(socketActions.startFigh());
    }
  }, [room.weapons, room.decks, room.monsters, isCreatingFight]);

  const addMonsterToRoom = () => {
    dispatch(socketActions.addMonsters([monsterId]));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Choose a weapon</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {userWeapons.map(weapon => {
            return <WeaponCardHorizontal key={weapon.id} onClick={() => setWeaponSelectedID(weapon.id)} weapon={weapon} isSelected={weaponSelectedID === weapon.id}/>
          })}
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Close
          </Button>
          {room.id !== DEFAULT_ROOM_ID && <Button mr={3} colorScheme='green' onClick={addMonsterToRoom}>ADD</Button>}
          <Button colorScheme='blue' onClick={goFight} isLoading={isCreatingFight}>Fight</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
  
  export default WeaponSelectionModal;