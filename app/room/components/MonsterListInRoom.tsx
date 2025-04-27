import { useAppSelector } from '@/redux/hooks';
import { Box, Text } from '@chakra-ui/react';
import * as Monster from '@/sockets/@types/Monster';
import GoToButton from '@/components/GoToButton';

const MonsterListInRoom = () => {
  const room = useAppSelector((state) => state.socketReducer.room);

  const monsterSquare = (member: Monster.Instance) => (
    <Box key={member.uid} style={{ marginBottom: "1em" }}>
      <Text>{member.id}</Text>
      <Text>{member.uid}</Text>
    </Box>
  );

  return (
    <Box>
      <Text>Monsters</Text>
      {room.monsters.length > 0 ?
        room.monsters?.map((monster) => (
          monsterSquare(monster)
        ))
        :
        <GoToButton text='Select Monster' href='/world' />
      }
    </Box>
  );
}

export default MonsterListInRoom;