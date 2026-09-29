import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getBillingConfig,
  createPaymentOrder,
  verifyPayment,
} from "../controllers/billingController.js";

const router = express.Router();
router.use(protect);
router.get("/config", getBillingConfig);
router.post("/orders", createPaymentOrder);
router.post("/verify", verifyPayment);

export default router;
