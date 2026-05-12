import express, { Router } from "express"
import { loginUser, resetUserPassword, userForgetPassword, userRegistration, verifyForgetPassword, verifyUser } from "../controller/auth.controller"

const router: Router = express.Router()

router.post("/user-registration", userRegistration)
router.post("/verify-user", verifyUser)
router.post("/login-user", loginUser)
router.post("/forget-password-user", userForgetPassword)
router.post("/reset-password-user", resetUserPassword)
router.post("/verify-forget-password-user", verifyForgetPassword)

export default router