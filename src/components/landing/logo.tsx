import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center", className)}>
      <Image src="/android-chrome-512x512.png" alt="AutoDiagram" width={42} height={42} />
      <span className="font-heading text-xl text-2xl font-extrabold">AutoDiagram</span>
    </Link>
  );
}
