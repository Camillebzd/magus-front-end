import { Action } from "./actions";
import { Monster, Weapon } from "./entities";
import * as Member from "@/sockets/@types/Member";

/**
 * Represent the raw data of an action.
 */
export type RawDataAction = {
  uid: string;
  caster: string; // uid of the caster
  target: string; // uid of the target
  ability: number; // id of the ability
  fluxesUsed: number;
  currentTurn: number;
}

/**
 * Manager for the actions
 */
class ActionManager {

  /**
   * Create an action from raw data.
   * @param rawDataAction Data of the action
   * @returns The action created from the data
   */
  createActionFromRawData(rawDataAction: RawDataAction, weapons: Map<Member.ID, Weapon>, monsters: Map<string, Monster>): Action | null {
    const weapon = weapons.get(rawDataAction.caster);
    const monster = monsters.get(rawDataAction.target);
    const ability = weapon?.abilities.filter(ability => ability.id == rawDataAction.ability)[0];

    if (!weapon || !monster || !ability) {
      console.error("Error: couldn't create the action from the raw data.");
      return null;
    }
    return new Action({
      uid: rawDataAction.uid,
      caster: weapon,
      ability: ability,
      target: monster,
      fluxesUsed: rawDataAction.fluxesUsed,
      currentTurn: rawDataAction.currentTurn
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
      ability: action.ability.id,
      fluxesUsed: action.fluxesUsed,
      currentTurn: action.currentTurn
    };
  }
}

export default ActionManager;