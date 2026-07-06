import { checkRateLimit, logToolUsage } from "@/lib/rate-limit";
import prisma from "@/lib/db";

// Mock Prisma Client
jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    toolUsage: {
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("Rate Limiting Service Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Allows Free user below limits", async () => {
    // Mock user is 'free'
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ plan: "free" });
    // Mock tool usage count today is 4 (below limit of 10)
    (prisma.toolUsage.count as jest.Mock).mockResolvedValue(4);

    const result = await checkRateLimit("user_123", "resume-checker");
    expect(result.allowed).toBe(true);
    expect(result.count).toBe(4);
    expect(result.limit).toBe(10);
  });

  test("Blocks Free user at or above limits (ATS Checker)", async () => {
    // Mock user is 'free'
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ plan: "free" });
    // Mock tool usage count today is 10 (equal to limit of 10)
    (prisma.toolUsage.count as jest.Mock).mockResolvedValue(10);

    const result = await checkRateLimit("user_123", "resume-checker");
    expect(result.allowed).toBe(false);
    expect(result.message).toContain("daily free limit of 10");
  });

  test("Blocks Free user at or above limits (AI Roaster)", async () => {
    // Mock user is 'free'
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ plan: "free" });
    // Mock tool usage count today is 5 (equal to limit of 5)
    (prisma.toolUsage.count as jest.Mock).mockResolvedValue(5);

    const result = await checkRateLimit("user_123", "resume-roaster");
    expect(result.allowed).toBe(false);
    expect(result.message).toContain("daily free limit of 5");
  });

  test("Allows Pro user even when counts exceed limit limits", async () => {
    // Mock user is 'pro'
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ plan: "pro" });
    // Mock tool usage count today is 25 (way above limits)
    (prisma.toolUsage.count as jest.Mock).mockResolvedValue(25);

    const result = await checkRateLimit("user_123", "resume-checker");
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(Infinity);
  });

  test("Logs tool usages to the database successfully", async () => {
    (prisma.toolUsage.create as jest.Mock).mockResolvedValue({ id: "log_1" });

    await logToolUsage("user_123", "json-formatter");

    expect(prisma.toolUsage.create).toHaveBeenCalledWith({
      data: {
        userId: "user_123",
        toolSlug: "json-formatter",
      },
    });
  });
});
