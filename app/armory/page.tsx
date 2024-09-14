'use client'

import styles from '../page.module.css';
import { useAppSelector } from '@/redux/hooks';
import WeaponList from '@/components/WeaponList';
import { useRequestAvailable, useUserWeapons } from '@/scripts/customHooks';
import { Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const isConnected = useAppSelector((state) => state.authReducer.isConnected);
  const userWeapons = useUserWeapons(false);
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
        <div>
          <WeaponList type={"classic"} weapons={userWeapons} />
        </div>
      }
    </main>
  );
};