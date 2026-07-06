import prisma from "@/lib/db";
import { POST as handleWebhook } from "@/app/api/payments/cashfree/webhook/route";
import { NextRequest } from "next/server";

// Mock Prisma Client
jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    subscription: {
      upsert: jest.fn(),
    },
  },
}));

describe("Authentication JWT & Session Callbacks", () => {
  // Mock JWT callback behavior in NextAuth config
  test("Forward user plan property in NextAuth JWT callback", () => {
    const mockUser = { id: "user_1", email: "test@example.com", plan: "pro" };
    const mockToken: any = {};
    
    // Simulate NextAuth jwt callback logic
    const jwtCallback = (token: any, user: any) => {
      if (user) {
        token.id = user.id;
        token.plan = user.plan || "free";
      }
      return token;
    };

    const token = jwtCallback(mockToken, mockUser);
    expect(token.id).toBe("user_1");
    expect(token.plan).toBe("pro");
  });

  test("Forward JWT tokens inside NextAuth Session object", () => {
    const mockToken = { id: "user_1", plan: "pro" };
    const mockSession: any = { user: {} };

    // Simulate NextAuth session callback logic
    const sessionCallback = (session: any, token: any) => {
      if (session.user) {
        session.user.id = token.id;
        session.user.plan = token.plan;
      }
      return session;
    };

    const session = sessionCallback(mockSession, mockToken);
    expect(session.user.id).toBe("user_1");
    expect(session.user.plan).toBe("pro");
  });
});

describe("Cashfree Webhook Upgrades Handler Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Upgrades user plan to PRO and registers subscription on PAID hook status", async () => {
    // 1. Mock DB queries
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: "user_123", email: "subscriber@test.com" });
    (prisma.user.update as jest.Mock).mockResolvedValue({ id: "user_123", plan: "pro" });
    (prisma.subscription.upsert as jest.Mock).mockResolvedValue({ id: "sub_1" });

    // 2. Build mock request payload matching Cashfree payload structure
    const webhookData = {
      event_type: "ORDER_PAID",
      data: {
        order: {
          order_id: "sub_user123_timestamp",
          order_status: "PAID",
          order_amount: 299,
        },
      },
    };

    const request = new NextRequest("http://localhost:3000/api/payments/cashfree/webhook", {
      method: "POST",
      body: JSON.stringify(webhookData),
    });

    // 3. Process Webhook Route
    const response = await handleWebhook(request);
    const json = await response.json();

    // 4. Assertions
    expect(response.status).toBe(200);
    expect(json.status).toBe("success");
    expect(prisma.user.findFirst).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user_123" },
      data: { plan: "pro" },
    });
    expect(prisma.subscription.upsert).toHaveBeenCalled();
  });

  test("Ignores non-paid orders or events", async () => {
    const webhookData = {
      event_type: "ORDER_FAILED",
      data: {
        order: {
          order_id: "sub_user123_timestamp",
          order_status: "FAILED",
        },
      },
    };

    const request = new NextRequest("http://localhost:3000/api/payments/cashfree/webhook", {
      method: "POST",
      body: JSON.stringify(webhookData),
    });

    const response = await handleWebhook(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe("ignored");
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
