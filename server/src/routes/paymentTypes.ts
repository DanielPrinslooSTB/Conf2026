import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { PAYMENT_TYPE_CATEGORIES } from "../services/paymentTypes.js";
import type { PaymentTypeEntry } from "../types/dispute.js";

export const paymentTypesRouter = Router();

// GET /api/payment-types
paymentTypesRouter.get(
  "/",
  (_req: Request, res: Response, _next: NextFunction) => {
    const response: PaymentTypeEntry[] = Object.entries(
      PAYMENT_TYPE_CATEGORIES
    ).map(([type, issueCategories]) => ({
      type,
      issueCategories,
    }));

    res.json(response);
  }
);
