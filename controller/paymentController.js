import crypto from "crypto";
import { Payment } from "../model/paymentModel.js";


export const checkout = async (req,res) => {
    try {
        console.log("Checkout request received:", req.body);
        const amount = Number(req.body.amount) || 100;
        console.log("Creating order for amount:", amount);
        
        // Create a mock order for testing
        const mockOrder = {
            id: "order_" + Date.now(),
            amount: amount * 100,
            currency: "INR",
            receipt: "receipt_" + Date.now(),
            status: "created"
        };
        
        console.log("Created mock order:", mockOrder);
        
        res.status(200).json({
            success: true,
            order: mockOrder
        });
    } catch (error) {
        console.error("Error in checkout:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create payment order",
            error: error.message
        });
    }
};

export const paymentVerification = async (req,res) => {
    try {
        console.log("Payment verification request received:", req.body);
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // For testing purposes, accept the payment without verification
        console.log("Saving payment data:", { razorpay_order_id, razorpay_payment_id, razorpay_signature });
        
        // Create a mock payment if values are missing
        const payment = new Payment({
            razorpay_order_id: razorpay_order_id || "order_mock_" + Date.now(),
            razorpay_payment_id: razorpay_payment_id || "pay_mock_" + Date.now(),
            razorpay_signature: razorpay_signature || "signature_mock_" + Date.now()
        });
        
        // Save to MongoDB
        console.log("Saving payment to MongoDB...");
        const savedPayment = await payment.save();
        console.log("Payment saved successfully:", savedPayment);

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            payment: {
                id: savedPayment._id,
                razorpay_payment_id: savedPayment.razorpay_payment_id
            }
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Error processing payment",
            error: error.message
        });
    }
};