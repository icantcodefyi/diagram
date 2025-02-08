import { db } from "@/server/db";
import { NextResponse } from "next/server";
import { env } from "@/env";
import crypto from "crypto";

const MONTHLY_CREDITS = 500;

interface LemonSqueezySubscriptionData {
  id: string;
  type: string;
  attributes: {
    store_id: number;
    customer_id: number;
    order_id: number;
    order_item_id: number;
    product_id: number;
    variant_id: number;
    user_email: string;
    status: string;
    card_brand: string;
    card_last_four: string;
    pause: null | Record<string, unknown>;
    cancelled: boolean;
    trial_ends_at: null | string;
    billing_anchor: number;
    urls: {
      update_payment_method: string;
    };
    renews_at: string;
    ends_at: null | string;
    created_at: string;
    updated_at: string;
    test_mode: boolean;
  };
  relationships?: {
    customer?: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

interface LemonSqueezyWebhookBody {
  meta: {
    event_name: string;
    custom_data: Record<string, unknown>;
  };
  data: LemonSqueezySubscriptionData;
}

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
): boolean {
  if (!signature || !env.LEMONSQUEEZY_WEBHOOK_SECRET) return false;

  const hmac = crypto.createHmac("sha256", env.LEMONSQUEEZY_WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest("hex");
  return signature === digest;
}

async function handleSubscriptionCreated(data: LemonSqueezySubscriptionData) {
  console.log("Processing subscription_created event:", {
    email: data.attributes.user_email,
    subscription_id: data.id,
    data: JSON.stringify(data, null, 2),
  });

  const { user_email } = data.attributes;
  const subscription_id = data.id;
  const ends_at = data.attributes.ends_at ?? data.attributes.renews_at;

  if (!user_email) {
    console.error("No user email found in webhook payload");
    return;
  }

  const user = await db.user.findUnique({
    where: { email: user_email },
    include: { credits: true },
  });

  if (!user) {
    console.error("User not found:", user_email);
    return;
  }

  console.log("Found user:", {
    userId: user.id,
    currentCredits: user.credits?.credits,
  });

  try {
    // Create or update subscription
    await db.$transaction(async (tx) => {
      // Create subscription
      const subscription = await tx.subscription.upsert({
        where: { lemonSqueezyId: subscription_id },
        create: {
          userId: user.id,
          lemonSqueezyId: subscription_id,
          status: "active",
          currentPeriodEnd: new Date(ends_at),
        },
        update: {
          status: "active",
          currentPeriodEnd: new Date(ends_at),
        },
      });

      console.log("Created/Updated subscription:", subscription);

      // Add monthly credits
      if (user.credits) {
        const updatedCredits = await tx.userCredits.update({
          where: { userId: user.id },
          data: {
            credits: user.credits.credits + MONTHLY_CREDITS,
            monthlyCredits: MONTHLY_CREDITS,
            lastMonthlyReset: new Date(),
          },
        });
        console.log("Updated credits:", updatedCredits);
      } else {
        const newCredits = await tx.userCredits.create({
          data: {
            userId: user.id,
            credits: MONTHLY_CREDITS,
            monthlyCredits: MONTHLY_CREDITS,
            lastMonthlyReset: new Date(),
          },
        });
        console.log("Created new credits:", newCredits);
      }
    });

    console.log("Successfully processed subscription creation");
  } catch (error) {
    console.error("Error in subscription creation:", error);
    throw error;
  }
}

async function handleSubscriptionUpdated(data: LemonSqueezySubscriptionData) {
  console.log("Processing subscription_updated event:", {
    subscription_id: data.id,
    status: data.attributes.status,
    data: JSON.stringify(data, null, 2),
  });

  const subscription_id = data.id;
  const { status } = data.attributes;
  const ends_at = data.attributes.ends_at ?? data.attributes.renews_at;

  try {
    const updated = await db.subscription.update({
      where: { lemonSqueezyId: subscription_id },
      data: {
        status,
        currentPeriodEnd: new Date(ends_at),
        cancelAtPeriodEnd: data.attributes.cancelled,
      },
    });
    console.log("Updated subscription:", updated);
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

async function handleSubscriptionCancelled(data: LemonSqueezySubscriptionData) {
  console.log("Processing subscription_cancelled event:", {
    subscription_id: data.id,
    data: JSON.stringify(data, null, 2),
  });

  const subscription_id = data.id;

  try {
    const cancelled = await db.subscription.update({
      where: { lemonSqueezyId: subscription_id },
      data: {
        status: "cancelled",
        cancelAtPeriodEnd: true,
      },
    });
    console.log("Cancelled subscription:", cancelled);
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    // Get the signature from headers
    const signature = req.headers.get("x-signature");
    const rawBody = await req.text();
    
    console.log("Received webhook request", {
      signature: signature ? "present" : "missing",
      bodyLength: rawBody.length,
      rawBody,
    });

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody) as LemonSqueezyWebhookBody;
    const eventName = body.meta.event_name;
    const data = body.data;

    console.log("Processing webhook event:", eventName, {
      data: JSON.stringify(data, null, 2),
    });

    switch (eventName) {
      case "subscription_created":
        await handleSubscriptionCreated(data);
        break;
      case "subscription_updated":
        await handleSubscriptionUpdated(data);
        break;
      case "subscription_cancelled":
        await handleSubscriptionCancelled(data);
        break;
      default:
        console.log("Unhandled event type:", eventName);
    }

    console.log("Successfully processed webhook event:", eventName);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 