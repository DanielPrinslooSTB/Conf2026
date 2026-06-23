import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client.js";
import { ApiError } from "../middleware/ApiError.js";
import { validateCreateDispute } from "../validators/disputeValidator.js";
import { evaluateDispute } from "../services/triageEngine.js";
import type { DisputeWithTriage, FiredRule } from "../types/dispute.js";

export const disputesRouter = Router();

function mapDisputeToResponse(dispute: {
  id: number;
  paymentType: string;
  issueCategory: string;
  status: string;
  createdAt: Date;
  customer: { id: number; name: string; accountNumber: string };
  transaction: { amount: number; date: Date; status: string; reference: string };
  triageRecommendation: {
    routingAction: string;
    priorityLevel: string;
    reasoning: string;
  } | null;
}): DisputeWithTriage {
  return {
    id: dispute.id,
    customer: {
      id: dispute.customer.id,
      name: dispute.customer.name,
      accountNumber: dispute.customer.accountNumber,
    },
    paymentType: dispute.paymentType,
    issueCategory: dispute.issueCategory,
    transaction: {
      amount: dispute.transaction.amount,
      date: dispute.transaction.date.toISOString(),
      status: dispute.transaction.status,
      reference: dispute.transaction.reference,
    },
    status: dispute.status,
    createdAt: dispute.createdAt.toISOString(),
    triageRecommendation: dispute.triageRecommendation
      ? {
          routingAction: dispute.triageRecommendation.routingAction,
          priorityLevel: dispute.triageRecommendation.priorityLevel,
          reasoning: JSON.parse(
            dispute.triageRecommendation.reasoning
          ) as FiredRule[],
        }
      : { routingAction: "", priorityLevel: "", reasoning: [] },
  };
}

// GET /api/disputes
disputesRouter.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const disputes = await prisma.dispute.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          transaction: true,
          triageRecommendation: true,
        },
      });

      const response = disputes.map(mapDisputeToResponse);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/disputes/:id
disputesRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new ApiError(400, "VALIDATION_ERROR", "Invalid dispute ID");
      }

      const dispute = await prisma.dispute.findUnique({
        where: { id },
        include: {
          customer: true,
          transaction: true,
          triageRecommendation: true,
        },
      });

      if (!dispute) {
        throw new ApiError(
          404,
          "NOT_FOUND",
          `Dispute with id ${id} not found`
        );
      }

      res.json(mapDisputeToResponse(dispute));
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/disputes
disputesRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = validateCreateDispute(req.body);
      if (!validation.valid) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "Invalid request data",
          validation.errors
        );
      }

      const {
        customerId,
        paymentType,
        issueCategory,
        transactionAmount,
        transactionDate,
        transactionStatus,
      } = req.body;

      // Verify customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "Invalid request data",
          { customerId: "Customer not found" }
        );
      }

      // Create transaction
      const transactionCount = await prisma.transaction.count();
      const reference = `TXN-REF-${String(transactionCount + 1).padStart(3, "0")}`;

      const transaction = await prisma.transaction.create({
        data: {
          amount: transactionAmount,
          date: new Date(transactionDate),
          status: transactionStatus,
          type: paymentType,
          reference,
        },
      });

      // Create dispute
      const dispute = await prisma.dispute.create({
        data: {
          customerId,
          transactionId: transaction.id,
          paymentType,
          issueCategory,
          status: "Open",
        },
      });

      // Run triage engine
      const triageResult = evaluateDispute({
        transactionAmount,
        transactionStatus,
        issueCategory,
        disputeCreatedAt: dispute.createdAt,
      });

      // Persist triage recommendation
      await prisma.triageRecommendation.create({
        data: {
          disputeId: dispute.id,
          routingAction: triageResult.routingAction,
          priorityLevel: triageResult.priorityLevel,
          reasoning: JSON.stringify(triageResult.reasoning),
        },
      });

      // Fetch full dispute with relations
      const fullDispute = await prisma.dispute.findUnique({
        where: { id: dispute.id },
        include: {
          customer: true,
          transaction: true,
          triageRecommendation: true,
        },
      });

      res.status(201).json(mapDisputeToResponse(fullDispute!));
    } catch (error) {
      next(error);
    }
  }
);
