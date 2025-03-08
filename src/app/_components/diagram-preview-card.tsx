"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/texturebutton";
import { Expand, Copy, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentDiagramIndex, setCurrentDiagramIndex] = useState(0);
  const { toast } = useToast();
  const utils = api.useUtils();

  // Query for diagram follow-ups
  const { data: diagramsWithFollowUps } = api.diagram.getUserDiagramsWithFollowUps.useQuery(
    { diagramId: diagram.id },
    { enabled: !!diagram.id }
  );

  const diagrams = diagramsWithFollowUps ?? [diagram];
  const currentDiagram = diagrams[currentDiagramIndex] ?? diagram;

  const deleteDiagram = api.ai.deleteDiagram.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Diagram deleted successfully",
        variant: "default",
        duration: 2000,
        className: "rounded",
      });
      void utils.diagram.getUserDiagrams.invalidate();
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
    void renderMermaidDiagram(currentDiagram.content, `#diagram-${currentDiagram.id}`);
  }, [currentDiagram]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentDiagram.content);
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

  const goToNextDiagram = () => {
    if (currentDiagramIndex < diagrams.length - 1) {
      setCurrentDiagramIndex(prev => prev + 1);
    }
  };

  const goToPreviousDiagram = () => {
    if (currentDiagramIndex > 0) {
      setCurrentDiagramIndex(prev => prev - 1);
    }
  };

  return (
    <Card className="group relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          {currentDiagramIndex === 0 ? currentDiagram.name : `${currentDiagram.name} (Follow-up ${currentDiagramIndex})`}
        </CardTitle>
        <div className="flex items-center gap-2">
          {diagrams.length > 1 && (
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
              <span className="mx-2 text-sm">
                {currentDiagramIndex + 1} / {diagrams.length}
              </span>
              <Button
                variant="secondary"
                size="icon"
                onClick={goToNextDiagram}
                disabled={currentDiagramIndex === diagrams.length - 1}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="icon"
              onClick={handleCopyCode}
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <DiagramDownloadButton
              content={currentDiagram.content}
              diagramId={currentDiagram.id}
              name={currentDiagram.name}
              type={currentDiagram.type}
              simpleMode={true}
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsModalOpen(true)}
              className="h-8 w-8"
            >
              <Expand className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          id={`diagram-${currentDiagram.id}`}
          className="overflow-x-auto py-2"
        />
      </CardContent>

      <DiagramPreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        diagram={currentDiagram}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
                deleteDiagram.mutate({ diagramId: currentDiagram.id });
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
