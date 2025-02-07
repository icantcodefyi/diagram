import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PricingFeatureItem } from "@/components/landing/pricing-feature-item";
import { CtaButton } from "@/components/landing/cta-button";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  description: string;
  price: number;
  isMostPopular: boolean;
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;
  feature5: string;
  className?: string;
}

export function PricingCard({
  name,
  description,
  price,
  isMostPopular,
  feature1,
  feature2,
  feature3,
  feature4,
  feature5,
  className,
}: PricingCardProps) {
  return (
    <Card className={cn("relative shadow-lg border-0 border", className)}>
      <CardContent className="flex flex-col items-start p-8">
        <h4 className="font-heading font-semibold text-foreground font-bold text-3xl">{name}</h4>
        <div className="mt-5">
          <span className="font-heading text-5xl font-semibold">${price}</span>
          <span className="text-sm"> /month</span>
        </div>
        <p className="text-muted-foreground mt-4">{description}</p>
        <Separator orientation="horizontal" className="my-6" />
        <ul className="space-y-2">
          <PricingFeatureItem text={feature1} />
          <PricingFeatureItem text={feature2} />
          <PricingFeatureItem text={feature3} />
          <PricingFeatureItem text={feature4} />
          <PricingFeatureItem text={feature5} />
        </ul>
        <CtaButton href="#" text="Get Started" className="mt-10 w-full" />
        <p className="text-muted-foreground text-balance text-center mt-4 mx-auto text-sm">
          No credit card required
        </p>
      </CardContent>
      {isMostPopular === true && (
        <span className="absolute inset-x-0 -top-5 mx-auto w-32 rounded-full bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground shadow-md bg-gradient-to-br from-secondary">
          Most popular
        </span>
      )}
    </Card>
  );
}
