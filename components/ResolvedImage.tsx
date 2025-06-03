'use client';

import { resolveImageUrl } from '@/scripts/utils';
import { Image, ImageProps } from '@chakra-ui/react'
import { useEffect, useState, forwardRef, ForwardedRef } from 'react';

interface ResolvedImageProps extends Omit<ImageProps, 'src'> {
  image: string;
}

/// Important: this component resolves the image URL based on the provided image string.
/// It is expected that the image string is a path or URL in the image props not the src prop.
const ResolvedImage = forwardRef(
  ({ image, alt = "Resolved Image", ...props }: ResolvedImageProps, ref: ForwardedRef<HTMLImageElement>) => {
    const [resolvedImageUrl, setResolvedImageUrl] = useState("");

    // resolve the image URL based on the weapon's image property
    useEffect(() => {
      const resolve = async () => {
        const resolvedImage = await resolveImageUrl(image);
        setResolvedImageUrl(resolvedImage);
      }
      if (image) {
        resolve();
      }
    }, [image]);

    return (
      <Image
        src={resolvedImageUrl}
        alt={alt}
        ref={ref}
        {...props}
      />
    );
  }
);

// Add display name for better debugging experience
ResolvedImage.displayName = 'ResolvedImage';

export default ResolvedImage;