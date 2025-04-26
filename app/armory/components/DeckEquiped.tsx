import { Ability } from "@/scripts/abilities";
import { useEquipedDeck } from "@/scripts/customHooks";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useMemo } from "react";

const DeckEquiped = () => {
  const equipedDeck = useEquipedDeck();
  const list = useMemo(() => {
    return equipedDeck.reduce((acc: { num: number, abilityData: Ability }[], curr) => {
      for (let i = 0; i < acc.length; i++) {
        if (acc[i].abilityData.id == curr.id) {
          acc[i].num += 1;
          return acc;
        }
      }
      acc.push({ num: 1, abilityData: curr });
      return acc;
    }, []);
  }, [equipedDeck]);

  return (
    <Box>
      <Flex flexDirection="row" alignItems="center" gap="2" flexWrap={"wrap"} justifyContent={"center"}>
        {list.length > 0 ? (
          list.map((elem, index) => (
            <Box
              key={index}
              borderWidth={1}
              borderRadius="md"
              padding={1}
              width="150px"
              textAlign="center"
            >
              <Text>{elem.num} {elem.abilityData.name}</Text>
            </Box>
          ))
        ) : (
          <Text fontSize='xl' mb={4}>
            You don't have any equiped deck.
          </Text>
        )}
      </Flex>
    </Box>
  );
}

export default DeckEquiped;