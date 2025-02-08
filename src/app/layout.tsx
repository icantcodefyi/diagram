import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { cn } from "@/lib/utils";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/toaster";
import { SessionProviderWrapper } from "@/app/_components/session-provider";
import { CSPostHogProvider } from "@/app/_components/posthog-provider";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontHeading = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoDiagram",
  description: "Generate beautiful diagrams instantly using AI. Transform your ideas into clear, professional diagrams with natural language.",
  metadataBase: new URL('https://www.autodiagram.com/'),
  authors: [{ name: "Ani" }],
  keywords: ["diagram generator", "AI diagrams", "flowchart maker", "sequence diagram", "UML diagrams", "mermaid diagrams", "automatic diagram generation", "AI-powered diagrams", "visual documentation", "diagram creation tool"],
  creator: "Ani",
  publisher: "AutoDiagram",
  category: "Technology",
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
    url: "https://www.autodiagram.com/",
    title: "AutoDiagram",
    description: "Generate beautiful diagrams instantly using AI. Transform your ideas into clear, professional diagrams with natural language.",
    siteName: "AutoDiagram",
    images: [
      {
        url: "/blog/og-image.png",
        width: 1200,
        height: 630,
        alt: "AutoDiagram - AI Powered Diagram Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoDiagram",
    description: "Generate beautiful diagrams instantly using AI. Transform your ideas into clear, professional diagrams with natural language.",
    images: ["/blog/og-image.png"],
    creator: "@ani",
    site: "@autodiagram",
  },
  alternates: {
    canonical: "https://www.autodiagram.com",
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
    <html lang="en">
      <body className={cn(
        "min-h-screen font-sans antialiased",
        fontSans.variable,
        fontHeading.variable
      )}>
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
