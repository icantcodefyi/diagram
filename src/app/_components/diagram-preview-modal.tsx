"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";
import { type Diagram } from "@/store/diagram-store";
import { renderMermaidDiagram } from "@/lib/mermaid-config";
import { useToast } from "@/hooks/use-toast";

interface DiagramPreviewModalProps {
  diagram: Diagram;
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
      // Render diagram when modal opens
      void renderMermaidDiagram(
        diagram.content,
        `#modal-diagram-${diagram.id}`,
      );
    }
  }, [isOpen, diagram]);

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
      toast({
        title: "Error",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleDownloadSVG = async () => {
    try {
      const element = document.querySelector(`#modal-diagram-${diagram.id} svg`);
      if (!element) throw new Error("No diagram found");

      const svgData = new XMLSerializer().serializeToString(element);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `${diagram.name ?? diagram.type}-diagram-${diagram.id}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Diagram downloaded as SVG",
        variant: "default",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to download diagram",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl ">
        <DialogHeader>
          <DialogTitle>
            {diagram.name ?? `${diagram.type} Diagram`}
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{new Date(diagram.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{diagram.isComplex ? "Complex" : "Simple"}</span>
          </div>
        </DialogHeader>
        <div className="relative">
          <div
            id={`modal-diagram-${diagram.id}`}
            className="w-full min-h-[400px] flex items-center justify-center bg-muted/30 rounded-md overflow-hidden p-4"
          />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyCode}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Code
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadSVG}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download SVG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 