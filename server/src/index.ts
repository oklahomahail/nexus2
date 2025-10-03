import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

// Load environment variables
dotenv.config();

import { logger } from "@/config/logger";
import { connectDatabase } from "@/config/database";
import { errorHandler } from "@/middleware/errorHandler";
import { rateLimiter } from "@/middleware/rateLimiter";
import { validateEnv } from "@/config/env";

// Import routes
import authRoutes from "@/routes/auth";
import userRoutes from "@/routes/users";
import clientRoutes from "@/routes/clients";
import campaignRoutes from "@/routes/campaigns";
import donorRoutes from "@/routes/donors";
import donationRoutes from "@/routes/donations";
import analyticsRoutes from "@/routes/analytics";
import healthRoutes from "@/routes/health";

// Validate environment variables
validateEnv();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

// Trust proxy (important for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// Compression
app.use(compression());

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
app.use(
  morgan("combined", {
    stream: { write: (message: string) => logger.info(message.trim()) },
  }),
);

// Rate limiting
app.use(rateLimiter);

// Health check (before auth for monitoring)
app.use("/health", healthRoutes);

// API Routes
const API_PREFIX = "/api";

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/clients`, clientRoutes);
app.use(`${API_PREFIX}/campaigns`, campaignRoutes);
app.use(`${API_PREFIX}/donors`, donorRoutes);
app.use(`${API_PREFIX}/donations`, donationRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);

// WebSocket connection handling
io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Join user-specific room for notifications
  socket.on("join-user-room", (userId: string) => {
    socket.join(`user-${userId}`);
    logger.debug(`User ${userId} joined room user-${userId}`);
  });

  // Join campaign-specific room for live updates
  socket.on("join-campaign-room", (campaignId: string) => {
    socket.join(`campaign-${campaignId}`);
    logger.debug(`Socket ${socket.id} joined campaign room ${campaignId}`);
  });

  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set("io", io);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    const PORT = parseInt(process.env.PORT || "4000", 10);
    const HOST = process.env.HOST || "localhost";

    server.listen(PORT, HOST, () => {
      logger.info(`🚀 Nexus Backend Server running on http://${HOST}:${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API Base URL: http://${HOST}:${PORT}/api`);
      logger.info(`⚡ WebSocket Server ready for real-time updates`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();

export { app, io };
