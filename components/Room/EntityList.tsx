import { useAppSelector } from '@/redux/hooks';
import { Box, Text } from '@chakra-ui/react';
import * as Member from '@/sockets/@types/Member';

const EntityList = () => {
  const room = useAppSelector((state) => state.socketReducer.room);

  const entitySquare = (member: Member.FrontInstance) => (
    <Box key={member.uid} style={{ marginBottom: "1em" }}>
      <Text>{member.name}</Text>
      <Text>{member.uid}</Text>
    </Box>
  );

  return (
    <Box>
      <Text>Entities</Text>
      {room.members?.map((member) => (
        entitySquare(member)
      ))}
    </Box>
  );
}

export default EntityList;