/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { SocialProofLogo } from "@/components/landing/social-proof-logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  const [inputText, setInputText] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      // Encode the input text for URL safety
      const encodedText = encodeURIComponent(inputText);
      router.push(`/generate?text=${encodedText}`);
    }
  };

  const handleMouseEnter = () => {
    if (videoRef.current) {
      void videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <section className="bg-gradient-to-b from-background via-secondary/20 via-70% pb-28 pt-20">
      <div className="container flex flex-col items-center gap-8 sm:gap-10">
        <motion.h1
          animate={{ y: 0, opacity: 1 }}
          initial={{ y: 10, opacity: 0 }}
          transition={{ delay: 0, duration: 0.4 }}
          className="text-balance text-center font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
        >
          Transform Ideas into Professional Diagrams with AI
        </motion.h1>
        <motion.p
          animate={{ y: 0, opacity: 1 }}
          initial={{ y: 10, opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="max-w-lg text-center text-lg text-muted-foreground sm:text-xl"
        >
          Say goodbye to manual diagram creation. Describe your concept and let
          our AI craft professional-grade visuals instantly.
        </motion.p>
        <motion.form
          onSubmit={handleSubmit}
          animate={{ y: 0.4, opacity: 1 }}
          initial={{ y: 10, opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex w-full max-w-xl flex-col gap-4 sm:flex-row"
        >
          <Input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe your diagram..."
            className="h-11 flex-1 bg-background"
          />
          <Button type="submit" className="h-11">
            Generate
          </Button>
        </motion.form>
        <motion.div
          animate={{ y: 0.4, opacity: 1 }}
          initial={{ y: 10, opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            className="rounded-lg shadow-lg"
          >
            <source src="/video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>
      </div>
      {/* <div className="container mt-14 max-w-5xl">
        <h2 className="mb-12 text-center text-sm font-semibold leading-8 text-muted-foreground sm:text-lg">
          Trusted by developers, teams, and businesses worldwide
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
      </div> */}
    </section>
  );
}
