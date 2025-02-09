"use server";

import { createCheckoutSession } from "@/lib/lemonsqueezy";
import { auth } from "@/server/auth";

export async function createCheckout(variantId: number) {
  const session = await auth();
  
  if (!session?.user?.email) {
    throw new Error("User must be logged in");
  }

  try {
    const checkoutUrl = await createCheckoutSession(variantId, session.user.email);
    return { url: checkoutUrl };
  } catch (error) {
    console.error("Error creating checkout:", error);
    throw new Error("Failed to create checkout");
  }
} 