'use client'

import styles from '../page.module.css';
import { useAppSelector } from '@/redux/hooks';
import WeaponList from '@/components/WeaponList';
import { useUserWeapons } from '@/scripts/customHooks';
import { Box, Flex, Text } from '@chakra-ui/react';
import Equiped from './components/Equiped';
import Stats from './components/Stats';

export default function Page() {
  const isConnected = useAppSelector((state) => state.authReducer.isConnected);
  const userWeapons = useUserWeapons(true);

  return (
    <main className={styles.main}>
      {!isConnected ? 
        (<Text>Please connect your wallet to interact here.</Text>)
        :
        <Flex direction="row" alignContent="center" maxH="75vh" justifyContent={"stretch"} gap={4} p={4}>
          <Box width={"50%"} justifyItems={"center"} borderColor={"profoundgrey.200"} borderWidth={2} borderRadius={8}>
            <Stats />
          </Box>
          <Box width={"50%"} justifyItems={"center"} borderColor={"profoundgrey.200"} borderWidth={2} borderRadius={8}>
            <Equiped />
          </Box>
          <Box width={"50%"} justifyItems={"center"} borderColor={"profoundgrey.200"} borderWidth={2} borderRadius={8}>
            <WeaponList type={"classic"} weapons={userWeapons} />
          </Box>
        </Flex>
      }
    </main>
  );
};