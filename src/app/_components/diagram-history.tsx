"use client";
import { useSession, signIn } from "next-auth/react";
import { api } from "@/trpc/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { DiagramPreviewModal } from "./diagram-preview-modal";
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

type DiagramType = Diagram;

export function DiagramHistory() {
  const { data: session } = useSession();
  const { data: diagrams, isLoading } = api.diagram.getUserDiagrams.useQuery(
    undefined,
    {
      enabled: !!session?.user,
    },
  ) as { data: DiagramType[] | undefined; isLoading: boolean };
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramType | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const isMobile = useIsMobile();

  const handleHistoryClick = () => {
    if (!session?.user) {
      setShowLoginDialog(true);
    }
  };

  const HistoryContent = () => (
    <div className="glassmorphism p-4 h-screen overflow-y-auto">
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
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Button
                  key={i}
                  variant="link"
                  className="h-auto w-full justify-start py-2 text-left text-muted-foreground"
                  disabled
                >
                  <div className="flex w-full flex-col">
                    <Skeleton className="mb-1 h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Button>
              ))
            ) : !session?.user ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Button
                  key={i}
                  variant="link"
                  className="h-auto w-full justify-start py-2 text-left text-muted-foreground"
                  onClick={handleHistoryClick}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">Example Diagram</span>
                    <span className="text-xs text-muted-foreground">
                      Sign in to view history
                    </span>
                  </div>
                </Button>
              ))
            ) : diagrams && diagrams.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No diagrams yet
              </p>
            ) : (
              diagrams?.map((diagram: DiagramType) => (
                <Button
                  key={diagram.id}
                  variant="link"
                  className="h-auto w-full justify-start py-2 text-left text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setSelectedDiagram(diagram)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {diagram.name ?? "Untitled Diagram"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(diagram.createdAt, {
                        addSuffix: true,
                      })}{" "}
                      • {diagram.type}
                    </span>
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );

  return (
    <>
      {isMobile ? (
        <>
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="link" className="fixed left-4 top-4 z-50">
                History
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <HistoryContent />
            </DrawerContent>
          </Drawer>
          {selectedDiagram && (
            <DiagramPreviewModal
              diagram={selectedDiagram}
              isOpen={!!selectedDiagram}
              onClose={() => setSelectedDiagram(null)}
            />
          )}
        </>
      ) : (
        <div className="fixed left-0 top-0 z-50 w-[300px]">
          <HistoryContent />
          {selectedDiagram && (
            <DiagramPreviewModal
              diagram={selectedDiagram}
              isOpen={!!selectedDiagram}
              onClose={() => setSelectedDiagram(null)}
            />
          )}
        </div>
      )}

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
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
    </>
  );
}
