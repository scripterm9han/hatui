import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    env: {
      VERCEL: process.env.VERCEL,
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
    },
    paths: {},
    errors: [],
  };

  try {
    diagnostics.cwd = process.cwd();
    const dbPath = "/tmp/dev.db";
    const srcPath = path.join(process.cwd(), "prisma/dev.db");

    diagnostics.paths.tmp_exists = fs.existsSync(dbPath);
    if (diagnostics.paths.tmp_exists) {
      diagnostics.paths.tmp_size = fs.statSync(dbPath).size;
    }
    diagnostics.paths.src_exists = fs.existsSync(srcPath);
    if (diagnostics.paths.src_exists) {
      diagnostics.paths.src_size = fs.statSync(srcPath).size;
    }
  } catch (e: any) {
    diagnostics.errors.push({ step: "fs_check", message: e.message });
  }

  try {
    // Try to run a simple query
    const userCount = await prisma.user.count();
    diagnostics.db_status = "success";
    diagnostics.user_count = userCount;
  } catch (e: any) {
    diagnostics.db_status = "failed";
    diagnostics.errors.push({ step: "db_query", message: e.message });
  }

  return NextResponse.json(diagnostics);
}
