import { useWeaponDeck } from "@/scripts/customHooks";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { useRouter } from 'next/navigation';

const CreateDeckButton = ({weaponId}: {weaponId: number}) => {
  const deck = useWeaponDeck(weaponId);
  const router = useRouter();

  return (
    <Button onClick={() => router.push(`/deckBuilding/${weaponId}`)}>Deck: {deck && deck.length > 0 ? <CheckIcon/> : <CloseIcon /> }</Button>
  );
}

export default CreateDeckButton;