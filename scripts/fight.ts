import {
  ATTACKER_SPEED_WEIGHT
} from "./systemValues";
import { deepCopy, getRandomInt } from "./utils";
import { Action, END_OF_TURN } from "./actions";
import { HistoricSystem } from "./historic";

// Main loop for resolves actions
export function resolveActions(actions: Action[], historicSystem: HistoricSystem) {
  const actualTurn = historicSystem.getTurn(actions[0].currentTurn);
  if (!actualTurn) {
    console.log(`Error: actual turn in resolve is invalide for turn ${actions[0].currentTurn}.`);
    return undefined;
  }

  // 2. Calculate the order
  sortActionOrder(actions);
  for (let i = 0; i < actions.length; i++) {
    actualTurn.actions.push(deepCopy(actions[i]));
    // set historic system after to not deep copie all the historic itself each turn...
    actions[i].setHistoricSystem(historicSystem);
    let resultOfAction = actions[i].resolve();

    if (resultOfAction == END_OF_TURN.TARGET_BLOCKED || resultOfAction == END_OF_TURN.NORMAL)
      continue;
    // latter get the id here if there is a combo so handle easily multiple entities
    return resultOfAction;
  }
  return END_OF_TURN.NORMAL;
}

function sortActionOrder(actions: Action[]) {
  actions.sort((a, b) => {
    let prioDif = (b.caster.getSpeedState() + b.getSpeedRule()) - (a.caster.getSpeedState() + a.getSpeedRule());
    if (prioDif == 0) {
      let speedDif = (b.ability.initiative * ((b.caster.stats.speed ** ATTACKER_SPEED_WEIGHT) / 1000)) - (a.ability.initiative * ((a.caster.stats.speed ** ATTACKER_SPEED_WEIGHT) / 1000));
      return speedDif == 0 ? (getRandomInt(1) == 0 ? -1 : 1) : speedDif;
    } else
      return prioDif;
  });
}