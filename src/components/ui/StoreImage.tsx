import Image, { ImageProps } from "next/image";

function isRemoteSrc(src: ImageProps["src"]) {
  return typeof src === "string" && /^https?:\/\//.test(src);
}

export function StoreImage({ src, unoptimized, ...props }: ImageProps) {
  return (
    <Image
      src={src}
      unoptimized={unoptimized ?? isRemoteSrc(src)}
      {...props}
    />
  );
}
