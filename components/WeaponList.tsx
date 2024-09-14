import { Weapon } from "@/scripts/entities";
import WeaponCard from "./WeaponCard";

import styles from './List.module.css'
import { WeaponGeneralType } from "@/scripts/WeaponGeneralType";

const WeaponList = ({weapons, type}: {weapons: Weapon[], type: WeaponGeneralType}) => {
  const weaponList = weapons.map(weapon =>
    <WeaponCard weapon={weapon} key={weapon.id} type={type}/>
  );

  return (
    <div className={styles.weaponList}>
      {weaponList}
    </div>
  );
}

export default WeaponList;