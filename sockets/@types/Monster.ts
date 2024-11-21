export type UID = number;  // unique id only attached to him (allow to have multiple times the same monster)
export type ID = number;   // id of the monster from DB to represent him

export interface Instance {
  uid: UID;
  id: ID;
  kind: "Monster"; // type guards
}