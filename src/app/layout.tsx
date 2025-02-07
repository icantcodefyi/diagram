import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/toaster";
import { SessionProviderWrapper } from "@/app/_components/session-provider";
import { CSPostHogProvider } from "@/app/_components/posthog-provider";

export const metadata: Metadata = {
  title: "Diagramify by Ani",
  description: "Generate beautiful diagrams instantly using AI. Transform your ideas into clear, professional diagrams with natural language.",
  metadataBase: new URL('https://diagram.ani.ink'),
  authors: [{ name: "Ani" }],
  keywords: ["diagram generator", "AI diagrams", "flowchart maker", "sequence diagram", "UML diagrams", "mermaid diagrams"],
  creator: "Ani",
  publisher: "Diagramify",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://diagram.ani.ink",
    title: "Diagramify by Ani",
    description: "Generate beautiful diagrams instantly using AI. Transform your ideas into clear, professional diagrams with natural language.",
    siteName: "Diagramify",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Diagramify - AI Powered Diagram Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Diagramify by Ani",
    description: "Generate beautiful diagrams instantly using AI. Transform your ideas into clear, professional diagrams with natural language.",
    images: ["/og-image.png"],
    creator: "@ani",
  },
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    {
      rel: "icon",
      url: "/favicon-16x16.png",
      sizes: "16x16",
      type: "image/png",
    },
    {
      rel: "icon",
      url: "/favicon-32x32.png",
      sizes: "32x32",
      type: "image/png",
    },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <CSPostHogProvider>
            <SessionProviderWrapper>{children}</SessionProviderWrapper>
            <Toaster />
          </CSPostHogProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
