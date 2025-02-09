import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { type MermaidTheme } from "@/lib/mermaid-config";
import { useReactFlow } from "reactflow";

export type { MermaidTheme };

export const THEMES: { label: string; value: MermaidTheme }[] = [
  { label: "Default", value: "default" },
  { label: "Forest", value: "forest" },
  { label: "Dark", value: "dark" },
  { label: "Neutral", value: "neutral" },
  { label: "Base", value: "base" },
];

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const DEFAULT_ZOOM = 1;

interface UseDiagramPreviewProps {
  diagram: string;
  diagramId: string;
}

export function useDiagramPreview({
  diagram,
}: UseDiagramPreviewProps) {
  const [currentTheme, setCurrentTheme] = useState<MermaidTheme>("default");
  const { toast } = useToast();
  const hasAutoAdjusted = useRef(false);
  const { zoomIn: flowZoomIn, zoomOut: flowZoomOut, setViewport } = useReactFlow();

  const handleThemeChange = useCallback(
    async (theme: MermaidTheme) => {
      try {
        setCurrentTheme(theme);
      } catch (err) {
        console.error("Failed to change theme:", err);
        toast({
          title: "Error",
          description: "Failed to change theme",
          variant: "destructive",
          duration: 2000,
          className: "rounded",
        });
      }
    },
    [toast],
  );

  const zoomIn = () => {
    flowZoomIn();
  };

  const zoomOut = () => {
    flowZoomOut();
  };

  const resetZoom = () => {
    setViewport({ x: 0, y: 0, zoom: DEFAULT_ZOOM });
  };

  return {
    currentTheme,
    handleThemeChange,
    zoomIn,
    zoomOut,
    resetZoom,
  };
}
