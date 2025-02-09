"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PricingFeatureItem } from "./pricing-feature-item";
import { cn } from "@/lib/utils";
import { LoginDialog } from "@/components/landing/login-dialog";
import { useState } from "react";
import { createCheckout } from "@/app/actions/checkout";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: number;
  description: string;
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;
  feature5: string;
  isMostPopular?: boolean;
  className?: string;
  variantId?: number;
}

export function PricingCard({
  name,
  price,
  description,
  feature1,
  feature2,
  feature3,
  feature4,
  feature5,
  isMostPopular,
  className,
  variantId,
}: PricingCardProps) {
  const { data: session } = useSession();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!session) {
      setIsLoginDialogOpen(true);
      return;
    }

    if (price === 0) {
      window.location.href = "/generate";
      return;
    }

    if (!variantId) {
      toast.error("This plan is not available for purchase");
      return;
    }

    try {
      setIsLoading(true);
      console.log("variantId", variantId);
      const { url } = await createCheckout(variantId);
      if (!url) {
        throw new Error("No checkout URL returned");
      }
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create checkout session. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
          <Button
            className="mt-10 w-full"
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Creating checkout...
              </>
            ) : price === 0 ? (
              "Get Started"
            ) : (
              "Subscribe"
            )}
          </Button>
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

      <LoginDialog isOpen={isLoginDialogOpen} onClose={() => setIsLoginDialogOpen(false)} />
    </>
  );
}
