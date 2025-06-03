'use client'

import { Box, BoxProps, ResponsiveValue } from '@chakra-ui/react';
import ResolvedImage from './ResolvedImage';
import { forwardRef, ForwardedRef } from 'react';

interface MultipleImagesProps extends BoxProps {
  images: string[];
  imageHeight?: ResponsiveValue<number | string>;
  imageWidth?: ResponsiveValue<number | string>;
}

const MultipleImages = forwardRef(
  ({
    images,
    height,
    width,
    imageHeight,
    imageWidth,
    ...props 
  }: MultipleImagesProps, 
  ref: ForwardedRef<HTMLDivElement>
  ) => {
    // Helper function to get size for a specific image index
    const getSizeForIndex = (
      sizesProp: ResponsiveValue<number | string> | undefined, 
      index: number, 
      defaultSize: ResponsiveValue<number | string> | undefined
    ): number | string | undefined => {
      if (Array.isArray(sizesProp)) {
        // If array provided, use the value at index or last value if index out of bounds
        const value = index < sizesProp.length ? sizesProp[index] : sizesProp[sizesProp.length - 1];
        return value === null ? undefined : value;
      }
      // If single value, use it for all images
      return sizesProp as number | string | undefined || (defaultSize as number | string | undefined);
    };
    
    return (
      <Box 
        position="relative" 
        height={height}
        width={width}
        ref={ref}
        {...props}
      >
        {images.map((image, index) => {
          // Get height and width for this specific image
          const imgHeight = getSizeForIndex(imageHeight, index, height);
          const imgWidth = getSizeForIndex(imageWidth, index, width);
          
          return (
            <ResolvedImage
              key={index}
              image={image}
              alt={`Image ${index + 1}`}
              height={imgHeight}
              width={imgWidth}
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              pointerEvents="none"
            />
          );
        })}
      </Box>
    );
  }
);

// Add display name for better debugging experience
MultipleImages.displayName = 'MultipleImages';

export default MultipleImages;