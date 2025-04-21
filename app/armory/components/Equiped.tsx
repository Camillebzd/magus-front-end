import WeaponCard from "@/components/WeaponCard";
import DeckEquiped from "./DeckEquiped";
import { Box, Text } from "@chakra-ui/react";
import { useEquipedWeapon } from "@/scripts/customHooks";

const Equiped = () => {
  const equipedWeapon = useEquipedWeapon();

  return (
    <Box>
      {equipedWeapon ?
        <>
          <WeaponCard weapon={equipedWeapon} type="equiped" />
          <DeckEquiped />
        </>
        :
        <Text fontSize='xl' mb={4}>
          You don't have any equiped weapon.
        </Text>
      }
    </Box>
  );
}

export default Equiped;