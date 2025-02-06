"use client";

import { useSession } from "next-auth/react";
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
          <h2 className="mb-4 text-lg font-medium">Credits</h2>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-medium">{credits?.credits ?? 0}</p>
                <p className="text-sm text-gray-500">Available Credits</p>
              </div>
              <p className="text-sm text-gray-500">
                Simple: 1 credit
                <br />
                Complex: 2 credits
                <br />
                Resets daily
              </p>
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
