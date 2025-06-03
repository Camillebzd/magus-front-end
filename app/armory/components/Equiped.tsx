import WeaponCard from "@/components/WeaponCard";
import DeckEquiped from "./DeckEquiped";
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { useEquipedWeapon } from "@/scripts/customHooks";
import EquipmentSlot, { EquipmentSlotPosition } from "./EquipmentSlot";
import MultipleImages from "@/components/MultipleImages";

const Equiped = () => {
  const equipedWeapon = useEquipedWeapon();

  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent="space-around"
      alignItems="center"
      direction="column"
    >
      <Flex direction="column" alignItems="center">
        {/* Top slot */}
        {/* <Box >
          <EquipmentSlot item={undefined} slotPosition={EquipmentSlotPosition.HEAD} />
        </Box> */}

        {/* Main central area with character and side slots */}
        <Flex width="100%" justifyContent="center" alignItems="center">
          {/* Left side slots */}
          <Flex direction="column" gap={4} mr={4}>
            <EquipmentSlot item={undefined} slotPosition={EquipmentSlotPosition.HEAD} />
            <EquipmentSlot item={undefined} slotPosition={EquipmentSlotPosition.BACK} />
            <EquipmentSlot item={undefined} slotPosition={EquipmentSlotPosition.HANDS} />
          </Flex>

          {/* Central character image */}
          <Box
            width="200px"
            height="200px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <MultipleImages
              images={[
                "/img/defaultSlots/slot_background.png",
                equipedWeapon?.image ?? "",
                "/img/characters/basic_mage.png"
              ]}
              width="200px"
              height="200px"
              imageHeight={['200px', '160px']}
              imageWidth={['200px', '160px']}
            />
          </Box>

          {/* Right side slots */}
          <Flex direction="column" gap={4} ml={4}>
            <EquipmentSlot item={undefined} slotPosition={EquipmentSlotPosition.CHEST} />
            <EquipmentSlot item={undefined} slotPosition={EquipmentSlotPosition.LEGS} />
            <EquipmentSlot item={undefined} slotPosition={EquipmentSlotPosition.FEETS} />
          </Flex>
        </Flex>

        {/* Bottom slot */}
        <Box>
          <EquipmentSlot item={equipedWeapon} slotPosition={EquipmentSlotPosition.WEAPON} />
        </Box>
      </Flex>

      {/* Deck info can be placed somewhere else or incorporated into the layout */}
      <Box >
        <DeckEquiped />
      </Box>
    </Flex>
  );
}

export default Equiped;