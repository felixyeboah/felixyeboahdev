const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "jaeyholic";

function isCloudinaryPublicId(src: string): boolean {
  return (
    !!src &&
    !src.startsWith("http") &&
    !src.startsWith("/") &&
    !src.startsWith(".")
  );
}

type LoaderProps = { src: string; width: number; quality?: number };

/**
 * Next.js Image loader for Cloudinary. Configured globally in next.config.
 * For Cloudinary public IDs: builds URL with fl_lossy,f_auto,q_auto.
 * For full URLs: returns as-is.
 */
export default function cloudinaryLoader({ src, width, quality }: LoaderProps): string {
  if (!isCloudinaryPublicId(src)) return src;
  const base = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
  const params = ["fl_lossy", "f_auto", quality != null ? `q_${quality}` : "q_auto", `w_${width}`];
  return `${base}/${params.join(",")}/${src}`;
}
