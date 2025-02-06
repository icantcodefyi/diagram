import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/toaster";
import { SessionProviderWrapper } from "@/app/_components/session-provider";
import { CSPostHogProvider } from "@/app/_components/posthog-provider";

export const metadata: Metadata = {
  title: "Diagramify by Ani",
  description: "Generate diagrams with AI",
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
