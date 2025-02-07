"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Diagram as PrismaDiagram } from "@prisma/client";
import { type Diagram as StoreDiagram } from "@/store/diagram-store";
import { renderMermaidDiagram } from "@/lib/mermaid-config";
import { formatDistanceToNow } from "date-fns";
import { useDiagramPreview } from "@/hooks/use-diagram-preview";
import { DiagramControls } from "./diagram-controls";
import { Badge } from "@/components/ui/badge";

interface DiagramPreviewModalProps {
  diagram: PrismaDiagram | StoreDiagram;
  isOpen: boolean;
  onClose: () => void;
}

export function DiagramPreviewModal({
  diagram,
  isOpen,
  onClose,
}: DiagramPreviewModalProps) {
  const diagramId = `modal-diagram-${diagram.id}`;
  const {
    currentTheme,
    scale,
    handleCopyToClipboard,
    handleThemeChange,
    zoomIn,
    zoomOut,
    resetZoom,
    isMinZoom,
    isMaxZoom,
  } = useDiagramPreview({
    diagram: diagram.content,
    diagramId,
  });

  useEffect(() => {
    if (isOpen) {
      // Wait for the modal to be fully rendered before rendering the diagram
      const timer = setTimeout(() => {
        void renderMermaidDiagram(diagram.content, `#${diagramId}`);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, diagram.content, diagramId, currentTheme]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[95vh] w-[1200px] max-w-[95vw] flex-col overflow-auto p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl">
            {diagram.name ?? `${diagram.type} Diagram`}
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {formatDistanceToNow(new Date(diagram.createdAt), {
                addSuffix: true,
              })}
            </span>
            <span>•</span>
            <Badge variant={diagram.isComplex ? "default" : "secondary"}>
              {diagram.isComplex ? "Complex" : "Simple"}
            </Badge>
          </div>
        </DialogHeader>
        <div className="relative mt-4 flex-1">
          <div className="relative rounded-lg bg-white p-4 dark:bg-slate-900">
            <div
              className="flex min-h-[600px] items-center justify-center overflow-hidden"
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
                <div id={diagramId} />
              </div>
            </div>
            <DiagramControls
              className="absolute right-4 top-4 z-10"
              content={diagram.content}
              diagramId={diagramId}
              type={diagram.type}
              name={diagram.name ?? undefined}
              currentTheme={currentTheme}
              onThemeChange={handleThemeChange}
              onCopy={handleCopyToClipboard}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onResetZoom={resetZoom}
              isMinZoom={Boolean(isMinZoom)}
              isMaxZoom={Boolean(isMaxZoom)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 