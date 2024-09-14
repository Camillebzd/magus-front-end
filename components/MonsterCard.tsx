'use client'

import { Monster } from "@/scripts/entities";
import { Card, CardBody, CardFooter, Heading, Stack, Button, Image, useDisclosure } from '@chakra-ui/react'
import DifficultyBadge from "./DifficultyBadge";

import styles from './Card.module.css'
import { useEffect, useRef, useState } from "react";

import Link from 'next/link'
import WeaponSelectionModal from "./WeaponSelectionModal";

const MonsterCard = ({monster}: {monster: Monster}) => {
  const [isOver, setIsOver] = useState(false);
  const imageMonster: any = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (isOver && imageMonster != null)
      imageMonster.current.style.transform = "scale(1.2)";
    else if (!isOver && imageMonster != null)
      imageMonster.current.style.transform = "scale(1)";
  }, [isOver]);

  return (
    <>
      {/* <Card colorScheme="red">
        <p>Test</p>
      </Card> */}
      <Link href={`/monster/${monster.id}`}>
        <Card className={styles.card} onMouseEnter={() => setIsOver(true)} onMouseLeave={() => setIsOver(false)}>
          <CardBody>
            <Image
              src={`/img/monsters/${monster.image}`}
              alt={`image of a ${monster.name}`}
              borderRadius='lg'
              className={styles.cardImage}
              ref={imageMonster}
            />
            <Stack mt='6' spacing='3' >
              <Heading size='md'>{monster.name}</Heading>
              <p style={{justifySelf: 'flex-end'}}>
                Difficulty: <DifficultyBadge difficulty={monster.difficulty}/>
              </p>
            </Stack>
          </CardBody>
          <CardFooter >
            {isOver && 
              (<>
                <Button position='absolute' top='89%' right='40%' size='sm' colorScheme='blue' onClick={e => {e.preventDefault(); onOpen();}}>
                  Fight
                </Button>
                {/* <WeaponSelectionModal isOpen={isOpen} onClose={onClose} monsterId={monster.id}/> */}
              </>)
            }
          </CardFooter>
        </Card>
      </Link>
      <WeaponSelectionModal isOpen={isOpen} onClose={onClose} monsterId={monster.id}/>
    </>
  );
}

export default MonsterCard;