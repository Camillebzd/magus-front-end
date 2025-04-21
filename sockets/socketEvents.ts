/**
 * Enum for socket events to listen to. All these events are emitted by the server 
 * and listened by the client at all time. This list is non exhaustive as it represents 
 * only the events needed for redux state management. All the other events
 * are handled by the client in each components but not stored in the redux state.
 */
export enum SocketEventsListener {
  Connect = "connect",
  Disconnect = "disconnect",
  Error = "err",
  MemberCreated = "memberCreated",
  MemberDeleted = "memberDeleted",
  WeaponAndDeckEquipped = "weaponAndDeckEquipped",
  WeaponAndDeckUnequipped = "weaponAndDeckUnequipped",
  NewRoomCreated = "newRoomCreated",
  RoomJoined = "roomJoined",
  RoomLeft = "roomLeft",
  MemberAdded = "memberAdded",
  MemberRemoved = "memberRemoved",
  MonstersAdded = "monstersAdded",
  MonstersRemoved = "monstersRemoved",
  WeaponAdded = "weaponAdded",
  WeaponRemoved = "weaponRemoved",
  DeckAdded = "deckAdded",
  DeckRemoved = "deckRemoved",
  EnterFight = "enterFight",
  AcceptedFight = "acceptedFight",
  RejectedFight = "rejectedFight",
  SkillSelected = "skillSelected",
  AllSkillsSelected = "allSkillsSelected",
  AllEntities = "allEntities"
}

/**
 * Enum for socket events to emitte to. All these events are emitted by the client 
 * and listened by the server at all time. This list is non exhaustive as it represents 
 * only the events needed for redux state management. All the other events
 * are handled by the client in each components but not stored in the redux state.
 */
export enum SocketEventsEmitter {
  CreateMember = "createMember",
  DeleteMember = "deleteMember",
  EquipWeaponAndDeck = "equipWeaponAndDeck",
  UnequipWeaponAndDeck = "unequipWeaponAndDeck",
  CreateNewRoom = "createNewRoom",
  JoinRoom = "joinRoom",
  LeaveRoom = "leaveRoom",
  AddMonsters = "addMonsters",
  SelectWeaponAndDeck = "selectWeaponAndDeck",
  RemoveMonsters = "removeMonsters",
  StartFigh = "startFigh",
  AcceptFight = "acceptFight",
  RejectFight = "rejectFight",
  SelectSkill = "selectSkill",
}
