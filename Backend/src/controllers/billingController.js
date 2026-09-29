import crypto from "crypto";
import Razorpay from "razorpay";

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay is not configured");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const getBillingConfig = (req, res) => {
  return res.status(200).json({
    success: true,
    configured: Boolean(process.env.RAZORPAY_KEY_ID),
    keyId: process.env.RAZORPAY_KEY_ID || null,
    amount: Number(process.env.PRO_PLAN_AMOUNT || 1900),
    currency: "INR",
  });
};

export const createPaymentOrder = async (req, res) => {
  try {
    const amount = Number(process.env.PRO_PLAN_AMOUNT || 1900);
    const order = await getRazorpay().orders.create({
      amount,
      currency: "INR",
      receipt: `documind_${req.user._id}_${Date.now()}`,
      notes: { userId: String(req.user._id), plan: "pro" },
    });
    return res.status(201).json({ success: true, order });
  } catch (error) {
    return res.status(503).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body || {};
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (
      !razorpay_signature ||
      !crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(razorpay_signature),
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Payment verification failed" });
  }
};
