import { Flex, Grid, GridItem, Button } from "@chakra-ui/react";
import { BrushTool, DottingRef, useBrush, useDotting } from "dotting";
import { FaCircle, FaPen, FaRegCircle } from "react-icons/fa";
import { BsEraserFill } from "react-icons/bs";
import { TbLine, TbArrowBackUp, TbArrowForwardUp } from "react-icons/tb";
import { PiPaintBucketFill, PiRectangle, PiRectangleDashed, PiRectangleFill } from "react-icons/pi";
import { RefObject } from "react";
import { RiDeleteBin5Fill } from "react-icons/ri";

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
  } = useDotting(dottingRef);

  return (
    <Flex justifyContent="center">
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
      </Grid>
    </Flex>
  );
}

export default ToolBar;