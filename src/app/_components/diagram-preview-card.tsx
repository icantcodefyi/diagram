"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/texturebutton";
import { Expand, Copy, Trash2 } from "lucide-react";
import { type Diagram } from "@/store/diagram-store";
import { DiagramPreviewModal } from "@/app/_components/diagram/diagram-preview-modal";
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
import { DiagramDownloadButton } from "./diagram-download-button";

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
        className: "rounded",
      });
      void utils.ai.getUserDiagrams.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete diagram",
        variant: "destructive",
        duration: 2000,
        className: "rounded",
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
        className: "rounded",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
        duration: 2000,
        className: "rounded",
      });
    }
  };


  return (
    <>
      <Card className="group relative overflow-hidden transition-shadow duration-200 hover:shadow-lg">
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
            className="flex h-[200px] w-full items-center justify-center overflow-hidden rounded-md bg-muted/30"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/5" />
          <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              variant="icon"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
            <Button
              variant="icon"
              size="icon"
              onClick={handleCopyCode}
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <DiagramDownloadButton
              content={diagram.content}
              diagramId={diagram.id}
              name={diagram.name}
              type={diagram.type}
              showLabel={false}
              simpleMode={true}
            />
            <Button
              variant="icon"
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

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              diagram.
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
