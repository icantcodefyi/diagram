"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ThreadHistoryProps {
  threadId: string;
  onDiagramSelect: (diagram: string, type: string) => void;
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
    <div className="w-64 space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Thread History</h3>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteThread}
          disabled={isLoading}
        >
          Delete Thread
        </Button>
      </div>
      <ScrollArea className="h-[600px]">
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
                className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                  selectedDiagramId === diagram.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted"
                }`}
                onClick={() => {
                  setSelectedDiagramId(diagram.id);
                  onDiagramSelect(diagram.code, diagram.type);
                }}
              >
                <div className="text-sm font-medium">{diagram.prompt}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {new Date(diagram.createdAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 