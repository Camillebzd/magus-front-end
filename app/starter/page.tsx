'use client'

import styles from '../page.module.css';
import { useAppSelector } from '@/redux/hooks';
import WeaponList from '@/components/WeaponList';
import { useRequestAvailable, useStarter } from '@/scripts/customHooks';

export default function Page() {
  const isConnected = useAppSelector((state) => state.authReducer.isConnected);
  const requestAvailable = useRequestAvailable();
  const weaponsStarter = useStarter();

  const errorPage = () => {
    let errorSentence: string = "";
    if (!isConnected)
      errorSentence = "You should be connected to see the starters."
    else if (requestAvailable < 1)
      errorSentence = "You should have at least one request available to see the starters."
    else if (weaponsStarter.length < 1)
      errorSentence = "Loading starters..."
    return (
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Armory</h1>
        {errorSentence}
      </main>
    );
  };

  if (!isConnected || requestAvailable < 1 || weaponsStarter.length < 1)
    return errorPage();

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Armory</h1>
      <WeaponList type={"starter"} weapons={weaponsStarter} />
    </main>
  );
};