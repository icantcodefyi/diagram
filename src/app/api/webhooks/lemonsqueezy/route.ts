import { db } from "@/server/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/env";
import crypto from "crypto";

const MONTHLY_CREDITS = 500;

interface LemonSqueezySubscriptionData {
  attributes: {
    customer_email: string;
    subscription_id: string;
    ends_at: string;
    status: string;
  };
}

interface LemonSqueezyWebhookBody {
  meta: {
    event_name: string;
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
  const { customer_email, subscription_id, ends_at } = data.attributes;
  const user = await db.user.findUnique({
    where: { email: customer_email },
    include: { credits: true },
  });

  if (!user) {
    console.error("User not found:", customer_email);
    return;
  }

  // Create or update subscription
  await db.$transaction(async (tx) => {
    await tx.subscription.upsert({
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

    // Add monthly credits
    if (user.credits) {
      await tx.userCredits.update({
        where: { userId: user.id },
        data: {
          credits: user.credits.credits + MONTHLY_CREDITS,
          monthlyCredits: MONTHLY_CREDITS,
          lastMonthlyReset: new Date(),
        },
      });
    } else {
      await tx.userCredits.create({
        data: {
          userId: user.id,
          credits: MONTHLY_CREDITS,
          monthlyCredits: MONTHLY_CREDITS,
          lastMonthlyReset: new Date(),
        },
      });
    }
  });
}

async function handleSubscriptionUpdated(data: LemonSqueezySubscriptionData) {
  const { subscription_id, status, ends_at } = data.attributes;

  await db.subscription.update({
    where: { lemonSqueezyId: subscription_id },
    data: {
      status,
      currentPeriodEnd: new Date(ends_at),
      cancelAtPeriodEnd: status === "cancelled",
    },
  });
}

async function handleSubscriptionCancelled(data: LemonSqueezySubscriptionData) {
  const { subscription_id } = data.attributes;

  await db.subscription.update({
    where: { lemonSqueezyId: subscription_id },
    data: {
      status: "cancelled",
      cancelAtPeriodEnd: true,
    },
  });
}

async function handleSubscriptionResumed(data: LemonSqueezySubscriptionData) {
  const { subscription_id, ends_at } = data.attributes;
  const subscription = await db.subscription.findUnique({
    where: { lemonSqueezyId: subscription_id },
    include: { user: { include: { credits: true } } },
  });

  if (!subscription?.user) {
    console.error("Subscription or user not found:", subscription_id);
    return;
  }

  await db.$transaction(async (tx) => {
    // Update subscription status
    await tx.subscription.update({
      where: { lemonSqueezyId: subscription_id },
      data: {
        status: "active",
        currentPeriodEnd: new Date(ends_at),
        cancelAtPeriodEnd: false,
      },
    });

    // Add new monthly credits if they don't have any
    if (subscription.user.credits?.monthlyCredits === 0) {
      await tx.userCredits.update({
        where: { userId: subscription.user.id },
        data: {
          credits: (subscription.user.credits?.credits || 0) + MONTHLY_CREDITS,
          monthlyCredits: MONTHLY_CREDITS,
          lastMonthlyReset: new Date(),
        },
      });
    }
  });
}

async function handleSubscriptionExpired(data: LemonSqueezySubscriptionData) {
  const { subscription_id } = data.attributes;

  await db.subscription.update({
    where: { lemonSqueezyId: subscription_id },
    data: {
      status: "expired",
      cancelAtPeriodEnd: false,
    },
  });
}

export async function POST(req: Request) {
  try {
    const signature = (await headers()).get("x-signature");
    const rawBody = await req.text();
    
    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody) as LemonSqueezyWebhookBody;
    const eventName = body.meta.event_name;
    const data = body.data;

    console.log("Received webhook event:", eventName);

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
      case "subscription_resumed":
        await handleSubscriptionResumed(data);
        break;
      case "subscription_expired":
        await handleSubscriptionExpired(data);
        break;
      default:
        console.log("Unhandled event type:", eventName);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 