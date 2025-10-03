import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { logger } from "@/config/logger";

// Default rate limiter
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10), // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
    retryAfter: Math.ceil(
      parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10) / 1000 / 60,
    ), // in minutes
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
    });

    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later.",
      retryAfter: Math.ceil(
        parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10) / 1000 / 60,
      ),
    });
  },
});

// Stricter rate limiter for authentication routes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
    retryAfter: 15, // 15 minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      email: req.body?.email,
    });

    res.status(429).json({
      success: false,
      message: "Too many authentication attempts, please try again later.",
      retryAfter: 15,
    });
  },
});

// API rate limiter for general API endpoints
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs for API endpoints
  message: {
    success: false,
    message: "API rate limit exceeded, please try again later.",
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiter
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 file uploads per hour
  message: {
    success: false,
    message: "Too many file uploads, please try again later.",
    retryAfter: 60, // 1 hour
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
