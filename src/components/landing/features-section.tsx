import { Search, BarChart2 } from "lucide-react";
import Image from "next/image";

import { FeatureItem } from "@/components/landing/feature-item";

export function FeaturesSection() {
  return (
    <section className="container flex flex-col py-24 md:flex-row md:items-center gap-8 gap-20 max-w-6xl">
      <div className="flex flex-1 flex-col items-start gap-10">
        <div className="flex flex-col gap-3">
          <span className="font-bold text-primary text-left italic font-heading">
            AI-Powered Diagram Generation
          </span>
          <h2 className="font-heading text-3xl tracking-tight sm:text-4xl text-balance text-left font-bold">
            Transform Ideas into Visuals Instantly
          </h2>
        </div>
        <p className="text-lg text-muted-foreground text-balance max-w-lg text-left hidden">
          Turn complex technical concepts into clear, professional diagrams with just a text description.
        </p>
        <div className="flex flex-col gap-8">
          <FeatureItem
            icon={Search}
            title="Natural Language Understanding"
            description="Simply describe your diagram in plain text - our AI understands context and creates the perfect visualization."
          />
          <FeatureItem
            icon={BarChart2}
            title="Intelligent Error Prevention"
            description="Advanced AI automatically detects and prevents common diagram issues, ensuring professional results every time."
          />
        </div>
      </div>
      <div className="relative flex-1 pt-10 rounded-tl-[2.5rem] rounded-bl-[5rem] rounded-tr-[2.5rem] bg-gradient-to-br to-primary from-secondary">
        <Image
          alt="SaaS Dashboard"
          src="/landing/feature1.svg"
          width={600}
          height={400}
        />
      </div>
    </section>
  );
}
