import { CheckIcon, CopyIcon } from "@chakra-ui/icons";
import { Box, Button, Code, Flex, useToast } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useState } from "react";

const CopyableField = ({ text }: { text: string }) => {
  const toast = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (codeText: string, setIsCopied: Dispatch<SetStateAction<boolean>>) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setTimeout(() => setIsCopied(false), 2000); // Reset "Copied" state after 2 seconds
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <Flex direction="row" alignItems="center">
      <Box overflowX="auto" maxWidth="100%">
        <Code
          p={2}
          display="inline-block"
          whiteSpace="pre-wrap"
          borderRightRadius="0"  // Remove right border radius
          border="1px solid"  // Add border to match button
          borderColor="gray.200"
          height='auto'
        >
          {text}
        </Code>
      </Box>
      <Button
        onClick={() => handleCopy(text, setIsCopied)}
        colorScheme="teal"
        variant="solid"
        borderLeftRadius="0"  // Remove left border radius
        p={3}
        border="1px solid"
        borderColor="gray.200"
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </Flex>

  );
}

export default CopyableField;