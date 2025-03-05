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
import { ThreadsList } from "@/app/_components/diagram/threads-list";

export default function ThreadPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [currentDiagram, setCurrentDiagram] = useState<string | null>(null);
  const [diagramType, setDiagramType] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createThreadWithPrompt = api.thread.createThread.useMutation({
    onSuccess: (data) => {
      setThreadId(data.thread.id);
      setCurrentDiagram(data.diagram.code);
      setDiagramType(data.diagram.type);
      setCurrentPrompt(data.diagram.prompt);
      setIsLoading(false);
      toast.success("Thread created successfully!");
    },
    onError: (error) => {
      console.error("Error creating thread:", error);
      setIsLoading(false);
      toast.error(error.message);
    },
  });

  const createDiagramInThread = api.thread.createDiagramInThread.useMutation({
    onSuccess: (data) => {
      setCurrentDiagram(data.diagram);
      setDiagramType(data.type);
      setCurrentPrompt(data.storedDiagram.prompt);
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
      createThreadWithPrompt.mutate({
        prompt,
        isComplex: false,
      });
    } else {
      // Generate diagram in existing thread
      createDiagramInThread.mutate({
        threadId,
        prompt,
        isComplex: false,
      });
    }
  };

  const handleDiagramSelect = (diagram: string, type: string, prompt: string) => {
    setCurrentDiagram(diagram);
    setDiagramType(type);
    setCurrentPrompt(prompt);
  };

  return (
    <div className="flex h-screen">
      {/* Left sidebar with threads */}
      <div className="w-64 border-r bg-background p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Threads</h1>
          <AuthButton />
        </div>
        <div className="space-y-4">
          <ThreadsList
            onThreadSelect={(threadId) => {
              setThreadId(threadId || null);
              if (!threadId) {
                setCurrentDiagram(null);
                setDiagramType(null);
                setCurrentPrompt(null);
              }
            }}
            selectedThreadId={threadId}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1">
        {/* Chat history */}
        <div className="w-80 border-r bg-background p-4">
          {threadId ? (
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
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Select a thread to view chat history</p>
            </div>
          )}
        </div>

        {/* Diagram and prompt area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
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
                  prompt={currentPrompt ?? undefined}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </div>
  );
} 