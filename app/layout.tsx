import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Suspense } from "react";
import { FacebookProvider } from "@/app/providers";
import { Toaster } from "react-hot-toast";
import { AxiomWebVitals } from "next-axiom";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

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
          {children}
          <Toaster />
        </main>
      </body>
    </html>
  );
}
