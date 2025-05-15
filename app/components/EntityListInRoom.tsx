import { useAppSelector } from '@/redux/hooks';
import { Box, Flex, Image, Text } from '@chakra-ui/react';
import * as Member from '@/sockets/@types/Member';
import { useAllWeapons } from '@/scripts/customHooks';

const EntityListInRoom = () => {
  const room = useAppSelector((state) => state.socketReducer.room);
  const weapons = useAllWeapons();

  const weaponImage = (weaponId: string) => {
    const weapon = weapons.find((weapon) => weapon.id.toString() === weaponId);

    return (
      <Box style={{ marginBottom: "1em" }}>
        <Image
          src={weapon?.image}
          alt={`image of weapon named ${weapon?.name}`}
          borderRadius='lg'
          height={"100px"}
          width={"100px"}
        />
      </Box>
    );
  };

  const entitySquare = (member: Member.FrontInstance) => (
    <Box key={member.uid} style={{ marginBottom: "1em" }} border={"1px solid"} borderRadius="lg" padding="1em" borderColor={"profoundgrey.200"}>
      <Text>{member.name} {member.uid === room.adminId ? 'ADMIN' : ''}</Text>
      <Text>{member.uid.slice(0, 6) + "..." + member.uid.slice(-4)}</Text>
      {weaponImage(room.weapons[member.uid])}
    </Box>
  );

  return (
    <Box>
      <Text>Entities</Text>
      <Flex
        direction={"row"}
        wrap={"wrap"}
        gap={4}
        alignItems={"center"}
      >
        {room.members?.map((member) => (
          entitySquare(member)
        ))}
      </Flex>
    </Box>
  );
}

export default EntityListInRoom;