"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/trpc/react";
import { useDiagramStore } from "@/store/diagram-store";
import type { Diagram } from "@/store/diagram-store";
import { DiagramPreviewCard } from "@/app/_components/diagram-preview-card";

interface DbDiagram {
  id: string;
  content: string;
  type: string;
  name: string | null;
  isComplex: boolean;
  createdAt: string;
  updatedAt: string;
}

function convertDbDiagramToStoreDiagram(dbDiagram: DbDiagram): Diagram {
  return {
    id: dbDiagram.id,
    content: dbDiagram.content,
    type: dbDiagram.type,
    name: dbDiagram.name ?? undefined,
    isComplex: dbDiagram.isComplex,
    createdAt: new Date(dbDiagram.createdAt),
    updatedAt: new Date(dbDiagram.updatedAt),
  };
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setDiagrams, setCredits } = useDiagramStore();

  const { data: diagrams, isLoading: diagramsLoading } = api.ai.getUserDiagrams.useQuery(
    undefined,
    {
      enabled: !!session,
    }
  );

  const { data: credits, isLoading: creditsLoading } = api.ai.getUserCredits.useQuery(
    undefined,
    {
      enabled: !!session,
    }
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (diagrams) {
      const typedDiagrams: Diagram[] = diagrams.map((d: DbDiagram) => 
        convertDbDiagramToStoreDiagram(d)
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
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Settings</h1>
      
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Your Credits</h2>
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <p className="text-lg">
            Available Credits: <span className="font-bold">{credits?.credits ?? 0}</span>
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Credits reset daily. Simple diagrams cost 1 credit, complex diagrams cost 2 credits.
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold">Your Diagrams</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {diagrams && diagrams.length > 0 ? (
            diagrams.map((diagram: DbDiagram) => (
              <DiagramPreviewCard 
                key={diagram.id} 
                diagram={convertDbDiagramToStoreDiagram(diagram)} 
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-600 dark:text-gray-400">
              You haven&apos;t generated any diagrams yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 