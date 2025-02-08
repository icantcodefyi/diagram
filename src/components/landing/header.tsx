"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

import { Logo } from "@/components/landing/logo";
import { NavItem } from "@/components/landing/nav-item";
import { Button } from "@/components/ui/button";
import { MobileNavbar } from "@/components/landing/mobile-navbar";
import { MobileNavItem } from "@/components/landing/mobile-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <motion.header
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="container flex items-center justify-between gap-10 py-4 mt-0 md:mt-4"
    >
      <Logo />
      <div className="flex items-center gap-10">
        <nav className="hidden items-center gap-10 md:flex justify-end">
          <NavItem href="/generate" label="Generate" cta={true} />
          <NavItem href="/about" label="About" />
          <NavItem href="/blog" label="Blog" />
          <NavItem href="/pricing" label="Pricing" />
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {session?.user ? (
            <Avatar 
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push('/generate')}
            >
              <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
              <AvatarFallback>{session.user.name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
          ) : (
            <Button onClick={() => signIn("google", { callbackUrl: "/generate" })}>
              Get Started
            </Button>
          )}
        </div>
      </div>
      <MobileNavbar>
        <div className="rounded-b-lg bg-background py-4 container text-foreground shadow-xl">
          <nav className="flex flex-col gap-1 pt-2">
            <MobileNavItem href="/generate" label="Generate" />
            <MobileNavItem href="/about" label="About" />
            <MobileNavItem href="/blog" label="Blog" />
            <MobileNavItem href="/pricing" label="Pricing" />
            {session?.user ? (
              <div className="flex items-center gap-2 p-2" onClick={() => router.push('/generate')}>
                <Avatar>
                  <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
                  <AvatarFallback>{session.user.name?.[0] ?? "U"}</AvatarFallback>
                </Avatar>
                <span>Go to Dashboard</span>
              </div>
            ) : (
              <Button size="lg" className="mt-2 w-full" onClick={() => signIn("google", { callbackUrl: "/generate" })}>
                Get Started
              </Button>
            )}
          </nav>
        </div>
      </MobileNavbar>
    </motion.header>
  );
}
