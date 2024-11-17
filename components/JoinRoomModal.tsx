'use client'

import styles from './Card.module.css'

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { socketActions } from '@/redux/features/socketSlice';
import {
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text
} from "@chakra-ui/react";
import { useEffect, useState } from 'react';
import { DEFAULT_ROOM_ID } from '@/sockets/@types/Room';

const JoinRoomModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const room = useAppSelector((state) => state.socketReducer.room);

  useEffect(() => {
    if (isJoiningRoom && room.id !== DEFAULT_ROOM_ID)
      handleModalClose();    
  }, [isJoiningRoom, room]);

  // Reset state when the modal closes
  const handleModalClose = () => {
    // clean states
    setRoomId("");
    setPassword("");
    setShowPassword(false);
    setIsJoiningRoom(false);
    // Close the modal
    onClose();
  };

  const joinRoom = () => {
    setIsJoiningRoom(true);
    dispatch(socketActions.joinRoom({ id: roomId, password }));
    // create event when joining fail
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Join a room</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Room ID</Text>
          <Input
            pr='4.5rem'
            placeholder='Enter room id'
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
          >
          </Input>
          <Text mt={'10px'}>Password</Text>
          <InputGroup size='md'>
            <Input
              pr='4.5rem'
              type={showPassword ? 'text' : 'password'}
              placeholder='Enter password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <InputRightElement width='4.5rem'>
              <Button h='1.75rem' size='sm' onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={handleModalClose}>
            Close
          </Button>
          <Button colorScheme='blue' onClick={joinRoom} isLoading={isJoiningRoom}>Join</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default JoinRoomModal;