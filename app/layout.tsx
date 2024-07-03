import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Suspense } from "react";
import { CSPostHogProvider, FacebookProvider } from "@/app/providers";
import { Toaster } from "react-hot-toast";
import { AxiomWebVitals } from "next-axiom";
import HeaderBar from "@/components/common/HeaderBar";
import { Metadata } from "next";
import { getURL } from "@/utils/utils";

const metadata = {
  metadataBase: getURL(),
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
    metadataBase: new URL(metadata.metadataBase),
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
      <CSPostHogProvider>
        <body className="bg-background text-foreground">
          <main className="min-h-screen flex flex-col items-center">
            <HeaderBar />
            {children}
            <Toaster />
          </main>
        </body>
      </CSPostHogProvider>
    </html>
  );
}
