'use client'

import styles from '../page.module.css'

import { useIsFullyConnected } from '@/scripts/customHooks';
import { DEFAULT_ROOM_ID } from '@/sockets/@types/Room';
import { Box, Button, Flex, Text, useDisclosure } from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import CreateRoomModal from '@/components/CreateRoomModal';
import JoinRoomModal from '@/components/JoinRoomModal';
import { socketActions } from '@/redux/features/socketSlice';
import CopyableField from '@/components/CopyableField';
import EntityList from '@/components/Room/EntityList';
import MonsterList from '@/components/Room/MonsterList';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';


export default function Page() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const room = useAppSelector((state) => state.socketReducer.room);
  const member = useAppSelector((state) => state.socketReducer.member);
  const isFullyConnected = useIsFullyConnected();
  const { isOpen: isOpenCreate, onOpen: onOpenCreate, onClose: onCloseCreate } = useDisclosure();
  const { isOpen: isOpenJoin, onOpen: onOpenJoin, onClose: onCloseJoin } = useDisclosure();

  useEffect(() => {
    if (room.goToRoomId != DEFAULT_ROOM_ID) {
      // first reset the state
      dispatch(socketActions.resetGoToRoomId());
      // then move page
      router.push(`fight/?roomid=${room.goToRoomId}&weaponid=${room.weapons[member.uid]}&monsterid=${0}`);
    }
  }, [room.goToRoomId]);

  const leaveRoom = () => {
    if (room.id != DEFAULT_ROOM_ID)
      dispatch(socketActions.leaveRoom(room.id));
  };

  const startFight = () => {
    dispatch(socketActions.startFigh());
  };

  // check if memberUID selected a weapon and a deck
  const isMemberReady = (memberUID: string): boolean => (memberUID in room.weapons && memberUID in room.decks);

  // Check if all members in the room are ready
  const isEveryoneReady = (): boolean => (room.members.filter((member) => isMemberReady(member.uid)).length === room.members.length);

  const startFightButton = () => {
    // This is the admin
    if (room.adminId === member.uid) {
      let isReady = false;
      // check everyone is ready
      if (member.uid in room.weapons && member.uid in room.decks && isEveryoneReady() && room.monsters.length > 0)
        isReady = true;
      return <Button mt={10} colorScheme='green' isDisabled={!isReady} onClick={startFight}>Start fight</Button>
    }
  };

  const roomDetails = () => (
    <Box>
      <Box mb={5}>
        <Text>Room id</Text>
        <CopyableField text={room.id} />
      </Box>
      <Box mb={5}>
        <Text>Admin id</Text>
        <CopyableField text={room.adminId} />
      </Box>
      {room.password.length === 0 ?
        <Box mb={5}>
          <Text>Password</Text>
          <Text>no password</Text>
        </Box>
        :
        <Box mb={5}>
          <Text>Password</Text>
          <CopyableField text={room.password} />
        </Box>
      }
      <EntityList />
      <MonsterList />
      <Flex gap={5}>
        <Button mt={10} colorScheme='red' onClick={leaveRoom}>Leave room</Button>
        {startFightButton()}
      </Flex>
    </Box>
  );

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Room</h1>
      <h2 className={styles.pageSubtitle}>Status</h2>
      <div>
        {room.id == DEFAULT_ROOM_ID ?
          <Flex gap={'5px'} alignItems='center'>
            {
              isFullyConnected ?
                <>
                  <Button onClick={onOpenCreate}>Create room</Button>
                  <Button onClick={onOpenJoin}>Join room</Button>
                </>
                :
                <Text>Connect if you want to create a room and play.</Text>
            }
          </Flex>
          :
          <Flex gap={'5px'} alignItems='center'>
            {roomDetails()}
          </Flex>
        }
      </div>
      <CreateRoomModal isOpen={isOpenCreate} onClose={onCloseCreate} />
      <JoinRoomModal isOpen={isOpenJoin} onClose={onCloseJoin} />
    </main>
  );
};