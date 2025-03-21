import dotenv from "dotenv";
import Razorpay from "razorpay";
dotenv.config();

// Make sure we have valid Razorpay API keys
const RAZORPAY_KEY_ID = process.env.RAZORPAY_API_KEY;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_API_SECRET;

// Log the configuration (without secrets)
console.log("Initializing Razorpay with key ID:", RAZORPAY_KEY_ID ? RAZORPAY_KEY_ID.substring(0, 4) + "..." : "undefined");

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error("WARNING: Razorpay API keys are not properly configured!");
  console.error("Please check your .env file and make sure both RAZORPAY_API_KEY and RAZORPAY_API_SECRET are set.");
  
  // Use test keys for development if environment variables are not set
  console.log("Using test keys for development");
}

// Create the Razorpay instance with proper error handling
let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID || "rzp_test_i9Gek4OXL0Jbvp",
    key_secret: RAZORPAY_KEY_SECRET || "uFKzIIODm9ncvndUGOVDzNzP"
  });
  
  console.log("Razorpay instance created successfully");
} catch (error) {
  console.error("Failed to initialize Razorpay:", error);
  // Create a mock instance for development
  razorpayInstance = {
    orders: {
      create: async (options) => {
        console.log("MOCK: Creating order with options:", options);
        return {
          id: "order_" + Date.now(),
          amount: options.amount,
          currency: options.currency
        };
      }
    }
  };
  console.log("Created mock Razorpay instance for development");
}

export const instance = razorpayInstance;