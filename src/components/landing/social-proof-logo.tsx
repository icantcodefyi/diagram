import Image from "next/image";
import { cn } from "@/lib/utils";

interface SocialProofLogoProps {
  image: string;
  className?: string;
}

export function SocialProofLogo({ image, className }: SocialProofLogoProps) {
  return (
    <div className={cn("relative col-span-2 flex-1 lg:col-span-1 h-6 sm:h-8", className)}>
      <Image alt="Company Logo" src={image} fill className="object-contain brightness-0" />
    </div>
  );
}
