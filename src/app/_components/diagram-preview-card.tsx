"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Expand, Copy } from "lucide-react";
import { type Diagram } from "@/store/diagram-store";
import { DiagramPreviewModal } from "./diagram-preview-modal";
import { renderMermaidDiagram } from "@/lib/mermaid-config";
import { useToast } from "@/hooks/use-toast";

export function DiagramPreviewCard({ diagram }: { diagram: Diagram }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

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
      const element = document.querySelector(`#diagram-${diagram.id} svg`);
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
    <>
      <Card className="group relative overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">
            {diagram.name ?? `${diagram.type} Diagram`}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{new Date(diagram.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{diagram.isComplex ? "Complex" : "Simple"}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            id={`diagram-${diagram.id}`} 
            className="w-full h-[200px] flex items-center justify-center bg-muted/30 rounded-md overflow-hidden"
            onMouseEnter={() => {
              void renderMermaidDiagram(diagram.content, `#diagram-${diagram.id}`);
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
          <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="secondary"
              size="icon"
              onClick={handleCopyCode}
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleDownloadSVG}
              className="h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsModalOpen(true)}
              className="h-8 w-8"
            >
              <Expand className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <DiagramPreviewModal
        diagram={diagram}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
} 