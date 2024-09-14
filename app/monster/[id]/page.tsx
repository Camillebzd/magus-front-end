'use client'

import styles from '@/app/page.module.css'

import { useParams } from 'next/navigation'
import { Box, Image } from '@chakra-ui/react'
import DifficultyBadge from '@/components/DifficultyBadge';
import { useMonstersWorld } from '@/scripts/customHooks';
import FightButton from '@/components/FightButton';
import { useAppSelector } from '@/redux/hooks';

export default function Page() {
  const route = useParams();
  const isConnected = useAppSelector(state => state.authReducer.isConnected);
  const monster = useMonstersWorld(false).find(monster => monster.id === parseInt(route.id as string));

  if (monster === undefined)
    return (
      <main className={styles.main}>
        <p>Loading data... If it takes too much time it means the monster doesn&apos;t exist.</p>
      </main>
    );

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>{monster.name}</h1>
      <Box height="256px" width="256px">
        <Image
          src={`/img/monsters/${monster.image}`}
          alt={`image of a ${monster.name}`}
          borderRadius='lg'
        />
      </Box>
      <div>
        <DifficultyBadge difficulty={monster.difficulty} />
        <p>{monster.description}</p>
        <p>Health: {monster.stats.health}</p>
        <p>Speed: {monster.stats.speed}</p>
        <p>Sharp damage: {monster.stats.sharpDmg}</p>
        <p>Blunt damage: {monster.stats.bluntDmg}</p>
        <p>Burn damage: {monster.stats.burnDmg}</p>
        <p>Sharp resistance: {monster.stats.sharpRes}</p>
        <p>Blunt resistance: {monster.stats.bluntRes}</p>
        <p>Burn resistance: {monster.stats.burnRes}</p>
        <p>Pierce: {monster.stats.pierce}</p>
        <p>Mind: {monster.stats.mind}</p>
        <p>Guard: {monster.stats.guard}</p>
        <p>Handling: {monster.stats.handling}</p>
        {isConnected && <FightButton monsterId={monster.id}/>}
      </div>
    </main>
  );
}