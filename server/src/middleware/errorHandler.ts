import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./ApiError.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    const body: {
      error: {
        code: string;
        message: string;
        status: number;
        details?: Record<string, string>;
      };
    } = {
      error: {
        code: err.code,
        message: err.message,
        status: err.status,
      },
    };

    if (err.details) {
      body.error.details = err.details;
    }

    res.status(err.status).json(body);
    return;
  }

  // Unexpected error
  console.error("Unexpected error:", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      status: 500,
    },
  });
}
