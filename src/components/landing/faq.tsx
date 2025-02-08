import { Accordion } from "@/components/ui/accordion";
import { FaqItem } from "@/components/landing/faq-item";

export function Faq() {
  return (
    <section className="pb-28 pt-20 bg-gradient-to-b from-background via-70% to-background via-secondary/30">
      <div className="container flex flex-col items-center gap-8">
        <div className="flex flex-col gap-3 items-center">
          <span className="font-bold text-primary text-left italic font-heading">Faq</span>
          <h2 className="font-heading text-3xl tracking-tight sm:text-4xl text-balance text-center font-bold">
            Frequently Asked Questions
          </h2>
        </div>
        <Accordion type="single" collapsible className="mt-6 w-full max-w-3xl flex flex-col gap-4">
          <FaqItem
            answer="AutoDiagram uses advanced AI to transform your text descriptions into professional diagrams. Simply describe what you want, and our AI creates accurate, visually appealing diagrams instantly."
            question="How does AutoDiagram work?"
          />
          <FaqItem
            answer="We support a wide range of diagram types including flowcharts, organizational charts, system architectures, user journeys, and more. Our AI adapts to your needs."
            question="What types of diagrams can I create?"
          />
          <FaqItem
            answer="Yes! You can export your diagrams as SVG, PNG, or get shareable links. This makes it easy to use your diagrams in presentations, documents, or collaborate with others."
            question="Can I export my diagrams?"
          />
          <FaqItem
            answer="AutoDiagram is perfect for software developers, project managers, business analysts, educators, designers, and anyone who needs to create professional diagrams quickly."
            question="Who is AutoDiagram for?"
          />
          <FaqItem
            answer="Yes, our AI automatically detects and resolves issues in your diagrams, ensuring they're accurate and functional. You can also make quick edits manually if needed."
            question="Does AutoDiagram help with error correction?"
          />
          <FaqItem
            answer="Yes, we prioritize data security with industry-standard protocols and encryption measures to protect your diagrams and information."
            question="Is my data secure?"
          />
        </Accordion>
      </div>
    </section>
  );
}
