"use client";

import { useEffect, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Diagram as PrismaDiagram } from "@prisma/client";
import { type Diagram as StoreDiagram } from "@/store/diagram-store";
import { formatDistanceToNow } from "date-fns";
import { useDiagramPreview } from "@/hooks/use-diagram-preview";
import { DiagramControls } from "./diagram-controls";
import { Badge } from "@/components/ui/badge";
import ReactFlow, { 
  Background, 
  Controls,
  ReactFlowProvider,
  type NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { renderMermaidDiagram } from "@/lib/mermaid-config";

interface MermaidNodeData {
  diagram: string;
  id: string;
}

const MermaidNode = memo(({ data }: NodeProps<MermaidNodeData>) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      void renderMermaidDiagram(data.diagram, `#${data.id}`);
    }, 100);
    return () => clearTimeout(timer);
  }, [data.diagram, data.id]);

  return (
    <div className="bg-background/50 p-4 rounded-lg shadow-lg">
      <div id={data.id} />
    </div>
  );
});

MermaidNode.displayName = "MermaidNode";

interface DiagramPreviewModalProps {
  diagram: PrismaDiagram | StoreDiagram;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (newContent: string) => void;
}

function DiagramPreviewModalContent({
  diagram,
  isOpen,
  onClose,
  onUpdate,
}: DiagramPreviewModalProps) {
  const diagramId = `modal-diagram-${diagram.id}`;
  const {
    currentTheme,
    handleThemeChange,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useDiagramPreview({
    diagram: diagram.content,
    diagramId,
  });

  const nodes = [
    {
      id: 'mermaid',
      type: 'mermaidNode',
      position: { x: 0, y: 0 },
      data: { diagram: diagram.content, id: diagramId },
      draggable: true,
      style: { cursor: 'grab' },
    },
  ];

  const nodeTypes = {
    mermaidNode: MermaidNode,
  };

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
            <div className="h-[600px] w-full">
              <ReactFlow
                nodes={nodes}
                edges={[]}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
                minZoom={0.1}
                maxZoom={4}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                panOnScroll
                selectionOnDrag
                panOnDrag
                zoomOnScroll
                nodesDraggable
              >
                <Background />
                <Controls />
              </ReactFlow>
            </div>
            <DiagramControls
              className="absolute right-4 top-4 z-10"
              content={diagram.content}
              diagramId={diagramId}
              type={diagram.type}
              name={diagram.name ?? undefined}
              currentTheme={currentTheme}
              onThemeChange={handleThemeChange}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onResetZoom={resetZoom}
              onContentUpdate={onUpdate}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DiagramPreviewModal(props: DiagramPreviewModalProps) {
  return (
    <ReactFlowProvider>
      <DiagramPreviewModalContent {...props} />
    </ReactFlowProvider>
  );
}