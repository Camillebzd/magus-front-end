import { Action } from "./actions";
import { Monster, Weapon } from "./entities";
import * as Member from "@/sockets/@types/Member";
import { ATTACKER_SPEED_WEIGHT } from "./systemValues";
import { getRandomInt } from "./utils";

/**
 * Represent the raw data of an action.
 */
export type RawDataAction = {
  uid: string;
  caster: string; // uid of the caster
  target: string; // uid of the target
  ability: string; // uid of the ability
  fluxesUsed: number;
  currentTurn: number;
  hasBeenValidated: boolean;
}

/**
 * Manager for the actions
 */
class ActionManager {

  /**
   * Create an action from raw data.
   * @dev The uid of the abilities should be set for monsters and weapons!!!!
   * @param rawDataAction Data of the action
   * @param weapons Map of the weapons
   * @param monsters Map of the monsters
   * @returns The action created from the data
   */
  createActionFromRawData(rawDataAction: RawDataAction, weapons: Map<Member.ID, Weapon>, monsters: Map<string, Monster>): Action | null {
    // find the caster in the weapons or monsters
    const caster = weapons.get(rawDataAction.caster) || monsters.get(rawDataAction.caster);
    if (!caster) {
      console.error("Error: couldn't find the caster for the action from the raw data, uid: " + rawDataAction.caster);
      return null;
    }
    // find the target in the weapons or monsters
    // const targets: (Weapon | Monster | null)[] = rawDataAction.target.map(targetUid => {
    //   const target = weapons.get(targetUid) || monsters.get(targetUid);
    //   if (!target) {
    //     console.error("Error: couldn't find the target for the action from the raw data, uid: " + targetUid);
    //     return null;
    //   }
    //   return target;
    // });
    // if (targets.includes(null)) {
    //   return null;
    // }
    const target = weapons.get(rawDataAction.target) || monsters.get(rawDataAction.target);
    if (!target) {
      console.error("Error: couldn't find the target for the action from the raw data, uid: " + rawDataAction.target);
      return null;
    }
    // // find the ability in the caster's abilities
    const ability = caster.getAbilityByUID(rawDataAction.ability);
    if (!ability) {
      console.error("Error: couldn't find the ability for the action from the raw data, uid: " + rawDataAction.ability);
      return null;
    }

    return new Action({
      uid: rawDataAction.uid,
      caster: caster,
      ability: ability,
      target: target,
      fluxesUsed: rawDataAction.fluxesUsed,
      currentTurn: rawDataAction.currentTurn,
      hasBeenValidated: rawDataAction.hasBeenValidated
    });
  }

  /**
   * Create raw data from an action.
   * @param Action The action to convert
   * @returns An object containing the raw data of the action
   */
  createRawDataFromAction(action: Action): RawDataAction {
    return {
      uid: action.uid,
      caster: action.caster.uid,
      target: action.target.uid,
      ability: action.ability.uid,
      fluxesUsed: action.fluxesUsed,
      currentTurn: action.currentTurn,
      hasBeenValidated: action.hasBeenValidated
    };
  }

  /**
   * Order the actions by speed and priority.
   * @dev This function will modify the array of actions passed by reference.
   * @param actions The actions to sort
   */
  sortActionsOrder(actions: Action[]) {
    actions.sort((a, b) => {
      let prioDif = (b.caster.getSpeedState() + b.getSpeedRule()) - (a.caster.getSpeedState() + a.getSpeedRule());
      if (prioDif == 0) {
        let speedDif = (b.ability.initiative * ((b.caster.stats.speed ** ATTACKER_SPEED_WEIGHT) / 1000)) - (a.ability.initiative * ((a.caster.stats.speed ** ATTACKER_SPEED_WEIGHT) / 1000));
        return speedDif == 0 ? (getRandomInt(1) == 0 ? -1 : 1) : speedDif;
      } else
        return prioDif;
    });
    return actions;
  }
}

export default ActionManager;