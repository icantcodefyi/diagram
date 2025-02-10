import { TextQuote, LineChart } from "lucide-react";

import { FeatureItem } from "@/components/landing/feature-item";
import { DiagramTypesSlider } from "./diagram-types-slider";
import { DIAGRAM_TYPES } from "@/types/diagram-types";

export function FeaturesSection3() {
  return (
    <section className="container flex flex-col py-24 md:flex-row md:items-center gap-8 gap-20 max-w-6xl">
      <div className="flex flex-1 flex-col items-start gap-10">
        <div className="flex flex-col gap-3">
          <span className="font-bold text-primary text-left italic font-heading">
            Smart Diagram Assistant
          </span>
          <h2 className="font-heading text-3xl tracking-tight sm:text-4xl text-balance text-left font-bold">
            Perfect for Every Professional
          </h2>
        </div>
        <p className="text-lg text-muted-foreground text-balance max-w-lg text-left hidden">
          From software architects to business analysts, AutoDiagram helps every professional communicate clearly through visuals.
        </p>
        <div className="flex flex-col gap-8">
          <FeatureItem
            icon={TextQuote}
            title="Multiple Diagram Types"
            description="Support for 20+ diagram types including flowcharts, ER diagrams, architecture maps, and sequence diagrams."
          />
          <FeatureItem
            icon={LineChart}
            title="Intelligent Suggestions"
            description="Context-aware recommendations for diagram types and layouts based on your description."
          />
        </div>
      </div>
      <div className="relative flex-1 pt-10 rounded-tl-[2.5rem] rounded-bl-[5rem] rounded-tr-[2.5rem] bg-gradient-to-br to-primary from-secondary">
      <DiagramTypesSlider diagrams={DIAGRAM_TYPES} />
      </div>
    </section>
  );
}
