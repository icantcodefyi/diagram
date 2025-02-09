import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import type { User, UserCredits, Subscription } from "@prisma/client";

const INITIAL_CREDITS = 10;
const DAILY_CREDITS = 10;
const MONTHLY_CREDITS = 500;

interface UserWithRelations extends User {
  credits: UserCredits | null;
  subscription: Subscription | null;
}

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
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { 
      credits: true,
      subscription: true,
    },
  }) as UserWithRelations | null;

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  const now = new Date();

  // Handle first-time users
  if (!user.credits) {
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

  // Check if daily credits need to be reset
  if (user.credits.lastCreditReset.getDate() !== now.getDate()) {
    // For pro users, also check monthly credits reset
    if (user.subscription?.status === "active") {
      const shouldResetMonthly = !user.credits.lastMonthlyReset || 
        user.credits.lastMonthlyReset.getMonth() !== now.getMonth();

      await db.userCredits.update({
        where: { userId },
        data: {
          credits: shouldResetMonthly 
            ? MONTHLY_CREDITS + DAILY_CREDITS - requiredCredits
            : user.credits.credits + DAILY_CREDITS - requiredCredits,
          lastCreditReset: now,
          ...(shouldResetMonthly && {
            monthlyCredits: MONTHLY_CREDITS,
            lastMonthlyReset: now,
          }),
        },
      });
      return;
    }

    // For regular users
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
  if (user.credits.credits < requiredCredits) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Insufficient credits",
    });
  }

  // Deduct credits
  await db.userCredits.update({
    where: { userId },
    data: {
      credits: user.credits.credits - requiredCredits,
    },
  });
}