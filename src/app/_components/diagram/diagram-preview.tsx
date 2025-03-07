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
import { Loader, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { getAnonymousUser } from "@/lib/anonymous-user";

interface DiagramHistory {
  id: string;
  content: string;
  type: DiagramType;
}

interface DiagramPreviewProps {
  diagram: string;
  diagramType: DiagramType | null;
  onUpdate?: (newContent: string) => void;
  diagramId?: string;
}

export function DiagramPreview({ diagram, diagramType, onUpdate, diagramId }: DiagramPreviewProps) {
  const [followUpText, setFollowUpText] = useState("");
  const [diagramHistory, setDiagramHistory] = useState<DiagramHistory[]>([]);
  const [currentDiagramIndex, setCurrentDiagramIndex] = useState(0);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: session } = useSession();

  const currentDiagram = diagramHistory[currentDiagramIndex];

  // Fetch anonymous ID if not logged in
  useEffect(() => {
    if (!session?.user) {
      const fetchAnonymousId = async () => {
        try {
          const anonUser = await getAnonymousUser();
          setAnonymousId(anonUser.id);
        } catch (error) {
          console.error("Error fetching anonymous ID:", error);
        }
      };
      void fetchAnonymousId();
    }
  }, [session?.user]);

  // Add query for diagrams with follow-ups
  const { data: diagramsWithFollowUps, refetch: refetchDiagrams } = api.diagram.getUserDiagramsWithFollowUps.useQuery(
    { 
      diagramId: diagramId ?? '',
      anonymousId: !session?.user ? anonymousId ?? undefined : undefined
    },
    { 
      enabled: !!diagramId && (!!session?.user || !!anonymousId)
    }
  );

  // Initialize diagram history when first diagram is loaded or when follow-ups are fetched
  useEffect(() => {
    if (diagramsWithFollowUps) {
      setDiagramHistory(diagramsWithFollowUps.map(d => ({
        id: d.id,
        content: d.content,
        type: d.type as DiagramType
      })));
    } else if (diagram && diagramType && diagramId) {
      setDiagramHistory([{ id: diagramId, content: diagram, type: diagramType }]);
    }
  }, [diagram, diagramType, diagramId, diagramsWithFollowUps]);

  const {
    currentTheme,
    scale,
    handleCopyToClipboard,
    handleThemeChange,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useDiagramPreview({
    diagram: currentDiagram?.content ?? diagram,
    diagramId: "mermaid-diagram-current",
  });

  const followUpMutation = api.ai.followUpDiagram.useMutation({
    onSuccess: async () => {
      await refetchDiagrams();
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
    if (!diagramId || !followUpText.trim() || diagramHistory.length === 0) return;

    followUpMutation.mutate({
      originalDiagramId: diagramHistory.at(-1)?.id ?? diagramId,
      followUpText: followUpText.trim(),
      anonymousId: !session?.user ? anonymousId ?? undefined : undefined
    });
  };

  const goToNextDiagram = () => {
    if (currentDiagramIndex < diagramHistory.length - 1) {
      setCurrentDiagramIndex(prev => prev + 1);
    }
  };

  const goToPreviousDiagram = () => {
    if (currentDiagramIndex > 0) {
      setCurrentDiagramIndex(prev => prev - 1);
    }
  };

  // Update diagram rendering when current diagram or theme changes
  useEffect(() => {
    const renderDiagram = async () => {
      try {
        if (currentDiagram) {
          await renderMermaidDiagram(
            currentDiagram.content,
            "#mermaid-diagram-current"
          );
        } else if (diagram) {
          await renderMermaidDiagram(
            diagram,
            "#mermaid-diagram-current"
          );
        }
      } catch (error) {
        console.error("Failed to render diagram:", error);
      }
    };

    void renderDiagram();
  }, [currentDiagram, diagram, currentTheme]);

  // Reset position when changing diagrams
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [currentDiagramIndex]);

  return (
    <div className="space-y-6">
      <Card className="relative">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">
              {currentDiagramIndex === 0 ? 
                `${currentDiagram?.type ? currentDiagram.type.charAt(0).toUpperCase() + currentDiagram.type.slice(1) : ''} Diagram` :
                `Follow-up ${currentDiagram?.type ? currentDiagram.type.charAt(0).toUpperCase() + currentDiagram.type.slice(1) : ''} Diagram ${currentDiagramIndex}`
              }
            </CardTitle>
            <CardDescription>{currentDiagram && DIAGRAM_TYPES[currentDiagram.type]}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {diagramHistory.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={goToPreviousDiagram}
                  disabled={currentDiagramIndex === 0}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentDiagramIndex + 1} / {diagramHistory.length}
                </span>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={goToNextDiagram}
                  disabled={currentDiagramIndex === diagramHistory.length - 1}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <div id="mermaid-diagram-current" />
              </div>
            </div>
            {currentDiagram && (
              <DiagramControls
                className="absolute right-4 top-4 z-10"
                content={currentDiagram.content}
                diagramId="mermaid-diagram-current"
                type={currentDiagram.type}
                currentTheme={currentTheme}
                onThemeChange={handleThemeChange}
                onCopy={handleCopyToClipboard}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onResetZoom={resetZoom}
                onContentUpdate={currentDiagramIndex === 0 ? onUpdate : undefined}
              />
            )}
          </div>

          {/* Show follow-up input only when viewing the latest diagram */}
          {currentDiagramIndex === diagramHistory.length - 1 && (
            <div className="rounded-lg border bg-card p-4">
              <form onSubmit={handleFollowUp} className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Follow-up Instructions</h4>
                  <p className="text-sm text-muted-foreground mb-2">Provide additional instructions to modify or enhance the diagram</p>
                  <Textarea
                    placeholder="Enter your follow-up instructions..."
                    value={followUpText}
                    onChange={(e) => setFollowUpText(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}