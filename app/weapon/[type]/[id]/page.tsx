'use client'

import styles from '@/app/page.module.css'

import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useParams } from 'next/navigation'
import { Box, Button, ButtonGroup, Image } from '@chakra-ui/react'
import { refreshOwnedTokenMetadata } from '@/redux/features/weaponSlice';
import { createContract, getWeaponStatsForLevelUp, multiplyStatsForLevelUp } from '@/scripts/utils';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { useStarter, useUserWeapons } from '@/scripts/customHooks';
import { Weapon } from '@/scripts/entities';

import RetrieveXpButton from '@/components/RetriveXpButton';
import CreateDeckButton from '@/components/CreateDeckButton';

export default function Page() {
  const route = useParams();
  let weapon: Weapon | undefined = undefined;
  const userWeapons = useUserWeapons(false);
  const starters = useStarter();
  if (route.type === "classic")
    weapon = userWeapons.find(weapon => weapon.id === parseInt(route.id as string));
  else if (route.type === "starter")
    weapon = starters.find(weapon => weapon.id === parseInt(route.id as string));
  const address = useAppSelector((state) => state.authReducer.address);
  const dispatch = useAppDispatch();

  const manualRefresh = async () => {
    if (weapon)
      dispatch(refreshOwnedTokenMetadata(weapon.id.toString()));
  };

  if (weapon === undefined)
    return (
      <main className={styles.main}>
        <p>Loading data...</p>
        <p>If it takes too much time it means:</p>
        <ol type="1" >
          <li>This is not your weapon / you&apos;re not connected</li>
          <li>The weapon doesn&apos;t exist</li>
          <li>An internal problem happened</li>
        </ol>
      </main>
    );

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>{weapon.name}</h1>
      <Box height="256px" width="256px">
        <Image
          src={weapon.image}
          alt={`image of ${weapon.name}`}
          borderRadius='lg'
        />
      </Box>
      <div>
        <p>{weapon.description}</p>
        <p>Health: {weapon.stats.health}</p>
        <p>Speed: {weapon.stats.speed}</p>
        <p>Sharp damage: {weapon.stats.sharpDmg}</p>
        <p>Blunt damage: {weapon.stats.bluntDmg}</p>
        <p>Burn damage: {weapon.stats.burnDmg}</p>
        <p>Sharp resistance: {weapon.stats.sharpRes}</p>
        <p>Blunt resistance: {weapon.stats.bluntRes}</p>
        <p>Burn resistance: {weapon.stats.burnRes}</p>
        <p>Mind: {weapon.stats.mind}</p>
        <p>Guard: {weapon.stats.guard}</p>
        <p>Handling: {weapon.stats.handling}</p>
        <p>Pierce: {weapon.stats.pierce}</p>
        <p>XP: {weapon.xp}</p>
        <p>Level: {weapon.level}</p>
        <p>Stage: {weapon.stage}</p>
        <p>Identity: {weapon.identity}</p>
      </div>
      {route.type === "classic" &&
        <ButtonGroup>
          {(weapon && address) && <RetrieveXpButton weapon={weapon} address={address}/> }
          <Button onClick={manualRefresh}>
            Refresh Metadata
          </Button>
          <CreateDeckButton weaponId={weapon.id} />
        </ButtonGroup>
      }
    </main>
  );
}