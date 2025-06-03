import { Weapon } from "@/scripts/entities";
import WeaponCard from "./WeaponCard";

import { WeaponGeneralType } from "@/scripts/WeaponGeneralType";
import { Box, SimpleGrid } from "@chakra-ui/react";

const WeaponList = ({ weapons, type }: { weapons: Weapon[], type: WeaponGeneralType }) => {
  const weaponList = weapons.map(weapon =>
    <WeaponCard weapon={weapon} key={weapon.id} type={type} />
  );

  return (
    <Box
      height="100%"
      width="100%"
      overflow="hidden"
    >
      <SimpleGrid
        spacing={4}
        overflowY="auto"
        height="100%"
        width="100%"
        p={4}
        minChildWidth="200px"
        justifyItems="center"
        justifyContent="center"
      >
        {weaponList}
      </SimpleGrid>
    </Box>
  );
}

export default WeaponList;