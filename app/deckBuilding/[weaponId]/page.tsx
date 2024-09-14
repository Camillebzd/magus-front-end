'use client'

import styles from '../../page.module.css';
import { useAppSelector } from '@/redux/hooks';
import { deckBuildingInitialState, deckBuildingReducer, useDeckDataStorage, useUserWeapons, useWeaponDeck } from '@/scripts/customHooks';
import { Button, ButtonGroup } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useImmerReducer } from 'use-immer';
import { MouseEvent } from 'react';
import { AbilityData } from '@/scripts/abilities';
import { DECK_MAX_SIZE } from '@/scripts/systemValues';
import { Notify } from 'notiflix';

type decklistElem = {
  num: number, 
  abilityData: AbilityData
}

export default function Page({params}: {params: {weaponId: string}}) {
  const isConnected = useAppSelector((state) => state.authReducer.isConnected);
  const userWeapon = useUserWeapons(false).find(weapon => weapon.id == parseInt(params.weaponId));
  const [deck, dispatchDeck] = useImmerReducer(deckBuildingReducer, deckBuildingInitialState);
  const [deckData, setDeckData] = useDeckDataStorage(parseInt(params.weaponId));
  const list: decklistElem[] = deck.reduce((acc: decklistElem[], curr) => {
    for (let i = 0; i < acc.length; i++) {
      if (acc[i].abilityData.id == curr.id) {
          acc[i].num += 1;
          return acc;
      }
    }
    acc.push({num: 1, abilityData: curr});
    return acc;
  }, []);

  // #region Error management
  if (!isConnected || !userWeapon)
    return (
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Deck building</h1>
        <h2>You&apos;re not connected or you don&apos;t have this weapon.</h2>
      </main>
      
    );
  // #endregion

  const handleClick = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>, abilityData: AbilityData) => {
    if (e.type === 'click' && deck.length < DECK_MAX_SIZE) {
      dispatchDeck({type: "add", abilityData: abilityData});
    } else if (e.type === 'contextmenu') {
      e.preventDefault();
      dispatchDeck({type: "remove", abilityData: abilityData});
    }
  };

  const saveDeck = () => {
    if (deck.length !== DECK_MAX_SIZE)
      return;
    setDeckData(deck);
    Notify.success('Deck saved.');
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Deck building</h1>
      <h2 className={styles.pageSubtitle}>{userWeapon.name}</h2>
      <p>Ability list: </p>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        {/* <ButtonGroup> */}
        <div style={{display: "flex", flexWrap: 'wrap', gap: "12px"}}>
          {userWeapon.abilities.map(ability => {
            return <Button key={ability.id} onClick={(e) => handleClick(e, ability.extractData())} onContextMenu={(e) => handleClick(e, ability.extractData())}>{ability.name}</Button>;
          })}
        </div>
        {/* </ButtonGroup> */}
        <p style={{marginTop: "12px"}}>Actual List: {deck.length}/{DECK_MAX_SIZE}</p>
        <ButtonGroup>
          {list.map((elem, i) => {
            return <Button key={i} onClick={(e) => handleClick(e, elem.abilityData)} onContextMenu={(e) => handleClick(e, elem.abilityData)}>{elem.num} {elem.abilityData.name}</Button>;
          })}
        </ButtonGroup>
        <Button onClick={saveDeck} style={{marginTop: '1rem', width: 'fit-content'}} colorScheme={deck.length == DECK_MAX_SIZE ? 'green' : 'red'}>Save deck</Button>
      </div>
    </main>
  );
};