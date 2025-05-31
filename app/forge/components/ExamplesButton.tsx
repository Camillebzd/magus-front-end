'use client';

import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure
} from "@chakra-ui/react";
import { Notify } from "notiflix";
import { RefObject, useState } from "react";
import { DottingRef, PixelModifyItem, useDotting } from "dotting";
import { pngToDottingData } from "../dottingUtils";

const ExampleList: { name: string, image: string }[] = [
  {
    name: "Basic Fire Staff",
    image: "/img/weapons/examples/basic_fire_staff.png"
  },
  {
    name: "Flying Swords",
    image: "/img/weapons/examples/flying_swords.png"
  }

]

const ExamplesButton = ({
  dottingRef
}: {
  dottingRef: RefObject<DottingRef>
}) => {
  const { setData } = useDotting(dottingRef);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [weaponSelected, setWeaponSelected] = useState<string>("");

  const selectWeapon = async () => {
    if (weaponSelected.length === 0) {
      Notify.failure("Please select a weapon example.");
      return;
    }
    const selectedExample = ExampleList.find(example => example.name === weaponSelected);
    if (selectedExample) {
      const data = await pngToDottingData(selectedExample.image, 36, 36);
      console.log(data);
      // Convert Map<Map<{color}>> to PixelModifyItem[][]
      const arrayData: PixelModifyItem[][] = Array.from(data.values()).map(rowMap =>
        Array.from(rowMap.entries()).map(([columnIndex, value]) => ({
          rowIndex: (rowMap as any).rowIndex ?? 0, // fallback if rowIndex is not present
          columnIndex,
          color: value.color,
        }))
      );
      setData(arrayData);
      customOnClose();
    } else {
      Notify.failure("Weapon example not found.");
    }
  };

  const customOnClose = () => {
    setWeaponSelected("");
    onClose();
  };

  return (
    <Flex justifyContent="center" gap={4} height={"100%"} m={4}>
      <Button width={"auto"} onClick={onOpen} colorScheme="blue">
        Examples
      </Button>
      <Modal isOpen={isOpen} onClose={customOnClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Weapon Examples</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              {ExampleList.map((example) => (
                <GridItem key={example.name}>
                  <Box
                    borderWidth={weaponSelected === example.name ? "2px" : "1px"}
                    borderColor={weaponSelected === example.name ? "blue.400" : "gray.200"}
                    borderRadius="md"
                    p={2}
                    cursor="pointer"
                    textAlign="center"
                    onClick={() => setWeaponSelected(example.name)}
                    transition="border-color 0.2s"
                  >
                    <Image
                      src={example.image}
                      alt={example.name}
                      boxSize="80px"
                      objectFit="contain"
                      mx="auto"
                      mb={2}
                    />
                    <Text fontWeight={weaponSelected === example.name ? "bold" : "normal"}>
                      {example.name}
                    </Text>
                  </Box>
                </GridItem>
              ))}
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' onClick={selectWeapon}>
              Select Weapon
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default ExamplesButton;