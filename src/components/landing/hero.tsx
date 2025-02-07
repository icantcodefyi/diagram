"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { CtaButton } from "@/components/landing/cta-button";
import { SocialProofLogo } from "@/components/landing/social-proof-logo";

export function Hero() {
  const [inputText, setInputText] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      // Encode the input text for URL safety
      const encodedText = encodeURIComponent(inputText);
      router.push(`/generate?text=${encodedText}`);
    }
  };

  return (
    <section className="bg-gradient-to-b from-background via-secondary/20 via-70% pb-28 pt-20">
      <div className="container flex flex-col items-center gap-8 sm:gap-10">
        <motion.div
          animate={{ y: 0, opacity: 1 }}
          initial={{ y: 5, opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="flex cursor-pointer items-center gap-1 rounded-full bg-secondary/10 px-4 py-1 font-medium text-secondary hover:bg-secondary/20"
        >
          <span className="text-sm">Introducing SocialLens</span>
        </motion.div>
        <motion.h1
          animate={{ y: 0, opacity: 1 }}
          initial={{ y: 10, opacity: 0 }}
          transition={{ delay: 0, duration: 0.4 }}
          className="text-balance text-center font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
        >
          Generate diagrams from your text with AI
        </motion.h1>
        <motion.p
          animate={{ y: 0, opacity: 1 }}
          initial={{ y: 10, opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="max-w-lg text-center text-lg text-muted-foreground sm:text-xl"
        >
          Transform your ideas into beautiful diagrams instantly using AI
        </motion.p>
        <motion.form
          onSubmit={handleSubmit}
          animate={{ y: 0.4, opacity: 1 }}
          initial={{ y: 10, opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex w-full max-w-xl flex-col gap-4 sm:flex-row"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe your diagram..."
            className="flex-1 rounded-lg border bg-background px-4 py-2 text-foreground"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Generate
          </button>
        </motion.form>
        <motion.div
          animate={{ y: 0.4, opacity: 1 }}
          initial={{ y: 10, opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Image
            alt="SaaS Dashboard"
            src="/landing/Desktop---104.png"
            width={1100}
            height={698}
            priority
          />
        </motion.div>
      </div>
      <div className="container mt-14 max-w-5xl">
        <h2 className="mb-12 text-center text-sm font-semibold leading-8 text-muted-foreground sm:text-lg">
          Trusted by the best companies in the world
        </h2>
        <div className="grid w-full grid-cols-4 gap-6 sm:grid-cols-6 lg:grid-cols-5">
          <SocialProofLogo image="/landing/microsoft.webp" />
          <SocialProofLogo image="/landing/google.png" />
          <SocialProofLogo image="/landing/amazon.png" />
          <SocialProofLogo
            image="/landing/netflix.png"
            className="sm:col-start-2"
          />
          <SocialProofLogo
            image="/landing/facebook.png"
            className="col-start-2 sm:col-start-auto"
          />
        </div>
      </div>
    </section>
  );
}
