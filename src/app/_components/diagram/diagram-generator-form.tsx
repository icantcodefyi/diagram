import { useState, useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/texturebutton";
import { Textarea } from "@/components/ui/textarea";
import { Loader, RefreshCw, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  EXAMPLE_SUGGESTIONS,
  type DiagramType,
} from "@/types/diagram";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { renderMermaidDiagram } from "@/lib/mermaid-config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { getAnonymousUser, updateAnonymousCredits } from "@/lib/anonymous-user";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DiagramGeneratorFormProps {
  onDiagramGenerated: (
    diagram: string,
    type: DiagramType,
    enhancedText?: string,
    diagramId?: string,
    prompt?: string
  ) => void;
  onError: (error: string | null) => void;
  onShowLogin: () => void;
}

export function DiagramGeneratorForm({
  onDiagramGenerated,
  onError,
  onShowLogin,
}: DiagramGeneratorFormProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplex, setIsComplex] = useState(false);
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();
  const hasInitialized = useRef(false);

  const generateDiagram = api.diagram.generateNew.useMutation({
    onMutate: () => {
      setIsLoading(true);
      onError(null);
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
        // Add a small delay to ensure DOM is ready
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Render the new diagram
        await renderMermaidDiagram(data.code, "#mermaid-diagram");

        onDiagramGenerated(
          data.code,
          data.type as DiagramType,
          undefined,
          data.id,
          data.prompt
        );

        toast({
          title: "Success",
          description: "Diagram generated successfully",
          variant: "default",
          duration: 3000,
          className: "rounded",
        });
      } catch (err) {
        console.error("Mermaid render error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to render diagram";
        onError(errorMessage);
      }
    },
    onError: (err) => {
      if (err instanceof Error) {
        // Handle validation errors specifically
        if (err.message.includes("Invalid input")) {
          onError("Your input doesn't contain enough information to generate a meaningful diagram. Please provide more details about what you want to visualize.");
          toast({
            title: "Invalid Input",
            description: "Please provide more detailed information about what you want to visualize.",
            variant: "destructive",
            duration: 5000,
            className: "rounded",
          });
          return;
        }
        
        // Handle credit-related errors
        if (err.message.includes("Insufficient credits")) {
          setShowCreditDialog(true);
          return;
        }
      }

      // Handle other errors
      const errorMessage = err instanceof Error
        ? err.message
        : "Failed to generate diagram. Please try again with a different description.";
      onError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
        className: "rounded",
      });
    },
  });

  // Handle URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const textQuery = searchParams.get("text");

    if (textQuery && !hasInitialized.current) {
      hasInitialized.current = true;
      setInput(textQuery);

      generateDiagram.mutate({
        prompt: textQuery,
        isComplex,
      });

      // Clear the URL query parameter after generation starts
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [isComplex, generateDiagram]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);

    if (!input.trim()) {
      onError("Please enter some text to generate a diagram.");
      return;
    }

    generateDiagram.mutate({
      prompt: input,
      isComplex,
    });
  };

  const handleReset = () => {
    setInput("");
    onError(null);
  };

  return (
    <>
      <Card className="border-none shadow-none">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Example: ${EXAMPLE_SUGGESTIONS.flowchart}`}
                className="min-h-[128px] resize-y rounded-[0.75rem]"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isLoading && input.trim()) {
                      void handleSubmit(e);
                    }
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="complex-mode"
                            checked={isComplex}
                            onCheckedChange={setIsComplex}
                            disabled={isLoading}
                          />
                          <Label
                            htmlFor="complex-mode"
                            className="cursor-pointer select-none text-sm text-muted-foreground"
                          >
                            Generate detailed and sophisticated diagram
                          </Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>impress your professor :3</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="minimal"
                onClick={handleReset}
                disabled={isLoading || !input}
                className="min-w-[140px]"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                type="submit"
                variant="accent"
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

      <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Need More Credits?</DialogTitle>
            <DialogDescription className="pt-2">
              {session?.user ? (
                "You've used all your credits for today. Since we're still in the experimental stage, you can request more credits by DMing us on Twitter."
              ) : (
                "You've used all your anonymous credits. Sign up to get more credits and unlock additional features!"
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            {session?.user ? (
              <Button
                variant="accent"
                onClick={() => window.open("https://twitter.com/messages/compose?recipient_id=icantcodefyi", "_blank")}
              >
                <Twitter className="mr-2 h-4 w-4" />
                DM on Twitter
              </Button>
            ) : (
              <Button
                variant="accent"
                onClick={() => {
                  setShowCreditDialog(false);
                  onShowLogin();
                }}
              >
                Sign Up
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 