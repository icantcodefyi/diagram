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
import { Button } from "@/components/ui/texturebutton";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DiagramPreviewProps {
  diagram: string;
  diagramType: DiagramType | null;
  onUpdate?: (newContent: string) => void;
  diagramId?: string;
}

export function DiagramPreview({ diagram, diagramType, onUpdate, diagramId }: DiagramPreviewProps) {
  const [followUpText, setFollowUpText] = useState("");
  const [followUpDiagram, setFollowUpDiagram] = useState<string | null>(null);
  const [followUpType, setFollowUpType] = useState<DiagramType | null>(null);
  const { toast } = useToast();

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

  const followUpMutation = api.ai.followUpDiagram.useMutation({
    onSuccess: (data) => {
      setFollowUpDiagram(data.diagram);
      setFollowUpType(data.type as DiagramType);
      setFollowUpText("");
      toast({
        title: "Success",
        description: "Follow-up diagram generated successfully",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    },
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

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagramId || !followUpText.trim()) return;

    followUpMutation.mutate({
      originalDiagramId: diagramId,
      followUpText: followUpText.trim(),
    });
  };

  // Initial render and theme changes
  useEffect(() => {
    void renderMermaidDiagram(diagram, "#mermaid-diagram");
  }, [diagram, currentTheme]);

  useEffect(() => {
    if (followUpDiagram) {
      void renderMermaidDiagram(followUpDiagram, "#follow-up-diagram");
    }
  }, [followUpDiagram, currentTheme]);

  return (
    <div className="space-y-6">
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
              className="flex min-h-[500px] items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
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
              onContentUpdate={onUpdate}
            />
          </div>
        </CardContent>
      </Card>

      {diagramId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Follow-up</CardTitle>
            <CardDescription>
              Provide additional instructions to modify or enhance the diagram
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFollowUp} className="space-y-4">
              <Textarea
                placeholder="Enter your follow-up instructions..."
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                className="min-h-[100px]"
              />
              <Button
                type="submit"
                disabled={followUpMutation.status === 'pending' || !followUpText.trim()}
                className="w-full"
              >
                {followUpMutation.status === 'pending' ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Generating
                  </>
                ) : (
                  "Generate Follow-up"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {followUpDiagram && (
        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-xl">
              {followUpType &&
                `Follow-up ${followUpType.charAt(0).toUpperCase() + followUpType.slice(1)} Diagram`}
            </CardTitle>
            {followUpType && (
              <CardDescription>{DIAGRAM_TYPES[followUpType]}</CardDescription>
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
                <div id="follow-up-diagram" />
              </div>
              <DiagramControls
                className="absolute right-4 top-4 z-10"
                content={followUpDiagram}
                diagramId="follow-up-diagram"
                type={followUpType ?? "diagram"}
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
      )}
    </div>
  );
}