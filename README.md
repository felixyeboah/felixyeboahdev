This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## OG Image Generation

This project includes a system for pre-generating Open Graph (OG) images for blog posts. This approach offers several advantages:

- Better performance since images are pre-generated at build time
- No runtime dependencies on the Edge runtime during page loads
- Reliable image serving - no more failures during loading
- Improved SEO as the images are always available
- Faster page loads since images are served as static files

### Generating OG Images

To generate OG images for your blog posts, run:

```bash
# Start the development server first (in a separate terminal)
npm run dev

# Then generate the OG images
npm run generate-og
```

This will:
1. Read all MDX files in the content/blog directory
2. Generate a unique hashed image for each blog post based on its title, subtitle, and cover image
3. Store the images in the public/static/og directory
4. Create a mapping file (og-mapping.json) that links each blog post slug to its OG image

### Command Options

The OG image generator supports various options:

```bash
# Generate test images even if no blog posts exist
npm run generate-og -- --test

# Force regeneration of all images
npm run generate-og -- --force

# Generate OG images for only the first 5 posts
npm run generate-og -- --limit=5

# Show help
npm run generate-og -- --help
```

### Previewing OG Images

To preview the generated OG images, visit:

- [http://localhost:3000/og-static-preview](http://localhost:3000/og-static-preview) - View all pre-generated OG images
- [http://localhost:3000/og-preview](http://localhost:3000/og-preview) - Dynamic OG image preview tool

### Building with OG Images

To build your site with pre-generated OG images:

```bash
npm run build:with-og
```

This command will generate the OG images first and then build the Next.js application.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
