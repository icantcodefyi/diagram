"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Logo } from "@/components/landing/logo";
import { NavItem } from "@/components/landing/nav-item";
import { Button } from "@/components/ui/button";
import { MobileNavbar } from "@/components/landing/mobile-navbar";
import { MobileNavItem } from "@/components/landing/mobile-nav";

export function Header() {
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
          <NavItem href="/about" label="About" />
          <NavItem href="/docs" label="Docs" />
          <NavItem href="/blog" label="Blog" />
          <NavItem href="/pricing" label="Pricing" />
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild>
            <Link href="/generate" className="cursor-pointer">
              Get Started
            </Link>
          </Button>
        </div>
      </div>
      <MobileNavbar>
        <div className="rounded-b-lg bg-background py-4 container text-foreground shadow-xl">
          <nav className="flex flex-col gap-1 pt-2">
            <MobileNavItem href="/about" label="About" />
            <MobileNavItem href="/docs" label="Docs" />
            <MobileNavItem href="/blog" label="Blog" />
            <MobileNavItem href="/pricing" label="Pricing" />
            <Button size="lg" asChild className="mt-2 w-full">
              <Link href="#" className="cursor-pointer">
                Get Started
              </Link>
            </Button>
          </nav>
        </div>
      </MobileNavbar>
    </motion.header>
  );
}
