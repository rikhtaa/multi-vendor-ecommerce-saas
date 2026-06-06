import isAuthenticated from "@packages/middleware/isAuthenticated";
import express, { Router } from "express"
import { createPaymentIntent, createPaymentSession, getOrderDetails, getSellersOrders, updateDeliveryStatus, verifyCouponCode, verifyingPaymentSession, getUserOrders } from "../controllers/order.controller";

const router: Router = express.Router()

router.post("/create-payment-intent", isAuthenticated, createPaymentIntent);
router.post("/create-payment-session", isAuthenticated, createPaymentSession);
router.get(
  "/verifying-payment-session",
  isAuthenticated,
  verifyingPaymentSession
);
router.get("/get-seller-orders", isAuthenticated, getSellersOrders);
router.get("/get-order-details/:id", isAuthenticated, getOrderDetails);
router.put("/update-status/:orderId", isAuthenticated, updateDeliveryStatus);
router.put("/verify-coupon", isAuthenticated, verifyCouponCode);
router.get("/get-user-orders", isAuthenticated, getUserOrders);

export default router