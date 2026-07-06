import prisma from "@/lib/db";

interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  message?: string;
}

/**
 * Checks and enforces daily rate limits for AI-powered tools.
 * Free tier: Resume Checker = 10/day, Resume Roaster = 5/day
 * Pro tier: Unlimited
 */
export async function checkRateLimit(
  userId: string,
  toolSlug: "resume-checker" | "resume-roaster"
): Promise<RateLimitResult> {
  // 1. Fetch current user plan directly from DB for security
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!user) {
    return { allowed: false, count: 0, limit: 0, message: "User not found." };
  }

  // Pro users have unlimited access
  if (user.plan === "pro") {
    return { allowed: true, count: 0, limit: Infinity };
  }

  // 2. Calculate local date boundaries for today (midnight to midnight)
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // 3. Count matching ToolUsage entries for this user today
  const count = await prisma.toolUsage.count({
    where: {
      userId,
      toolSlug,
      createdAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  const limit = toolSlug === "resume-checker" ? 10 : 5;

  if (count >= limit) {
    return {
      allowed: false,
      count,
      limit,
      message: `You have reached your daily free limit of ${limit} checks for the AI ${
        toolSlug === "resume-checker" ? "Resume Checker" : "Resume Roaster"
      }. Upgrade to Pro for unlimited access.`,
    };
  }

  return { allowed: true, count, limit };
}

/**
 * Logs a new tool usage event in the database
 */
export async function logToolUsage(userId: string, toolSlug: string): Promise<void> {
  try {
    await prisma.toolUsage.create({
      data: {
        userId,
        toolSlug,
      },
    });
  } catch (err) {
    console.error(`Failed to log usage for tool ${toolSlug} and user ${userId}:`, err);
  }
}
