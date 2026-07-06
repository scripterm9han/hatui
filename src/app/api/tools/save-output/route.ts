import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: "Authentication required." }, { status: 401 });
    }

    const { toolSlug, inputRef, outputRef } = await req.json();
    if (!toolSlug) {
      return Response.json({ error: "Missing toolSlug parameter." }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // 1. Check user plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    // 2. Enforce rolling 20 limit for free users
    if (user.plan !== "pro") {
      const savedCount = await prisma.savedOutput.count({
        where: { userId, toolSlug },
      });

      if (savedCount >= 20) {
        // Find the oldest record
        const oldestRecords = await prisma.savedOutput.findMany({
          where: { userId, toolSlug },
          orderBy: { createdAt: "asc" },
          take: savedCount - 19, // Leaves room for 1 new item to make it 20
        });

        const idsToDelete = oldestRecords.map((r) => r.id);
        await prisma.savedOutput.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }
    }

    // 3. Create new SavedOutput record
    const saved = await prisma.savedOutput.create({
      data: {
        userId,
        toolSlug,
        inputRef,
        outputRef,
      },
    });

    return Response.json({ success: true, id: saved.id });
  } catch (err: any) {
    console.error("Save output error:", err);
    return Response.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return Response.json({ error: "Missing record ID." }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Make sure user owns the record before deleting
    const record = await prisma.savedOutput.findUnique({
      where: { id },
    });

    if (!record) {
      return Response.json({ error: "Record not found." }, { status: 404 });
    }

    if (record.userId !== userId) {
      return Response.json({ error: "Forbidden." }, { status: 403 });
    }

    await prisma.savedOutput.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Delete output error:", err);
    return Response.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
