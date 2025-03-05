"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MessageSquare, Trash2 } from "lucide-react";

interface ThreadHistoryProps {
  threadId: string;
  onDiagramSelect: (diagram: string, type: string, prompt: string) => void;
}

export function ThreadHistory({ threadId, onDiagramSelect }: ThreadHistoryProps) {
  const [selectedDiagramId, setSelectedDiagramId] = useState<string | null>(null);
  const { data: thread, isLoading } = api.thread.getThread.useQuery(
    { threadId },
    { enabled: !!threadId }
  );

  const deleteThread = api.thread.deleteThread.useMutation({
    onSuccess: () => {
      toast.success("Thread deleted successfully");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeleteThread = () => {
    if (confirm("Are you sure you want to delete this thread?")) {
      deleteThread.mutate({ threadId });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <h3 className="font-semibold">Chat History</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeleteThread}
          disabled={isLoading}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : thread?.diagrams.length === 0 ? (
            <div className="text-sm text-muted-foreground">No diagrams yet</div>
          ) : (
            thread?.diagrams.map((diagram) => (
              <motion.div
                key={diagram.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`group relative cursor-pointer rounded-lg border p-3 transition-colors ${
                  selectedDiagramId === diagram.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted"
                }`}
                onClick={() => {
                  setSelectedDiagramId(diagram.id);
                  onDiagramSelect(diagram.code, diagram.type, diagram.prompt);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-xs font-medium text-primary">
                      {diagram.type.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-sm font-medium line-clamp-2">
                      {diagram.prompt}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {new Date(diagram.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs font-medium text-primary">
                        {diagram.type}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 