import Link from "next/link";
import { cn } from "@/lib/utils";

interface MobileNavItemProps {
  href: string;
  label: string;
  className?: string;
}

export function MobileNavItem({ href, label, className }: MobileNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full cursor-pointer items-center rounded-md p-2 font-medium text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {label}
    </Link>
  );
}
