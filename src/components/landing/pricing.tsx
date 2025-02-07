import { PricingCard } from "@/components/landing/pricing-card";

export function Pricing() {
  return (
    <section className="container flex flex-col items-center gap-6 sm:gap-7 pt-24 pb-40">
      <div className="flex flex-col gap-3 items-center">
        <span className="font-bold text-primary text-left italic font-heading">Pricing</span>
        <h2 className="font-heading text-3xl tracking-tight sm:text-4xl text-balance text-left font-bold">
          Simple pricing
        </h2>
      </div>
      <p className="text-lg text-muted-foreground text-balance max-w-lg text-center">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit lobortis arcu enim urna adipiscing
        praesent velit viverra sit.
      </p>
      <div className="mt-7 grid w-full grid-cols-1 gap-7 lg:grid-cols-3">
        <PricingCard
          name="Startup"
          price={19}
          feature1="Unlimited projects"
          feature2="Unlimited storage"
          feature3="24/7 support"
          feature4="API access"
          feature5="Custom branding"
          description="For small companies and teams."
          isMostPopular={false}
        />
        <PricingCard
          name="Growth"
          price={39}
          feature1="Everything in Basic"
          feature2="Priority support"
          feature3="Advanced analytics"
          feature4="Unlimited users"
          feature5="Custom domain"
          description="For larger companies and teams."
          isMostPopular
          className="border-2 border-primary"
        />
        <PricingCard
          name="Enterprise"
          price={99}
          feature1="Everything in Pro"
          feature2="Single sign-on"
          feature3="Custom SLA"
          feature4="Custom integrations"
          feature5="Custom reporting"
          description="For very large businesses."
          isMostPopular={false}
        />
      </div>
    </section>
  );
}
