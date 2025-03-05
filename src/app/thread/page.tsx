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

  const { data: thread } = api.thread.getThread.useQuery(
    { threadId: threadId! },
    { enabled: !!threadId }
  );

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

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4">
          {threadId ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {thread?.diagrams.map((diagram, index) => (
                <div key={diagram.id} className="space-y-4">
                  {/* Prompt message */}
                  <div className="flex justify-end">
                    <div className="bg-primary/10 rounded-lg p-4 max-w-[60%]">
                      <p className="text-sm">{diagram.prompt}</p>
                    </div>
                  </div>
                  {/* Diagram response */}
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-8 w-full">
                      <DiagramPreview
                        diagram={diagram.code}
                        diagramType={diagram.type}
                        onUpdate={(newCode) => {
                          // Handle diagram update if needed
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Select a thread or create a new one to start</p>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t bg-background p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your diagram..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Generating..." : "Send"}
            </Button>
          </form>
        </div>
      </div>

      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </div>
  );
} 