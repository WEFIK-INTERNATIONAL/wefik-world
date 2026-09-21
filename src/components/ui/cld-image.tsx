'use client';

import { CldImage as NextCldImage, CldImageProps } from 'next-cloudinary';

/**
 * Re-export base CldImage for direct use
 */
export { NextCldImage as CldImage };

/**
 * CloudinaryProductImage
 * Optimized image component for digital product mockups, thumbnails, and preview screenshots.
 * Automatically applies auto-format (f_auto) and auto-quality (q_auto) to ensure fast load times.
 */
export function CloudinaryProductImage({
  src,
  alt,
  width = 600,
  height = 400,
  className,
  priority = false,
  crop = {
    type: 'auto',
    source: true,
  },
  ...props
}: Omit<CldImageProps, 'alt'> & { alt: string }) {
  // If src is an external URL that is not a Cloudinary public ID, we can still deliver via fetch or fallback
  return (
    <NextCldImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      crop={crop}
      {...props}
    />
  );
}
