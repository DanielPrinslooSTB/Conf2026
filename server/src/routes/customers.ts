import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client.js";

export const customersRouter = Router();

// GET /api/customers
customersRouter.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const customers = await prisma.customer.findMany({
        select: {
          id: true,
          name: true,
          accountNumber: true,
        },
      });

      res.json(customers);
    } catch (error) {
      next(error);
    }
  }
);
