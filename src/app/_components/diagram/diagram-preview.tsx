import { useEffect, useState } from "react";
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
  diagramType: string | null;
  onUpdate: (newDiagram: string) => void;
  prompt?: string;
  diagramId: string;
}

export function DiagramPreview({ diagram, diagramType, onUpdate, prompt, diagramId }: DiagramPreviewProps) {
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
    diagramId,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  };

  // Initial render and theme changes
  useEffect(() => {
    void renderMermaidDiagram(diagram, `#${diagramId}`);
  }, [diagram, currentTheme, diagramId]);

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
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left side - Diagram */}
          <div className="relative rounded-lg bg-white p-6 dark:bg-slate-900">
            <div
              className="flex min-h-[400px] items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
              style={{
                position: 'relative',
                width: '100%',
                margin: '20px 0',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <div
                style={{
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.2s ease-in-out",
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
                  padding: '20px',
                }}
              >
                <div id={diagramId} />
              </div>
            </div>
            <DiagramControls
              className="absolute right-4 top-4 z-10"
              content={diagram}
              diagramId={diagramId}
              type={diagramType ?? "diagram"}
              currentTheme={currentTheme}
              onThemeChange={handleThemeChange}
              onCopy={handleCopyToClipboard}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onResetZoom={resetZoom}
              onContentUpdate={onUpdate}
            />
          </div>

          {/* Right side - Prompt */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-2">Prompt</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {prompt || "No prompt available"}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-2">Mermaid Code</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                <code>{diagram}</code>
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}