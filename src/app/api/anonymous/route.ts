import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/server/db";

const DAILY_CREDITS = 3;

export async function GET(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");
    
    const ip = forwardedFor?.split(",")[0] ?? realIp ?? "unknown";

    // Create a unique identifier based on IP and user agent
    const identifier = `${ip}-${userAgent ?? "unknown"}`;

    // Find or create anonymous user
    const diagram = await db.diagram.findFirst({
      where: {
        anonymousId: identifier,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let credits = DAILY_CREDITS;
    let lastReset = new Date().toISOString();

    if (diagram) {
      const lastDiagramDate = diagram.createdAt;
      const today = new Date();
      
      // If the last diagram was created today, calculate remaining credits
      if (lastDiagramDate.getDate() === today.getDate() &&
          lastDiagramDate.getMonth() === today.getMonth() &&
          lastDiagramDate.getFullYear() === today.getFullYear()) {
        // Count diagrams created today
        const todayDiagrams = await db.diagram.count({
          where: {
            anonymousId: identifier,
            createdAt: {
              gte: new Date(today.setHours(0, 0, 0, 0)),
            },
          },
        });
        credits = Math.max(0, DAILY_CREDITS - todayDiagrams);
        lastReset = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      }
    }

    return NextResponse.json({
      id: identifier,
      credits,
      lastReset,
    });
  } catch (error) {
    console.error("Error in anonymous user route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 