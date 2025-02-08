const LEMON_SQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1/checkouts";

import { env } from "@/env";

interface LemonSqueezyCheckoutResponse {
  data: {
    type: string;
    id: string;
    attributes: {
      url: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

interface LemonSqueezyErrorResponse {
  errors: Array<{
    status: string;
    title: string;
    detail: string;
  }>;
}

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
    const response = await fetch(LEMON_SQUEEZY_API_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.LEMONSQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: customerEmail,
              custom: {
                user_email: customerEmail,
              },
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: "118138"
              }
            },
            variant: {
              data: {
                type: "variants",
                id: variantId.toString()
              }
            }
          },
          test_mode: env.NODE_ENV === "development",
        },
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as LemonSqueezyErrorResponse;
      console.error("LemonSqueezy API Error:", errorData);
      throw new Error(
        errorData.errors?.[0]?.detail ?? `HTTP error! status: ${response.status}`
      );
    }

    const data = (await response.json()) as LemonSqueezyCheckoutResponse;
    return data.data.attributes.url;
  } catch (error) {
    console.error("Error creating Lemon Squeezy checkout:", error);
    throw error instanceof Error 
      ? error 
      : new Error("Failed to create checkout session");
  }
} 