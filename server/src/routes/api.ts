import { Router } from "express";
import { disputesRouter } from "./disputes.js";
import { paymentTypesRouter } from "./paymentTypes.js";
import { customersRouter } from "./customers.js";

export const apiRouter = Router();

apiRouter.use("/disputes", disputesRouter);
apiRouter.use("/payment-types", paymentTypesRouter);
apiRouter.use("/customers", customersRouter);
