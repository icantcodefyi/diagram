"use client";

import { useState, useEffect } from "react";
import mermaid from "mermaid";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DiagramGenerator() {
  const [input, setInput] = useState("");
  const [diagram, setDiagram] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "arial",
      logLevel: "error",
    });
  }, []);

  // Initialize mutation
  const generateDiagram = api.ai.generateDiagram.useMutation({
    onMutate: () => {
      setIsLoading(true);
    },
    onSettled: () => {
      setIsLoading(false);
    },
    onSuccess: async (data) => {
      try {
        setError(null);
        setDiagram(data.diagram);

        // Clear and re-render mermaid diagram
        const element = document.querySelector("#mermaid-diagram");
        if (element) {
          // Clear previous content
          element.innerHTML = "";

          // Create a new div for the diagram
          const diagramDiv = document.createElement("div");
          diagramDiv.className = "mermaid";
          diagramDiv.textContent = data.diagram;

          // Add the new div to the container
          element.appendChild(diagramDiv);

          // Render the diagram
          await mermaid.run({
            nodes: [diagramDiv],
          });
        }
      } catch (err) {
        setError("Failed to render diagram. Please try again.");
        console.error("Mermaid render error:", err);
      }
    },
    onError: (err) => {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to generate diagram. Please try again.";
      setError(errorMessage);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!input.trim()) {
      setError("Please enter some text to generate a diagram.");
      return;
    }
    generateDiagram.mutate({ text: input });
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(diagram);
      toast({
        title: "Success",
        description: "Diagram code copied to clipboard",
        variant: "default",
        duration: 2000,
      });
    } catch (err) {
      console.log(err);
      toast({
        title: `Error`,
        description: "Failed to copy to clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <div className="container max-w-4xl space-y-6 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            AI Diagram Generator
          </CardTitle>
          <CardDescription className="text-center">
            Describe what you want to diagram and I&apos;ll create it for you
            using Mermaid.js
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Example: Create a sequence diagram showing how a user logs in to a website..."
                className="min-h-[128px] resize-y"
                disabled={isLoading}
              />
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating
                  </>
                ) : (
                  "Generate Diagram"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {diagram && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-lg border bg-white p-4 dark:bg-slate-900">
              <div id="mermaid-diagram" className="overflow-x-auto"></div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyToClipboard}
                className="text-sm"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Diagram Code
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
