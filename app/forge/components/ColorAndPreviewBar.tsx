import MultipleImages from "@/components/MultipleImages";
import { Flex, Text } from "@chakra-ui/react";
import { DottingRef, useBrush } from "dotting";
import { RefObject, useEffect, useState } from "react";
import { SketchPicker } from "react-color";

const ColorAndPreviewBar = ({
  createdImage,
  dottingRef,
}: {
  createdImage: string | null;
  dottingRef: RefObject<DottingRef>
}) => {
  const { brushColor, changeBrushColor } = useBrush(dottingRef);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Flex justifyContent="center" bg={"red"} direction={"column"} gap={4} height={"100%"}>
      {mounted && <SketchPicker
        color={brushColor}
        onChangeComplete={(color) => changeBrushColor(color.hex)}
      />}
      <Flex justifyContent="center" gap={2} direction={"column"} alignItems={"center"}>
        <Text fontWeight={'bold'}>Preview</Text>
        <MultipleImages
          height={200}
          width={200}
          images={[
            createdImage || "",
            "/img/characters/basic_mage.png",
          ]}
        />
      </Flex>
    </Flex>
  );
}

export default ColorAndPreviewBar;