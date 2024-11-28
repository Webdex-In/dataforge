import { PrismaClient } from "@prisma/client";


export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

async function checkDBConnection() {
  try {
    await db.$connect();
  } catch (error) {
    // console.error("Failed to connect to database", error);
    // process.exit(1);
  }
}

checkDBConnection();
