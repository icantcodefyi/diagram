import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  label: string;
  className?: string;
  cta?: boolean;
}

export function NavItem({ href, label, className, cta }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex cursor-pointer items-center font-medium text-muted-foreground transition-colors hover:text-foreground text-sm relative",
        className,
        cta && "font-medium text-primary"
      )}
    >
      {label}
      {cta && (
        <span className="group-hover:bg-foreground absolute -top-1 -right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
      )}
    </Link>
  );
}
