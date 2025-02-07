import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DIAGRAM_TYPES,
  type DiagramType,
} from "@/types/diagram";
import { useDiagramPreview } from "@/hooks/use-diagram-preview";
import { DiagramControls } from "./diagram-controls";
import { renderMermaidDiagram } from "@/lib/mermaid-config";

interface DiagramPreviewProps {
  diagram: string;
  diagramType: DiagramType | null;
}

export function DiagramPreview({ diagram, diagramType }: DiagramPreviewProps) {
  const {
    currentTheme,
    scale,
    handleCopyToClipboard,
    handleThemeChange,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useDiagramPreview({
    diagram,
    diagramId: "mermaid-diagram",
  });

  // Initial render and theme changes
  useEffect(() => {
    void renderMermaidDiagram(diagram, "#mermaid-diagram");
  }, [diagram, currentTheme]);

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="text-xl">
          {diagramType &&
            `${diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} Diagram`}
        </CardTitle>
        {diagramType && (
          <CardDescription>{DIAGRAM_TYPES[diagramType]}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative rounded-lg bg-white p-4 dark:bg-slate-900">
          <div
            className="flex min-h-[500px] items-center justify-center overflow-hidden"
            style={{
              position: 'relative',
              width: '100%',
            }}
          >
            <div
              style={{
                transformOrigin: "center center",
                transition: "transform 0.2s ease-in-out",
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) scale(${scale})`,
              }}
            >
              <div id="mermaid-diagram" />
            </div>
          </div>
          <DiagramControls
            className="absolute right-4 top-4 z-10"
            content={diagram}
            diagramId="mermaid-diagram"
            type={diagramType ?? "diagram"}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            onCopy={handleCopyToClipboard}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
          />
        </div>
      </CardContent>
    </Card>
  );
} 