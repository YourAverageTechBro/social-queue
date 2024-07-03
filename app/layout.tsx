import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Suspense } from "react";
import { CSPostHogProvider, FacebookProvider } from "@/app/providers";
import { Toaster } from "react-hot-toast";
import { AxiomWebVitals } from "next-axiom";
import HeaderBar from "@/components/common/HeaderBar";
import { Metadata } from "next";
import { getURL } from "@/utils/utils";

const meta = {
  title: "Social Media Management For Everyone | SocialQueue.ai",
  description:
    "An open source tool that makes it easier for you to upload your content to every social media platform out there.",
  cardImage: "/opengraph-image.png",
  favicon: "/favicon.ico",
  url: getURL(),
  robots: "follow, index",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: meta.title,
    description: meta.description,
    referrer: "origin-when-cross-origin",
    keywords: [
      "Social media management",
      "Social media management software",
      "Social media management tool",
      "Social media management software",
      "Social media management tool",
      "Social media management software",
      "Social media management tool",
      "Social Media Marketing",
      "Organic Social Media",
      "Social Media",
    ],
    authors: [
      {
        name: "SocialQueue.ai",
        url: "https://socialqueue.ai/",
      },
    ],
    creator: "SocialQueue.ai",
    publisher: "SocialQueue.ai",
    robots: meta.robots,
    icons: { icon: meta.favicon },
    metadataBase: new URL(meta.url),
    openGraph: {
      url: meta.url,
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage],
      type: "website",
      siteName: meta.title,
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
