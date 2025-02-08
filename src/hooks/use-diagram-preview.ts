import { useState, useCallback, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  changeTheme,
  renderMermaidDiagram,
  type MermaidTheme,
} from "@/lib/mermaid-config";

export type { MermaidTheme };

export const THEMES: { label: string; value: MermaidTheme }[] = [
  { label: "Default", value: "default" },
  { label: "Forest", value: "forest" },
  { label: "Dark", value: "dark" },
  { label: "Neutral", value: "neutral" },
  { label: "Base", value: "base" },
];

const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const DEFAULT_SCALE = 3;

interface UseDiagramPreviewProps {
  diagram: string;
  diagramId: string;
}

export function useDiagramPreview({
  diagram,
  diagramId,
}: UseDiagramPreviewProps) {
  const [currentTheme, setCurrentTheme] = useState<MermaidTheme>("default");
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const { toast } = useToast();
  const hasAutoAdjusted = useRef(false);

  // Auto-adjust scale based on diagram size - only on initial render
  useEffect(() => {
    if (hasAutoAdjusted.current) {
      return;
    }

    const adjustScale = () => {
      const container = document.getElementById(diagramId)?.parentElement;
      const diagram = document.getElementById(diagramId);

      if (container && diagram) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const diagramWidth = diagram.scrollWidth;
        const diagramHeight = diagram.scrollHeight;

        // Only adjust if diagram is too large at DEFAULT_SCALE (300%)
        if (
          diagramWidth * DEFAULT_SCALE > containerWidth * 0.95 ||
          diagramHeight * DEFAULT_SCALE > containerHeight * 0.95
        ) {
          const scaleX = (containerWidth * 0.95) / diagramWidth;
          const scaleY = (containerHeight * 0.95) / diagramHeight;
          const newScale = Math.min(
            Math.max(Math.min(scaleX, scaleY) * 3, MIN_ZOOM),
            DEFAULT_SCALE,
          );
          setScale(newScale);
        }

        hasAutoAdjusted.current = true;
      }
    };

    // Wait for diagram to be rendered
    const timer = setTimeout(adjustScale, 200);
    return () => clearTimeout(timer);
  }, [diagram, diagramId]);

  // Reset the auto-adjust flag when diagram changes
  useEffect(() => {
    hasAutoAdjusted.current = false;
  }, [diagram]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(diagram);
      toast({
        title: "Success",
        description: "Diagram code copied to clipboard",
        variant: "default",
        duration: 2000,
        className: "rounded",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
        duration: 2000,
        className: "rounded",
      });
    }
  };

  const handleThemeChange = useCallback(
    async (theme: MermaidTheme) => {
      try {
        setCurrentTheme(theme);
        await changeTheme(theme);
        if (diagram) {
          await renderMermaidDiagram(diagram, `#${diagramId}`);
        }
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
    [diagram, diagramId, toast],
  );

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const resetZoom = () => {
    setScale(DEFAULT_SCALE);
  };

  return {
    currentTheme,
    scale,
    handleCopyToClipboard,
    handleThemeChange,
    zoomIn,
    zoomOut,
    resetZoom,
    isMinZoom: scale <= MIN_ZOOM,
    isMaxZoom: scale >= MAX_ZOOM,
  };
}
