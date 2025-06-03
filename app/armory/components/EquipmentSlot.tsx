import MultipleImages from "@/components/MultipleImages";
import { socketActions } from "@/redux/features/socketSlice";
import { useAppDispatch } from "@/redux/hooks";
import { Weapon } from "@/scripts/entities";
import { Box, CloseButton } from "@chakra-ui/react";
import { useState } from "react";

export enum EquipmentSlotPosition {
  HEAD = "HEAD",
  BACK = "BACK",
  HANDS = "HANDS",
  CHEST = "CHEST",
  LEGS = "LEGS",
  FEETS = "FEETS",
  WEAPON = "WEAPON",
  // no accessory slot for now
}

const DEFAULT_EQUIPMENT_SLOT_IMAGES: Record<EquipmentSlotPosition, string> = {
  [EquipmentSlotPosition.HEAD]: "/img/defaultSlots/slot_helmet.png",
  [EquipmentSlotPosition.BACK]: "/img/defaultSlots/slot_back.png",
  [EquipmentSlotPosition.HANDS]: "/img/defaultSlots/slot_hands.png",
  [EquipmentSlotPosition.CHEST]: "/img/defaultSlots/slot_chest.png",
  [EquipmentSlotPosition.LEGS]: "/img/defaultSlots/slot_legs.png",
  [EquipmentSlotPosition.FEETS]: "/img/defaultSlots/slot_feets.png",
  [EquipmentSlotPosition.WEAPON]: "/img/defaultSlots/slot_weapon.png"
};

const EquipmentSlot = ({
  item,
  slotPosition
}: {
  item: Weapon | undefined,
  slotPosition: EquipmentSlotPosition
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useAppDispatch();

  const removeItem = () => {
    if (!item) return;
    console.log("unequip", item.id.toString());
    // call unequip on server, for the moment only for weapon
    dispatch(socketActions.unequipWeaponAndDeck());
  };

  return (
    <Box
      width="75px"
      height="75px"
      onMouseEnter={() => { setIsHovered(true); console.log("hovered") }}
      onMouseLeave={() => setIsHovered(false)}
      position="relative"
    >
      {isHovered && item != undefined && (
        <CloseButton
          zIndex={10}
          borderRadius={"full"}
          position="absolute"
          top="-0.60rem"
          right="-0.60rem"
          size="sm"
          bg={"red.400"}
          _hover={{ bg: "red.500" }}
          onClick={removeItem}
        />
      )}
      <MultipleImages
        images={item ? ["/img/defaultSlots/slot_background.png", item.image] : [DEFAULT_EQUIPMENT_SLOT_IMAGES[slotPosition]]}
        width="75px"
        height="75px"
        imageHeight={['75px', '60px']}
        imageWidth={['75px', '60px']}
      />
    </Box>
  );
};

export default EquipmentSlot;