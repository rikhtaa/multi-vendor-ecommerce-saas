import express, { Router } from "express"
import isAuthenticated from "@packages/middleware/isAuthenticated";
import {isSeller} from "@packages/middleware/authorizeRoles";
import { fetchMessages, fetchSellerMessages, getSellerConversations, getUserConversations, newConversation } from "../controllers/chatting.controller"

const router: Router = express.Router()

router.post("/create-user-conversationGroup", isAuthenticated, newConversation);
router.get("/get-user-conversations", isAuthenticated, getUserConversations);
router.get(
  "/get-seller-conversations",
  isAuthenticated,
  isSeller,
  getSellerConversations
);
router.get("/get-messages/:conversationId", isAuthenticated, fetchMessages);
router.get(
  "/get-seller-messages/:conversationId",
  isAuthenticated,
  isSeller,
  fetchSellerMessages
);

export default router
