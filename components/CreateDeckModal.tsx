'use client'

import { useAppDispatch } from '@/redux/hooks';
import { socketActions } from '@/redux/features/socketSlice';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text
} from "@chakra-ui/react";
import { useState } from 'react';
import { Weapon } from '@/scripts/entities';
import { MouseEvent } from 'react';
import { DECK_MAX_SIZE } from '@/scripts/systemValues';
import { AbilityData, RawDataAbilities } from '@/scripts/abilities';
import UniqueIdGenerator from '@/scripts/UniqueIdGenerator';

type decklistElem = {
  num: number,
  abilityData: AbilityData
}

const CreateDeckModal = ({ weapon, isOpen, onClose }: { weapon: Weapon, isOpen: boolean, onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const [deck, setDeck] = useState<AbilityData[]>([]);
  const list: decklistElem[] = deck.reduce((acc: decklistElem[], curr) => {
    for (let i = 0; i < acc.length; i++) {
      if (acc[i].abilityData.id == curr.id) {
        acc[i].num += 1;
        return acc;
      }
    }
    acc.push({ num: 1, abilityData: curr });
    return acc;
  }, []);

  // Reset state when the modal closes
  const handleModalClose = () => {
    // clean states
    // Close the modal
    onClose();
  };

  const handleDeck = (action: 'add' | 'remove', newAbility: AbilityData) => {
    switch (action) {
      case "add": {
        setDeck((prevDeck) => {
          if (prevDeck.filter(ability => ability.id == newAbility.id).length + 1 > newAbility.tier) {
            return prevDeck; 
          }
          return [...prevDeck, newAbility];
        });
        setDeck((prevDeck) => [...prevDeck].sort((ability1, ability2) => ability1.id - ability2.id));
        break;
      }
      case "remove": {
        setDeck((prevDeck) => {
          const index = prevDeck.findIndex((ability) => ability.id === newAbility.id);
          if (index === -1) {
            return prevDeck; // If no ability is found, return the current deck unchanged
          }
          // Create a new array without the ability at the found index
          return [...prevDeck.slice(0, index), ...prevDeck.slice(index + 1)];
        });
        setDeck((prevDeck) => [...prevDeck].sort((ability1, ability2) => ability1.id - ability2.id));
        break;
      }
    }
  }

  const handleClick = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>, abilityData: AbilityData) => {
    if (e.type === 'click' && deck.length < DECK_MAX_SIZE) {
      handleDeck('add', abilityData);
    } else if (e.type === 'contextmenu') {
      e.preventDefault();
      handleDeck('remove', abilityData);
    }
  };

  const sendWeaponAndDeck = () => {
    let rawDataDeck: RawDataAbilities = {};

    if (deck.length === DECK_MAX_SIZE) {
      list.forEach((elem) => {
        if (!rawDataDeck[elem.abilityData.id]) {
          rawDataDeck[elem.abilityData.id] = [];
        }
        for (let i = 0; i < elem.num; i++) {
          rawDataDeck[elem.abilityData.id].push(UniqueIdGenerator.getInstance().generateSnowflakeId(200));
        }
      });
      console.log("deck:", rawDataDeck);
      dispatch(socketActions.equipWeaponAndDeck({
        weaponId: weapon.id.toString(),
        deck: rawDataDeck,
      }));
      // dispatch(socketActions.selectWeaponAndDeck({ weaponId: weapon.id.toString(), deck: rawDataDeck }));
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create your deck</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
        <Text marginBottom={5}>Ability list:</Text>
          <div style={{ display: "flex", flexWrap: 'wrap', gap: "12px" }}>
            {weapon.abilities.map(ability => {
              return <Button key={ability.id} onClick={(e) => handleClick(e, ability.extractData())} onContextMenu={(e) => handleClick(e, ability.extractData())}>{ability.name}</Button>;
            })}
          </div>
          <Text marginTop={5} marginBottom={5}>Actual deck: {deck.length}/{DECK_MAX_SIZE}</Text>
          <div style={{ display: "flex", flexWrap: 'wrap', gap: "12px" }}>
            {list.map((elem, i) => {
              return <Button key={i} onClick={(e) => handleClick(e, elem.abilityData)} onContextMenu={(e) => handleClick(e, elem.abilityData)}>{elem.num} {elem.abilityData.name}</Button>;
            })}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={handleModalClose}>
            Close
          </Button>
          <Button colorScheme='green' onClick={sendWeaponAndDeck}>Choose</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateDeckModal;