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

const CreateRoomModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const room = useAppSelector((state) => state.socketReducer.room);

  useEffect(() => {
    if (isCreatingRoom && room.id !== DEFAULT_ROOM_ID)
      handleModalClose();    
  }, [isCreatingRoom, room]);

  // Reset state when the modal closes
  const handleModalClose = () => {
    // clean states
    setPassword("");
    setShowPassword(false);
    setIsCreatingRoom(false);
    // Close the modal
    onClose();
  };

  const createRoom = () => {
    setIsCreatingRoom(true);
    dispatch(socketActions.createNewRoom(password));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a new room</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Password</Text>
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
          <Button colorScheme='blue' onClick={createRoom} isLoading={isCreatingRoom}>Create</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateRoomModal;