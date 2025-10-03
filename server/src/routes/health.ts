import { Router, Request, Response } from "express";
import { checkDatabaseHealth } from "@/config/database";
import { asyncHandler } from "@/middleware/errorHandler";

const router = Router();

// Basic health check
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Nexus Backend API is healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  }),
);

// Detailed health check
router.get(
  "/detailed",
  asyncHandler(async (req: Request, res: Response) => {
    const dbHealth = await checkDatabaseHealth();

    const healthInfo = {
      success: true,
      services: {
        database: dbHealth ? "healthy" : "unhealthy",
        server: "healthy",
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      memory: process.memoryUsage(),
      version: process.version,
    };

    // Return 503 if any service is unhealthy
    const status = Object.values(healthInfo.services).every(
      (service) => service === "healthy",
    )
      ? 200
      : 503;

    res.status(status).json(healthInfo);
  }),
);

export default router;
