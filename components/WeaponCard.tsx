'use client'

import { Weapon, WeaponMint } from "@/scripts/entities";
import { Card, CardBody, CardFooter, Heading, Stack, Button, Image, useDisclosure } from '@chakra-ui/react'

import styles from './Card.module.css'
import { useEffect, useRef, useState } from "react";

import Link from 'next/link'
import { WeaponGeneralType } from "@/scripts/WeaponGeneralType";
import { createContract } from "@/scripts/utils";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { Notify } from "notiflix";
import { DEFAULT_ADMIN_ID } from "@/sockets/@types/Room";
import CreateDeckModal from "./CreateDeckModal";
import { socketActions } from "@/redux/features/socketSlice";

const WeaponCard = ({ weapon, type }: { weapon: Weapon, type: WeaponGeneralType }) => {
  const room = useAppSelector((state) => state.socketReducer.room);
  const [isOver, setIsOver] = useState(false);
  const imageWeapon: any = useRef(null);
  const address = useAppSelector((state) => state.authReducer.address);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useAppDispatch();
  const equipedWeaponId = useAppSelector((state) => state.socketReducer.member.equipedWeaponId);

  useEffect(() => {
    if (isOver && imageWeapon != null)
      imageWeapon.current.style.transform = "scale(1.2)";
    else if (!isOver && imageWeapon != null)
      imageWeapon.current.style.transform = "scale(1)";
  }, [isOver]);

  const craftStarter = async () => {
    let weaponToMint: WeaponMint = {
      name: weapon.name,
      description: weapon.description,
      image: weapon.image,
      level: weapon.level,
      stage: weapon.stage,
      weaponStats: {
        health: weapon.stats.health,
        speed: weapon.stats.speed,
        mind: weapon.stats.mind,
        offensiveStats: {
          sharpDamage: weapon.stats.sharpDmg,
          bluntDamage: weapon.stats.bluntDmg,
          burnDamage: weapon.stats.burnDmg,
          pierce: weapon.stats.pierce,
          lethality: weapon.stats.lethality
        },
        defensiveStats: {
          sharpResistance: weapon.stats.sharpRes,
          bluntResistance: weapon.stats.bluntRes,
          burnResistance: weapon.stats.burnRes,
          guard: weapon.stats.guard,
        },
        handling: weapon.stats.handling,
      },
      xp: 0,
      abilities: [],
      identity: "None"
    };
    weapon.abilities.forEach((ability) => { weaponToMint.abilities.push(ability.name) });
    console.log(weaponToMint);
    if (!address)
      return;
    const contract = await createContract(address)
    try {
      await contract.requestWeapon(weaponToMint);
      Notify.success("Your weapon was created, wait a minute and you will see it appear!");
      router.push('/armory');
    } catch {
      Notify.failure("An error occuquered during the request weapon process.");
    }
  };

  const equipWeapon = async () => {
    console.log("equip", weapon.id.toString());
    // call equip on server
    dispatch(socketActions.equipWeaponAndDeck({
      weaponId: weapon.id.toString(),
      deck: {},
    }));
  }

  const unequipWeapon = async () => {
    console.log("unequip", weapon.id.toString());
    // call unequip on server
    dispatch(socketActions.unequipWeaponAndDeck());
  }

  const cardFooter = () => {
    if (type === "starter") {
      return (
        <Button position='absolute' top='89%' right='40%' size='sm' colorScheme='blue' onClick={e => { e.preventDefault(); craftStarter(); }}>
          Choose
        </Button>
      );
    } else if (type === "equiped") {
      return (
        <Button position='absolute' top='89%' right='40%' size='sm' colorScheme='red' onClick={e => { e.preventDefault(); unequipWeapon(); }}>
          Unequip
        </Button>
      );
    } else if (type === "classic" && equipedWeaponId != weapon.id.toString()) {
      return (
        <Button position='absolute' top='89%' right='40%' size='sm' colorScheme='green' onClick={e => { e.preventDefault(); equipWeapon(); }}>
          Equip
        </Button>
      );
    }
    // unreachable case
    if (room.id !== DEFAULT_ADMIN_ID) {
      return (
        <Button position='absolute' top='89%' right='40%' size='sm' colorScheme='green' onClick={e => { e.preventDefault(); onOpen(); }}>
          Choose
        </Button>
      );
    }
  };

  return (
    <Link href={`/weapon/${type}/${weapon.id}`}>
      <Card className={styles.card} onMouseEnter={() => setIsOver(true)} onMouseLeave={() => setIsOver(false)}>
        <CardBody className={styles.cardBody}>
          <Image
            src={weapon.image}
            alt={`image of weapon named ${weapon.name}`}
            borderRadius='lg'
            className={styles.cardImage}
            ref={imageWeapon}
          />
          <Stack mt='6' spacing='3' >
            <Heading size='md'>{weapon.name}</Heading>
            <p>{weapon.description}</p>
          </Stack>
        </CardBody>
        <CardFooter >
          {cardFooter()}
        </CardFooter>
      </Card>
      <CreateDeckModal weapon={weapon} isOpen={isOpen} onClose={onClose} />
    </Link>
  );
}

export default WeaponCard;