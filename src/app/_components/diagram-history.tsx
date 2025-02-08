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
        id: selectedDiagram.id,
        content: newContent,
      });
      // Update the selected diagram locally
      setSelectedDiagram({
        ...selectedDiagram,
        content: newContent,
      });
    }
  };

  const renderHistoryContent = () => (
    <div className={`p-4 h-screen overflow-y-auto ${!isCollapsed || isMobile ? "glassmorphism" : ""}`}>
      <Button
        variant="link"
        className="mb-4 flex w-full items-start justify-start text-muted-foreground"
        onClick={() => {
          if (!session?.user) {
            handleHistoryClick();
          } else if (!isMobile) {
            setIsCollapsed(!isCollapsed);
          }
        }}
      >
        <span className="font-semibold">History</span>
      </Button>

      {(!isCollapsed || isMobile) && (
        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="space-y-2">
            {isLoading && (
              <>
                <HistorySkeleton />
                <HistorySkeleton />
                <HistorySkeleton />
              </>
            )}
            
            {!session?.user && (
              <>
                <DiagramHistoryItem
                  title="Example Diagram"
                  subtitle="Sign in to view history"
                  onClick={handleHistoryClick}
                />
                <DiagramHistoryItem
                  title="Example Diagram"
                  subtitle="Sign in to view history"
                  onClick={handleHistoryClick}
                />
                <DiagramHistoryItem
                  title="Example Diagram"
                  subtitle="Sign in to view history"
                  onClick={handleHistoryClick}
                />
              </>
            )}

            {session?.user && diagrams?.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                No diagrams yet
              </p>
            )}

            {session?.user &&
              diagrams?.map((diagram) => (
                <DiagramHistoryItem
                  key={diagram.id}
                  title={diagram.name ?? "Untitled Diagram"}
                  subtitle={`${formatDistanceToNow(diagram.createdAt, {
                    addSuffix: true,
                  })} • ${diagram.type}`}
                  onClick={() => setSelectedDiagram(diagram)}
                />
              ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  return (
    <>
      {isMobile ? (
        <MobileHistoryView
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          selectedDiagram={selectedDiagram}
          onClose={() => setSelectedDiagram(null)}
          onUpdate={handleDiagramUpdate}
        >
          {renderHistoryContent()}
        </MobileHistoryView>
      ) : (
        <DesktopHistoryView
          selectedDiagram={selectedDiagram}
          onClose={() => setSelectedDiagram(null)}
          onUpdate={handleDiagramUpdate}
        >
          {renderHistoryContent()}
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
  selectedDiagram: Diagram | null;
  onClose: () => void;
  onUpdate: (newContent: string) => void;
}

function MobileHistoryView({
  children,
  isOpen,
  onOpenChange,
  selectedDiagram,
  onClose,
  onUpdate,
}: MobileHistoryViewProps) {
  return (
    <>
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>
          <Button variant="link" className="fixed left-4 top-4 z-50">
            History
          </Button>
        </DrawerTrigger>
        <DrawerContent>{children}</DrawerContent>
      </Drawer>
      {selectedDiagram && (
        <DiagramPreviewModal
          diagram={selectedDiagram}
          isOpen={!!selectedDiagram}
          onClose={onClose}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}

interface DesktopHistoryViewProps {
  children: React.ReactNode;
  selectedDiagram: Diagram | null;
  onClose: () => void;
  onUpdate: (newContent: string) => void;
}

function DesktopHistoryView({
  children,
  selectedDiagram,
  onClose,
  onUpdate,
}: DesktopHistoryViewProps) {
  return (
    <div className="fixed left-0 top-0 z-50 w-[300px]">
      {children}
      {selectedDiagram && (
        <DiagramPreviewModal
          diagram={selectedDiagram}
          isOpen={!!selectedDiagram}
          onClose={onClose}
          onUpdate={onUpdate}
        />
      )}
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
