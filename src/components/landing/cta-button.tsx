import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CtaButtonProps {
  text: string;
  href: string;
  className?: string;
}

export function CtaButton({ text, href, className }: CtaButtonProps) {
  return (
    <Link href={href} className={className}>
      <Button
        size="lg"
        asChild={false}
        className="cursor-pointer sm:h-14 sm:text-base sm:px-10 gap-2 bg-gradient-to-br to-primary via-primary via-60% hover:scale-95 hover:opacity-90 transition-transform group w-full from-secondary"
      >
        {text}
        <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
      </Button>
    </Link>
  );
}
