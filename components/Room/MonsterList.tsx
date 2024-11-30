import { useAppSelector } from '@/redux/hooks';
import { Box, Text } from '@chakra-ui/react';
import * as Monster from '@/sockets/@types/Monster';

const MonsterList = () => {
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
      {room.monsters?.map((monster) => (
        monsterSquare(monster)
      ))}
    </Box>
  );
}

export default MonsterList;