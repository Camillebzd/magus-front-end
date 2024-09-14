import { Monster } from "@/scripts/entities";
import MonsterCard from "./MonsterCard";

import styles from './List.module.css'

const MonsterList = ({monsters}: {monsters: Monster[]}) => {
  const monsterList = monsters.map(monster =>
    <MonsterCard monster={monster} key={monster.id} />
  );

  return (
    <div className={styles.monsterList}>
      {monsterList}
    </div>
  );
}

export default MonsterList;