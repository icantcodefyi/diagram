import { cn } from "@/lib/utils";

interface StatItemProps {
  value: string;
  label: string;
  className?: string;
}

export function StatItem({ value, label, className }: StatItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 p-8 rounded-3xl p-6 bg-secondary/10",
        className,
      )}
    >
      <div className="font-bold font-heading text-4xl">{value}</div>
      <div className="text-center text-sm">{label}</div>
    </div>
  );
}
