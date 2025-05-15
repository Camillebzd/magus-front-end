import { useAppSelector } from '@/redux/hooks';
import { Box, Text, Image, Flex } from '@chakra-ui/react';
import * as Monster from '@/sockets/@types/Monster';
import { useMonstersWorld } from '@/scripts/customHooks';

const MonsterListInRoom = () => {
  const room = useAppSelector((state) => state.socketReducer.room);
  const member = useAppSelector((state) => state.socketReducer.member);
  const monsters = useMonstersWorld();

  const entitySquare = (monsterInstance: Monster.Instance) => {
    const monster = monsters.find((monster) => monster.id === monsterInstance.id);

    return (
      <Box key={monsterInstance.uid} style={{ marginBottom: "1em" }} border={"1px solid"} borderRadius="lg" padding="1em" borderColor={"profoundgrey.200"}>
        <Text>{monster?.name}</Text>
        <Text>{monsterInstance.uid.slice(0, 6) + "..." + monsterInstance.uid.slice(-4)}</Text>
        <Box style={{ marginBottom: "1em" }}>
          <Image
            src={`/img/monsters/${monster?.image}`}
            alt={`image of monster named ${monster?.name}`}
            borderRadius='lg'
            height={"100px"}
            width={"100px"}
          />
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Text>Monsters</Text>
      <Flex
        direction={"row"}
        wrap={"wrap"}
        gap={4}
        alignItems={"center"}
      >
        {room.monsters.length > 0 ?
          room.monsters?.map((monster) => (
            entitySquare(monster)
          ))
          :
          room.adminId === member.uid ? <Text>Select monsters bellow</Text> : <Text>Wait for admin to select monsters...</Text>
        }
      </Flex>
    </Box>
  );
}

export default MonsterListInRoom;