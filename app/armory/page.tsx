'use client'

import styles from '../page.module.css';
import { useAppSelector } from '@/redux/hooks';
import WeaponList from '@/components/WeaponList';
import { useRequestAvailable, useUserWeapons } from '@/scripts/customHooks';
import { Box, Button, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import Equiped from './components/Equiped';

export default function Page() {
  const isConnected = useAppSelector((state) => state.authReducer.isConnected);
  const userWeapons = useUserWeapons(true);
  const requestAvailable = useRequestAvailable();
  const router = useRouter();

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Armory</h1>
      {requestAvailable > 0 && 
        <div style={{display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "1rem"}}>
          <p>You can request {requestAvailable} free weapon(s): </p> 
          <Button onClick={() => router.push('/starter')}>Create weapon</Button>
        </div>
      }
      {!isConnected ? 
        (<p>You have to connect your wallet to interact here.</p>)
        :
        <Box display={"flex"} flexDirection="row" alignItems="center" height="calc(100vh - 170px)">
          <Box width={"50%"} minHeight="100%" justifyItems={"center"}>
            <Text fontSize='xl' mb={4}>
              Equiped:
            </Text>
            <Equiped />
          </Box>
          <Box width={"50%"} minHeight="100%" overflowY="auto" justifyItems={"center"}>
            <Text fontSize='xl' mb={4}>
              Your weapons:
            </Text>
            <WeaponList type={"classic"} weapons={userWeapons} />
          </Box>
        </Box>
      }
    </main>
  );
};