import { fetchFromDB, getRandomInt } from "./utils";
import {
  TARGET_ABILITY,
  CONDITIONS
} from "./systemValues";
import { Monster, Weapon } from "./entities";
import { Ability, AftermathType, Rule, Modifier, Condition, EffectValue, Effect, EffectTarget, Order } from "./abilities";
import { SetStateAction, Dispatch } from "react";

import { HistoricSystem } from "./historic";

// Unstable...
let effects: Effect[] = [];
let rules: Rule[] = [];
let modifiers: Modifier[] = [];
let effectTargets: EffectTarget[] = [];
let conditions: Condition[] = [];
let orders: Order[] = [];

// Flag to track if the data has been initialized
let isDataInitialized = false;

const initData = async () => {
  try {
    const effectsData: Effect[] | undefined = await fetchFromDB("abilities", "effects");
    if (effectsData)
      effects = effectsData;
    else
      console.log("Error: can't fetch abilities' effects.");
    const rulesData: Rule[] | undefined = await fetchFromDB("abilities", "rules");
    if (rulesData)
      rules = rulesData;
    else
      console.log("Error: can't fetch rules for abilities.");
    const modifiersData: Modifier[] | undefined = await fetchFromDB("abilities", "modifiers");
    if (modifiersData)
      modifiers = modifiersData;
    else
      console.log("Error: can't fetch modifiers for abilities.");
    const targetsData: EffectTarget[] | undefined = await fetchFromDB("abilities", "targets");
    if (targetsData)
      effectTargets = targetsData;
    else
      console.log("Error: can't fetch effectTargets for abilities.");
    const conditionsData: Condition[] | undefined = await fetchFromDB("abilities", "conditions");
    if (conditionsData)
      conditions = conditionsData;
    else
      console.log("Error: can't fetch conditions for abilities.");
    const ordersData: Order[] | undefined = await fetchFromDB("abilities", "orders");
    if (ordersData)
      orders = ordersData;
    else
      console.log("Error: can't fetch orders for abilities.");
    isDataInitialized = true;
  } catch (error) {
    console.error("Error initializing data:", error);
    isDataInitialized = false;
  }
}

// Export a function to ensure data is loaded before using any of the actions
export async function ensureDataLoaded() {
  if (!isDataInitialized) {
    await initData();
  }
  return isDataInitialized;
}

// export enum END_OF_TURN { NORMAL, TARGET_BLOCKED, PLAYER_COMBO, MONSTER_COMBO, PLAYER_DIED, MONSTER_DIED };

export enum RULE_ORDER {
  VERY_BEGINNING = 1,
  BEFORE_SPECIAL_CHECK = 2,
  BEFORE_PARRY_CHECK = 3,
  BEFORE_DAMAGE_CALCULATION = 4,
  BEFORE_CRIT_CALCULATION = 5,
  BEFORE_DAMAGE_APPLICATION = 6,
  BEFORE_MODIFIER_APPLICATION = 7,
  BEFORE_DEATHS_CHECK = 8,
  BEFORE_COMBO_CHECK = 9,
  VERY_END = 10,
  END_RESOLVE_ACTION = 11
};

export type ActionData = {
  uid: string;
  caster: Weapon | Monster;
  targets: (Weapon | Monster)[];
  ability: Ability;
  isCombo?: boolean;
  hasBeenDone?: boolean;
  hasBeenValidated?: boolean;
  fluxesUsed: number;
  info?: Dispatch<SetStateAction<string[]>>;
  currentTurn?: number;
};

/**
 * Instructions to send from the server to resolve the action on the client.
 * The server will send this object to the client to resolve the action in a 
 * deterministic way.
 */
export type ActionInstructions = {
  actionUid: string;
  damageCalculated: { [uid: string]: number }; // uid of the target and the damage calculated
  effectsTriggered: { [uid: string]: number[] }; // uid of the target and the effects triggered
  abilityWasCrit: { [uid: string]: boolean }; // uid of the target and if the ability was crit
  abilityWasBlocked: { [uid: string]: boolean }; // uid of the target and if the ability was blocked
  triggeredCombo: boolean;
};

