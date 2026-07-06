import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");
  const mockStatus = searchParams.get("mock_status");
  const planType = searchParams.get("plan_type") || "monthly";

  const redirectUrl = new URL("/dashboard", req.url);

  if (!orderId) {
    redirectUrl.searchParams.set("payment", "failed");
    redirectUrl.searchParams.set("reason", "missing_order_id");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // 1. Resolve customer ID (User ID) from orderId structure "sub_{userId}_{timestamp}"
    // Format is sub_userIdExcerpt_timestamp. Wait, it's safer to query user ID from DB or decode it.
    // Let's decode userId from orderId which is "sub_userId_timestamp"
    const parts = orderId.split("_");
    // Wait, in route.ts we did: `sub_${userId.substring(5, 15)}_${Date.now()}`. 
    // To identify the user reliably, we should fetch the user whose id contains the middle part or has matching details.
    // Better yet, we can do a lookup in SavedOutput or User. But since this is a callback, 
    // let's do a findFirst user whose id contains the middle part of orderId!
    const userExcerpt = parts[1];
    
    let user = await prisma.user.findFirst({
      where: {
        id: {
          contains: userExcerpt,
        },
      },
    });

    if (!user) {
      // Fallback: search by recent login or look for user
      // If we can't find the user, return error
      redirectUrl.searchParams.set("payment", "failed");
      redirectUrl.searchParams.set("reason", "user_not_found");
      return NextResponse.redirect(redirectUrl);
    }

    // 2. Handle Mock Status
    if (mockStatus === "SUCCESS") {
      // Upgrade User to Pro
      await prisma.user.update({
        where: { id: user.id },
        data: { plan: "pro" },
      });

      // Insert or Update subscription record
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + (planType === "annual" ? 365 : 30));

      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          status: "active",
          currentPeriodEnd: periodEnd,
        },
        create: {
          userId: user.id,
          cashfreeSubId: `mock_sub_${Date.now()}`,
          status: "active",
          currentPeriodEnd: periodEnd,
        },
      });

      redirectUrl.searchParams.set("payment", "success");
      return NextResponse.redirect(redirectUrl);
    }

    // 3. Handle Active Cashfree Verification
    const appId = process.env.CASHFREE_APP_ID || "TEST_APP_ID";
    const secretKey = process.env.CASHFREE_SECRET_KEY || "TEST_SECRET_KEY";
    const apiEndpoint = process.env.CASHFREE_API_ENDPOINT || "https://sandbox.cashfree.com/pg";

    const verifyRes = await fetch(`${apiEndpoint}/orders/${orderId}`, {
      method: "GET",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secretKey,
      },
    });

    if (!verifyRes.ok) {
      throw new Error(`Failed to fetch order status from Cashfree: ${await verifyRes.text()}`);
    }

    const orderData = await verifyRes.json();

    if (orderData.order_status === "PAID" || orderData.order_status === "SUCCESS") {
      // Upgrade User to Pro
      await prisma.user.update({
        where: { id: user.id },
        data: { plan: "pro" },
      });

      // Insert subscription record
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + (planType === "annual" ? 365 : 30));

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

      redirectUrl.searchParams.set("payment", "success");
    } else {
      redirectUrl.searchParams.set("payment", "failed");
      redirectUrl.searchParams.set("reason", `order_status_${orderData.order_status}`);
    }

    return NextResponse.redirect(redirectUrl);
  } catch (err: any) {
    console.error("Cashfree callback error:", err);
    redirectUrl.searchParams.set("payment", "failed");
    redirectUrl.searchParams.set("error", err.message || "unknown");
    return NextResponse.redirect(redirectUrl);
  }
}
export const dynamic = "force-dynamic";
