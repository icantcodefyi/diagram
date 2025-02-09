"use client";

import { DiagramGenerator } from "@/app/_components/diagram-generator";
import { AuthButton } from "@/app/_components/auth-button";
import { DiagramHistory } from "@/app/_components/diagram-history";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { OnboardingComponent } from "@/app/_components/onboarding-steps";
import { motion } from "framer-motion";

function GeneratePageContent() {
  const searchParams = useSearchParams();
  const text = searchParams.get("text");

  // If there's text in the URL, automatically start the generation
  useEffect(() => {
    if (text) {
    }
  }, [text]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-1">
        <DiagramHistory />
        <div className="relative flex flex-1 flex-col">
          <div className="relative flex items-center justify-center p-4 w-full max-w-7xl mx-auto">
            <motion.div 
              className="w-full sm:w-auto"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <OnboardingComponent />
            </motion.div>
            <div className="flex-shrink-0">
              <AuthButton />
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <DiagramGenerator />
          </div>
        </div>
      </div>
      <footer className="flex items-center justify-center gap-4 py-4 text-sm text-gray-600">
        <span>Powered by</span>
        <a
          href="https://gemini.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:opacity-80"
        >
          <span className="font-semibold">Gemini</span>
          <Image
            src="/google-logo.svg"
            alt="Gemini Logo"
            width={20}
            height={20}
          />
        </a>
        <span>&</span>
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:opacity-80"
        >
          <Image
            src="/vercel-logo.svg"
            alt="Vercel Logo"
            width={60}
            height={20}
          />
        </a>
      </footer>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className="animate-pulse"
            />
            <div className="h-2 w-24 animate-pulse rounded-full bg-gray-200" />
          </div>
        </div>
      }
    >
      <GeneratePageContent />
    </Suspense>
  );
}