export class Action {
  uid: string;
  caster: Weapon | Monster;
  targets: (Weapon | Monster)[];
  ability: Ability;
  isCombo = false;
  hasBeenDone = false;
  hasBeenValidated = false;
  fluxesUsed = 0;
  info: Dispatch<SetStateAction<string[]>> | undefined = undefined;
  damageCalculated: { [uid: string]: number };
  effectsTriggered: { [uid: string]: number[] }; // ids of the effects triggered by the action to send to the client
  abilityWasCrit: { [uid: string]: boolean };
  abilityWasBlocked: { [uid: string]: boolean };
  triggeredCombo = false;
  finalDamage: { [uid: string]: number };
  damageInflicted = 0;
  modifiersCleansed = 0;
  modifiersPurged = 0;
  currentTurn: number = 0;
  historicSystem: null | HistoricSystem = null;

  constructor(data: ActionData) {
    this.uid = data.uid;
    this.caster = data.caster;
    this.targets = data.targets;
    this.ability = data.ability;
    this.isCombo = data.isCombo || false;
    this.hasBeenDone = data.hasBeenDone || false;
    this.hasBeenValidated = data.hasBeenValidated || false;
    this.fluxesUsed = data.fluxesUsed || 0;
    this.info = data.info || undefined;
    this.currentTurn = data.currentTurn || 0;

    // will be initialized in the resolve function
    this.damageCalculated = {};
    this.effectsTriggered = {};
    this.abilityWasCrit = {};
    this.abilityWasBlocked = {};

    this.finalDamage = data.targets.reduce((acc, target) => {
      acc[target.uid] = 0;
      return acc;
    }, {} as { [uid: string]: number });


    // Check if the data is loaded
    ensureDataLoaded().catch(err => console.error("Failed to load action data:", err));
  }

  // static async create(data: ActionData): Promise<Action> {
  //   await ensureDataLoaded(); // Ensure data is loaded before creating the instance
  //   return new Action(data);
  // }

  // set hystoric system, carefule to not circulare link or too deep copy
  setHistoricSystem(historicSystem: HistoricSystem) {
    this.historicSystem = historicSystem;
  }

  // Used to add log in log obj
  log(message: string) {
    if (!this.info)
      return;
    this.info((currentInfo) => [...currentInfo, message]);
  }

  // Main fct that resolve the action
  resolve(instruction: ActionInstructions) {
    // Add the instruction data before the resolve
    this.abilityWasCrit = instruction.abilityWasCrit;
    this.abilityWasBlocked = instruction.abilityWasBlocked;
    this.triggeredCombo = instruction.triggeredCombo;
    this.effectsTriggered = instruction.effectsTriggered;
    this.damageCalculated = instruction.damageCalculated;
    // Resolve the action
    this.applyRule(RULE_ORDER.VERY_BEGINNING);
    this.log(`${this.caster.name} launch ${this.ability.name}.`);
    if (this.caster.isConfused()) {
      this.endOfResolve();
      this.log(`${this.caster.name} is confused!`);
      return;
    }
    this.applyRule(RULE_ORDER.BEFORE_SPECIAL_CHECK);
    if (this.ability.type != "SPECIAL") {
      this.applyRule(RULE_ORDER.BEFORE_PARRY_CHECK);
      for (let target of this.targets) {
        // 3. & 4. Parry
        if (this.abilityWasBlocked[target.uid]) {
          this.log(`The ability has been blocked by ${target.name}.`);
          continue;
        }
        this.applyRule(RULE_ORDER.BEFORE_DAMAGE_CALCULATION);
        // 5., 6., 7. & 8. Calc dmg + crit + modifiers
        this.finalDamage[target.uid] = this.damageCalculated[target.uid];
        console.log("1 finalDamage: ", this.finalDamage[target.uid]);
        this.applyRule(RULE_ORDER.BEFORE_CRIT_CALCULATION);
        if (this.abilityWasCrit[target.uid]) {
          this.log(`The ability was a crit!`);
          this.finalDamage[target.uid] = this.caster.addCritOnDamage(this.finalDamage[target.uid]);
        }
        this.finalDamage[target.uid] = this.caster.addModifiersOnDamage(this.finalDamage[target.uid]);
        this.applyRule(RULE_ORDER.BEFORE_DAMAGE_APPLICATION);
        // 9. Apply dmg & buff / debuff
        this.damageInflicted = target.applyDamage(this.finalDamage[target.uid]);
        this.log(`${target.name} takes ${this.damageInflicted} damage.`);
        console.log("2 damageInflicted: ", this.damageInflicted);
      }
    }
    this.applyRule(RULE_ORDER.BEFORE_MODIFIER_APPLICATION);
    this.addModifiers();
    this.applyRule(RULE_ORDER.BEFORE_DEATHS_CHECK);
    // check health
    // if (this.target.isDead()) {
    //   this.endOfResolve();
    //   return this.target.isNPC == false ? END_OF_TURN.PLAYER_DIED : END_OF_TURN.MONSTER_DIED;
    // }
    // if (this.caster.isDead()) {
    //   this.endOfResolve();
    //   return this.caster.isNPC == false ? END_OF_TURN.MONSTER_DIED : END_OF_TURN.PLAYER_DIED;
    // }
    // this.applyRule(RULE_ORDER.BEFORE_COMBO_CHECK);
    // // 10. Combo
    // if (this.caster.isDoingCombo() && !this.isCombo) {
    //   this.triggeredCombo = true;
    //   this.endOfResolve();
    //   return this.caster.isNPC == false ? END_OF_TURN.PLAYER_COMBO : END_OF_TURN.MONSTER_COMBO;
    // }
    this.applyRule(RULE_ORDER.VERY_END);
    this.endOfResolve();
    return;
  }

