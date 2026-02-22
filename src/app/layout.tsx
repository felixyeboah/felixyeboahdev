import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Clock } from "@/components/clock";
import "./globals.css";
import Link from "next/link";

const ibmMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://felixyeboah.com"), // Update this to your actual domain
  title: {
    default: "Felix Yeboah — Software Developer",
    template: "%s | Felix Yeboah",
  },
  description: "A software developer building functional, beautiful interfaces and experiences for the web and mobile.",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://felixyeboah.dev",
    title: "Felix Yeboah — Software Developer",
    description: "A software developer building functional, beautiful interfaces and experiences for the web and mobile.",
    siteName: "Felix Yeboah",
  },
  twitter: {
    card: "summary_large_image",
    title: "Felix Yeboah — Software Developer",
    description: "A software developer building functional, beautiful interfaces and experiences for the web and mobile.",
    creator: "@sudocode_", // Update to your Twitter handle
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`min-h-screen ${ibmMono.variable}`}>
      <body className={`${ibmMono.className} antialiased max-w-2xl mx-auto px-6`}>
        <nav className="flex justify-between items-center pt-10 pb-16">
          <Link href="/" className="font-semibold">Felix Yeboah</Link>
          <Clock />
        </nav>
        {children}
      </body>
    </html>
  );
}
