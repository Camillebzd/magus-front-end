import WeaponCard from "@/components/WeaponCard";
import DeckEquiped from "./DeckEquiped";
import { Flex, Text } from "@chakra-ui/react";
import { useEquipedWeapon } from "@/scripts/customHooks";

const Equiped = () => {
  const equipedWeapon = useEquipedWeapon();

  return (
    <Flex alignItems="center" flexDirection={"column"} gap={4}>
      {equipedWeapon ?
        <>
          <WeaponCard weapon={equipedWeapon} type="equiped" />
          <DeckEquiped />
        </>
        :
        <Text fontSize='xl' mb={4}>
          You do not have any equiped weapon.
        </Text>
      }
    </Flex>
  );
}

export default Equiped;