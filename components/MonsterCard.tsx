'use client'

import { Monster } from "@/scripts/entities";
import { Card, CardBody, CardFooter, Heading, Stack, Button, Image } from '@chakra-ui/react'
import DifficultyBadge from "./DifficultyBadge";

import styles from './Card.module.css'
import { useEffect, useRef, useState } from "react";

import Link from 'next/link'
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { DEFAULT_ROOM_ID } from "@/sockets/@types/Room";
import { DefaultMemberInformation, socketActions } from "@/redux/features/socketSlice";

const MonsterCard = ({ monster }: { monster: Monster }) => {
  const [isOver, setIsOver] = useState(false);
  const imageMonster: any = useRef(null);
  const room = useAppSelector((state) => state.socketReducer.room);
  const member = useAppSelector((state) => state.socketReducer.member);
  const [isCreatingFight, setIsCreatingFight] = useState(false);
  const dispatch = useAppDispatch();

  // check if memberUID selected a weapon and a deck
  const isMemberReady = (memberUID: string): boolean => (memberUID in room.weapons && memberUID in room.decks);
  // Check if all members in the room are ready
  const isEveryoneReady = (): boolean => (room.members.filter((member) => isMemberReady(member.uid)).length === room.members.length);

  useEffect(() => {
    if (isOver && imageMonster != null)
      imageMonster.current.style.transform = "scale(1.2)";
    else if (!isOver && imageMonster != null)
      imageMonster.current.style.transform = "scale(1)";
  }, [isOver]);

  const launchFight = () => {
    // check if the room is already created and if member is ready
    if (room.id === DEFAULT_ROOM_ID &&
      member.equipedWeaponId != DefaultMemberInformation.equipedWeaponId &&
      member.equipedDeck != DefaultMemberInformation.equipedDeck) {
      setIsCreatingFight(true);
      dispatch(socketActions.createNewRoom("")); // no password
    }
  }

  // When the room is created, add the monster and launch the fight
  useEffect(() => {
    if (room.id === DEFAULT_ROOM_ID || !isCreatingFight) return;
    // no need to push the weapon and deck to the room, already done if equiped
    if (member.equipedWeaponId != DefaultMemberInformation.equipedWeaponId &&
      member.equipedDeck != DefaultMemberInformation.equipedDeck) {
      // push the monster to the room
      dispatch(socketActions.addMonsters([monster.id]));
    } else {
      console.error("Error: user is not ready");
      return;
    }
  }, [room.id, isCreatingFight]);

  // Launch the fight when everything is ready
  useEffect(() => {
    if (member.uid in room.weapons && member.uid in room.decks && isEveryoneReady() && room.monsters.length > 0 && isCreatingFight) {
      setIsCreatingFight(false);
      dispatch(socketActions.startFigh());
    }
  }, [room.weapons, room.decks, room.monsters, isCreatingFight]);

  const addToRoom = () => {
    if (room.id === DEFAULT_ROOM_ID)
      return;
    // push the monster to the room
    dispatch(socketActions.addMonsters([monster.id]));
  }

  const cardFooter = () => {
    if (room.id !== DEFAULT_ROOM_ID) {
      return (
        <Button size='sm' colorScheme='green' onClick={e => { e.preventDefault(); addToRoom(); }}>
          Add in room
        </Button>
      );
    } else if (room.id === DEFAULT_ROOM_ID &&
      member.equipedWeaponId != DefaultMemberInformation.equipedWeaponId &&
      member.equipedDeck != DefaultMemberInformation.equipedDeck) {
      return (
        <Button size='sm' colorScheme='blue' onClick={e => { e.preventDefault(); launchFight(); }}>
          Fight
        </Button>
      );
    }
  };

  return (
    <Link href={`/monster/${monster.id}`}>
      <Card
        backgroundColor={"profoundgrey.400"}
        borderColor={"profoundgrey.200"}
        borderWidth={"1px"}
        className={styles.card}
        onMouseEnter={() => setIsOver(true)}
        onMouseLeave={() => setIsOver(false)}
      >
        <CardBody>
          <Image
            src={`/img/monsters/${monster.image}`}
            alt={`image of a ${monster.name}`}
            borderRadius='lg'
            className={styles.cardImage}
            ref={imageMonster}
            height={"200px"}
            width={"200px"}
          />
          <Stack mt='6' spacing='3' >
            <Heading size='md'>{monster.name}</Heading>
            <p style={{ justifySelf: 'flex-end' }}>
              Difficulty: <DifficultyBadge difficulty={monster.difficulty} />
            </p>
          </Stack>
        </CardBody>
        <CardFooter marginBottom={2} padding={0}>
          {cardFooter()}
        </CardFooter>
      </Card>
    </Link>
  );
}

export default MonsterCard;