import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

// Global is used here to maintain connection across hot reloads in development
declare global {
  var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["error", "warn"],
    errorFormat: "minimal",
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ["query", "error", "warn", "info"],
      errorFormat: "pretty",
    });
  }
  prisma = global.__prisma;
}

// Database connection function
export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info("🗄️ Database connected successfully");

    // Test the connection
    const userCount = await prisma.user.count();
    logger.info(`📊 Database health check: ${userCount} users in database`);
  } catch (error) {
    logger.error("❌ Database connection failed:", error);
    throw error;
  }
}

// Graceful shutdown function
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    logger.info("🔌 Database disconnected successfully");
  } catch (error) {
    logger.error("❌ Database disconnect failed:", error);
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error("Database health check failed:", error);
    return false;
  }
}

export { prisma };
export default prisma;
