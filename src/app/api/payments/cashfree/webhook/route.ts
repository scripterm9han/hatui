import { NextRequest } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    console.log("Received Cashfree webhook payload:", payload);

    // Verify webhook type and status
    const eventType = payload.event_type;
    const orderId = payload.data?.order?.order_id;
    const orderStatus = payload.data?.order?.order_status;

    if (!orderId || (eventType !== "ORDER_PAID" && orderStatus !== "PAID")) {
      return Response.json({ status: "ignored", message: "Not a paid order event." });
    }

    // Decode User ID from orderId (Format: sub_userIdExcerpt_timestamp)
    const parts = orderId.split("_");
    const userExcerpt = parts[1];

    if (!userExcerpt) {
      return Response.json({ error: "Invalid order ID format." }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: {
          contains: userExcerpt,
        },
      },
    });

    if (!user) {
      return Response.json({ error: "Associated user not found." }, { status: 404 });
    }

    // Upgrade User to Pro
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: "pro" },
    });

    // Update or Insert Subscription record
    const periodEnd = new Date();
    // Default to 30 days (monthly) unless order amount suggests annual (e.g. >= 2000)
    const orderAmount = payload.data?.order?.order_amount || 299;
    const isAnnual = orderAmount >= 2000;
    periodEnd.setDate(periodEnd.getDate() + (isAnnual ? 365 : 30));

    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        status: "active",
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId: user.id,
        cashfreeSubId: `cf_sub_${orderId}`,
        status: "active",
        currentPeriodEnd: periodEnd,
      },
    });

    console.log(`Successfully upgraded user ${user.id} to PRO via webhook.`);

    return Response.json({ status: "success", message: "User plan upgraded." });
  } catch (err: any) {
    console.error("Cashfree webhook processing error:", err);
    return Response.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
