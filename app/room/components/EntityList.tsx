import { useAppSelector } from '@/redux/hooks';
import { Box, Text } from '@chakra-ui/react';
import * as Member from '@/sockets/@types/Member';
import GoToButton from '@/components/GoToButton';

const EntityList = () => {
  const room = useAppSelector((state) => state.socketReducer.room);

  const entitySquare = (member: Member.FrontInstance) => (
    <Box key={member.uid} style={{ marginBottom: "1em" }}>
      <Text>{member.name} {member.uid === room.adminId ? 'ADMIN' : ''}</Text>
      <Text>{member.uid}</Text>
      <Text>Weapon: {room.weapons[member.uid] != undefined ? room.weapons[member.uid] : <GoToButton text='Select Weapon' href='/armory'/>}</Text>
      <Text>Deck: {room.decks[member.uid] != undefined ? 'building ui...' : 'not selected'}</Text>
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