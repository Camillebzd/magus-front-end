import { Flex, Grid, GridItem, Button } from "@chakra-ui/react";
import { BrushTool, DottingRef, PixelModifyItem, useBrush, useDotting } from "dotting";
import { FaCircle, FaPen, FaRegCircle } from "react-icons/fa";
import { BsEraserFill } from "react-icons/bs";
import { TbLine, TbArrowBackUp, TbArrowForwardUp } from "react-icons/tb";
import { PiPaintBucketFill, PiRectangle, PiRectangleDashed, PiRectangleFill } from "react-icons/pi";
import { RefObject, useRef } from "react";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { HiDownload, HiUpload } from "react-icons/hi";
import { LuMove } from "react-icons/lu";
import { pngToDottingData } from "../dottingUtils";
import ExamplesButton from "./ExamplesButton";

const TOOLS: { info: string, brushTool: BrushTool; icon: JSX.Element }[] = [
  {
    info: 'Dot',
    brushTool: BrushTool.DOT,
    icon: <FaPen style={{ width: '24px', height: '24px' }} />,
  },
  {
    info: 'Ellipse',
    brushTool: BrushTool.ELLIPSE,
    icon: <FaRegCircle style={{ width: '24px', height: '24px' }} />,
  },
  {
    info: 'Ellipse filled',
    brushTool: BrushTool.ELLIPSE_FILLED,
    icon: <FaCircle style={{ width: '24px', height: '24px' }} />,
  },
  {
    info: 'Eraser',
    brushTool: BrushTool.ERASER,
    icon: <BsEraserFill style={{ width: '24px', height: '24px' }} />,
  },
  {
    info: 'Line',
    brushTool: BrushTool.LINE,
    icon: <TbLine style={{ width: '24px', height: '24px' }} />,
  },
  {
    info: 'Paint bucket',
    brushTool: BrushTool.PAINT_BUCKET,
    icon: <PiPaintBucketFill style={{ width: '24px', height: '24px' }} />,
  },
  {
    info: 'Rectangle',
    brushTool: BrushTool.RECTANGLE,
    icon: <PiRectangle style={{ width: '24px', height: '24px' }} />,
  },
  {
    info: 'Rectangle filled',
    brushTool: BrushTool.RECTANGLE_FILLED,
    icon: <PiRectangleFill style={{ width: '24px', height: '24px' }} />,
  },
  {
    info: 'Select',
    brushTool: BrushTool.SELECT,
    icon: <PiRectangleDashed style={{ width: '24px', height: '24px' }} />,
  },
  {
    info: 'Move',
    brushTool: BrushTool.NONE,
    icon: <LuMove style={{ width: '24px', height: '24px' }} />,
  },
];

const ToolBar = ({
  dottingRef,
}: {
  dottingRef: RefObject<DottingRef>
}) => {
  const { brushTool, changeBrushTool } = useBrush(dottingRef);
  const {
    clear,
    undo,
    redo,
    downloadImage,
    setData
  } = useDotting(dottingRef);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePngFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const data = await pngToDottingData(dataUrl, 36, 36);
      console.log(data);
      // Convert Map<Map<{color}>> to PixelModifyItem[][]
      const arrayData: PixelModifyItem[][] = Array.from(data.values()).map(rowMap =>
        Array.from(rowMap.entries()).map(([columnIndex, value]) => ({
          rowIndex: (rowMap as any).rowIndex ?? 0, // fallback if rowIndex is not present
          columnIndex,
          color: value.color,
        }))
      );
      setData(arrayData);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "image/png") {
      handlePngFile(file);
    }
    // Reset input so user can upload the same file again if needed
    e.target.value = "";
  };

  return (
    <Flex justifyContent="center" direction={"column"} alignItems={"center"}>
      <input
        type="file"
        accept="image/png"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={onFileChange}
      />
      <Grid templateColumns="repeat(2, 1fr)" gap={1}>
        <GridItem>
          <Button
            onClick={undo}
            colorScheme="blue"
            variant="outline"
          >
            <TbArrowBackUp style={{ width: '24px', height: '24px' }} />
          </Button>
        </GridItem>
        <GridItem>
          <Button
            onClick={redo}
            colorScheme="blue"
            variant="outline"
          >
            <TbArrowForwardUp style={{ width: '24px', height: '24px' }} />
          </Button>
        </GridItem>
        {TOOLS.map((tool, index) => (
          <GridItem key={index}>
            <Button
              onClick={() => changeBrushTool(tool.brushTool)}
              colorScheme="blue"
              variant={brushTool === tool.brushTool ? "solid" : "outline"}
            >
              {tool.icon}
            </Button>
          </GridItem>
        ))}
        <GridItem colSpan={2}>
          <Button
            onClick={clear}
            colorScheme="red"
            variant="outline"
          >
            <RiDeleteBin5Fill style={{ width: '24px', height: '24px' }} />
          </Button>
        </GridItem>
        <GridItem colSpan={1}>
          <Button
            onClick={() => downloadImage({ isGridVisible: false, type: 'png' })}
            colorScheme="green"
            variant="outline"
          >
            <HiDownload style={{ width: '24px', height: '24px' }} />
          </Button>
        </GridItem>
        <GridItem colSpan={1}>
          <Button
            onClick={uploadImage}
            colorScheme="green"
            variant="outline"
          >
            <HiUpload style={{ width: '24px', height: '24px' }} />
          </Button>
        </GridItem>
      </Grid>
      <ExamplesButton dottingRef={dottingRef} />
    </Flex>
  );
}

export default ToolBar;