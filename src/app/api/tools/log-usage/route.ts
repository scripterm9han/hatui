import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      // Client-side tools do not require authentication; ignore logging or count anonymously
      return Response.json({ success: true, message: "Anonymous usage not logged." });
    }

    const { toolSlug } = await req.json();
    if (!toolSlug) {
      return Response.json({ error: "Missing toolSlug parameter." }, { status: 400 });
    }

    const userId = (session.user as any).id;

    await prisma.toolUsage.create({
      data: {
        userId,
        toolSlug,
      },
    });

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Usage logging error:", err);
    return Response.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
