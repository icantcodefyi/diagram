import { useEffect, memo } from "react";
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

interface DiagramPreviewProps {
  diagram: string;
  diagramType: DiagramType | null;
  onUpdate?: (newContent: string) => void;
}

function DiagramPreviewContent({ diagram, diagramType, onUpdate }: DiagramPreviewProps) {
  const {
    currentTheme,
    handleThemeChange,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useDiagramPreview({
    diagram,
    diagramId: "mermaid-diagram",
  });

  const nodes = [
    {
      id: 'mermaid',
      type: 'mermaidNode',
      position: { x: 0, y: 0 },
      data: { diagram, id: "mermaid-diagram" },
      draggable: true,
      style: { cursor: 'grab' },
    },
  ];

  const nodeTypes = {
    mermaidNode: MermaidNode,
  };

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
          <div className="h-[500px] w-full">
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
            content={diagram}
            diagramId="mermaid-diagram"
            type={diagramType ?? "diagram"}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
            onContentUpdate={onUpdate}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function DiagramPreview(props: DiagramPreviewProps) {
  return (
    <ReactFlowProvider>
      <DiagramPreviewContent {...props} />
    </ReactFlowProvider>
  );
}