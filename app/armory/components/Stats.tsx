'use client';

import { Box, Flex, Text, Image, HStack, Spacer, Divider, VStack } from "@chakra-ui/react";
import { useEquipedWeapon } from "@/scripts/customHooks";


const Stats = () => {
  const equipedWeapon = useEquipedWeapon();

  if (!equipedWeapon) {
    return (
      <Flex
        width="100%"
        height="99%"
        justifyContent="space-around"
        alignItems="center"
        direction="column"
      >
        <Text fontSize='xl'>
          Equip a weapon to see your stats.
        </Text>
      </Flex>
    );
  }

  const stats = [
    { name: "Health", value: equipedWeapon.stats.health },
    { name: "Speed", value: equipedWeapon.stats.speed },
    { name: "Mind", value: equipedWeapon.stats.mind },
    { name: "Sharp damage", value: equipedWeapon.stats.sharpDmg },
    { name: "Blunt damage", value: equipedWeapon.stats.bluntDmg },
    { name: "Burn damage", value: equipedWeapon.stats.burnDmg },
    { name: "Sharp resistance", value: equipedWeapon.stats.sharpRes },
    { name: "Blunt resistance", value: equipedWeapon.stats.bluntRes },
    { name: "Burn resistance", value: equipedWeapon.stats.burnRes },
    { name: "Pierce", value: equipedWeapon.stats.pierce },
    { name: "Handling", value: equipedWeapon.stats.handling },
    { name: "Guard", value: equipedWeapon.stats.guard },
    { name: "Lethality", value: equipedWeapon.stats.lethality },
  ];

  const StatRow = ({ name, value }: { name: string, value: number | string }) => (
    <HStack width="100%" py={1}>
      <Text fontWeight="medium" color="gray.200">{name}:</Text>
      <Spacer />
      <Text fontWeight="bold">{value}</Text>
    </HStack>
  );

  return (
    <Flex
      width="100%"
      height="100%%"
      alignItems="center"
      direction="column"
    >
      <Text fontSize='xl' fontWeight="bold" mb={4} textAlign="center">
        Character Stats
      </Text>

      <Divider mb={4} />

      <VStack spacing={2} align="stretch">
        {stats.map((stat, index) => (
          <StatRow key={index} name={stat.name} value={stat.value} />
        ))}
      </VStack>
    </Flex>
  );
}

export default Stats;