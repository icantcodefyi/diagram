import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/toaster";
import { SessionProviderWrapper } from "@/app/_components/session-provider";
export const metadata: Metadata = {
  title: "Diagramify by Ani",
  description: "Generate diagrams with AI",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
