"use client";
import { useSession, signIn } from "next-auth/react";
import { api } from "@/trpc/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Diagram } from "@prisma/client";
import { DiagramHistoryItem } from "@/app/_components/diagram/diagram-history-item";
import { DiagramPreviewModal } from "@/app/_components/diagram/diagram-preview-modal";
import { useRouter } from "next/navigation";

interface DiagramNode {
  diagram: Diagram;
  children: DiagramNode[];
  level: number;
}

function buildDiagramTree(diagrams: Diagram[]): DiagramNode[] {
  const diagramMap = new Map<string, DiagramNode>();
  const rootNodes: DiagramNode[] = [];

  // First pass: create nodes
  diagrams.forEach(diagram => {
    diagramMap.set(diagram.id, {
      diagram,
      children: [],
      level: 0
    });
  });

  // Second pass: build tree structure
  diagrams.forEach(diagram => {
    const node = diagramMap.get(diagram.id)!;
    if (diagram.parentDiagramId) {
      const parentNode = diagramMap.get(diagram.parentDiagramId);
      if (parentNode) {
        parentNode.children.push(node);
        node.level = parentNode.level + 1;
      } else {
        rootNodes.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  });

  return rootNodes;
}

function DiagramTreeView({ 
  node, 
  onSelect 
}: { 
  node: DiagramNode; 
  onSelect: (diagram: Diagram) => void;
}) {
  const router = useRouter();

  const handleDiagramClick = () => {
    // Navigate to the generate page with the diagram ID
    router.push(`/generate?id=${node.diagram.id}`);
  };

  return (
    <div className="pl-4">
      <button
        onClick={handleDiagramClick}
        className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
      >
        <div className="flex-1">
          <div className="font-medium truncate">{node.diagram.prompt}</div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span>{formatDistanceToNow(new Date(node.diagram.createdAt))} ago</span>
            {node.children.length > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-xs text-blue-600">{node.children.length} follow-up{node.children.length > 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>
      </button>
      {node.children.length > 0 && (
        <div className="border-l pl-4 mt-2">
          {node.children.map((child) => (
            <DiagramTreeView 
              key={child.diagram.id} 
              node={child} 
              onSelect={onSelect} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DiagramHistory() {
  const { data: session } = useSession();
  const utils = api.useContext();
  const { data: diagrams, isLoading } = api.diagram.getUserDiagrams.useQuery(
    undefined,
    {
      enabled: !!session?.user,
    },
  );
  const updateDiagram = api.diagram.update.useMutation({
    onSuccess: () => {
      // Refetch diagrams after update
      void utils.diagram.getUserDiagrams.invalidate();
    },
  });
  const [selectedDiagram, setSelectedDiagram] = useState<Diagram | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const isMobile = useIsMobile();

  const handleHistoryClick = () => {
    if (!session?.user) {
      setShowLoginDialog(true);
    }
  };

  const handleDiagramUpdate = async (newContent: string) => {
    if (selectedDiagram) {
      updateDiagram.mutate({
        diagramId: selectedDiagram.id,
        code: newContent,
      });
      // Update the selected diagram locally
      setSelectedDiagram({
        ...selectedDiagram,
        code: newContent,
      });
    }
  };

  const diagramTree = diagrams ? buildDiagramTree(diagrams) : [];

  const content = (
    <ScrollArea className="h-screen">
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Diagram History</h2>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !session?.user ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
            <p>Sign in to view your diagram history</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => void signIn()}
            >
              Sign In
            </Button>
          </div>
        ) : diagrams?.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
            <p>No diagrams yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {diagramTree.map((node) => (
              <DiagramTreeView
                key={node.diagram.id}
                node={node}
                onSelect={() => {}} // We don't need this anymore since we're using direct navigation
              />
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );

  return (
    <>
      {isMobile ? (
        <MobileHistoryView
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        >
          {content}
        </MobileHistoryView>
      ) : (
        <DesktopHistoryView>
          {content}
        </DesktopHistoryView>
      )}

      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </>
  );
}

function HistorySkeleton() {
  return (
    <Button
      variant="link"
      className="h-auto w-full justify-start py-2 text-left text-muted-foreground"
      disabled
    >
      <div className="flex w-full flex-col">
        <Skeleton className="mb-1 h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </Button>
  );
}

interface MobileHistoryViewProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function MobileHistoryView({
  children,
  isOpen,
  onOpenChange,
}: MobileHistoryViewProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="link" className="fixed left-4 top-4 z-50">
          History
        </Button>
      </DrawerTrigger>
      <DrawerContent>{children}</DrawerContent>
    </Drawer>
  );
}

interface DesktopHistoryViewProps {
  children: React.ReactNode;
}

function DesktopHistoryView({
  children,
}: DesktopHistoryViewProps) {
  return (
    <div className="fixed left-0 top-0 z-50 w-[300px]">
      {children}
    </div>
  );
}

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in to access history</DialogTitle>
          <DialogDescription>
            Sign in to save your diagrams and access them anytime, anywhere.
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="default"
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Sign in
        </Button>
      </DialogContent>
    </Dialog>
  );
}
