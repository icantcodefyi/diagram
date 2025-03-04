"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DiagramPreview } from "@/app/_components/diagram/diagram-preview";
import { ThreadHistory } from "@/app/_components/diagram/thread-history";
import { AuthButton } from "@/app/_components/auth-button";
import { LoginDialog } from "@/app/_components/login-dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ThreadPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [currentDiagram, setCurrentDiagram] = useState<string | null>(null);
  const [diagramType, setDiagramType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createThread = api.thread.createThread.useMutation({
    onSuccess: (data) => {
      setThreadId(data.thread.id);
      setCurrentDiagram(data.diagram.code);
      setDiagramType(data.diagram.type);
      setIsLoading(false);
      toast.success("Thread created successfully!");
    },
    onError: (error) => {
      console.error("Error creating thread:", error);
      setIsLoading(false);
      toast.error(error.message);
    },
  });

  const generateDiagram = api.thread.generateDiagram.useMutation({
    onSuccess: (data) => {
      setCurrentDiagram(data.diagram);
      setDiagramType(data.type);
      setIsLoading(false);
      toast.success("Diagram generated successfully!");
    },
    onError: (error) => {
      console.error("Error generating diagram:", error);
      setIsLoading(false);
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    if (!threadId) {
      // Create new thread
      createThread.mutate({
        prompt,
        isComplex: false,
      });
    } else {
      // Generate diagram in existing thread
      generateDiagram.mutate({
        threadId,
        prompt,
        isComplex: false,
      });
    }
  };

  const handleDiagramSelect = (diagram: string, type: string) => {
    setCurrentDiagram(diagram);
    setDiagramType(type);
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Diagram Thread</h1>
        <AuthButton />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr]">
        {threadId && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThreadHistory
              threadId={threadId}
              onDiagramSelect={handleDiagramSelect}
            />
          </motion.div>
        )}

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="prompt" className="text-sm font-medium">
                  {threadId ? "Add to thread" : "Create new thread"}
                </label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your diagram description..."
                  className="min-h-[100px]"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Generating..."
                  : threadId
                  ? "Add to Thread"
                  : "Create Thread"}
              </Button>
            </form>
          </motion.div>

          {currentDiagram && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DiagramPreview
                diagram={currentDiagram}
                diagramType={diagramType}
                onUpdate={setCurrentDiagram}
              />
            </motion.div>
          )}
        </div>
      </div>

      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </div>
  );
} 