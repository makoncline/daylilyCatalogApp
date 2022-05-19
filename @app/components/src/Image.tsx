import type { ImageProps } from "next/image";
import { default as NextImage } from "next/image";
import React from "react";

const S3_BUCKET_HOST_NAMES = [
  "daylily-catalog-images-stage.s3.amazonaws.com",
  "daylily-catalog-images.s3.amazonaws.com",
];
const RESIZED_IMAGES_BUCKET_HOST_NAME = "images-stage.daylilycatalog.com";

function Image({
  src,
  thumb = false,
  ...props
}: ImageProps & {
  thumb?: boolean;
}) {
  const [main, setMain] = React.useState(src);
  const [placeholder, setPlaceholder] = React.useState<string | null>(null);
  const [isError, setIsError] = React.useState(false);
  const { hostname, pathname } = new URL(src);
  if (S3_BUCKET_HOST_NAMES.includes(hostname) && !isError && main === src) {
    const filePathNoExt =
      pathname.substr(0, pathname.lastIndexOf(".")) || pathname;
    const srcs = {
      placeholder: `https://${RESIZED_IMAGES_BUCKET_HOST_NAME}${filePathNoExt}-placeholder.webp`,
      thumb: `https://${RESIZED_IMAGES_BUCKET_HOST_NAME}${filePathNoExt}-thumb.webp`,
      full: `https://${RESIZED_IMAGES_BUCKET_HOST_NAME}${filePathNoExt}.webp`,
    };
    setMain(thumb ? srcs.thumb : srcs.full);
    setPlaceholder(srcs.placeholder);
  }
  function handleError() {
    if (main !== src) {
      console.log("Error loading resized image, falling back to original");
      setIsError(true);
      setMain(src);
      setPlaceholder(null);
    }
  }
  return (
    <NextImage
      src={main}
      placeholder={placeholder ? "blur" : undefined}
      blurDataURL={placeholder ? placeholder : undefined}
      onError={handleError}
      {...props}
    />
  );
}

export { Image };
