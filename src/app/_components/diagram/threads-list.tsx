"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface ThreadsListProps {
  onThreadSelect: (threadId: string) => void;
  selectedThreadId: string | null;
}

export function ThreadsList({ onThreadSelect, selectedThreadId }: ThreadsListProps) {
  const { data: threads, isLoading } = api.thread.getThreads.useQuery();

  const deleteThread = api.thread.deleteThread.useMutation({
    onSuccess: () => {
      toast.success("Thread deleted successfully");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeleteThread = (threadId: string) => {
    if (confirm("Are you sure you want to delete this thread?")) {
      deleteThread.mutate({ threadId });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Your Threads</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onThreadSelect("")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Thread
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : threads?.length === 0 ? (
            <div className="text-sm text-muted-foreground">No threads yet</div>
          ) : (
            threads?.map((thread) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                  selectedThreadId === thread.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted"
                }`}
                onClick={() => onThreadSelect(thread.id)}
              >
                <div className="text-sm font-medium line-clamp-2">
                  {thread.diagrams[0]?.prompt || "Untitled Thread"}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {new Date(thread.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs font-medium text-primary">
                    {thread.diagrams[0]?.type || "No diagrams"}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-6 w-full text-xs text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteThread(thread.id);
                  }}
                >
                  Delete Thread
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 