'use client'

import { Box, Image } from '@chakra-ui/react';

const MultipleImages = ({ height, width, images }: { height: number, width: number, images: string[] }) => {
  return (
    <Box position="relative" height={height} width={width}>
      {images.map((image, index) => (
        <Image
          key={index}
          src={image}
          alt={"Image"}
          height={height}
          width={width}
          position="absolute"
          top={0}
          left={0}
          pointerEvents="none"
        />
      ))}
    </Box>
  );
}

export default MultipleImages;