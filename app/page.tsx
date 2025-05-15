'use client'

import { useIsFullyConnected, useMonstersWorld } from '@/scripts/customHooks';
import { DEFAULT_ROOM_ID } from '@/sockets/@types/Room';
import { Box, Button, Flex, Text, useDisclosure } from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import CreateRoomModal from '@/components/CreateRoomModal';
import JoinRoomModal from '@/components/JoinRoomModal';
import { socketActions } from '@/redux/features/socketSlice';
import CopyableField from '@/components/CopyableField';
import EntityListInRoom from '@/app/components/EntityListInRoom';
import MonsterListInRoom from '@/app/components/MonsterListInRoom';

import styles from './page.module.css'
import MonsterList from '@/components/MonsterList';

export default function Home() {
  const dispatch = useAppDispatch();
  const room = useAppSelector((state) => state.socketReducer.room);
  const member = useAppSelector((state) => state.socketReducer.member);
  const monsters = useMonstersWorld(true);
  const areMonstersLoading = useAppSelector((state) => state.monsterReducer.isLoading);
  const isFullyConnected = useIsFullyConnected();
  const { isOpen: isOpenCreate, onOpen: onOpenCreate, onClose: onCloseCreate } = useDisclosure();
  const { isOpen: isOpenJoin, onOpen: onOpenJoin, onClose: onCloseJoin } = useDisclosure();

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
      <Flex mb={5} alignItems='center' flexDirection="row" gap={5}>
        <Box>
          <Text>Room id</Text>
          <CopyableField text={room.id} />
        </Box>
        <Box>
          <Text>Admin id</Text>
          <CopyableField text={room.adminId} />
        </Box>
      </Flex>
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
      <EntityListInRoom />
      <MonsterListInRoom />
      <Flex gap={5}>
        <Button mt={10} colorScheme='red' onClick={leaveRoom}>Leave room</Button>
        {startFightButton()}
      </Flex>
    </Box>
  );

  return (
    <Box className={styles.main}>
      {/* Room box */}
      <Flex
        borderRadius={10}
        padding={5}
        flexDirection={'column'}
        gap={5}
        width={'100%'}
        borderColor={'profoundgrey.800'}
        borderWidth={1}
        backgroundColor={'profoundgrey.900'}
      >
        {room.id == DEFAULT_ROOM_ID ?
          <Flex gap={'5px'} alignItems='center' justifyContent={'center'}>
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
          <Flex gap={'5px'} alignItems='center' justifyContent={'center'} flexDirection={'column'}>
            {roomDetails()}
          </Flex>
        }

      </Flex>
      {/* Monsters & events availables */}
      <Flex direction={'column'}>
        <Text fontSize='xl' mt={5} fontWeight={'bold'}>
          Monsters & events availables
        </Text>
        <Text fontSize='sm' mb={4} color={'lightgrey'}>
          Click on the monster to see its details
        </Text>
        {areMonstersLoading ?
          <Text>Monsters loading...</Text> :
          <MonsterList monsters={monsters} />
        }
      </Flex>
      <CreateRoomModal isOpen={isOpenCreate} onClose={onCloseCreate} />
      <JoinRoomModal isOpen={isOpenJoin} onClose={onCloseJoin} />
    </Box>
  )
}