  // Call at the end of the resolve 
  endOfResolve() {
    this.caster.applyDecayingModifier();
    this.applyRule(RULE_ORDER.END_RESOLVE_ACTION);
    this.hasBeenDone = true;
  }

  // Add all modifiers from the action
  addModifiers() {
    this.ability.effects.forEach((actionEffect) => {
      let effect = effects.find((effect) => effect.id == actionEffect);
      if (!effect) {
        console.log("Error: this effect is not supported");
        return;
      }
      // Check if it is a modifier
      if (effect.aftermathType != "MODIFIER") {
        return;
      }
      // Modifier Info
      let modifier = this.getAftermath(effect.aftermathId, "MODIFIER") as Modifier;
      if (modifier == undefined || !Object.keys(modifier).length) {
        console.log("Error: modifier empty or not supported");
        return;
      }
      // Condition data
      let condition = conditions.find((condition) => condition.id === effect.conditionId);
      if (condition == undefined) {
        console.log("Error: this condition is not supported:", effect.conditionId);
        return;
      }
      // Modifier stack
      let modifierStack = this.getAftermathValue(effect.id, this.ability.effectsValue);
      if (modifierStack == -1) {
        console.log("Error: modifier stack is not set on effect");
        return;
      }
      // Target
      let targetObj = effectTargets.find((target) => target.id === effect.targetId);
      if (targetObj == undefined) {
        console.log("Error: this target is not supported:", effect.targetId);
        return;
      }
      let targets = this.getTargetsForEffect(targetObj);
      if (targets == undefined) {
        console.log("Error: this target type is not supported:", targetObj.id);
        return;
      }
      for (let target of targets) {
        // check if effect was triggered on server side
        if (this.effectsTriggered[target.uid].findIndex((id) => id === effect.id) == -1) {
          console.log("failed to apply modifier");
          continue;
        }
        // Check condition - check again but should be true if the effect was triggered on server side
        if (!this.checkCondition(condition, target)) {
          console.log("Condition not met");
          continue;
        }
        // Flux quantity
        let fluxQuantity = this.ability.isMagical ? this.fluxesUsed : 1;
        for (let i = 0; i < fluxQuantity; i++) {
          target.addModifier(modifier, modifierStack, this.caster);
          this.log(`${this.caster.name} add ${modifierStack} stacks of ${modifier.name} on ${target.name}.`);
        }
      }
    });
  }

