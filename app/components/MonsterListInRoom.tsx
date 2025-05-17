import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Box, Text, Image, Flex, CloseButton } from '@chakra-ui/react';
import * as Monster from '@/sockets/@types/Monster';
import { useMonstersWorld } from '@/scripts/customHooks';
import { useState } from 'react';
import { socketActions } from '@/redux/features/socketSlice';

const MonsterListInRoom = () => {
  const room = useAppSelector((state) => state.socketReducer.room);
  const member = useAppSelector((state) => state.socketReducer.member);
  const userId = useAppSelector((state) => state.authReducer.address);
  const dispatch = useAppDispatch();
  const monsters = useMonstersWorld();
  const [hoveredMonsterId, setHoveredMonsterId] = useState<string | null>(null);

  const entitySquare = (monsterInstance: Monster.Instance) => {
    const monster = monsters.find((monster) => monster.id === monsterInstance.id);
    const isHovered = hoveredMonsterId === monsterInstance.uid;

    return (
      <Box
        key={monsterInstance.uid}
        style={{ marginBottom: "1em" }}
        border={"1px solid"}
        borderRadius="lg"
        padding="1em"
        borderColor={"profoundgrey.200"}
        position={"relative"}
        onMouseEnter={() => setHoveredMonsterId(monsterInstance.uid)}
        onMouseLeave={() => setHoveredMonsterId(null)}
      >
        {isHovered && (
          <CloseButton
            borderRadius={"full"}
            position="absolute"
            top="-0.75rem"
            right="-0.75rem"
            size="sm"
            bg={"red.400"}
            _hover={{ bg: "red.500" }}
            onClick={() => {
              if (room.adminId === userId) {
                dispatch(socketActions.removeMonsters([monsterInstance]));
              }
            }}
          />
        )}
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