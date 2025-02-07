"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/texturebutton";
import { Copy } from "lucide-react";
import { DiagramDownloadButton } from "./diagram-download-button";
import { type Diagram } from "@/store/diagram-store";
import { renderMermaidDiagram } from "@/lib/mermaid-config";
import { useToast } from "@/hooks/use-toast";
import { type RouterOutputs } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";

type DiagramType = RouterOutputs["diagram"]["getUserDiagrams"][number];

interface DiagramPreviewModalProps {
  diagram: Diagram | DiagramType;
  isOpen: boolean;
  onClose: () => void;
}

export function DiagramPreviewModal({
  diagram,
  isOpen,
  onClose,
}: DiagramPreviewModalProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Wait for the modal to be fully rendered before rendering the diagram
      const timer = setTimeout(() => {
        void renderMermaidDiagram(
          diagram.content,
          `#modal-diagram-${diagram.id}`,
        );
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, diagram.content, diagram.id]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(diagram.content);
      toast({
        title: "Success",
        description: "Diagram code copied to clipboard",
        variant: "default",
        duration: 2000,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[95vh] w-[1200px] max-w-[95vw] flex-col overflow-auto p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{diagram.name ?? `${diagram.type} Diagram`}</DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{formatDistanceToNow(new Date(diagram.createdAt), { addSuffix: true })}</span>
            <span>•</span>
            <span>{diagram.isComplex ? "Complex" : "Simple"}</span>
          </div>
        </DialogHeader>
        <div className="relative">
          <div
            id={`modal-diagram-${diagram.id}`}
            className="flex min-h-[400px] w-full items-center justify-center overflow-hidden rounded-md bg-muted/30 p-4"
          >
            {/* Container for the Mermaid diagram */}
          </div>
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyCode}
              className="gap-2"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </Button>
            <DiagramDownloadButton
              content={diagram.content}
              diagramId={`modal-diagram-${diagram.id}`}
              name={diagram.name}
              type={diagram.type}
              showLabel={true}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
