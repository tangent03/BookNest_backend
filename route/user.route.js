import express from "express";
import { changePassword, forgotPassword, login, resetPassword, signup } from "../controller/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup)
router.post("/login", login)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.put("/change-password", verifyToken, changePassword)

export default router;
