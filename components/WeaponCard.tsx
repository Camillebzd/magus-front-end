'use client'

import { Weapon, WeaponMint } from "@/scripts/entities";
import {
  Card,
  CardBody,
  CardFooter,
  Heading,
  Stack,
  Button,
  useDisclosure,
  Flex
} from '@chakra-ui/react'

import styles from './Card.module.css'
import { useEffect, useRef, useState } from "react";

import Link from 'next/link'
import { WeaponGeneralType } from "@/scripts/WeaponGeneralType";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { Notify } from "notiflix";
import CreateDeckModal from "./CreateDeckModal";
import { socketActions } from "@/redux/features/socketSlice";
import { useContract } from "@/scripts/customHooks";
import ResolvedImage from "./ResolvedImage";

const WeaponCard = ({ weapon, type }: { weapon: Weapon, type: WeaponGeneralType }) => {
  const [isOver, setIsOver] = useState(false);
  const imageWeapon: any = useRef(null);
  const address = useAppSelector((state) => state.authReducer.address);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useAppDispatch();
  const equipedWeaponId = useAppSelector((state) => state.socketReducer.member.equipedWeaponId);
  const contract = useContract();
  const [isCraftingStarter, setIsCraftingStarter] = useState(false);

  useEffect(() => {
    if (isOver && imageWeapon != null)
      imageWeapon.current.style.transform = "scale(1.2)";
    else if (!isOver && imageWeapon != null)
      imageWeapon.current.style.transform = "scale(1)";
  }, [isOver]);

  const craftStarter = async () => {
    if (!contract) {
      console.log("Contract not found");
      return;
    }

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
    try {
      setIsCraftingStarter(true);
      const tx = await contract.requestWeapon(weaponToMint);
      await tx.wait();
      Notify.success("Your weapon was created, wait a minute and you will see it appear!");
      setIsCraftingStarter(false);
      router.push('/armory');
    } catch (e) {
      console.log(e);
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
        <Button size='sm' isLoading={isCraftingStarter} colorScheme='blue' onClick={e => { e.preventDefault(); craftStarter(); }}>
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
      <Button size='sm' colorScheme='green' isActive={false} isDisabled={true} onClick={e => { e.preventDefault(); }}>
        Equiped
      </Button>
    );
  };

  return (
    <Link href={`/weapon/${type}/${weapon.id}`}>
      <Card
        backgroundColor={"profoundgrey.400"}
        borderColor={"profoundgrey.200"}
        borderWidth={"1px"}
        className={styles.card}
        onMouseEnter={() => setIsOver(true)}
        onMouseLeave={() => setIsOver(false)}
        width={"200px"}
        height={"230px"}
      >
        <CardBody
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          height="100%"
          padding={4}
        >
          <ResolvedImage
            image={weapon.image}
            alt={`image of weapon named ${weapon.name}`}
            borderRadius='lg'
            className={styles.cardImage}
            ref={imageWeapon}
            height={"100px"}
            width={"100px"}
          />
          <Stack mt='6' spacing='2' width="100%">
            <Flex direction={"row"} alignItems={"center"} justifyContent={"space-between"} gap={2} width="100%">
              <Heading size='sm' noOfLines={1} overflow="hidden" textOverflow="ellipsis" maxWidth="80%">
                {weapon.name}
              </Heading>
              <Heading size='sm' flexShrink={0}>LV.{weapon.level}</Heading>
            </Flex>
          </Stack>
        </CardBody>
        <CardFooter marginBottom={2} padding={0} justifyContent="center">
          {cardFooter()}
        </CardFooter>
      </Card>
      <CreateDeckModal weapon={weapon} isOpen={isOpen} onClose={onClose} />
    </Link>
  );
}

export default WeaponCard;