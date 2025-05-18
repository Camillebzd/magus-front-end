'use client'

import { socketActions } from "@/redux/features/socketSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { DEFAULT_ROOM_ID } from "@/sockets/@types/Room";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure
} from "@chakra-ui/react";import { useRouter } from "next/navigation";
 import { useEffect } from "react";

/**
 * Component used to listen from the server when the admin accept the fight (launch).
 * It will print a modal impossible to close and the user will have to select if he accepts or not
 * to go in the fight. When all the members have accepted the fight, the user will be redirected to the fight page.
 */
const AcceptFightListener = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const room = useAppSelector((state) => state.socketReducer.room);
  const member = useAppSelector((state) => state.socketReducer.member);

  // listen for first time when the admin accept the fight
  useEffect(() => {
    if (room.acceptedMembers.length > 0 && !isOpen) {
      // show modal
      onOpen();
    }
    if (room.acceptedMembers.length == 0 && isOpen) {
      // close modal
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.acceptedMembers, isOpen]);

  // listen when the server redirect to the fight page
  useEffect(() => {
    if (room.goToRoomId != DEFAULT_ROOM_ID) {
      // close the modal
      onClose();
      // first reset the state
      dispatch(socketActions.resetGoToRoomId());
      // then move page
      // router.push(`fight/?roomid=${room.goToRoomId}&weaponid=${room.weapons[member.uid]}&monsterid=${0}`);
      // router.push(`fight/${room.goToRoomId}/?roomid=${room.goToRoomId}&weaponid=${room.weapons[member.uid]}&monsterid=${0}`);
      router.push(`fight/${room.goToRoomId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.goToRoomId]);


  const acceptFight = () => {
    console.log('accept fight button');
    // send the accept to the server
    dispatch(socketActions.acceptFight());
  };

  const rejectFight = () => {
    // send the reject to the server
    dispatch(socketActions.rejectFight());
  };

  const modalFooter = () => {
    if (room.acceptedMembers.includes(member.uid)) {
      return (
        <ModalFooter>
          <Text>Waiting for others to accept</Text>
        </ModalFooter>
      );
    }
    return (
      <ModalFooter>
        <Button colorScheme='blue' mr={3} onClick={acceptFight}>Accept</Button>
        <Button colorScheme='red' onClick={rejectFight}>Reject</Button>
      </ModalFooter>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Accept the fight</ModalHeader>
        {/* <ModalCloseButton /> */}
        <ModalBody>
          {room.members.map((member) => (
            <Text key={member.uid}>{member.uid}: {room.acceptedMembers.includes(member.uid) ? 'accepted' : 'waiting'}</Text>
          ))}
        </ModalBody>
        {modalFooter()}
      </ModalContent>
    </Modal>

  );
}

export default AcceptFightListener;