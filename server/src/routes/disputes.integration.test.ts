import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../index.js";
import { prisma } from "../prisma/client.js";

// Ensure at least one customer exists for tests
let testCustomerId: number;

beforeAll(async () => {
  const customer = await prisma.customer.findFirst();
  if (customer) {
    testCustomerId = customer.id;
  } else {
    const newCustomer = await prisma.customer.create({
      data: {
        name: "Test Customer",
        email: "test-integration@example.com",
        accountNumber: "ACC-INT-001",
      },
    });
    testCustomerId = newCustomer.id;
  }
});

describe("GET /api/disputes", () => {
  it("returns 200 with an array", async () => {
    const res = await request(app).get("/api/disputes");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns disputes with full structure", async () => {
    const res = await request(app).get("/api/disputes");
    if (res.body.length > 0) {
      const dispute = res.body[0];
      expect(dispute).toHaveProperty("id");
      expect(dispute).toHaveProperty("customer");
      expect(dispute).toHaveProperty("paymentType");
      expect(dispute).toHaveProperty("issueCategory");
      expect(dispute).toHaveProperty("transaction");
      expect(dispute).toHaveProperty("status");
      expect(dispute).toHaveProperty("createdAt");
      expect(dispute).toHaveProperty("triageRecommendation");
      expect(dispute.triageRecommendation).toHaveProperty("routingAction");
      expect(dispute.triageRecommendation).toHaveProperty("priorityLevel");
      expect(dispute.triageRecommendation).toHaveProperty("reasoning");
    }
  });
});

