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
  onDiagramGenerated: (diagram: string, type: DiagramType, enhancedText?: string) => void;
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
  const [anonymousCredits, setAnonymousCredits] = useState<number | null>(null);
  const { toast } = useToast();
  const { data: session } = useSession();
  const hasInitialized = useRef(false);

  // Fetch user credits if logged in
  const { data: userCredits } = api.ai.getUserCredits.useQuery(undefined, {
    enabled: !!session?.user,
    refetchOnWindowFocus: true,
  });

  // Fetch anonymous user credits if not logged in
  useEffect(() => {
    if (!session?.user) {
      const fetchAnonymousCredits = async () => {
        try {
          const anonUser = await getAnonymousUser();
          setAnonymousCredits(anonUser.credits);
        } catch (error) {
          console.error("Error fetching anonymous credits:", error);
        }
      };
      void fetchAnonymousCredits();
    }
  }, [session?.user]);

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

        onDiagramGenerated(data.diagram, data.type, data.enhancedText);

        // Update anonymous credits if not logged in
        if (!session?.user && anonymousCredits !== null) {
          const newCredits = anonymousCredits - (isComplex ? 2 : 1);
          await updateAnonymousCredits(newCredits);
          setAnonymousCredits(newCredits);
        }

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
          toast({
            title: "Out of Credits",
            description: session?.user 
              ? "You've used all your credits for today. Credits will reset tomorrow!"
              : "You've used all your anonymous credits. Sign up to get more credits!",
            variant: "destructive",
            duration: 5000,
            className: "rounded",
            action: !session?.user ? (
              <Button variant="secondary" size="sm" onClick={onShowLogin}>
                Sign Up
              </Button>
            ) : undefined,
          });
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

  // Add state for anonymous ID
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  // Fetch anonymous ID if not logged in
  useEffect(() => {
    if (!session?.user) {
      const fetchAnonymousId = async () => {
        try {
          const anonUser = await getAnonymousUser();
          setAnonymousId(anonUser.id);
        } catch (error) {
          console.error("Error fetching anonymous ID:", error);
        }
      };
      void fetchAnonymousId();
    }
  }, [session?.user]);

  // Handle URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const textQuery = searchParams.get("text");

    if (textQuery && !hasInitialized.current) {
      hasInitialized.current = true;
      setInput(textQuery);

      const generateFromQuery = async () => {
        const credits = session?.user ? userCredits?.credits : anonymousCredits;
        if (credits !== undefined && credits !== null) {
          const requiredCredits = isComplex ? 2 : 1;
          if (credits < requiredCredits) {
            toast({
              title: "Insufficient Credits",
              description: session?.user 
                ? "You don't have enough credits for this operation."
                : "Not enough anonymous credits. Sign up to get more credits!",
              variant: "destructive",
              duration: 5000,
              className: "rounded",
              action: !session?.user ? (
                <Button variant="secondary" size="sm" onClick={onShowLogin}>
                  Sign Up
                </Button>
              ) : undefined,
            });
            return;
          }
        }

        if (!session?.user && !anonymousId) {
          console.error("No anonymous ID available");
          return;
        }

        generateDiagram.mutate({
          text: textQuery,
          isComplex,
          anonymousId: !session?.user ? anonymousId! : undefined,
        });

        // Clear the URL query parameter after generation starts
        window.history.replaceState({}, "", window.location.pathname);
      };

      void generateFromQuery();
    }
  }, [session?.user, userCredits?.credits, anonymousCredits, anonymousId, isComplex, generateDiagram, toast, onShowLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);

    const credits = session?.user ? userCredits?.credits : anonymousCredits;
    if (credits !== undefined && credits !== null) {
      const requiredCredits = isComplex ? 2 : 1;
      if (credits < requiredCredits) {
        setShowCreditDialog(true);
        return;
      }
    }

    if (!input.trim()) {
      onError("Please enter some text to generate a diagram.");
      return;
    }

    if (!session?.user && !anonymousId) {
      console.error("No anonymous ID available");
      return;
    }

    generateDiagram.mutate({
      text: input,
      isComplex,
      anonymousId: !session?.user ? anonymousId! : undefined,
    });
  };

  const handleReset = () => {
    setInput("");
    onError(null);
  };

  const credits = session?.user ? userCredits?.credits : anonymousCredits;

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
                            Generate detailed diagram
                          </Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>impress your professor :3</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center gap-2">
                {isComplex && <span className="text-xs text-muted-foreground">(Uses 2 credits)</span>}
                  <Badge variant="outline" className="text-xs">
                    <AnimatedCounter 
                      value={credits}
                      className="tabular-nums"
                    />
                    {!session?.user && " (Anonymous)"}
                  </Badge>
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