  // Try to apply all the rules that respect the orderId call
  applyRule(orderId: number) {
    this.ability.effects.forEach((actionEffect) => {
      let effect = effects.find((effect) => effect.id == actionEffect);
      if (effect == undefined) {
        console.log("Error: this effect is not supported on ability ", this.ability.name);
        return;
      }
      // Check if it is a rule
      if (effect.aftermathType != "RULE") {
        return;
      }
      // Rule Info
      let rule = this.getAftermath(effect.aftermathId, "RULE") as Rule;
      if (!rule) {
        console.log("Error: rule unknown on ability ", this.ability.name);
        return;
      }
      // Order
      let order = orders.find(order => order.id == rule.orderId);
      if (!order) {
        console.log("Error: order not supported on ability ", this.ability.name);
        return;
      }
      // Check if the order is the one we want
      if (order.id != orderId)
        return;
      // Condition data
      let condition = conditions.find((condition) => condition.id === effect!.conditionId);
      if (condition == undefined) {
        console.log("Error: this condition is not supported on ability ", this.ability.name);
        return;
      }
      // Rule value
      let ruleValue = this.getAftermathValue(effect.id, this.ability.effectsValue);
      if (ruleValue == -1) {
        console.log("Error: rule value is not set on effect on ability ", this.ability.name);
        return;
      }
      // Target
      let targetObj = effectTargets.find((target) => target.id === effect!.targetId);
      if (targetObj == undefined) {
        console.log("Error: this target is not supported on ability ", this.ability.name);
        return;
      }
      let targets = this.getTargetsForEffect(targetObj);
      if (targets === undefined) {
        console.log("Error: this target type is not supported: ", targetObj.id);
        return;
      }
      for (let target of targets) {
        // check if effect was triggered on server side
        if (this.effectsTriggered[target.uid].findIndex((id) => id === effect.id) == -1) {
          console.log("failed to apply rule");
          continue;
        }
        // Check condition - check again but should be true if the effect was triggered on server side
        if (!this.checkCondition(condition, target)) {
          console.log("Condition not met");
          continue;
        }
        // Flux quantity
        let fluxQuantity = this.ability.isMagical ? this.fluxesUsed : 1;
        this.executeRule(rule, ruleValue, target, fluxQuantity);
      }
    });
  }

