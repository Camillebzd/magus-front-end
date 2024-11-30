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
import * as Monster from '@/sockets/@types/Monster';
import EntityList from '@/components/Room/EntityList';
import MonsterList from '@/components/Room/MonsterList';


export default function Page() {
  const dispatch = useAppDispatch();
  const room = useAppSelector((state) => state.socketReducer.room);
  const isFullyConnected = useIsFullyConnected();
  const { isOpen: isOpenCreate, onOpen: onOpenCreate, onClose: onCloseCreate } = useDisclosure()
  const { isOpen: isOpenJoin, onOpen: onOpenJoin, onClose: onCloseJoin } = useDisclosure()

  const leaveRoom = () => {
    if (room.id != DEFAULT_ROOM_ID)
      dispatch(socketActions.leaveRoom(room.id));
  };

  const monsterInfo = (monster: Monster.Instance) => (
    <Box key={monster.uid} style={{ marginBottom: "1em" }}>
      <Text>{monster.id}</Text>
      <Text>{monster.uid}</Text>
    </Box>
  );

  const displayMonsters = () => (
    <Box>
      <Text>Monsters</Text>
      {room.monsters?.map((monster) => (
        monsterInfo(monster)
      ))}
    </Box>
  );

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
      {/* {displayMonsters()} */}
      <Button mt={10} colorScheme='red' onClick={leaveRoom}>Leave room</Button>
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