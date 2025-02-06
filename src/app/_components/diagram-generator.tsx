"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/texturebutton";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader, Copy, RefreshCw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DIAGRAM_TYPES, EXAMPLE_SUGGESTIONS, type DiagramType } from "@/types/diagram";
import { initializeMermaid, renderMermaidDiagram } from "@/lib/mermaid-config";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function DiagramGenerator() {
  const [input, setInput] = useState("");
  const [diagram, setDiagram] = useState("");
  const [diagramType, setDiagramType] = useState<DiagramType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplex, setIsComplex] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Mermaid when component mounts
    void initializeMermaid();
  }, []);

  // Initialize mutation
  const generateDiagram = api.ai.generateDiagram.useMutation({
    onMutate: () => {
      setIsLoading(true);
      setError(null);
      // Clear previous diagram before generating new one
      const element = document.querySelector("#mermaid-diagram");
      if (element) {
        element.innerHTML = "";
      }
    },
    onSettled: () => {
      setIsLoading(false);
    },
    onSuccess: async (data) => {
      try {
        setDiagram(data.diagram);
        setDiagramType(data.type);
        
        // Add a small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Render the new diagram
        await renderMermaidDiagram(data.diagram, "#mermaid-diagram");

        toast({
          title: "Success",
          description: data.message,
          variant: "default",
          duration: 3000,
        });
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError("Failed to render diagram. Please try again with a simpler description.");
      }
    },
    onError: (err) => {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to generate diagram. Please try again with a different description.";
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
    generateDiagram.mutate({ text: input, isComplex });
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
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleDownloadSVG = async () => {
    try {
      const element = document.querySelector("#mermaid-diagram svg");
      if (!element) throw new Error("No diagram found");

      const svgData = new XMLSerializer().serializeToString(element);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `diagram-${Date.now()}.svg`;
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
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to download diagram",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleReset = () => {
    setInput("");
    setDiagram("");
    setDiagramType(null);
    setError(null);
    const element = document.querySelector("#mermaid-diagram");
    if (element) element.innerHTML = "";
  };

  return (
    <div className="container max-w-4xl space-y-6 py-6">
      <Card className="shadow-none border-none">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Example: ${EXAMPLE_SUGGESTIONS[diagramType ?? "flowchart"]}`}
                className="min-h-[128px] resize-y"
                disabled={isLoading}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="complex-mode"
                  checked={isComplex}
                  onCheckedChange={setIsComplex}
                  disabled={isLoading}
                />
                <Label htmlFor="complex-mode" className="text-sm text-muted-foreground cursor-pointer select-none">
                  Generate detailed and sophisticated diagram
                </Label>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
                disabled={isLoading || (!input && !diagram)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
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
          <CardHeader>
            <CardTitle className="text-xl">
              {diagramType && `${diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} Diagram`}
            </CardTitle>
            {diagramType && (
              <CardDescription>
                {DIAGRAM_TYPES[diagramType]}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-white p-4 dark:bg-slate-900">
              <div id="mermaid-diagram" className="overflow-x-auto flex justify-center"></div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyToClipboard}
              className="text-sm"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadSVG}
              className="text-sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Download SVG
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
