import { Button } from "@/components/ui/texturebutton";
import { Copy, ChevronDown, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DiagramDownloadButton } from "../diagram-download-button";
import { DiagramEditor } from "./diagram-editor";
import { THEMES, type MermaidTheme } from "@/hooks/use-diagram-preview";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DiagramControlsProps {
  content: string;
  diagramId: string;
  type: string;
  showLabel?: boolean;
  name?: string;
  currentTheme: MermaidTheme;
  onThemeChange: (theme: MermaidTheme) => void;
  onCopy: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onContentUpdate?: (newContent: string) => void;
  className?: string;
  isMinZoom?: boolean;
  isMaxZoom?: boolean;
}

export function DiagramControls({
  content,
  diagramId,
  type,
  showLabel = true,
  name,
  currentTheme,
  onThemeChange,
  onCopy,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onContentUpdate,
  className,
  isMinZoom,
  isMaxZoom,
}: DiagramControlsProps) {
  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-1 rounded-lg p-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="minimal"
                size="icon"
                onClick={onZoomOut}
                disabled={isMinZoom}
                className="h-7 w-7 border bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <ZoomOut className="h-4 w-4" />
                <span className="sr-only">Zoom Out</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="minimal"
                size="icon"
                onClick={onResetZoom}
                className="h-7 w-7 border bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="sr-only">Reset Zoom</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset Zoom</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="minimal"
                size="icon"
                onClick={onZoomIn}
                disabled={isMaxZoom}
                className="h-7 w-7 border bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <ZoomIn className="h-4 w-4" />
                <span className="sr-only">Zoom In</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-1 rounded-lg p-1.5">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="minimal" size="sm" className="h-7 gap-1 border bg-background hover:bg-accent hover:text-accent-foreground">
                    Theme
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Change Theme</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              {THEMES.map((theme) => (
                <DropdownMenuItem
                  key={theme.value}
                  onClick={() => void onThemeChange(theme.value)}
                  className={cn(
                    "gap-2",
                    theme.value === currentTheme && "bg-accent text-accent-foreground"
                  )}
                >
                  {theme.label}
                  {theme.value === currentTheme && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-current" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="minimal"
                size="sm"
                onClick={onCopy}
                className="h-7 gap-1 border bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <Copy className="mr-2 h-4 w-4" />
                {showLabel && "Copy"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Code</TooltipContent>
          </Tooltip>

          <DiagramDownloadButton
            content={content}
            diagramId={diagramId}
            type={type}
            name={name}
            showLabel={showLabel}
          />
          {onContentUpdate && (
            <DiagramEditor
              content={content}
              diagramId={diagramId}
              onUpdate={onContentUpdate}
              showLabel={showLabel}
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}