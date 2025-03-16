import { RawDataAbilities } from "@/scripts/abilities";

export type UID = string;  // unique id only attached to him (allow to have multiple times the same monster)
export type ID = number;   // id of the monster from DB to represent him

export interface Instance {
  uid: UID;
  id: ID;
  abilities: RawDataAbilities; // not named deck but is the same
}