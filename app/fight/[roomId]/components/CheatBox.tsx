import { Box, Flex, Text, Switch, Button } from "@chakra-ui/react";
import { useSocket } from "@/sockets/socketContext";
import Draggable from "react-draggable";
import { SetStateAction, useEffect, useState, useRef } from "react";
import { Weapon } from "@/scripts/entities";

const CheatBox = ({ weapon, setInfo }: { weapon: Weapon; setInfo: (value: SetStateAction<string[]>) => void }) => {
  const socket = useSocket();
  const [cheatStates, setCheatStates] = useState<{ [name: string]: boolean }>({
    immunity: false,
    immortality: false,
  });

  // Create a ref for the draggable container
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleCheatResponse = (cheatcode: string) => {
      console.log("cheatcode", cheatcode);

      if (cheatStates[cheatcode] !== undefined) {
        setCheatStates((prevState) => ({
          ...prevState,
          [cheatcode]: !prevState[cheatcode],
        }));
      }

      setInfo((currentInfo) => {
        const newInfo = [...currentInfo];
        newInfo.push(`------ cheatcode ${cheatcode} ------`);
        return newInfo;
      });

      weapon?.triggerCheatCode(cheatcode);
    };

    // Attach the listener
    socket.on("cheatcodeTriggered", handleCheatResponse);

    // Cleanup the listener on unmount
    return () => {
      socket.off("cheatcodeTriggered");
    };
  }, [socket, setInfo, weapon, cheatStates]);

  const cheatToggle = (cheatcode: string, title: string) => (
    <Flex align="center" gap={2}>
      <Text>{title}</Text>
      <Switch
        isChecked={cheatStates[cheatcode]} // Reflect the current state
        onChange={() => socket.emit("triggerCheatcode", cheatcode)} // Toggle the state
        colorScheme="teal"
      />
    </Flex>
  );

  const cheatButton = (cheatcode: string, title: string) => (
    <Button onClick={() => socket.emit("triggerCheatcode", cheatcode)} colorScheme="teal" size="sm">
      {title}
    </Button>
  );

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle">
      <Box
        ref={nodeRef} // Attach the ref to the draggable container
        border={"1px solid"}
        borderColor="profoundgrey.200"
        position="absolute"
        left="38%"
        zIndex="10"
        bg="profoundgrey.400"
        p="4"
        borderRadius="md"
        boxShadow="lg"
      >
        <Box
          className="drag-handle"
          bg="profoundgrey.200"
          p="2"
          borderRadius="md"
          cursor="move"
          mb="4"
        >
          <Text fontWeight="bold" textAlign="center">
            Cheat Board (draggable)
          </Text>
        </Box>
        <Flex direction="column" gap={4}>
          {cheatToggle("immunity", "Immunity")}
          {cheatToggle("immortality", "Immortality")}
          {cheatButton("fullLife", "Full Life")}
        </Flex>
      </Box>
    </Draggable>
  );
};

export default CheatBox;