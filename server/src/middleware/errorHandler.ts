import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { logger } from "@/config/logger";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let details: any = null;

  // Log the error
  logger.error("Error occurred:", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
  });

  // Handle different types of errors
  if (error instanceof CustomError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    details = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        statusCode = 409;
        message = "Resource already exists";
        details = `Duplicate value for field: ${error.meta?.target}`;
        break;
      case "P2025":
        statusCode = 404;
        message = "Resource not found";
        break;
      case "P2003":
        statusCode = 400;
        message = "Foreign key constraint violation";
        break;
      default:
        statusCode = 400;
        message = "Database operation failed";
        break;
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided";
  } else if (error instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token";
  } else if (error instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Token expired";
  } else if (
    error.message.includes("ENOTFOUND") ||
    error.message.includes("ECONNREFUSED")
  ) {
    statusCode = 503;
    message = "Service temporarily unavailable";
  } else if (error.message.includes("ENOENT")) {
    statusCode = 404;
    message = "File not found";
  }

  // Don't expose sensitive information in production
  if (process.env.NODE_ENV === "production") {
    // Only send generic error messages in production
    if (statusCode === 500) {
      message = "Internal Server Error";
      details = null;
    }
  } else {
    // In development, include more details
    if (statusCode === 500) {
      details = {
        message: error.message,
        stack: error.stack,
      };
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(details && { details }),
      ...(process.env.NODE_ENV === "development" && {
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      }),
    },
  });
};

// Async error wrapper to catch async errors in route handlers
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Not found middleware
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
};

export default errorHandler;
