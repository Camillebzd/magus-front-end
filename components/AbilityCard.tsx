'use client'

import styles from './Card.module.css'

import { Ability } from "@/scripts/abilities";

const AbilityCard = ({ability, onClick}: {ability: Ability, onClick: () => void}) => {

  return (
    <div className={styles.abilityCardContainer} onClick={onClick}>
      <p>{ability.name}</p>
      <div>DMG { ability.damage } | INI { ability.initiative }</div>
      {ability.isMagical && <div className={styles.fluxeCircleFull}></div>}
    </div>
  );
}

export default AbilityCard;