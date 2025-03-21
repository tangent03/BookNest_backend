import express from "express";
import { getAllEmails, sendContactEmail, testEmail } from "../controller/contact.controller.js";

const router = express.Router();

// Route to handle contact form submissions
router.post("/send", sendContactEmail);

// Route to test email configuration
router.get("/test", testEmail);

// Route to get all emails (admin access only)
router.get("/emails", getAllEmails);

export default router; 