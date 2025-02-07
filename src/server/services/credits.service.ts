import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";

const INITIAL_CREDITS = 10;
const DAILY_CREDITS = 10;

export async function validateAndUpdateUserCredits(
  userId: string | undefined,
  anonymousId: string | undefined,
  isComplex: boolean
): Promise<void> {
  const requiredCredits = isComplex ? 2 : 1;

  if (!userId) {
    await validateAnonymousCredits(anonymousId);
    return;
  }

  await validateUserCredits(userId, requiredCredits);
}

async function validateAnonymousCredits(anonymousId: string | undefined): Promise<void> {
  if (!anonymousId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Anonymous ID is required for unauthenticated users",
    });
  }

  const anonymousCount = await db.diagram.count({
    where: {
      anonymousId,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  });

  if (anonymousCount >= 5) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Please login to generate more diagrams",
    });
  }
}

async function validateUserCredits(userId: string, requiredCredits: number): Promise<void> {
  const userCredits = await db.userCredits.findUnique({
    where: { userId },
  });

  const now = new Date();

  if (!userCredits) {
    if (requiredCredits > INITIAL_CREDITS) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient credits",
      });
    }
    
    await db.userCredits.create({
      data: {
        userId,
        credits: INITIAL_CREDITS - requiredCredits,
        lastCreditReset: now,
      },
    });
    return;
  }

  // Check if credits need to be reset
  if (userCredits.lastCreditReset.getDate() !== now.getDate()) {
    if (requiredCredits > DAILY_CREDITS) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient credits",
      });
    }

    await db.userCredits.update({
      where: { userId },
      data: {
        credits: DAILY_CREDITS - requiredCredits,
        lastCreditReset: now,
      },
    });
    return;
  }

  // Check if user has enough credits
  if (userCredits.credits < requiredCredits) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Insufficient credits",
    });
  }

  // Deduct credits
  await db.userCredits.update({
    where: { userId },
    data: {
      credits: userCredits.credits - requiredCredits,
    },
  });
}