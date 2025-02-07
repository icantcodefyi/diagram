/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/trpc/react";
import { useDiagramStore } from "@/store/diagram-store";
import type { Diagram } from "@/store/diagram-store";
import { DiagramPreviewCard } from "@/app/_components/diagram-preview-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

interface DbDiagram {
  id: string;
  content: string;
  type: string;
  name: string | null;
  isComplex: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
}

function convertDbDiagramToStoreDiagram(dbDiagram: DbDiagram): Diagram {
  return {
    id: dbDiagram.id,
    content: dbDiagram.content,
    type: dbDiagram.type,
    name: dbDiagram.name ?? undefined,
    isComplex: dbDiagram.isComplex,
    createdAt: dbDiagram.createdAt,
    updatedAt: dbDiagram.updatedAt,
  };
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setDiagrams, setCredits } = useDiagramStore();

  const { data: diagrams, isLoading: diagramsLoading } =
    api.ai.getUserDiagrams.useQuery(undefined, {
      enabled: !!session,
    });

  const { data: credits, isLoading: creditsLoading } =
    api.ai.getUserCredits.useQuery(undefined, {
      enabled: !!session,
    });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (diagrams) {
      const typedDiagrams: Diagram[] = diagrams.map((d: DbDiagram) =>
        convertDbDiagramToStoreDiagram(d),
      );
      setDiagrams(typedDiagrams);
    }
  }, [diagrams, setDiagrams]);

  useEffect(() => {
    if (credits?.credits) {
      setCredits(credits.credits);
    }
  }, [credits, setCredits]);

  if (status === "loading" || diagramsLoading || creditsLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-8">
        <Button
          variant="link"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="space-y-8 px-8">
        <h1 className="text-2xl font-medium">Settings</h1>
        <section>
          <h2 className="mb-4 text-lg font-medium">Profile</h2>
          <Card className="p-4 sm:p-6">
            <div className="space-y-6 sm:space-y-8">
              {/* User Info Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {session.user?.image && (
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="h-16 w-16 sm:h-12 sm:w-12 rounded-full border-2 border-border"
                      />
                    )}
                    <div>
                      <h3 className="text-xl sm:text-lg font-medium">{session.user?.name ?? 'User'}</h3>
                      <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => void signOut({ callbackUrl: "/" })}
                  className="w-[100px] sm:w-[100px] border-[1px] dark:border-[2px] border-black/10 dark:border-neutral-950 bg-gradient-to-b from-red-300/90 to-red-500 dark:from-red-300/90 dark:to-red-500 p-[1px] transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-full h-full flex items-center justify-center gap-2 bg-gradient-to-b from-red-400/60 to-red-500/60 text-sm text-white/90 transition duration-300 ease-in-out hover:bg-gradient-to-b hover:from-red-400/70 hover:to-red-600/70 dark:hover:from-red-400/70 dark:hover:to-red-500/80 active:bg-gradient-to-b active:from-red-400/80 active:to-red-600/80 dark:active:from-red-400 dark:active:to-red-500 disabled:hover:from-red-400 disabled:hover:to-red-500 px-4 py-2 rounded-[10px]">
                    Sign Out
                  </div>
                </Button>
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Credits Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <p className="text-3xl font-semibold">{credits?.credits ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Available Credits</p>
                </div>
                <div className="text-center sm:text-right">
                  <div className="inline-block px-4 py-3 bg-muted/50 rounded-lg">
                    <p className="text-sm space-y-1">
                      <span className="block text-muted-foreground">Simple: <span className="text-foreground font-medium">1 credit</span></span>
                      <span className="block text-muted-foreground">Complex: <span className="text-foreground font-medium">2 credits</span></span>
                      <span className="block text-xs text-muted-foreground/80 mt-2">Resets daily</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-medium">Your Diagrams</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {diagrams && diagrams.length > 0 ? (
              diagrams.map((diagram: DbDiagram) => (
                <DiagramPreviewCard
                  key={diagram.id}
                  diagram={convertDbDiagramToStoreDiagram(diagram)}
                />
              ))
            ) : (
              <Card className="col-span-full p-6 text-center">
                <p className="mb-4 text-gray-500">No diagrams yet</p>
                <Button onClick={() => router.push("/")}>
                  Create Your First Diagram
                </Button>
              </Card>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
