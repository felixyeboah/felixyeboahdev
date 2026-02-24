import Image from "next/image";

type CloudinaryImageProps = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
};

/**
 * MDX Image component. Uses the global Cloudinary loader (fl_lossy, f_auto, q_auto)
 * for public IDs; full URLs pass through unchanged.
 * Use in MDX like: <Image src="blog/1_LyZcwuLWv2FArOumCxobpA" alt="..." width={600} height={379} />
 */
export function CloudinaryImage({
  src,
  alt = "Blog image",
  width = 600,
  height = 379,
  className = "my-8 w-full rounded-xl border border-foreground/10",
}: CloudinaryImageProps) {
  const w = typeof width === "number" ? width : Number(width) || 600;
  const h = typeof height === "number" ? height : Number(height) || 379;

  return (
    <Image
      src={src}
      alt={alt}
      width={w}
      height={h}
      className={className}
      sizes="(max-width: 768px) 100vw, 600px"
    />
  );
}