  // Execute the rule with the value given on the target
  executeRule(rule: Rule, ruleValue: number, target: Weapon | Monster, fluxQuantity: number) {
    switch (rule.id) {
      // Gain X fluxes
      case 1:
        if (target == null) {
          console.log(`target not specified for rule: ${rule} `);
          break;
        }
        target.addFluxes(ruleValue * fluxQuantity);
        break;
      // Do nothing
      case 2:
        this.log("NOTHING HAPPEN");
        break;
      // Random ability launch
      case 3:
        console.log("TODO: the random ability launch...");
        break;
      // Heal the target from the damage of the ability
      case 4:
        if (target == null) {
          console.log(`target not specified for rule: ${rule} `);
          break;
        }
        target.applyHeal(Math.round(ruleValue * fluxQuantity * this.damageInflicted / 100));
        break;
      // Force a combo on the target
      case 5:
        if (target == null) {
          console.log(`target not specified for rule: ${rule} `);
          break;
        }
        target.forceComboOnAction = true;
        break;
      // Force a crit on the target
      case 6:
        if (target == null) {
          console.log(`target not specified for rule: ${rule} `);
          break;
        }
        target.forceCritOnAction = true;
        break;
      // Buff the target by doesn't letting the target of an action be able to block
      case 7:
        if (target == null) {
          console.log(`target not specified for rule: ${rule} `);
          break;
        }
        target.preventBlockingOnAction = true;
        break;
      // Add additional damage to final damage
      case 8:
        this.finalDamage[target.uid] += ruleValue * fluxQuantity;
        break;
      // Priority on action, handled in getSpeedRule
      case 9:
        break;
      case 10:
        break;
      // Multiply final damage
      case 11:
        console.log("before: ", this.finalDamage);
        this.finalDamage[target.uid] *= ruleValue * fluxQuantity;
        console.log("after: ", this.finalDamage);
        break;
      // Cleans the target
      case 12:
        if (target == null) {
          console.log(`target not specified for rule: ${rule} `);
          break;
        }
        this.modifiersCleansed = target.cleans();
        break;
      // Multiply final damage by the number of negative effect cleansed by this ability
      case 13:
        this.finalDamage[target.uid] *= this.modifiersCleansed * ruleValue * fluxQuantity;
        break;
      // Add some stack on all debuff on the target
      case 14:
        if (target == null) {
          console.log(`target not specified for rule: ${rule} `);
          break;
        }
        target.addDecayingModifierStacks("DEBUFF", ruleValue * fluxQuantity);
        break;
      // Purge the target (remove positive modifiers)
      case 15:
        if (target == null) {
          console.log(`target not specified for rule: ${rule} `);
          break;
        }
        this.modifiersPurged = target.purge();
        break;
      // Add additional damage for each flux on the target of action
      case 16:
        this.finalDamage[target.uid] += ruleValue * target.fluxes * fluxQuantity;
      // Add additional damage for each flux on the caster of action
      case 17:
        this.finalDamage[target.uid] += ruleValue * this.caster.fluxes * fluxQuantity;
      // Remove fluxes on the target and add them to the caster
      case 18:
        if (target == null) {
          console.log(`target not specified for rule: ${rule} `);
          break;
        }
        this.caster.fluxes += target.removeFluxes(ruleValue * fluxQuantity);
      // Heal % of missing hp
      case 19:
        if (target == null) {
          console.log(`target not specified for rule: ${rule} `);
          break;
        }
        target.applyHeal(Math.round(ruleValue * fluxQuantity * (target.stats.healthMax - target.stats.health) / 100));
        break;
      // Heal % of maximum hp
      case 20:
        if (target == null) {
          console.log(`target not specified for rule: ${rule} `);
          break;
        }
        target.applyHeal(Math.round(ruleValue * fluxQuantity * target.stats.healthMax / 100));
        break;
      // Removes fluxes
      case 23:
        if (target == null) {
          console.log(`target not specified for rule: ${rule} `);
          break;
        }
        target.removeFluxes(ruleValue * fluxQuantity);
        break;
      default:
        console.log(`Error: rule not supported for the moment with id: ${rule.id}.`);
        return;
    }
  }

  // return true or false if the effect condition is valid or not
  checkCondition(condition: Condition, target: Weapon | Monster) {
    switch (condition.id) {
      // no condition
      case CONDITIONS.NO_CONDITION:
        return true;
      case CONDITIONS.ABILITY_IS_CRIT:
        return this.abilityWasCrit[target.uid];
      case CONDITIONS.ABILITY_TRIGGERS_COMBO:
        return this.triggeredCombo;
      case CONDITIONS.ABILITY_BLOCKED_BY_TARGET:
        return this.abilityWasBlocked[target.uid];
      case CONDITIONS.TARGET_ALREADY_ACTED:
        if (target === null) {
          console.log("Error: try to use condition target already acted with a null target.");
          return false;
        }
        if (!this.historicSystem) {
          console.log("Error: historic system is null in checkCondition for target already acted.");
          return false;
        }
        return this.historicSystem.hasAlreadyActed(target, this.currentTurn - 1);
      case CONDITIONS.TARGET_NOT_ALREADY_ACTED:
        if (target === null) {
          console.log("Error: try to use condition target not already acted with a null target.");
          return false;
        }
        if (!this.historicSystem) {
          console.log("Error: historic system is null in checkCondition for target not already acted.");
          return false;
        }
        return !this.historicSystem.hasAlreadyActed(target, this.currentTurn - 1);
      case CONDITIONS.TARGET_HAS_LESS_HP_THAN_CASTER:
        return target.stats.health < this.caster.stats.health;
      case CONDITIONS.TARGET_HAS_MORE_HP_THAN_CASTER:
        return target.stats.health > this.caster.stats.health;
      case CONDITIONS.TARGET_BEARS_POSITIVE_MODIFIER:
        return target.hasPositiveModifier();
      case CONDITIONS.TARGET_BEARS_NEGATIVE_MODIFIER:
        return target.hasNegativeModifier();
      case CONDITIONS.TARGET_DOESNT_BEARS_ANY_MODIFIER:
        return target.modifiers.length == 0;
      case CONDITIONS.CASTER_ALREADY_USED_THIS_ABILITY_LAST_TURN:
        if (target === null) {
          console.log("Error: try to use CASTER_ALREADY_USED_THIS_ABILITY_LAST_TURN with a null target.");
          return false;
        }
        if (!this.historicSystem) {
          console.log("Error: historic system is null in checkCondition for target CASTER_ALREADY_USED_THIS_ABILITY_LAST_TURN.");
          return false;
        }
        return this.historicSystem.hasAlreadyLaunchedAbility(target, this.ability, this.currentTurn - 1);
      case CONDITIONS.CASTER_BEARS_POSITIVE_MODIFIER:
        return this.caster.hasPositiveModifier();
      case CONDITIONS.CASTER_BEARS_NEGATIVE_MODIFIER:
        return this.caster.hasNegativeModifier();
      case CONDITIONS.CASTER_DOESNT_BEARS_ANY_MODIFIER:
        return this.caster.modifiers.length == 0;
      case CONDITIONS.CASTER_TOOK_DAMAGE_THIS_TURN_OR_LAST_ONE:
        return false; // TODO with historic system
      default:
        console.log("Error: condition not supported");
        return false;
    }
  }

