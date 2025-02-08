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
import { getAnonymousUser, updateAnonymousCredits } from "@/lib/anonymous-user";
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

interface DiagramGeneratorFormProps {
  onDiagramGenerated: (diagram: string, type: DiagramType) => void;
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
  const anonymousUser = getAnonymousUser();
  const [anonymousCredits, setAnonymousCredits] = useState(0);
  const hasInitialized = useRef(false);

  // Fetch user credits if logged in
  const { data: userCredits } = api.ai.getUserCredits.useQuery(undefined, {
    enabled: !!session?.user,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    setAnonymousCredits(getAnonymousUser().credits);
  }, []);

  const generateDiagram = api.ai.generateDiagram.useMutation({
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
        await renderMermaidDiagram(data.diagram, "#mermaid-diagram");

        // Update anonymous user credits if not logged in
        if (!session?.user) {
          const requiredCredits = isComplex ? 2 : 1;
          updateAnonymousCredits(anonymousUser.credits - requiredCredits);
        }

        onDiagramGenerated(data.diagram, data.type);

        toast({
          title: "Success",
          description: data.message,
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
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to generate diagram. Please try again with a different description.";
      onError(errorMessage);

      // Handle credit-related errors
      if (err instanceof Error) {
        if (err.message.includes("Please login to generate more diagrams")) {
          onShowLogin();
        } else if (err.message.includes("Insufficient credits")) {
          toast({
            title: "Out of Credits",
            description:
              "You've used all your credits for today. Credits will reset tomorrow!",
            variant: "destructive",
            duration: 5000,
            className: "rounded",
          });
        }
      }
    },
  });

  // Handle URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const textQuery = searchParams.get("text");

    if (textQuery && !hasInitialized.current) {
      hasInitialized.current = true;
      setInput(textQuery);

      const generateFromQuery = async () => {
        // Check credits first
        if (session?.user && userCredits?.credits !== undefined) {
          const requiredCredits = isComplex ? 2 : 1;
          if (userCredits.credits < requiredCredits) {
            toast({
              title: "Insufficient Credits",
              description: "You don't have enough credits for this operation.",
              variant: "destructive",
              duration: 5000,
              className: "rounded",
            });
            return;
          }
        } else {
          const requiredCredits = isComplex ? 2 : 1;
          if (anonymousUser.credits < requiredCredits) {
            onShowLogin();
            return;
          }
        }

        generateDiagram.mutate({
          text: textQuery,
          isComplex,
          anonymousId: !session?.user ? anonymousUser.id : undefined,
        });

        // Clear the URL query parameter after generation starts
        window.history.replaceState({}, "", window.location.pathname);
      };

      void generateFromQuery();
    }
  }, [
    session?.user,
    userCredits?.credits,
    isComplex,
    anonymousUser.credits,
    anonymousUser.id,
    generateDiagram,
    toast,
    onShowLogin,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);

    // Check credits based on user type
    if (session?.user && userCredits?.credits !== undefined) {
      const requiredCredits = isComplex ? 2 : 1;
      if (userCredits.credits < requiredCredits) {
        setShowCreditDialog(true);
        return;
      }
    } else {
      // Check anonymous user credits
      const requiredCredits = isComplex ? 2 : 1;
      if (anonymousUser.credits < requiredCredits) {
        onShowLogin();
        return;
      }
    }

    if (!input.trim()) {
      onError("Please enter some text to generate a diagram.");
      return;
    }

    generateDiagram.mutate({
      text: input,
      isComplex,
      anonymousId: !session?.user ? anonymousUser.id : undefined,
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
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <AnimatedCounter 
                      value={session === null ? anonymousCredits : userCredits?.credits}
                      className="tabular-nums"
                    />
                  </Badge>
                  {isComplex && <span className="text-xs text-muted-foreground">(Uses 2 credits)</span>}
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
              You&apos;ve used all your credits for today. Since we&apos;re still in the experimental stage, 
              you can request more credits by DMing us on Twitter.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              variant="accent"
              onClick={() => window.open("https://twitter.com/messages/compose?recipient_id=icantcodefyi", "_blank")}
            >
              <Twitter className="mr-2 h-4 w-4" />
              DM on Twitter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 