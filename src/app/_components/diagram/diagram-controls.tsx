import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Download, Palette, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { type MermaidTheme } from "@/hooks/use-diagram-preview";
import { THEMES } from "@/hooks/use-diagram-preview";
import { DiagramDownloadButton } from "../diagram-download-button";

export interface DiagramControlsProps {
  className?: string;
  content: string;
  diagramId: string;
  type: string;
  name?: string;
  currentTheme: MermaidTheme;
  onThemeChange: (theme: MermaidTheme) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onContentUpdate?: (newContent: string) => void;
}

export function DiagramControls({
  className,
  content,
  diagramId,
  type,
  name,
  currentTheme,
  onThemeChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onContentUpdate,
}: DiagramControlsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="icon"
        size="icon"
        onClick={onZoomIn}
        className="h-8 w-8"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="icon"
        size="icon"
        onClick={onZoomOut}
        className="h-8 w-8"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="icon"
        size="icon"
        onClick={onResetZoom}
        className="h-8 w-8"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="icon" size="icon" className="h-8 w-8">
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {THEMES.map((theme) => (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => onThemeChange(theme.value)}
            >
              {theme.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DiagramDownloadButton
        content={content}
        diagramId={diagramId}
        type={type}
        name={name}
        showLabel={false}
        simpleMode={true}
      />
    </div>
  );
}