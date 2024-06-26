import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Suspense } from "react";
import { FacebookProvider } from "@/app/providers";
import { Toaster } from "react-hot-toast";
import { AxiomWebVitals } from "next-axiom";
import HeaderBar from "@/components/common/HeaderBar";
import { Metadata } from "next";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Social Media Post Management For Everyone | SocialQueue.ai",
  description:
    "An open source tool that makes it easier for you to upload your content to every social media platform out there.",
  cardImage: "/opengraph-image.png",
  robots: "follow, index",
  favicon: "/favicon.ico",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: metadata.title,
    description: metadata.description,
    referrer: "origin-when-cross-origin",
    keywords: [
      "Social media",
      "social media management",
      "social media marketing",
      "social media management software",
    ],
    authors: [
      {
        name: "SocialQueue.ai",
        url: "https://socialqueue.ai/",
      },
    ],
    creator: "SocialQueue.ai",
    publisher: "SocialQueue.ai",
    robots: metadata.robots,
    icons: { icon: metadata.favicon },
    metadataBase: metadata.metadataBase,
    openGraph: {
      url: metadata.metadataBase,
      title: metadata.title,
      description: metadata.description,
      images: [metadata.cardImage],
      type: "website",
      siteName: metadata.title,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <AxiomWebVitals />
      <Suspense>
        <FacebookProvider />
      </Suspense>
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center">
          <HeaderBar />
          {children}
          <Toaster />
        </main>
      </body>
    </html>
  );
}
