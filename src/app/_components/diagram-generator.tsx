"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
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
import { Loader, Copy, RefreshCw, Download, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DIAGRAM_TYPES,
  EXAMPLE_SUGGESTIONS,
  type DiagramType,
} from "@/types/diagram";
import {
  initializeMermaid,
  renderMermaidDiagram,
  changeTheme,
  getCurrentTheme,
  type MermaidTheme,
} from "@/lib/mermaid-config";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DiagramDownloadButton } from "./diagram-download-button";
import { LoginDialog } from "./login-dialog";
import { getAnonymousUser, updateAnonymousCredits } from "@/lib/anonymous-user";

export function DiagramGenerator() {
  const [input, setInput] = useState("");
  const [diagram, setDiagram] = useState("");
  const [diagramType, setDiagramType] = useState<DiagramType | null>(null);
  const [currentTheme, setCurrentTheme] = useState<MermaidTheme>("default");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplex, setIsComplex] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();
  const anonymousUser = getAnonymousUser();
  const [anonymousCredits, setAnonymousCredits] = useState(0);

  // Fetch user credits if logged in
  const { data: userCredits } = api.ai.getUserCredits.useQuery(undefined, {
    enabled: !!session?.user,
    refetchOnWindowFocus: true,
  });

  const themes: { label: string; value: MermaidTheme }[] = [
    { label: "Default", value: "default" },
    { label: "Forest", value: "forest" },
    { label: "Dark", value: "dark" },
    { label: "Neutral", value: "neutral" },
    { label: "Base", value: "base" },
  ];

  useEffect(() => {
    // Initialize Mermaid when component mounts
    void initializeMermaid(currentTheme);
  }, []);

  useEffect(() => {
    setAnonymousCredits(getAnonymousUser().credits);
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
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Render the new diagram
        await renderMermaidDiagram(data.diagram, "#mermaid-diagram");

        // Update anonymous user credits if not logged in
        if (!session?.user) {
          const requiredCredits = isComplex ? 2 : 1;
          updateAnonymousCredits(anonymousUser.credits - requiredCredits);
        }

        toast({
          title: "Success",
          description: data.message,
          variant: "default",
          duration: 3000,
        });
      } catch (err) {
        console.error("Mermaid render error:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to render diagram";
        setError(errorMessage);
      }
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate diagram. Please try again with a different description.";
      setError(errorMessage);
      
      // Handle credit-related errors
      if (err instanceof Error) {
        if (err.message.includes("Please login to generate more diagrams")) {
          setShowLoginDialog(true);
        } else if (err.message.includes("Insufficient credits")) {
          toast({
            title: "Out of Credits",
            description: "You've used all your credits for today. Credits will reset tomorrow!",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Check credits based on user type
    if (session?.user && userCredits?.credits !== undefined) {
      const requiredCredits = isComplex ? 2 : 1;
      if (userCredits.credits < requiredCredits) {
        toast({
          title: "Insufficient Credits",
          description: "You don't have enough credits for this operation. Credits will reset tomorrow!",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
    } else {
      // Check anonymous user credits
      const requiredCredits = isComplex ? 2 : 1;
      if (anonymousUser.credits < requiredCredits) {
        setShowLoginDialog(true);
        return;
      }
    }
    
    if (!input.trim()) {
      setError("Please enter some text to generate a diagram.");
      return;
    }

    generateDiagram.mutate({ 
      text: input, 
      isComplex,
      anonymousId: !session?.user ? anonymousUser.id : undefined,
    });
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

  const handleReset = () => {
    setInput("");
    setDiagram("");
    setDiagramType(null);
    setError(null);
    const element = document.querySelector("#mermaid-diagram");
    if (element) element.innerHTML = "";
  };

  const handleThemeChange = async (theme: MermaidTheme) => {
    try {
      setCurrentTheme(theme);
      await changeTheme(theme);
      if (diagram) {
        await renderMermaidDiagram(diagram, "#mermaid-diagram");
      }
    } catch (err) {
      console.error("Failed to change theme:", err);
      toast({
        title: "Error",
        description: "Failed to change theme",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <div className="container max-w-4xl space-y-6 py-6">
      <Card className="border-none shadow-none">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Example: ${EXAMPLE_SUGGESTIONS[diagramType ?? "flowchart"]}`}
                className="min-h-[128px] resize-y"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      if (!isLoading && input.trim()) {
                        void handleSubmit(e);
                      }
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
                <div className="text-sm text-muted-foreground">
                  {session?.user ? (
                    `Credits: ${userCredits?.credits ?? 0} / 10`
                  ) : (
                    `Credits: ${anonymousCredits} / 5`
                  )}
                  {isComplex && (
                    <span className="ml-1">(Uses 2 credits)</span>
                  )}
                </div>
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
                variant="minimal"
                onClick={handleReset}
                disabled={isLoading || (!input && !diagram)}
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

      {diagram && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {diagramType &&
                `${diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} Diagram`}
            </CardTitle>
            {diagramType && (
              <CardDescription>{DIAGRAM_TYPES[diagramType]}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-white p-4 dark:bg-slate-900">
              <div
                id="mermaid-diagram"
                className="flex justify-center overflow-x-auto"
              ></div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  Theme
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {themes.map((theme) => (
                  <DropdownMenuItem
                    key={theme.value}
                    onClick={() => void handleThemeChange(theme.value)}
                  >
                    {theme.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyToClipboard}
              className="text-sm"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </Button>
            <DiagramDownloadButton
              content={diagram}
              diagramId="mermaid-diagram"
              type={diagramType ?? "diagram"}
              showLabel={true}
            />
          </CardFooter>
        </Card>
      )}

      <LoginDialog 
        isOpen={showLoginDialog} 
        onClose={() => setShowLoginDialog(false)} 
      />
    </div>
  );
}
