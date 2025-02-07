import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface FaqItemProps {
  question: string;
  answer: string;
  className?: string;
}

export function FaqItem({ question, answer, className }: FaqItemProps) {
  return (
    <AccordionItem
      value={question}
      className={cn("border-b-0 px-8 rounded-3xl py-3 bg-card", className)}
    >
      <AccordionTrigger className="text-left text-lg hover:no-underline [&>svg]:hidden font-semibold flex justify-between items-center gap-3 [&[data-state=open]>div>svg>path:first-child]:hidden">
        {question}
        <div className="size-10 rounded-[0.5rem] flex items-center justify-center shrink-0 bg-secondary/10 text-secondary">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6 text-primary transition-transform duration-300 ease-out [&[data-state=open]>path:first-child]:rotate-90"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </div>
      </AccordionTrigger>
      <AccordionContent className="text-lg text-muted-foreground">{answer}</AccordionContent>
    </AccordionItem>
  );
}
