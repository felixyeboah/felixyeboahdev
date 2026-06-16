import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader } from "next/font/google";
import { Clock } from "@/components/clock";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";
import Link from "next/link";

const ibmMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const SITE_URL = "https://felixyeboah.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Felix Yeboah — Software Developer",
    template: "%s | Felix Yeboah",
  },
  description:
    "A software developer building functional, beautiful interfaces and experiences for the web and mobile.",
  keywords: [
    "Felix Yeboah",
    "Software Developer",
    "Frontend Engineer",
    "Web Developer",
    "Next.js",
    "React",
    "UI Design",
  ],
  authors: [{ name: "Felix Yeboah" }],
  creator: "Felix Yeboah",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "Felix Yeboah — Software Developer",
    description:
      "A software developer building functional, beautiful interfaces and experiences for the web and mobile.",
    siteName: "Felix Yeboah",
  },
  twitter: {
    card: "summary_large_image",
    title: "Felix Yeboah — Software Developer",
    description:
      "A software developer building functional, beautiful interfaces and experiences for the web and mobile.",
    creator: "@sudocode_",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':(window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ibmMono.variable} ${newsreader.variable}`}
    >
      <body className="min-h-screen max-w-2xl mx-auto px-6 font-mono antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <header className="flex items-center justify-between pt-10 pb-16">
          <Link
            href="/"
            className="font-semibold tracking-tight transition-colors hover:text-accent"
          >
            Felix Yeboah
          </Link>
          <div className="flex items-center gap-4 text-sm text-foreground/50">
            <Clock />
            <ThemeToggle />
          </div>
        </header>
        {children}
        <footer className="border-t border-foreground/10 py-8 text-xs text-foreground/40">
          <span>© {new Date().getFullYear()} Felix Yeboah</span>
        </footer>
      </body>
    </html>
  );
}
