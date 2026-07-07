import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import DashboardClient from "@/components/DashboardClient";

export const metadata = {
  title: "Dashboard - Hatiyar Suite",
  description: "View your saved tool history, usage metrics, and subscription plans.",
};

export default async function DashboardPage() {
  // 1. Authenticate user
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const userId = (session.user as any).id;

  // 2. Fetch User plan directly from Database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, email: true, name: true },
  });

  if (!user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  // 3. Fetch saved outputs
  const savedOutputs = await prisma.savedOutput.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // 4. Calculate today's usages
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const checkerUsageToday = await prisma.toolUsage.count({
    where: {
      userId,
      toolSlug: "resume-checker",
      createdAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  const roasterUsageToday = await prisma.toolUsage.count({
    where: {
      userId,
      toolSlug: "resume-roaster",
      createdAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  // 5. Aggregate top used tools
  const usageGroups = await prisma.toolUsage.groupBy({
    by: ["toolSlug"],
    where: { userId },
    _count: {
      toolSlug: true,
    },
    orderBy: {
      _count: {
        toolSlug: "desc",
      },
    },
    take: 10,
  });

  const topTools = usageGroups.map((group) => ({
    slug: group.toolSlug,
    count: group._count.toolSlug,
  }));

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="shell max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            User <span className="text-[var(--color-accent)] font-mono">Dashboard</span>
          </h1>
          <p className="text-[var(--color-fg-muted)] text-sm mt-1.5">
            Analyze your workspace productivity, limits, and saved outputs.
          </p>
        </div>

        <DashboardClient
          initialHistory={savedOutputs}
          userEmail={user.email || ""}
          userName={user.name || ""}
          userPlan={user.plan}
          checkerUsageToday={checkerUsageToday}
          roasterUsageToday={roasterUsageToday}
          topTools={topTools}
        />
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
