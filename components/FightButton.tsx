import { Button, useDisclosure } from "@chakra-ui/react";
import WeaponSelectionModal from "./WeaponSelectionModal";

const FightButton = ({monsterId}: {monsterId: number}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen}>Fight</Button>
      <WeaponSelectionModal isOpen={isOpen} onClose={onClose} monsterId={monsterId}/>
    </>
  );
}

export default FightButton;