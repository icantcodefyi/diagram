"use client";

import { useEffect, useState } from "react";
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
  onUpdate?: (newContent: string) => void;
}

export function DiagramPreviewModal({
  diagram,
  isOpen,
  onClose,
  onUpdate,
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

  useEffect(() => {
    if (isOpen) {
      // Reset position when modal opens
      setPosition({ x: 0, y: 0 });
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
              className="flex min-h-[600px] items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
              style={{
                position: 'relative',
                width: '100%',
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
              onContentUpdate={onUpdate}
              isMinZoom={isMinZoom}
              isMaxZoom={isMaxZoom}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}