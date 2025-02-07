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
            answer="It enhances your social media presence by analyzing data, identifying trends, and providing actionable insights for more engaging content."
            question="What's the main purpose of SociaLens for social media?"
          />
          <FaqItem
            answer="It uses advanced algorithms to suggest optimal posting times, relevant hashtags, and insights on content types that resonate with your audience."
            question="How does the AI tool optimize content?"
          />
          <FaqItem
            answer="Yes, it seamlessly integrates with popular platforms like Facebook, Twitter, Instagram, and LinkedIn for centralized management"
            question="Can I integrate SociaLens with multiple platforms?"
          />
          <FaqItem
            answer="It analyzes your audience, identifies demographics and interests, and suggests strategies to expand reach and engagement."
            question="How does SociaLens assist in audience targeting?"
          />
          <FaqItem
            answer="Yes, we prioritize data security with industry-standard protocols and encryption measures to safeguard your information."
            question="Is my data secure?"
          />
          <FaqItem
            answer="Yes, team accounts are available. Multiple users can collaborate under a single account, streamlining social media optimization efforts."
            question="Do you offer team accounts?"
          />
        </Accordion>
      </div>
    </section>
  );
}
