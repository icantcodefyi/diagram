"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/texturebutton";
import { Pencil, X, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { renderMermaidDiagram } from "@/lib/mermaid-config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DiagramEditorProps {
  content: string;
  diagramId: string;
  onUpdate: (newContent: string) => void;
  className?: string;
  showLabel?: boolean;
}

export function DiagramEditor({
  content,
  diagramId,
  onUpdate,
  showLabel = true,
}: DiagramEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [previewDiagramId] = useState(`${diagramId}-preview`);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

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
      const delta = -e.deltaY * 0.01;
      setScale(prevScale => {
        const newScale = prevScale + delta;
        return Math.min(Math.max(0.1, newScale), 4); // Limit scale between 0.1 and 4
      });
    }
  };

  // Reset position and scale when opening editor
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
      setScale(1);
    }
  }, [isOpen]);

  // Update preview when content changes
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        try {
          void renderMermaidDiagram(editedContent, `#${previewDiagramId}`).catch((err: unknown) => {
            // Extract the relevant error message
            const errorMessage = err instanceof Error ? err.message : String(err);
            const parseErrorRegex = /Error: Parse error on line (\d+):[\s\S]*?Expecting '([^']+)'.*?got '([^']+)'/;
            const parseError = parseErrorRegex.exec(errorMessage);
            
            if (parseError) {
              const [, line, expected, got] = parseError;
              setError(`Error on line ${line}: Expected '${expected}' but got '${got}'`);
            } else {
              const cleanedMessage = String(errorMessage).replace("[ERROR] : ", "").trim();
              setError(cleanedMessage);
            }
          });
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : "An error occurred";
          setError(errorMessage);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [editedContent, isOpen, previewDiagramId]);

  const handleSave = () => {
    // Only allow saving if there are no errors
    if (!error) {
      onUpdate(editedContent);
      setIsOpen(false);
    }
  };

  return (
    <TooltipProvider>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
              >
                <Pencil className="mr-2 h-4 w-4" />
                {showLabel && "Edit"}
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>Edit Diagram</TooltipContent>
        </Tooltip>
        <SheetContent className="flex w-[800px] sm:max-w-[800px] flex-col">
          <SheetHeader>
            <SheetTitle>Edit Diagram</SheetTitle>
            <SheetDescription>
              Edit the diagram content below. The preview will update automatically.
              Use Ctrl/Cmd + scroll to zoom, and drag to pan around the preview.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4 p-1">
              <div className="relative">
                <Textarea
                  value={editedContent}
                  onChange={(e) => {
                    setEditedContent(e.target.value);
                    setError(null); // Clear error when user starts typing
                  }}
                  className="min-h-[200px] font-mono"
                  placeholder="Enter your diagram code here..."
                />
                {error && (
                  <div className="mt-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    <p className="font-medium">Syntax Error</p>
                    <p>{error}</p>
                  </div>
                )}
              </div>
              <div className="rounded-lg border bg-card">
                <div className="flex items-center justify-between border-b p-2">
                  <div className="text-sm font-medium text-muted-foreground">Preview</div>
                  <div className="flex items-center w-[50%] gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditedContent(content);
                        setError(null);
                        setIsOpen(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSave}
                      disabled={!!error}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Save Changes
                    </Button>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4">
                  <div 
                    className="flex min-h-[400px] items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing relative"
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
                      <div id={previewDiagramId} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
