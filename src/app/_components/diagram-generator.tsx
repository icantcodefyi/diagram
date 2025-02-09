"use client";

import { useState } from "react";
import { type DiagramType } from "@/types/diagram";
import { LoginDialog } from "./login-dialog";
import React from "react";
import { DiagramGeneratorForm } from "@/app/_components/diagram/diagram-generator-form";
import { DiagramPreview } from "@/app/_components/diagram/diagram-preview";
import { AuthButton } from "@/app/_components/auth-button";

export function DiagramGenerator() {
  const [diagram, setDiagram] = useState("");
  const [diagramType, setDiagramType] = useState<DiagramType | null>(null);
  const [enhancedText, setEnhancedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleDiagramUpdate = (newContent: string) => {
    setDiagram(newContent);
  };

  return (
    <div className="container max-w-4xl space-y-6 py-6">
      <div className="relative">
        <DiagramGeneratorForm
          onDiagramGenerated={(newDiagram, type, newEnhancedText) => {
            setDiagram(newDiagram);
            setDiagramType(type);
            setEnhancedText(newEnhancedText ?? null);
            setError(null);
          }}
          onError={setError}
          onShowLogin={() => setShowLoginDialog(true)}
        />
        <div className="absolute right-4 top-4">
          <AuthButton />
        </div>
      </div>

      {diagram && !error && (
        <>
          {enhancedText && (
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="font-medium">AI&apos;s Understanding:</p>
              <p className="mt-1">{enhancedText}</p>
            </div>
          )}
          <DiagramPreview 
            diagram={diagram} 
            diagramType={diagramType} 
            onUpdate={handleDiagramUpdate}
          />
        </>
      )}

      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </div>
  );
}
