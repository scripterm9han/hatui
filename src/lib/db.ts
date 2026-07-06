import { PrismaClient } from "@prisma/client";

import fs from "fs";
import path from "path";

const prismaClientSingleton = () => {
  if (process.env.VERCEL === "1") {
    const dbName = "dev.db";
    const dbPath = path.join("/tmp", dbName);
    const srcPath = path.join(process.cwd(), "prisma", dbName);
    
    process.env.DATABASE_URL = `file:${dbPath}`;
    
    if (!fs.existsSync(dbPath)) {
      try {
        if (!fs.existsSync("/tmp")) {
          fs.mkdirSync("/tmp", { recursive: true });
        }
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, dbPath);
          console.log("Successfully copied SQLite database to /tmp");
        } else {
          console.error(`Source database file not found at: ${srcPath}`);
        }
      } catch (error) {
        console.error("Error setting up SQLite database in /tmp:", error);
      }
    }
  }

  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
