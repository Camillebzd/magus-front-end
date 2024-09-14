import { Button } from '@chakra-ui/react'
import { createContract, fetchFromDB, getAllAbilitiesIdForWeapon, getWeaponStatsForLevelUp, multiplyStatsForLevelUp } from '@/scripts/utils';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Weapon } from '@/scripts/entities';

import { useAbilities, useXpStorage } from '@/scripts/customHooks';

const RetrieveXpButton = ({weapon, address}: {weapon: Weapon, address: string}) => {
  const [xp, setXp] = useXpStorage(weapon.id);
  const abilities = useAbilities();

  const retrieveXp = async () => {
    if (address.length < 0 || !weapon || weapon.level >= 12 || xp < 1)
      return;
    const contract = await createContract(address);
    const nextLevel: string = (weapon.level + 1).toString();
    let totalXp = weapon.xp + xp;
    let xpAmountRequired: {[key: string]: number} = {};
    xpAmountRequired = (await fetchFromDB("general/levels"))[0];
    if (xpAmountRequired === undefined) {
      Notify.failure('An error happened during the gain xp process...');
      return;
    }
    if (xpAmountRequired[nextLevel] > totalXp) {
      try {
        await contract.gainXP(weapon.id, xp);
        // console.log(`gain xp on weapon id: ${weapon.id}, xp amout to add: ${xp}`);
        Notify.success('Your weapon gained xp, wait a minute and click on refresh to see it!');
        setXp(0);
      } catch(e) {
        console.log("error: ", e);
        Notify.failure('An error happened during the gain xp process...');
      }
    } else {
      let levelToSet = 1;
      let xpRequired = 0;
      let rest = totalXp;
      for (levelToSet = weapon.level + 1; levelToSet <= 12; levelToSet++) {
        xpRequired += xpAmountRequired[levelToSet.toString()];
        if (xpRequired > totalXp)
          break;
        else
          rest -= xpAmountRequired[levelToSet.toString()];
      }
      levelToSet -= 1;
      try {
        let weaponStats = await getWeaponStatsForLevelUp(weapon.identity);
        // console.log("avant coef", weaponStats);
        multiplyStatsForLevelUp(weaponStats, levelToSet - weapon.level);
        // console.log("apres coef", weaponStats);
        // abilities
        let alreadyKnownAbilities = weapon.abilities.map(ability => ability.id);
        let allAbilities = await getAllAbilitiesIdForWeapon(weapon.identity, levelToSet);
        let abilitiesToAddId = allAbilities.filter(abilityId => !alreadyKnownAbilities.includes(abilityId));
        if (!abilities || abilities.length < 1) {
          Notify.failure('An error happened during the level up process...');
          console.log("Error: no abilities.");
          return;
        }
        let abilitiesToAdd: string[] = abilities.map((ability) => {
          for (let i = 0; i < abilitiesToAddId.length; i++)
            if (abilitiesToAddId[i] == ability.id)
              return ability.name;
        }).filter(element => element !== undefined) as string[];
        console.log("abilities to add: ", abilitiesToAdd);
        await contract.levelUp(weapon.id, levelToSet, weaponStats, abilitiesToAdd, rest);
        console.log(`levelup on weapon id: ${weapon.id}, level: ${levelToSet}, xp left: ${rest}`);
        Notify.success(`Your weapon gained ${levelToSet - weapon.level} level(s), wait a minute and click on refresh to see it!`);
        setXp(0);
      } catch(e) {
        console.log("error: ", e);
        Notify.failure('An error happened during the level up process...');
      }
    }
  };

  return (
    <Button onClick={retrieveXp}>
      Retrieve {xp} xp
    </Button>
  );
};

export default RetrieveXpButton;