import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.felixyeboah.dev',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'felixyeboah.dev',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'pbs.twimg.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 't.co',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'utfs.io',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i.imgur.com',
                pathname: '**',
            },
        ],
    },
    /* page CSS (styles/pages) and post content are read with fs at build time */
    outputFileTracingIncludes: { '/**': ['./styles/pages/**', './content/**'] },
    async redirects() {
        const renamed: Record<string, string> = {
            'miss-cookie': 'miss-cookie-spices',
            dnaweds: 'desmond-weds-akyeamaa',
            'seven-sports': '7even-sports-group',
            drobotix: 'drobotix',
            dronehub: 'dronehub',
            undisciplined: 'undisciplined',
        };
        return [
            { source: '/blog', destination: '/writing', permanent: true },
            {
                source: '/blog/why-i-built-primeflow-a-developers-reaction-to-a-real-problem',
                destination: '/writing/why-i-built-reevit',
                permanent: true,
            },
            { source: '/blog/:slug', destination: '/writing/:slug', permanent: true },
            /* previous felixyeboah.dev routes */
            { source: '/docs/:slug', destination: '/writing/:slug', permanent: true },
            { source: '/case-studies', destination: '/work', permanent: true },
            ...Object.entries(renamed).map(([from, to]) => ({
                source: `/case-studies/${from}`,
                destination: `/work/${to}`,
                permanent: true,
            })),
            { source: '/case-studies/:slug', destination: '/work', permanent: false },
        ];
    },
    typescript: {
        ignoreBuildErrors: true
    }
};

export default nextConfig;
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
