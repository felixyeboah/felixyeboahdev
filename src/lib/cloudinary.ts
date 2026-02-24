/**
 * Cloudinary URL builder for blog images.
 * Public IDs from MDX (e.g. "blog/1_LyZcwuLWv2FArOumCxobpA") are resolved to full Cloudinary URLs.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "felixyeboah";

export type CloudinaryTransformations = {
  width?: number;
  height?: number;
  quality?: "auto" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  crop?: string;
};

/**
 * Build a Cloudinary delivery URL from a public ID.
 * @param publicId - Cloudinary public ID (e.g. "blog/1_LyZcwuLWv2FArOumCxobpA")
 * @param options - Optional transformations
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformations = {}
): string {
  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "limit",
  } = options;

  const parts: string[] = [];

  if (quality === "auto") parts.push("q_auto");
  else if (typeof quality === "number") parts.push(`q_${quality}`);

  if (format === "auto") parts.push("f_auto");
  else parts.push(`f_${format}`);

  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (width || height) parts.push(`c_${crop}`);

  const transformations = parts.length > 0 ? parts.join(",") + "/" : "";
  const base = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

  return `${base}/${transformations}${publicId}`;
}

/**
 * Check if a src value is a Cloudinary public ID (not a full URL or local path).
 */
export function isCloudinaryPublicId(src: string): boolean {
  return (
    !!src &&
    !src.startsWith("http") &&
    !src.startsWith("/") &&
    !src.startsWith(".")
  );
}