  // return the entity obj targeted by the target input obj, null if no target selected and undefined if not supported
  getTargetsForEffect(target: EffectTarget): (Weapon | Monster)[] {
    switch (target.id) {
      case TARGET_ABILITY.TARGET_OF_ABILITY:
        return this.targets;
      case TARGET_ABILITY.CASTER_OF_ABILITY:
        return [this.caster];
      case TARGET_ABILITY.NONE:
        return [];
      default:
        console.log("WARNING: maybe the effect target is not supported yet");
        return [];
    }
  }

  // Get the aftermath obj from id and type, empty if no aftermath found
  getAftermath(aftermathId: number, aftermathType: AftermathType) {
    if (aftermathType == "RULE")
      return rules.find(rule => rule.id === aftermathId) as Rule;
    else if (aftermathType == "MODIFIER")
      return modifiers.find(modifier => modifier.id === aftermathId) as Modifier;
    console.log("Error: aftermath type not supported yet");
    return undefined;
  }

  // Get the value for the effect on effectsValue on ability, -1 if empty
  getAftermathValue(effectId: number, effectsValue: EffectValue[]) {
    let effectValue = effectsValue.find((effectValue) => effectValue.id === effectId);

    if (effectValue == undefined) {
      console.log(`Error: effectValue not found for effectId ${effectId}`);
      return -1;
    }
    return effectValue.value;
  }

  // return the list of effect on the ability
  getEffectsOnAbility() {
    let effectOnAbility: Effect[] = [];

    for (let effectId of this.ability.effects) {
      let effect = effects.find(elem => elem.id == effectId);
      if (effect)
        effectOnAbility.push(effect as Effect);
    }
    return effectOnAbility;
  }

  // Check if the ability of action contain a specific rule
  isRulePresent(ruleId: number) {
    let effectOnAbility = this.getEffectsOnAbility();

    if (!effectOnAbility || effectOnAbility.length == 0)
      return false;
    return effectOnAbility.findIndex(effect => effect.aftermathType === "RULE" && effect.aftermathId === ruleId) != -1;
  }

  // Check if the ability of action contain a specific modifier
  isModifierPresent(modifierId: number) {
    let effectOnAbility = this.getEffectsOnAbility();

    if (effectOnAbility.length == 0)
      return false;
    return effectOnAbility.findIndex(effect => effect.aftermathType === "MODIFIER" && effect.aftermathId === modifierId) != -1;
  }

  // Return a 0 if ability is normal, 1 if ability should play first
  getSpeedRule() {
    if (this.isRulePresent(9))
      return 1;
    return 0;
  }
}