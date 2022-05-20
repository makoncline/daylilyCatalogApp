import type { ImageProps } from "next/image";
import { default as NextImage } from "next/image";
import React from "react";

const S3_BUCKET_HOST_NAMES = [
  "daylily-catalog-images-stage.s3.amazonaws.com",
  "daylily-catalog-images.s3.amazonaws.com",
];

function Image({
  src: originalSrc,
  thumb = false,
  ...props
}: ImageProps & {
  thumb?: boolean;
}) {
  const { hostname, pathname } = new URL(originalSrc);
  const filePathNoExt =
    pathname.substr(0, pathname.lastIndexOf(".")) || pathname;
  const base = `https://${process.env.S3_RESIZED_IMAGE_BUCKET}${filePathNoExt}`;
  const ext = `.webp`;
  const srcs = {
    placeholder: `${base}-placeholder${ext}`,
    thumb: `${base}-thumb${ext}`,
    full: `${base}${ext}`,
  };
  const resizedImage = thumb ? srcs.thumb : srcs.full;
  const shouldUseResizedImage = S3_BUCKET_HOST_NAMES.includes(hostname);
  const [src, setSrc] = React.useState(
    shouldUseResizedImage ? resizedImage : originalSrc
  );
  const [placeholder, setPlaceholder] = React.useState<string | null>(
    shouldUseResizedImage ? srcs.placeholder : null
  );

  function handleError() {
    if (src !== originalSrc) {
      console.log(
        `Error loading resized image, falling back to original. ${src}`
      );
      setSrc(originalSrc);
      setPlaceholder(null);
    }
  }
  return (
    <NextImage
      src={src}
      placeholder={placeholder ? "blur" : undefined}
      blurDataURL={placeholder ? placeholder : undefined}
      onError={handleError}
      {...props}
    />
  );
}

export { Image };
