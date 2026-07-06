import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { parseFileToText } from "@/lib/file-parser";
import { getAtsScore } from "@/lib/ai";
import { checkRateLimit, logToolUsage } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json(
        { error: "Authentication required. Please sign in to check your resume." },
        { status: 401 }
      );
    }
    const userId = (session.user as any).id;

    // 2. Validate rate limit
    const limitCheck = await checkRateLimit(userId, "resume-checker");
    if (!limitCheck.allowed) {
      return Response.json({ error: limitCheck.message }, { status: 429 });
    }

    // 3. Parse input (Form data containing file or text)
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    let resumeText = formData.get("text") as string | null;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      resumeText = await parseFileToText(buffer, file.type);
    }

    if (!resumeText || !resumeText.trim()) {
      return Response.json(
        { error: "No resume content detected. Please paste text or upload a valid file." },
        { status: 400 }
      );
    }

    // 4. Run AI ATS Scoring analysis
    const analysisResult = await getAtsScore(resumeText);

    // 5. Log tool usage in database
    await logToolUsage(userId, "resume-checker");

    return Response.json({
      success: true,
      data: analysisResult,
      rawText: resumeText.substring(0, 10000), // Return raw text for saving later if needed
    });
  } catch (err: any) {
    console.error("Resume checker API error:", err);
    return Response.json(
      { error: err.message || "An unexpected error occurred during resume analysis." },
      { status: 500 }
    );
  }
}
export const maxDuration = 60; // Allow enough time for AI response
export const dynamic = "force-dynamic";
