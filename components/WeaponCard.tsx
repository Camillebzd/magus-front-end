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

  const unequipWeapon = async () => {
    console.log("unequip", weapon.id.toString());
    // call unequip on server
    dispatch(socketActions.unequipWeaponAndDeck());
  }

  const cardFooter = () => {
    if (type === "starter") {
      return (
        <Button size='sm' colorScheme='blue' onClick={e => { e.preventDefault(); craftStarter(); }}>
          Choose
        </Button>
      );
    } else if (type === "equiped") {
      return (
        <Button size='sm' colorScheme='red' onClick={e => { e.preventDefault(); unequipWeapon(); }}>
          Unequip
        </Button>
      );
    } else if (type === "classic" && equipedWeaponId != weapon.id.toString()) {
      return (
        <Button size='sm' colorScheme='green' onClick={e => { e.preventDefault(); onOpen(); }}>
          Equip
        </Button>
      );
    }
    return (
      <Button size='sm' colorScheme='green' isActive={false} isDisabled={true} onClick={e => { e.preventDefault();}}>
        Equiped
      </Button>
    );
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
            height={"200px"}
            width={"200px"}
          />
          <Stack mt='6' spacing='3' >
            <Heading size='md'>{weapon.name}</Heading>
            <p>{weapon.description}</p>
          </Stack>
        </CardBody>
        <CardFooter marginBottom={2} padding={0}>
          {cardFooter()}
        </CardFooter>
      </Card>
      <CreateDeckModal weapon={weapon} isOpen={isOpen} onClose={onClose} />
    </Link>
  );
}

export default WeaponCard;