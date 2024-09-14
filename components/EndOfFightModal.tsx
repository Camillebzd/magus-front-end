'use client'

import { useAppSelector } from "@/redux/hooks";
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { createContract, fetchFromDB } from "@/scripts/utils";
import { Notify } from "notiflix";
import { useXpStorage } from "@/scripts/customHooks";
import { useEffect, useState } from "react";

const EndOfFightModal = ({isOpen, onClose, weaponId, difficulty, isWinner}: {isOpen: boolean, onClose: () => void, weaponId: number, difficulty: number, isWinner: boolean}) => {
  const address = useAppSelector((state) => state.authReducer.address);
  const router = useRouter();
  const [xp, setXp] = useXpStorage(weaponId);
  const [xpReward, setXpReward] = useState(0);

  useEffect(() => {
    const getXpRewardData = async () => {
      const response = await fetchFromDB("general/experiences");

      if (response === undefined) {
        console.log("An error occured during the fetch of experiences from db.");
        Notify.failure('An error happened during the retrieve of xp data...');
        return;
      }
      setXpReward(response[0][difficulty.toString()]);
    }
    getXpRewardData();
  }, []);

  const goToWorld = () => {
    router.push('/world');
  };

  const gainXP = async () => {
    // if (address.length < 42) {
    //   Notify.success("Error: you can't gain xp if your address is invalid.");
    //   return;
    // }
    // const contract = await createContract(address)
    // try {
    //   await contract.gainXP(weaponId, xpQuantity);
    //   Notify.success(`Your weapon gained ${xpQuantity} xp, wait a minute and you will see it!`);
    // } catch (e){
    //   console.log(e);
    //   Notify.failure('An error happened during the the process of gaining experience.');
    // }
    if (xpReward === 0)
      return;
    try {
      setXp(xp + xpReward);
      Notify.success(`Your weapon stocked ${xpReward} xp, go on the detail page to see it!`);
    } catch (e) {
      console.log(e);
      Notify.failure('An error happened during the the process of gaining experience.');
    }
    goToWorld();
  };

  const resultSentence = () => {
    if (isWinner)
      return `Congratulation for your win, you can gain ${xpReward}XP.`;
    else
      return 'You lost...';
  };

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>End of fight</ModalHeader>
        {/* <ModalCloseButton /> */}
        <ModalBody>
          <Text>{resultSentence()}</Text>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={goToWorld}>
            World
          </Button>
          {isWinner && <Button colorScheme='blue' onClick={gainXP}>Gain XP</Button>}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
  }
  
  export default EndOfFightModal;