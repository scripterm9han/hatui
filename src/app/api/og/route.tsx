import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Hatiyar Multi-Tool Suite";
    const description = searchParams.get("description") || "Modern, SEO-friendly, and blazing fast engineering tools.";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            backgroundColor: "#050714",
            padding: "80px",
            border: "6px solid #00f0ff",
            position: "relative",
          }}
        >
          {/* Subtle grid lines background simulation */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 240, 255, 0.01)",
              backgroundImage:
                "linear-gradient(to right, rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Glowing bottom right accent dot */}
          <div
            style={{
              position: "absolute",
              bottom: "-100px",
              right: "-100px",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              backgroundColor: "rgba(0, 240, 255, 0.15)",
              filter: "blur(60px)",
            }}
          />

          {/* Top Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "24px",
              fontWeight: "bold",
              fontFamily: "monospace",
              color: "#00f0ff",
              letterSpacing: "2px",
              marginBottom: "40px",
              textShadow: "0 0 10px rgba(0,240,255,0.5)",
            }}
          >
            ⚙ HATIYAR.IN
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "#ffffff",
              lineHeight: 1.1,
              marginBottom: "24px",
              maxWidth: "950px",
            }}
          >
            {title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "28px",
              color: "#94a3b8",
              lineHeight: 1.4,
              maxWidth: "900px",
            }}
          >
            {description}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate dynamic OG Image`, { status: 500 });
  }
}
