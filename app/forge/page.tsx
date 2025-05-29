'use client'

import { useEffect, useRef, useState } from 'react';
import styles from '../page.module.css';
import { Flex, Select } from '@chakra-ui/react';
import { CanvasDataChangeParams, CanvasInfoChangeParams, Dotting, DottingRef, PixelModifyItem, useDotting, useHandlers } from 'dotting';
import ToolBar from './components/ToolBar';
import ColorAndPreviewBar from './components/ColorAndPreviewBar';

export default function Page() {
  const dottingRef = useRef<DottingRef>(null);
  const {
    getBackgroundCanvas,
    convertWorldPosToCanvasOffset,
    getForegroundCanvas,
  } = useDotting(dottingRef);
  const {
    // addCanvasElementEventListener,
    // removeCanvasElementEventListener,
    addDataChangeListener,
    removeDataChangeListener,
    addCanvasInfoChangeEventListener,
    removeCanvasInfoChangeEventListener,
  } = useHandlers(dottingRef);
  const [characterImage, setCharacterImage] = useState<"NONE" | "BACKGROUND" | "FORGROUND">("NONE");

  const [testImage, setTestImage] = useState<string | null>(null);

  const CreateEmptySquareData = (
    size: number,
  ): Array<Array<PixelModifyItem>> => {
    const data: Array<Array<PixelModifyItem>> = [];
    for (let i = 0; i < size; i++) {
      const row: Array<PixelModifyItem> = [];
      for (let j = 0; j < size; j++) {
        row.push({ rowIndex: i, columnIndex: j, color: "" });
      }
      data.push(row);
    }
    return data;
  };

  useEffect(() => {
    const renderer = ({
      topLeftCornerOffset,
      gridSquareSize,
    }: CanvasInfoChangeParams) => {
      // clear the canvas at the beginning
      const foregroundCanvas = getForegroundCanvas();
      const foregroundCtx = foregroundCanvas.getContext("2d");
      if (foregroundCtx) {
        foregroundCtx.clearRect(0, 0, foregroundCanvas.width, foregroundCanvas.height);
      }
      const backgroundCanvas = getBackgroundCanvas();
      const backgroundCtx = backgroundCanvas.getContext("2d");
      if (backgroundCtx) {
        backgroundCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
      }
      console.log(characterImage)
      // Don't render anything if set to NONE
      if (characterImage === "NONE" || characterImage === undefined || characterImage.length == 0) {
        return;
      }
      // Choose which canvas to use based on the state
      const canvas = characterImage === "BACKGROUND"
        ? getBackgroundCanvas()
        : getForegroundCanvas();

      const width = canvas.width;
      const height = canvas.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imgUrl = "/img/characters/basic_mage.png";
      const img = new Image();
      img.src = imgUrl;
      const imageWorldPosX = 0;
      const imageWorldPosY = 0;

      const { x, y } = convertWorldPosToCanvasOffset(
        imageWorldPosX,
        imageWorldPosY,
      );

      const imageWidth = gridSquareSize * 35;
      const imageHeight = gridSquareSize * 35;

      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, x, y, imageWidth, imageHeight);
      };
    };

    addCanvasInfoChangeEventListener(renderer);
    return () => {
      removeCanvasInfoChangeEventListener(renderer);
    };
  }, [
    characterImage,  // Add characterImage as a dependency
    getForegroundCanvas,
    getBackgroundCanvas,
    addCanvasInfoChangeEventListener,
    removeCanvasInfoChangeEventListener,
    convertWorldPosToCanvasOffset,
  ]);

  useEffect(() => {
    const handleDataChange = ({ isLocalChange, data, layerId, delta }: CanvasDataChangeParams) => {
      setTestImage(dottingDataToPng(data, 35));
    };

    addDataChangeListener(handleDataChange);
    return () => {
      // Cleanup the listener when the component unmounts
      removeDataChangeListener(handleDataChange);
    };
  }, [addDataChangeListener, removeDataChangeListener]);

  // Handle mouse move events to update the dotting data
  // useEffect(() => {
  //   const handleMouseMove = () => {
  //   };

  //   addCanvasElementEventListener("mousemove", handleMouseMove);
  //   return () => {
  //     removeCanvasElementEventListener("mousemove", handleMouseMove);
  //   };
  // }, []);

  const dottingDataToPng = (dottingData: Map<number, Map<number, { color: string }>>, pixelSize = 1): string => {
    // Get the bounds
    const rows = Array.from(dottingData.keys());
    const cols = Array.from(
      new Set(rows.flatMap(row => Array.from(dottingData.get(row)?.keys() ?? [])))
    );
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);

    const width = (maxCol - minCol + 1) * pixelSize;
    const height = (maxRow - minRow + 1) * pixelSize;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    for (let row = minRow; row <= maxRow; row++) {
      const colMap = dottingData.get(row);
      if (!colMap) continue;
      for (let col = minCol; col <= maxCol; col++) {
        const pixel = colMap.get(col);
        if (pixel && pixel.color && pixel.color !== 'transparent' && pixel.color !== '') {
          ctx.fillStyle = pixel.color;
          ctx.fillRect(
            (col - minCol) * pixelSize,
            (row - minRow) * pixelSize,
            pixelSize,
            pixelSize
          );
        }
      }
    }

    // Export as PNG data URL
    return canvas.toDataURL('image/png');
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Forge</h1>
      <Flex
        direction="row"
        alignItems="center"
        justifyContent="center"
        gap={10}
        bg={"blue"}
      >
        <ToolBar dottingRef={dottingRef} />
        <Flex
          direction="column"
          // alignItems="center"
          // justifyContent="center"
          bg={"green"}
        >
          <Dotting
            ref={dottingRef}
            width={500}
            height={500}
            isGridFixed={true}
            defaultPixelColor="transparent"
            initLayers={[
              {
                id: "layer1",
                data: CreateEmptySquareData(35),
              }
            ]}
          />
          <Flex justifyContent="center" marginTop={4} marginBottom={4} alignItems={"center"} gap={2}>
            <Select
              maxWidth={"fit-content"}
              placeholder='Select character option'
              onChange={(e) => setCharacterImage(e.target.value as "NONE" | "BACKGROUND" | "FORGROUND")}
              value={characterImage}
              defaultValue={"NONE"}
            >
              <option value='NONE'>None</option>
              <option value='BACKGROUND'>Background</option>
              <option value='FORGROUND'>Forground</option>
            </Select>
          </Flex>
        </Flex>
        <ColorAndPreviewBar createdImage={testImage} dottingRef={dottingRef} />
      </Flex>
    </main>
  );
};