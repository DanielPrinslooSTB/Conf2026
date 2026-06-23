import { PrismaClient } from "@prisma/client";
import { evaluateDispute } from "../src/services/triageEngine.js";

const prisma = new PrismaClient();

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function main() {
  // Clear existing data
  await prisma.triageRecommendation.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.customer.deleteMany();

  // Create 10 customers
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: "Jane Smith", email: "jane.smith@email.com", accountNumber: "ACC-001" } }),
    prisma.customer.create({ data: { name: "John Doe", email: "john.doe@email.com", accountNumber: "ACC-002" } }),
    prisma.customer.create({ data: { name: "Alice Johnson", email: "alice.johnson@email.com", accountNumber: "ACC-003" } }),
    prisma.customer.create({ data: { name: "Bob Williams", email: "bob.williams@email.com", accountNumber: "ACC-004" } }),
    prisma.customer.create({ data: { name: "Carol Davis", email: "carol.davis@email.com", accountNumber: "ACC-005" } }),
    prisma.customer.create({ data: { name: "David Brown", email: "david.brown@email.com", accountNumber: "ACC-006" } }),
    prisma.customer.create({ data: { name: "Eve Wilson", email: "eve.wilson@email.com", accountNumber: "ACC-007" } }),
    prisma.customer.create({ data: { name: "Frank Miller", email: "frank.miller@email.com", accountNumber: "ACC-008" } }),
    prisma.customer.create({ data: { name: "Grace Taylor", email: "grace.taylor@email.com", accountNumber: "ACC-009" } }),
    prisma.customer.create({ data: { name: "Henry Anderson", email: "henry.anderson@email.com", accountNumber: "ACC-010" } }),
  ]);

  // Define disputes with expected triage outcomes
  const disputeData = [
    // Escalate: Unauthorized Transaction (Card Payment)
    { customerId: customers[0].id, paymentType: "Card Payment", issueCategory: "Unauthorized Transaction", amount: 15000, txDate: daysAgo(2), txStatus: "Completed", txType: "Card Payment", disputeAge: 2 },
    // Escalate: Unauthorized Transaction (Internal Transfer, old)
    { customerId: customers[1].id, paymentType: "Internal Transfer", issueCategory: "Unauthorized Transaction", amount: 8000, txDate: daysAgo(12), txStatus: "Completed", txType: "Internal Transfer", disputeAge: 10 },
    // Investigate Further: Failed EFT
    { customerId: customers[2].id, paymentType: "EFT", issueCategory: "Failed Transfer", amount: 5000, txDate: daysAgo(5), txStatus: "Failed", txType: "EFT", disputeAge: 3 },
    // Investigate Further: Failed Card Payment
    { customerId: customers[3].id, paymentType: "Card Payment", issueCategory: "Duplicate Debit", amount: 200, txDate: daysAgo(4), txStatus: "Failed", txType: "Card Payment", disputeAge: 2 },
    // Resolve Immediately: Low-value Duplicate Debit
    { customerId: customers[4].id, paymentType: "Card Payment", issueCategory: "Duplicate Debit", amount: 150, txDate: daysAgo(1), txStatus: "Completed", txType: "Card Payment", disputeAge: 1 },
    // Resolve Immediately: Low-value Duplicate Debit (EFT)
    { customerId: customers[5].id, paymentType: "EFT", issueCategory: "Duplicate Debit", amount: 300, txDate: daysAgo(3), txStatus: "Completed", txType: "EFT", disputeAge: 2 },
    // Refer to Another Team: High amount, Incorrect Amount
    { customerId: customers[6].id, paymentType: "Card Payment", issueCategory: "Incorrect Amount", amount: 12000, txDate: daysAgo(6), txStatus: "Completed", txType: "Card Payment", disputeAge: 5 },
    // Refer to Another Team: Medium amount, Missing Payment
    { customerId: customers[7].id, paymentType: "EFT", issueCategory: "Missing Payment", amount: 2500, txDate: daysAgo(8), txStatus: "Pending", txType: "EFT", disputeAge: 6 },
    // Refer to Another Team (old dispute, escalated priority)
    { customerId: customers[8].id, paymentType: "Internal Transfer", issueCategory: "Missing Payment", amount: 4000, txDate: daysAgo(15), txStatus: "Completed", txType: "Internal Transfer", disputeAge: 12 },
    // Escalate: Unauthorized with Failed status (still Escalate per rules)
    { customerId: customers[9].id, paymentType: "Card Payment", issueCategory: "Unauthorized Transaction", amount: 900, txDate: daysAgo(3), txStatus: "Failed", txType: "Card Payment", disputeAge: 2 },
    // Investigate Further: Failed Internal Transfer
    { customerId: customers[0].id, paymentType: "Internal Transfer", issueCategory: "Failed Transfer", amount: 7500, txDate: daysAgo(9), txStatus: "Failed", txType: "Internal Transfer", disputeAge: 8 },
    // Refer to Another Team: Card Payment, Failed Transaction category but Completed status
    { customerId: customers[1].id, paymentType: "Card Payment", issueCategory: "Failed Transaction", amount: 3000, txDate: daysAgo(4), txStatus: "Completed", txType: "Card Payment", disputeAge: 3 },
    // Low priority, young: Resolve Immediately
    { customerId: customers[2].id, paymentType: "Internal Transfer", issueCategory: "Duplicate Debit", amount: 100, txDate: daysAgo(1), txStatus: "Pending", txType: "Internal Transfer", disputeAge: 1 },
    // High priority with age escalation (Medium→High)
    { customerId: customers[3].id, paymentType: "EFT", issueCategory: "Missing Payment", amount: 5000, txDate: daysAgo(20), txStatus: "Completed", txType: "EFT", disputeAge: 15 },
    // Low amount, old dispute (Low→Medium priority, Refer)
    { customerId: customers[4].id, paymentType: "Card Payment", issueCategory: "Incorrect Amount", amount: 800, txDate: daysAgo(14), txStatus: "Completed", txType: "Card Payment", disputeAge: 10 },
    // Very high amount, Unauthorized (High priority, Escalate)
    { customerId: customers[5].id, paymentType: "Internal Transfer", issueCategory: "Unauthorized Transaction", amount: 25000, txDate: daysAgo(1), txStatus: "Completed", txType: "Internal Transfer", disputeAge: 1 },
    // Medium amount duplicate debit (≥500 so no Resolve Immediately → Refer)
    { customerId: customers[6].id, paymentType: "EFT", issueCategory: "Duplicate Debit", amount: 1500, txDate: daysAgo(2), txStatus: "Completed", txType: "EFT", disputeAge: 2 },
    // Failed Transaction with Pending status (not Failed, so Refer)
    { customerId: customers[7].id, paymentType: "Card Payment", issueCategory: "Failed Transaction", amount: 6000, txDate: daysAgo(5), txStatus: "Pending", txType: "Card Payment", disputeAge: 4 },
    // Low-value EFT Missing Payment (Refer, no special rule)
    { customerId: customers[8].id, paymentType: "EFT", issueCategory: "Missing Payment", amount: 350, txDate: daysAgo(2), txStatus: "Completed", txType: "EFT", disputeAge: 1 },
    // Boundary: amount exactly 500, Duplicate Debit (not < 500, so Refer)
    { customerId: customers[9].id, paymentType: "Card Payment", issueCategory: "Duplicate Debit", amount: 500, txDate: daysAgo(3), txStatus: "Completed", txType: "Card Payment", disputeAge: 2 },
  ];

  for (let i = 0; i < disputeData.length; i++) {
    const d = disputeData[i];

    const transaction = await prisma.transaction.create({
      data: {
        amount: d.amount,
        date: d.txDate,
        status: d.txStatus,
        type: d.txType,
        reference: `TXN-REF-${String(i + 1).padStart(3, "0")}`,
      },
    });

    const disputeCreatedAt = daysAgo(d.disputeAge);

    const dispute = await prisma.dispute.create({
      data: {
        customerId: d.customerId,
        transactionId: transaction.id,
        paymentType: d.paymentType,
        issueCategory: d.issueCategory,
        status: "Open",
        createdAt: disputeCreatedAt,
      },
    });

    // Run triage engine
    const triageResult = evaluateDispute({
      transactionAmount: d.amount,
      transactionStatus: d.txStatus as "Completed" | "Failed" | "Pending",
      issueCategory: d.issueCategory,
      disputeCreatedAt,
    });

    await prisma.triageRecommendation.create({
      data: {
        disputeId: dispute.id,
        routingAction: triageResult.routingAction,
        priorityLevel: triageResult.priorityLevel,
        reasoning: JSON.stringify(triageResult.reasoning),
      },
    });
  }

  console.log(`Seeded ${customers.length} customers, ${disputeData.length} disputes with triage recommendations`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
