import { PricingCard } from "@/components/landing/pricing-card";

export function Pricing() {
  return (
    <section className="container flex flex-col items-center gap-6 sm:gap-7 pt-24 pb-40">
      <div className="flex flex-col gap-3 items-center">
        <span className="font-bold text-primary text-left italic font-heading">Pricing</span>
        <h2 className="font-heading text-3xl tracking-tight sm:text-4xl text-balance text-left font-bold">
          Simple, transparent pricing
        </h2>
      </div>
      <p className="text-lg text-muted-foreground text-balance max-w-lg text-center">
        Choose the perfect plan for your diagramming needs. Start with our free tier and scale as you grow.
      </p>
      <div className="mt-7 grid w-full grid-cols-1 gap-7 lg:grid-cols-2 max-w-4xl">
        <PricingCard
          name="Free"
          price={0}
          feature1="5 diagrams per month"
          feature2="Basic diagram types"
          feature3="PNG export"
          feature4="Community support"
          feature5="Basic editing tools"
          description="Perfect for individual users and small projects."
          isMostPopular={false}
        />
        <PricingCard
          name="Pro"
          price={9}
          feature1="Unlimited diagrams"
          feature2="All diagram types"
          feature3="SVG & PNG export"
          feature4="Priority support"
          feature5="Advanced editing tools"
          description="For professionals and growing teams."
          isMostPopular
          className="border-2 border-primary"
          variantId={687799}
        />
      </div>
    </section>
  );
}
