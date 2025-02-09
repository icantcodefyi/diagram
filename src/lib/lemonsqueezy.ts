import { type NewCheckout, createCheckout as createLemonCheckout, lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
import { env } from "@/env";

// Initialize the SDK
lemonSqueezySetup({
  apiKey: env.LEMONSQUEEZY_API_KEY,
  onError: (error) => console.error("Lemon Squeezy Error:", error),
});

/**
 * Creates a checkout session with Lemon Squeezy
 * @param variantId - The variant ID of the product
 * @param customerEmail - The email address of the customer
 * @returns Promise<string> - The checkout URL
 */
export async function createCheckoutSession(
  variantId: number,
  customerEmail: string
): Promise<string> {
  if (!env.LEMONSQUEEZY_API_KEY) {
    throw new Error("LEMONSQUEEZY_API_KEY is not set");
  }

  try {
    const storeId = "118138"; // Your store ID
    const checkoutOptions: NewCheckout = {
      checkoutData: {
        email: customerEmail,
        custom: {
          user_email: customerEmail,
        },
      },
      testMode: env.NODE_ENV === "development",
    };

    const { error, data } = await createLemonCheckout(storeId, variantId.toString(), checkoutOptions);
    
    if (error) {
      console.error("LemonSqueezy API Error:", error);
      throw new Error(error.message);
    }

    if (!data?.data?.attributes?.url) {
      throw new Error("No checkout URL returned from Lemon Squeezy");
    }

    return data.data.attributes.url;
  } catch (error) {
    console.error("Error creating Lemon Squeezy checkout:", error);
    throw error instanceof Error 
      ? error 
      : new Error("Failed to create checkout session");
  }
} 