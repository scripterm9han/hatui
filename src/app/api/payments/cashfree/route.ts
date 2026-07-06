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

    const { planType } = await req.json(); // "monthly" or "annual"
    if (planType !== "monthly" && planType !== "annual") {
      return Response.json({ error: "Invalid planType selection." }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const userEmail = session.user.email || "";
    const userName = session.user.name || "Customer";

    const amount = planType === "monthly" ? 299 : 2499;
    const orderId = `sub_${userId.substring(5, 15)}_${Date.now()}`;

    // Cashfree Sandbox or Production Keys
    const appId = process.env.CASHFREE_APP_ID || "TEST_APP_ID";
    const secretKey = process.env.CASHFREE_SECRET_KEY || "TEST_SECRET_KEY";
    const apiEndpoint = process.env.CASHFREE_API_ENDPOINT || "https://sandbox.cashfree.com/pg";

    // Handle Mock Payment Mode if test credentials are present
    if (appId === "TEST_APP_ID" || secretKey === "TEST_SECRET_KEY") {
      console.log("Cashfree configured in MOCK mode. Generating mock session details.");
      return Response.json({
        success: true,
        mockMode: true,
        orderId,
        orderAmount: amount,
        paymentSessionId: `mock_session_${Date.now()}`,
        paymentLink: `/api/payments/cashfree/callback?order_id=${orderId}&mock_status=SUCCESS&plan_type=${planType}`,
      });
    }

    // Call Cashfree API to create PG Order
    const cfResponse = await fetch(`${apiEndpoint}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secretKey,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: userId,
          customer_email: userEmail,
          customer_phone: "9999999999", // Placeholder phone number
          customer_name: userName,
        },
        order_meta: {
          return_url: `${process.env.NEXTAUTH_URL}/api/payments/cashfree/callback?order_id={order_id}&plan_type=${planType}`,
        },
      }),
    });

    if (!cfResponse.ok) {
      const errText = await cfResponse.text();
      throw new Error(`Cashfree order creation failed: ${errText}`);
    }

    const cfData = await cfResponse.json();

    return Response.json({
      success: true,
      orderId: cfData.order_id,
      orderAmount: cfData.order_amount,
      paymentSessionId: cfData.payment_session_id,
      paymentLink: cfData.payment_link || null,
    });
  } catch (err: any) {
    console.error("Cashfree init error:", err);
    return Response.json({ error: err.message || "Failed to initiate payment." }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
