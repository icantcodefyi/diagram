import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Diagram = {
  id: string;
  content: string;
  type: string;
  name?: string;
  isComplex: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type DiagramStore = {
  diagrams: Diagram[];
  anonymousDiagramCount: number;
  setDiagrams: (diagrams: Diagram[]) => void;
  addDiagram: (diagram: Diagram) => void;
  incrementAnonymousCount: () => void;
  resetAnonymousCount: () => void;
  credits: number;
  setCredits: (credits: number) => void;
};

export const useDiagramStore = create<DiagramStore>()(
  persist(
    (set) => ({
      diagrams: [],
      anonymousDiagramCount: 0,
      credits: 0,
      setDiagrams: (diagrams) => set({ diagrams }),
      addDiagram: (diagram) =>
        set((state) => ({
          diagrams: [...state.diagrams, diagram],
        })),
      incrementAnonymousCount: () =>
        set((state) => ({
          anonymousDiagramCount: state.anonymousDiagramCount + 1,
        })),
      resetAnonymousCount: () => set({ anonymousDiagramCount: 0 }),
      setCredits: (credits) => set({ credits }),
    }),
    {
      name: "diagram-storage",
      partialize: (state) => ({
        anonymousDiagramCount: state.anonymousDiagramCount,
      }),
    },
  ),
); 