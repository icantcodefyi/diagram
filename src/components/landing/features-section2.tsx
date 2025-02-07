import Image from "next/image";

import { StatItem } from "@/components/landing/stat-item";

export function FeaturesSection2() {
  return (
    <section className="container flex flex-col py-24 md:flex-row md:items-center gap-8 gap-20 max-w-6xl">
      <div className="relative flex-1 pt-10 rounded-tl-[2.5rem] rounded-tr-[2.5rem] rounded-br-[5rem] overflow-hidden bg-gradient-to-br to-primary order-1 md:order-none from-secondary">
        <Image alt="SaaS Dashboard" src="/landing/Group-997-1.png" width={500} height={0} />
      </div>
      <div className="flex flex-1 flex-col items-start gap-10">
        <div className="flex flex-col gap-3">
          <span className="font-bold text-primary text-left italic font-heading">
            Quick Edit Functionality
          </span>
          <h2 className="font-heading text-3xl tracking-tight sm:text-4xl text-balance text-left font-bold">
            Seamless Editing & Export
          </h2>
        </div>
        <p className="text-lg text-muted-foreground text-balance max-w-lg text-left">
          Effortlessly adjust, refine, and export your diagrams in multiple formats for easy sharing and collaboration.
        </p>
        <div className="flex grid-cols-2 grid gap-4">
          <StatItem label="Time Saved vs Manual Creation" value="90%" />
          <StatItem label="Export Options" value="3+" />
        </div>
      </div>
    </section>
  );
}
