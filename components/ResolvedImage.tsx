'use client';

import { resolveImageUrl } from '@/scripts/utils';
import { Image, ImageProps, Skeleton, Box, Flex, Spinner } from '@chakra-ui/react'
import { useEffect, useState, forwardRef, ForwardedRef } from 'react';

interface ResolvedImageProps extends Omit<ImageProps, 'src'> {
  image: string;
  showLoadingIndicator?: boolean;
}

/// Important: this component resolves the image URL based on the provided image string.
/// It is expected that the image string is a path or URL in the image props not the src prop.
const ResolvedImage = forwardRef(
  ({ 
    image, 
    alt = "Resolved Image", 
    showLoadingIndicator = true,
    ...props 
  }: ResolvedImageProps, ref: ForwardedRef<HTMLImageElement>) => {
    const [resolvedImageUrl, setResolvedImageUrl] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // resolve the image URL based on the weapon's image property
    useEffect(() => {
      const resolve = async () => {
        try {
          setIsLoading(true);
          setHasError(false);
          const resolvedImage = await resolveImageUrl(image);
          setResolvedImageUrl(resolvedImage);
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to resolve image URL:", error);
          setHasError(true);
          setIsLoading(false);
        }
      }
      
      if (image) {
        resolve();
      } else {
        setIsLoading(false);
        setHasError(true);
      }
    }, [image]);

    // Handle image load error
    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    // If we're still resolving the URL or the image is loading
    if (isLoading && showLoadingIndicator) {
      return (
        <Flex 
          align="center" 
          justify="center" 
          width={props.width || props.boxSize || "100%"}
          height={props.height || props.boxSize || "100%"}
          bg="blackAlpha.300"
          borderRadius={props.borderRadius}
        >
          <Spinner size="sm" color="whiteAlpha.700" />
        </Flex>
      );
    }

    // If there's an error or no image provided
    if (hasError) {
      return (
        <Flex
          align="center"
          justify="center"
          width={props.width || props.boxSize || "100%"}
          height={props.height || props.boxSize || "100%"}
          bg="blackAlpha.300"
          borderRadius={props.borderRadius}
          p={2}
          textAlign="center"
          color="whiteAlpha.700"
          fontSize="sm"
        >
          {alt}
        </Flex>
      );
    }

    // If we have a resolved URL, render the image
    return (
      <Image
        src={resolvedImageUrl}
        alt={alt}
        ref={ref}
        onError={handleError}
        {...props}
      />
    );
  }
);

// Add display name for better debugging experience
ResolvedImage.displayName = 'ResolvedImage';

export default ResolvedImage;