import { type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureItemProps {
  title: string;
  description: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  className?: string;
}

export function FeatureItem({ title, description, icon: Icon, className }: FeatureItemProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="shrink-0 size-16 flex items-center justify-center rounded-[1rem] bg-secondary/10 text-secondary">
        <Icon size={29} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-bold">{title}</h3>
        <p className="text-muted-foreground text-balance">{description}</p>
      </div>
    </div>
  );
}
