'use client'

import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import WeaponCardHorizontal from "./WeaponCardHorizontal";
import { useRouter, usePathname } from "next/navigation";
import { useUserWeapons } from "@/scripts/customHooks";
import { UserWeaponsContext } from "@/app/world/context";
import { Weapon } from "@/scripts/entities";

const WeaponSelectionModal = ({isOpen, onClose, monsterId}: {isOpen: boolean, onClose: () => void, monsterId: number}) => {
  const router = useRouter();
  const path = usePathname();
  const userWeaponsInContext = useContext(UserWeaponsContext);
  const userWeaponsInRedux = useUserWeapons(false);
  let userWeapons: Weapon[] = [];
  if (path.includes("world")) { // world page contains context
    userWeapons = userWeaponsInContext;
  } else {
    userWeapons = userWeaponsInRedux;
  }

  const [weaponSelectedID, setWeaponSelectedID] = useState(-1);

  useEffect(() => {
    setWeaponSelectedID(-1);
  }, [isOpen]);

  const goFight = () => {
    if (weaponSelectedID < 0)
      return;
    router.push(`/fight?weaponid=${weaponSelectedID}&monsterid=${monsterId}`);
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
          <Button colorScheme='blue' onClick={goFight}>Fight</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
  
  export default WeaponSelectionModal;