'use client'

import styles from '../page.module.css'

import MonsterList from '@/components/MonsterList';
import { useIsFullyConnected, useMonstersWorld, useUserWeapons } from '@/scripts/customHooks';
import { UserWeaponsContext } from './context';
import { DEFAULT_ROOM_ID } from '@/sockets/@types/Room';
import { Box, Button, Flex, Text, useDisclosure } from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import CreateRoomModal from '@/components/CreateRoomModal';
import JoinRoomModal from '@/components/JoinRoomModal';
import { socketActions } from '@/redux/features/socketSlice';

export default function Page() {
  const monsters = useMonstersWorld(true);
  const userWeapons = useUserWeapons(true);
  const dispatch = useAppDispatch();
  const room = useAppSelector((state) => state.socketReducer.room);
  const isFullyConnected = useIsFullyConnected();
  const { isOpen: isOpenCreate, onOpen: onOpenCreate, onClose: onCloseCreate } = useDisclosure()
  const { isOpen: isOpenJoin, onOpen: onOpenJoin, onClose: onCloseJoin } = useDisclosure()

  const leaveRoom = () => {
    if (isFullyConnected && room.id != DEFAULT_ROOM_ID)
      dispatch(socketActions.leaveRoom(room.id));

  };

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>World</h1>
      <h2 className={styles.pageSubtitle}>Room info</h2>
      <div>
        {room.id == DEFAULT_ROOM_ID ?
          <Flex gap={'5px'} alignItems='center'>
            <Text>Not in a room.</Text>
            {
              isFullyConnected ?
                <>
                  <Button onClick={onOpenCreate}>Create room</Button>
                  <Button onClick={onOpenJoin}>Join room</Button>
                </>
                :
                <Text>Connect if you want to create one.</Text>
            }
          </Flex>
          :
          <Flex gap={'5px'} alignItems='center'>
            <Text>In room: {room.id}</Text>
            <Button onClick={leaveRoom}>Leave room</Button>
          </Flex>
        }
      </div>
      <h2 className={styles.pageSubtitle}>Monsters</h2>
      {monsters.length === 0 ?
        <p>Monsters loading...</p> :
        <UserWeaponsContext.Provider value={userWeapons}>
          <MonsterList monsters={monsters} />
        </UserWeaponsContext.Provider>
      }
      {/* <h2 className={styles.pageSubtitle}>Dungeons</h2> */}
      <CreateRoomModal isOpen={isOpenCreate} onClose={onCloseCreate} />
      <JoinRoomModal isOpen={isOpenJoin} onClose={onCloseJoin} />
    </main>
  );
};