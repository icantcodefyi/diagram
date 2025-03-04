import { db } from "@/server/db";
import { NextResponse } from "next/server";
import { env } from "@/env";
import crypto from "crypto";
import { 
  cancelSubscription 
} from '@lemonsqueezy/lemonsqueezy.js';

const MONTHLY_CREDITS = 500;

interface LemonSqueezyWebhookBody {
  meta: {
    event_name: string;
    custom_data: Record<string, unknown>;
  };
  data: {
    id: string;
    type: string;
    attributes: {
      user_email: string;
      status: string;
      cancelled: boolean;
      renews_at: string;
      ends_at: string | null;
      [key: string]: unknown;
    };
    relationships?: Record<string, unknown>;
  };
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

async function handleSubscriptionCreated(webhookData: LemonSqueezyWebhookBody) {
  const subscriptionId = webhookData.data.id;
  const subscription = webhookData.data;
  
  // If webhook contains user_email in custom_data, use that, otherwise fallback to subscription data
  const user_email = typeof webhookData.meta.custom_data?.user_email === 'string' 
    ? webhookData.meta.custom_data.user_email 
    : subscription.attributes.user_email;
  
  const ends_at = subscription.attributes.ends_at ?? subscription.attributes.renews_at;

  if (!user_email) {
    console.error("No user email found in subscription data");
    throw Error("No user email found in subscription data");
  }

  const user = await db.user.findUnique({
    where: { email: user_email },
    include: { credits: true },
  });

  if (!user) {
    console.error("User not found:", user_email);
    throw Error(`User not found: ${user_email}`);
  }

  console.log("Found user:", {
    userId: user.id,
    currentCredits: user.credits?.credits,
  });

  try {
    await db.$transaction(async (tx) => {
      const dbSubscription = await tx.subscription.upsert({
        where: { lemonSqueezyId: subscriptionId },
        create: {
          userId: user.id,
          lemonSqueezyId: subscriptionId,
          status: "active",
          currentPeriodEnd: new Date(ends_at),
        },
        update: {
          status: "active",
          currentPeriodEnd: new Date(ends_at),
        },
      });

      console.log("Created/Updated subscription:", dbSubscription);

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

async function handleSubscriptionUpdated(webhookData: LemonSqueezyWebhookBody) {
  const subscriptionId = webhookData.data.id;
  const subscription = webhookData.data;
  const { status } = subscription.attributes;
  const ends_at = subscription.attributes.ends_at ?? subscription.attributes.renews_at;

  try {
    const updated = await db.subscription.update({
      where: { lemonSqueezyId: subscriptionId },
      data: {
        status,
        currentPeriodEnd: new Date(ends_at),
        cancelAtPeriodEnd: subscription.attributes.cancelled,
      },
    });
    console.log("Updated subscription:", updated);
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

async function handleSubscriptionCancelled(subscriptionId: string) {
  try {
    const cancelled = await db.subscription.update({
      where: { lemonSqueezyId: subscriptionId },
      data: {
        status: "cancelled",
        cancelAtPeriodEnd: true,
      },
    });
    console.log("Cancelled subscription:", cancelled);
  } catch (error) {
    console.error("Error cancelling subscription in database:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
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
    const subscriptionId = body.data.id;

    console.log("Processing webhook event:", eventName, {
      subscriptionId,
      data: JSON.stringify(body.data, null, 2),
    });

    switch (eventName) {
      case "subscription_created":
        await handleSubscriptionCreated(body);
        break;
      case "subscription_updated":
        await handleSubscriptionUpdated(body);
        break;
      case "subscription_cancelled":
        await handleSubscriptionCancelled(subscriptionId);
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