describe("GET /api/disputes/:id", () => {
  it("returns 400 for non-numeric id", async () => {
    const res = await request(app).get("/api/disputes/abc");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 404 for non-existent id", async () => {
    const res = await request(app).get("/api/disputes/999999");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 200 with dispute structure for valid id", async () => {
    // First create a dispute to fetch
    const createRes = await request(app).post("/api/disputes").send({
      customerId: testCustomerId,
      paymentType: "Card Payment",
      issueCategory: "Duplicate Debit",
      transactionAmount: 100,
      transactionDate: "2026-01-15",
      transactionStatus: "Completed",
    });

    const id = createRes.body.id;
    const res = await request(app).get(`/api/disputes/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.customer.id).toBe(testCustomerId);
  });
});

describe("POST /api/disputes", () => {
  it("creates a dispute and returns 201 with triage recommendation", async () => {
    const res = await request(app).post("/api/disputes").send({
      customerId: testCustomerId,
      paymentType: "Card Payment",
      issueCategory: "Unauthorized Transaction",
      transactionAmount: 5000,
      transactionDate: "2026-06-01",
      transactionStatus: "Completed",
    });

    expect(res.status).toBe(201);
    expect(res.body.paymentType).toBe("Card Payment");
    expect(res.body.issueCategory).toBe("Unauthorized Transaction");
    expect(res.body.status).toBe("Open");
    expect(res.body.triageRecommendation.routingAction).toBe("Escalate");
    expect(res.body.triageRecommendation.priorityLevel).toBe("Medium");
    expect(res.body.triageRecommendation.reasoning.length).toBeGreaterThan(0);
  });

  it("returns 400 when body is empty", async () => {
    const res = await request(app)
      .post("/api/disputes")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for invalid paymentType", async () => {
    const res = await request(app).post("/api/disputes").send({
      customerId: testCustomerId,
      paymentType: "Bitcoin",
      issueCategory: "Duplicate Debit",
      transactionAmount: 100,
      transactionDate: "2026-01-15",
      transactionStatus: "Completed",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty("paymentType");
  });

  it("returns 400 for mismatched issueCategory and paymentType", async () => {
    const res = await request(app).post("/api/disputes").send({
      customerId: testCustomerId,
      paymentType: "EFT",
      issueCategory: "Incorrect Amount", // Not valid for EFT
      transactionAmount: 100,
      transactionDate: "2026-01-15",
      transactionStatus: "Completed",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty("issueCategory");
  });

  it("returns 400 for non-existent customer", async () => {
    const res = await request(app).post("/api/disputes").send({
      customerId: 999999,
      paymentType: "Card Payment",
      issueCategory: "Duplicate Debit",
      transactionAmount: 100,
      transactionDate: "2026-01-15",
      transactionStatus: "Completed",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty("customerId");
  });

  it("returns 400 for negative transactionAmount", async () => {
    const res = await request(app).post("/api/disputes").send({
      customerId: testCustomerId,
      paymentType: "Card Payment",
      issueCategory: "Duplicate Debit",
      transactionAmount: -50,
      transactionDate: "2026-01-15",
      transactionStatus: "Completed",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty("transactionAmount");
  });

  it("returns 400 for invalid transactionDate", async () => {
    const res = await request(app).post("/api/disputes").send({
      customerId: testCustomerId,
      paymentType: "Card Payment",
      issueCategory: "Duplicate Debit",
      transactionAmount: 100,
      transactionDate: "not-a-date",
      transactionStatus: "Completed",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty("transactionDate");
  });

  it("returns 400 for invalid transactionStatus", async () => {
    const res = await request(app).post("/api/disputes").send({
      customerId: testCustomerId,
      paymentType: "Card Payment",
      issueCategory: "Duplicate Debit",
      transactionAmount: 100,
      transactionDate: "2026-01-15",
      transactionStatus: "Cancelled",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty("transactionStatus");
  });

  it("generates unique transaction references", async () => {
    const res1 = await request(app).post("/api/disputes").send({
      customerId: testCustomerId,
      paymentType: "EFT",
      issueCategory: "Failed Transfer",
      transactionAmount: 200,
      transactionDate: "2026-03-10",
      transactionStatus: "Failed",
    });

    const res2 = await request(app).post("/api/disputes").send({
      customerId: testCustomerId,
      paymentType: "EFT",
      issueCategory: "Failed Transfer",
      transactionAmount: 300,
      transactionDate: "2026-03-11",
      transactionStatus: "Failed",
    });

    expect(res1.body.transaction.reference).not.toBe(
      res2.body.transaction.reference
    );
  });
});

describe("POST /api/disputes - triage integration", () => {
  it("assigns High priority for amount > 10000", async () => {
    const res = await request(app).post("/api/disputes").send({
      customerId: testCustomerId,
      paymentType: "Card Payment",
      issueCategory: "Incorrect Amount",
      transactionAmount: 15000,
      transactionDate: "2026-06-20",
      transactionStatus: "Completed",
    });

    expect(res.status).toBe(201);
    expect(res.body.triageRecommendation.priorityLevel).toBe("High");
  });

  it("assigns Low priority for amount < 1000", async () => {
    const res = await request(app).post("/api/disputes").send({
      customerId: testCustomerId,
      paymentType: "Internal Transfer",
      issueCategory: "Missing Payment",
      transactionAmount: 50,
      transactionDate: "2026-06-20",
      transactionStatus: "Completed",
    });

    expect(res.status).toBe(201);
    expect(res.body.triageRecommendation.priorityLevel).toBe("Low");
  });

  it("routes Failed transactions to Investigate Further", async () => {
    const res = await request(app).post("/api/disputes").send({
      customerId: testCustomerId,
      paymentType: "EFT",
      issueCategory: "Duplicate Debit",
      transactionAmount: 800,
      transactionDate: "2026-06-20",
      transactionStatus: "Failed",
    });

    expect(res.status).toBe(201);
    expect(res.body.triageRecommendation.routingAction).toBe(
      "Investigate Further"
    );
  });

  it("resolves low-value duplicate debits immediately", async () => {
    const res = await request(app).post("/api/disputes").send({
      customerId: testCustomerId,
      paymentType: "Card Payment",
      issueCategory: "Duplicate Debit",
      transactionAmount: 250,
      transactionDate: "2026-06-20",
      transactionStatus: "Completed",
    });

    expect(res.status).toBe(201);
    expect(res.body.triageRecommendation.routingAction).toBe(
      "Resolve Immediately"
    );
  });
});
