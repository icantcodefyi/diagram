"use client";

import { useState, useEffect } from "react";
import { type DiagramType } from "@/types/diagram";
import { LoginDialog } from "./login-dialog";
import React from "react";
import { DiagramGeneratorForm } from "@/app/_components/diagram/diagram-generator-form";
import { DiagramPreview } from "@/app/_components/diagram/diagram-preview";
import { AuthButton } from "@/app/_components/auth-button";
import { api } from "@/trpc/react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { Diagram } from "@prisma/client";

export function DiagramGenerator() {
  const [diagram, setDiagram] = useState("");
  const [diagramType, setDiagramType] = useState<DiagramType | null>(null);
  const [enhancedText, setEnhancedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [currentDiagramId, setCurrentDiagramId] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const diagramId = searchParams.get("id");
  const [prompt, setPrompt] = useState("");
  const [isComplex, setIsComplex] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Set current diagram ID from URL when component mounts or URL changes
  useEffect(() => {
    if (diagramId) {
      setCurrentDiagramId(diagramId);
    }
  }, [diagramId]);

  // Get the current diagram if we have an ID
  const { data: currentDiagram } = api.diagram.getDiagram.useQuery(
    { id: diagramId! },
    { enabled: !!diagramId }
  );

  // Generate a new diagram
  const generateDiagram = api.diagram.generateNew.useMutation({
    onMutate: () => {
      setIsGenerating(true);
    },
    onSuccess: (diagram: Diagram) => {
      if (diagram.code) {
        setPrompt("");
        setIsGenerating(false);
        toast({
          title: "Success",
          description: "Diagram generated successfully",
          variant: "default",
        });
        // Update URL when new diagram is generated
        window.history.pushState({}, "", `/generate?id=${diagram.id}`);
      }
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update diagram data when currentDiagram changes
  useEffect(() => {
    if (currentDiagram?.code) {
      setDiagram(currentDiagram.code);
      setDiagramType(currentDiagram.type as DiagramType);
      setCurrentPrompt(currentDiagram.prompt);
    }
  }, [currentDiagram]);

  const handleDiagramUpdate = (newContent: string) => {
    setDiagram(newContent);
  };

  const handleDiagramGenerated = (
    newDiagram: string,
    type: DiagramType,
    newEnhancedText?: string,
    diagramId?: string,
    prompt?: string
  ) => {
    setDiagram(newDiagram);
    setDiagramType(type);
    setEnhancedText(newEnhancedText ?? null);
    setError(null);
    if (diagramId) {
      setCurrentDiagramId(diagramId);
      // Update URL when new diagram is generated
      window.history.pushState({}, "", `/generate?id=${diagramId}`);
    }
    if (prompt) setCurrentPrompt(prompt);
  };

  return (
    <div className="container max-w-4xl space-y-6 py-6">
      <div className="relative">
        <DiagramGeneratorForm
          onDiagramGenerated={handleDiagramGenerated}
          onError={setError}
          onShowLogin={() => setShowLoginDialog(true)}
        />
        <div className="absolute right-4 top-4">
          <AuthButton />
        </div>
      </div>

      {(diagram || currentDiagram?.code) && !error && (
        <>
          {enhancedText && (
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="font-medium">AI&apos;s Understanding:</p>
              <p className="mt-1">{enhancedText}</p>
            </div>
          )}
          <div className="flex-1">
            <DiagramPreview 
              diagram={currentDiagram?.code || diagram}
              diagramType={diagramType} 
              onUpdate={handleDiagramUpdate}
              diagramId={diagramId || currentDiagramId!}
              prompt={currentPrompt ?? undefined}
            />
          </div>
        </>
      )}

      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </div>
  );
}
