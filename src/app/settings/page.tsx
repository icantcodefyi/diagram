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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Crown, LayoutGrid } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const { data: subscription } = api.ai.getUserSubscription.useQuery(undefined, {
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
      <div className="mx-auto max-w-3xl space-y-4 p-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-8 w-48" />
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

  const isPro = subscription?.status === "active";
  const totalDiagrams = diagrams?.length ?? 0;
  const complexDiagrams = diagrams?.filter(d => d.isComplex).length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-3xl p-4">
        <Button
          variant="link"
          onClick={() => router.push("/generate")}
          className="mb-8 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Generator
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account and preferences
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={session.user?.image ?? ''} alt={session.user?.name ?? 'User'} />
                  <AvatarFallback>{session.user?.name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-medium">
                      {session.user?.name ?? 'User'}
                    </h2>
                    {isPro && (
                      <Badge variant="secondary" className="gap-1">
                        <Crown className="h-3 w-3 text-accent" />
                        PRO
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => void signOut({ callbackUrl: "/" })}
                size="sm"
              >
                Sign Out
              </Button>
            </div>

            <Separator />

            {/* Plan Info */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">{isPro ? 'Pro Plan' : 'Free Plan'}</h3>
                <p className="text-sm text-muted-foreground">
                  {isPro 
                    ? `Active until ${subscription.currentPeriodEnd.toLocaleDateString()}`
                    : 'Limited features and credits'}
                </p>
              </div>
              {!isPro && (
                <Button
                  onClick={() => router.push("/pricing")}
                  className="gap-1"
                >
                  <Crown className="h-4 w-4" />
                  Upgrade
                </Button>
              )}
            </div>

            {/* Credits & Usage Stats */}
            <Card className="bg-muted/50">
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-semibold">{credits?.credits ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Available Credits</p>
                  </div>
                  <Badge variant={isPro ? "secondary" : "outline"} className="h-fit gap-1 py-1">
                    {isPro ? (
                      <>
                        <Crown className="h-3 w-3 text-accent" />
                        500 Monthly
                      </>
                    ) : (
                      "10 Daily"
                    )}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-lg font-medium">{totalDiagrams}</p>
                    <p className="text-sm text-muted-foreground">Total Diagrams</p>
                  </div>
                  <div>
                    <p className="text-lg font-medium">{complexDiagrams}</p>
                    <p className="text-sm text-muted-foreground">Complex Diagrams</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>

          <CardFooter>
            <div className="w-full space-y-1.5 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Simple Diagram</span>
                <span className="font-medium">1 credit</span>
              </div>
              <div className="flex justify-between">
                <span>Complex Diagram</span>
                <span className="font-medium">2 credits</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Recent Diagrams Section */}
        <Card className="mt-8 border-none shadow-none">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              <CardTitle>Recent Diagrams</CardTitle>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/generate")}
            >
              Create New
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {diagrams && diagrams.length > 0 ? (
                diagrams.slice(0, 6).map((diagram: DbDiagram) => (
                  <DiagramPreviewCard
                    key={diagram.id}
                    diagram={convertDbDiagramToStoreDiagram(diagram)}
                  />
                ))
              ) : (
                <Card className="col-span-full p-6 text-center">
                  <CardContent className="pt-6">
                    <p className="mb-4 text-muted-foreground">No diagrams yet</p>
                    <Button onClick={() => router.push("/generate")}>
                      Create Your First Diagram
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
