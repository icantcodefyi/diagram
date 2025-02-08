import { Button } from "@/components/ui/button";

interface DiagramHistoryItemProps {
  title: string;
  subtitle: string;
  onClick: () => void;
}

export function DiagramHistoryItem({
  title,
  subtitle,
  onClick,
}: DiagramHistoryItemProps) {
  return (
    <Button
      variant="link"
      className="h-auto w-full justify-start py-2 text-left text-muted-foreground hover:text-foreground transition-colors"
      onClick={onClick}
    >
      <div className="flex flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
    </Button>
  );
} 