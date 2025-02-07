import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="container">
      <div className="flex flex-col items-center gap-6 px-6 relative flex-1 rounded-tl-[2.5rem] rounded-bl-[5rem] rounded-tr-[2.5rem] bg-gradient-to-br to-primary overflow-hidden pt-24 from-secondary">
        <h2 className="font-heading text-3xl tracking-tight sm:text-4xl text-balance text-primary-foreground text-left font-bold md:text-5xl">
          Start Creating Beautiful Diagrams Today
        </h2>
        <p className="max-w-xl text-lg text-primary-foreground/80 text-center">
          Join thousands of professionals who trust Diagramify to transform their ideas into stunning visuals.
        </p>
        <Button
          size="lg"
          asChild
          variant="outline"
          className="cursor-pointer border-border bg-background hover:bg-bacground/90"
        >
          <Link href="#">Try Diagramify Free</Link>
        </Button>
        <Image
          alt="SaaS Dashboard"
          src="/landing/Group-999-(1).png"
          width={900}
          height={698}
          priority
          className="-mt-14 mt-0 lg:-mb-40"
        />
      </div>
    </section>
  );
}
