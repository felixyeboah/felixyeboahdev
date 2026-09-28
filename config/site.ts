export type SiteConfig = {
  name: string;
  title: string;
  titleAlt: string; // Used for schema.org JSONLD
  description: string;
  url: string; // Domain without trailing slash
  siteUrl: string; // Domain with trailing slash
  siteLanguage: string;
  logo: string; // Used for schema.org JSONLD
  ogImage: string; // Open Graph image // Recommended size 1200x630 (will be used fallback on blog posts)
  favicon: string; // Manifest favicon generation
  shortName: string; // Shortname for manifest, must be shorter than 12 characters
  author: string; // Author for schema.org JSONLD
  keywords: string[];
  themeColor: string;
  backgroundColor: string;
  twitterHandle: string; // Twitter Username without @
  twitter: string; // Twitter Username with @
  twitterCardType: 'summary' | 'summary_large_image';
  twitterDesc: string;
};

export const siteConfig: SiteConfig = {
  name: 'Felix Yeboah',
  title: 'Felix Yeboah',
  titleAlt: 'Felix Yeboah | Portfolio',
  description:
    "Hi I'm Felix, A self-taught Software Engineer and UI/UX Designer from Accra, Ghana. I learn, build and share my knowledge with the world. I'm passionate about building quality software that makes the world a better place.",
  url: 'https://felixyeboah.dev',
  siteUrl: 'https://felixyeboah.dev/',
  siteLanguage: 'en',
  logo: '/static/logo/logo.png', // Path is relative to the public directory
  ogImage: '/opengraph-image', // Updated to use the file-based OG image
  favicon: '/static/favicon.png', // Path is relative to the public directory
  shortName: 'FelixYeboah',
  author: 'Felix Yeboah',
  keywords: [
    'Software Engineer',
    'Go',
    'React',
    'Typescript',
    'VueJS',
    'Remix',
    'Docker',
    'Entreprise',
    'Frontend',
    'Engineering',
    'Blog',
    'NextJS',
    'Python',
  ],
  themeColor: '#000000',
  backgroundColor: '#ffffff',
  twitterHandle: 'sudocode_',
  twitter: '@sudocode_',
  twitterCardType: 'summary_large_image',
  twitterDesc:
    'Helping people make the world a better place through quality software.',
}; 