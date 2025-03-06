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
import { ChevronLeft, ChevronRight, Send, Plus, Minus, RotateCcw, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface DiagramPreviewProps {
  diagram: string;
  diagramType: DiagramType | null;
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
  const [followUpPrompt, setFollowUpPrompt] = useState("");
  const [showFollowUpInput, setShowFollowUpInput] = useState(false);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [selectedDiagramForFollowUp, setSelectedDiagramForFollowUp] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch diagram data including child diagrams
  const { data: diagramData, isLoading: isLoadingDiagram } = api.diagram.getDiagram.useQuery(
    { id: diagramId },
    { 
      enabled: !!diagramId,
      retry: 3,
      retryDelay: 1000
    }
  );

  // Get all related diagrams (parent and children)
  const [diagramSequence, setDiagramSequence] = useState<Array<{
    id: string;
    prompt: string;
    code: string;
    createdAt: Date;
    isParent?: boolean;
    parentDiagramId?: string;
  }>>([]);

  console.log("Diagram Data", diagramData);
  console.log("Diagram Sequence", diagramSequence);

  useEffect(() => {
    if (diagramData) {
      const sequence = [];
      
      // Add parent diagram if we're viewing a child
      if (diagramData.parentDiagram) {
        sequence.push({
          id: diagramData.parentDiagram.id,
          prompt: diagramData.parentDiagram.prompt,
          code: diagramData.parentDiagram.code,
          createdAt: new Date(diagramData.parentDiagram.createdAt),
          isParent: true,
          parentDiagramId: diagramData.parentDiagram.parentDiagramId || undefined
        });
      }

      // Add current diagram
      sequence.push({
        id: diagramData.id,
        prompt: diagramData.prompt,
        code: diagramData.code,
        createdAt: new Date(diagramData.createdAt),
        parentDiagramId: diagramData.parentDiagramId || undefined
      });

      // Add child diagrams in chronological order
      if (diagramData.childDiagrams?.length > 0) {
        const sortedChildren = [...diagramData.childDiagrams].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        sortedChildren.forEach(child => {
          sequence.push({
            id: child.id,
            prompt: child.prompt,
            code: child.code,
            createdAt: new Date(child.createdAt),
            parentDiagramId: child.parentDiagramId || undefined
          });
        });
      }

      setDiagramSequence(sequence);
    }
  }, [diagramData]);

  // Effect to render all diagrams
  useEffect(() => {
    const renderDiagrams = async () => {
      try {
        if (diagramSequence.length > 0) {
          for (const diag of diagramSequence) {
            if (diag.code) {
              await renderMermaidDiagram(diag.code, `#diagram-${diag.id}`);
            }
          }
        } else if (diagram) {
          // If no sequence is available, render the single diagram
          await renderMermaidDiagram(diagram, `#diagram-${diagramId}`);
        }
      } catch (error) {
        console.error('Failed to render diagrams:', error);
      }
    };

    void renderDiagrams();
  }, [diagramSequence, diagram, diagramId, currentTheme]);

  const handleVersionChange = (direction: 'prev' | 'next') => {
    if (!diagramData) return;

    // If we're viewing a child diagram, navigate between siblings
    if (diagramData.parentDiagramId) {
      const siblings = diagramData.childDiagrams;
      const currentIndex = siblings.findIndex(d => d.id === diagramId);

      const newIndex = direction === 'prev'
        ? currentIndex - 1
        : currentIndex + 1;

      if (newIndex >= 0 && newIndex < siblings.length) {
        const newVersion = siblings[newIndex];
        if (newVersion) {
          window.history.pushState({}, "", `/generate?id=${newVersion.id}`);
          window.location.reload();
        }
      }
    }
    // If we're viewing a parent diagram, navigate through its children
    else if (diagramData.childDiagrams.length > 0) {
      const children = diagramData.childDiagrams;
      const currentIndex = children.findIndex(d => d.id === diagramId);

      const newIndex = direction === 'prev'
        ? currentIndex === -1 ? children.length - 1 : currentIndex - 1
        : currentIndex === -1 ? 0 : currentIndex + 1;

      if (newIndex >= 0 && newIndex < children.length) {
        const newVersion = children[newIndex];
        if (newVersion) {
          window.history.pushState({}, "", `/generate?id=${newVersion.id}`);
          window.location.reload();
        }
      }
    }
  };

  const generateFollowUp = api.diagram.generateFollowUp.useMutation({
    onMutate: () => {
      setIsGeneratingFollowUp(true);
    },
    onSuccess: (newDiagram) => {
      if (newDiagram.code) {
        // Add the new diagram to the sequence
        setDiagramSequence(prev => {
          // Find the parent diagram to ensure proper linking
          const parentDiagram = prev.find(d => d.id === newDiagram.parentDiagramId);
          if (!parentDiagram) return prev;

          const newDiagramEntry = {
            id: newDiagram.id,
            prompt: newDiagram.prompt,
            code: newDiagram.code,
            createdAt: new Date(newDiagram.createdAt),
            parentDiagramId: newDiagram.parentDiagramId || undefined
          };

          return [...prev, newDiagramEntry];
        });

        onUpdate(newDiagram.code);
        setFollowUpPrompt("");
        setSelectedDiagramForFollowUp(null);
        setIsGeneratingFollowUp(false);

        // Navigate to the new diagram
        window.history.pushState({}, "", `/generate?id=${newDiagram.id}`);
        window.location.reload();

        toast({
          title: "Success",
          description: "Follow-up diagram generated successfully",
          variant: "default",
        });
      }
    },
    onError: (error) => {
      setIsGeneratingFollowUp(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  const handleFollowUpSubmit = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!parentId || !followUpPrompt.trim()) return;

    // Find the parent diagram's code
    const parentDiagram = diagramSequence.find(d => d.id === parentId);
    if (!parentDiagram) {
      toast({
        title: "Error",
        description: "Parent diagram not found",
        variant: "destructive",
      });
      return;
    }

    generateFollowUp.mutate({
      parentDiagramId: parentId,
      prompt: followUpPrompt,
      changeDescription: followUpPrompt,
      isComplex: false
    });
  };

  // Helper function to get follow-ups for a specific diagram
  const getFollowUps = (parentId: string) => {
    return diagramSequence.filter(d => d.parentDiagramId === parentId);
  };

  // Helper function to get current follow-up index
  const getCurrentFollowUpIndex = (parentId: string, currentId: string) => {
    const followUps = getFollowUps(parentId);
    return followUps.findIndex(d => d.id === currentId);
  };

  const handleVersionNavigation = (parentId: string, direction: 'prev' | 'next') => {
    const followUps = getFollowUps(parentId);
    const currentIndex = getCurrentFollowUpIndex(parentId, diagramId);
    
    const newIndex = direction === 'prev'
      ? (currentIndex - 1 + followUps.length) % followUps.length
      : (currentIndex + 1) % followUps.length;

    const newVersion = followUps[newIndex];
    if (!newVersion) return;

    // If this is a child diagram, update it dynamically
    if (newVersion.parentDiagramId) {
      onUpdate(newVersion.code);
    } else {
      // Only reload page for root nodes
      window.history.pushState({}, "", `/generate?id=${newVersion.id}`);
      window.location.reload();
    }
  };

  const DiagramView = ({ diagramCode, id }: { diagramCode: string; id: string }) => {
    // Get parent ID and check if there are siblings to navigate through
    const parentId = diagramData?.parentDiagramId ?? diagramData?.id;
    const followUps = parentId ? getFollowUps(parentId) : [];
    const hasMultipleVersions = followUps.length > 1;
    const currentIndex = parentId ? getCurrentFollowUpIndex(parentId, id) : -1;

    return (
      <div
        className="flex min-h-[400px] items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing relative"
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
        {/* Navigation arrows */}
        {parentId && hasMultipleVersions && (
          <>
            <Button
              variant="minimal"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-opacity opacity-50 hover:opacity-100"
              onClick={() => handleVersionNavigation(parentId, 'prev')}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="minimal"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-opacity opacity-50 hover:opacity-100"
              onClick={() => handleVersionNavigation(parentId, 'next')}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/20 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} of {followUps.length}
            </div>
          </>
        )}
        <div
          style={{
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.2s ease-in-out",
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
            width: '100%',
            padding: '20px',
          }}
        >
          <pre className="mermaid" id={`diagram-${id}`}>
            {diagramCode}
          </pre>
        </div>
      </div>
    );
  };

  if (isLoadingDiagram) {
    return (
      <Card className="relative">
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin">
            <Loader2 className="w-8 h-8" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="text-xl">
          {diagramType &&
            `${diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} Diagram Sequence`}
        </CardTitle>
        {diagramType && DIAGRAM_TYPES[diagramType as keyof typeof DIAGRAM_TYPES] && (
          <CardDescription>
            {DIAGRAM_TYPES[diagramType as keyof typeof DIAGRAM_TYPES]}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {diagramSequence.length > 0 ? (
            diagramSequence.map((diag, index) => (
              <div key={diag.id} className="border rounded-lg p-6 bg-white dark:bg-slate-900">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
                    <span>{diag.isParent ? 'Original Diagram' : `Follow-up #${index}`}</span>
                    {!diag.isParent && getFollowUps(diag.parentDiagramId ?? '').length > 1 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="minimal"
                          size="icon"
                          onClick={() => handleVersionNavigation(diag.parentDiagramId ?? '', 'prev')}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          {getCurrentFollowUpIndex(diag.parentDiagramId ?? '', diag.id) + 1} of {getFollowUps(diag.parentDiagramId ?? '').length}
                        </span>
                        <Button
                          variant="minimal"
                          size="icon"
                          onClick={() => handleVersionNavigation(diag.parentDiagramId ?? '', 'next')}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </h3>
                  <div className="text-sm text-gray-500 mb-2">
                    Created {formatDistanceToNow(diag.createdAt)} ago
                  </div>
                  <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4">
                    <p className="text-sm font-medium">Prompt:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{diag.prompt}</p>
                  </div>
                </div>
                <DiagramView diagramCode={diag.code} id={diag.id} />
                <DiagramControls
                  className="mt-4"
                  content={diag.code}
                  diagramId={diag.id}
                  type={diagramType ?? "diagram"}
                  currentTheme={currentTheme}
                  onThemeChange={handleThemeChange}
                  onCopy={handleCopyToClipboard}
                  onZoomIn={zoomIn}
                  onZoomOut={zoomOut}
                  onResetZoom={resetZoom}
                  onContentUpdate={onUpdate}
                />
                
                {/* Follow-up form for each diagram */}
                <div className="mt-4">
                  {selectedDiagramForFollowUp === diag.id ? (
                    <form onSubmit={(e) => handleFollowUpSubmit(e, diag.id)} className="space-y-2">
                      <div className="flex gap-2">
                        <textarea
                          value={followUpPrompt}
                          onChange={(e) => setFollowUpPrompt(e.target.value)}
                          placeholder="Describe the changes you want to make to this diagram..."
                          className="w-full rounded-md border p-2"
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="submit"
                          disabled={isGeneratingFollowUp || !followUpPrompt.trim()}
                        >
                          {isGeneratingFollowUp ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating Changes
                            </>
                          ) : (
                            "Apply Changes"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setSelectedDiagramForFollowUp(null);
                            setFollowUpPrompt("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setSelectedDiagramForFollowUp(diag.id)}
                    >
                      Create Follow-up
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : diagram ? (
            <div className="border rounded-lg p-6 bg-white dark:bg-slate-900">
              <DiagramView diagramCode={diagram} id={diagramId} />
              <DiagramControls
                className="mt-4"
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
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}