import { Check } from "lucide-react";

interface PricingFeatureItemProps {
  text: string;
}

export function PricingFeatureItem({ text }: PricingFeatureItemProps) {
  return (
    <li className="flex items-center gap-2">
      <div className="rounded bg-primary/10 p-1">
        <Check className="h-4 w-4 text-primary" />
      </div>
      <span className="text-muted-foreground text-sm">{text}</span>
    </li>
  );
} 