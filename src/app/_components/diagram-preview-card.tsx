"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Expand, Copy, Trash2 } from "lucide-react";
import { type Diagram } from "@/store/diagram-store";
import { DiagramPreviewModal } from "./diagram-preview-modal";
import { renderMermaidDiagram } from "@/lib/mermaid-config";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DiagramPreviewCard({ diagram }: { diagram: Diagram }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const utils = api.useUtils();

  const deleteDiagram = api.ai.deleteDiagram.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Diagram deleted successfully",
        variant: "default",
        duration: 2000,
      });
      void utils.ai.getUserDiagrams.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete diagram",
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  useEffect(() => {
    void renderMermaidDiagram(diagram.content, `#diagram-${diagram.id}`);
  }, [diagram.content, diagram.id]);

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

  const handleDownloadPNG = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: diagram.content,
          type: diagram.type,
        }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `${diagram.name ?? diagram.type}-diagram-${diagram.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Diagram downloaded as PNG",
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
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
          <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
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
              onClick={handleDownloadPNG}
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your diagram.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteDiagram.mutate({ diagramId: diagram.id });
                setIsDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 