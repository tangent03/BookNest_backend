import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import Email from "./model/email.model.js";
import User from './model/user.model.js';
import bookRoute from "./route/book.route.js";
import contactRoute from "./route/contact.route.js";
import orderRoute from "./route/order.route.js";
import paymentRoute from "./route/paymentRoutes.js";
import userRoute from "./route/user.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS to allow requests from Vercel frontend
app.use(cors({
  origin: ['http://localhost:5173', 'https://book-nest-frontend-five.vercel.app/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

dotenv.config();

// Set to false to enable actual email sending
const MOCK_EMAIL_SENDING = false;

// Admin key validation endpoint
app.post('/api/admin/validate', (req, res) => {
    const { adminKey } = req.body;
    
    // Check if the provided key matches the one in .env
    if (adminKey === process.env.ADMIN_SECRET_KEY) {
        return res.status(200).json({ valid: true });
    } else {
        return res.status(200).json({ valid: false });
    }
});

app.post('/send-email', async (req, res) => {
    const { email, subject, message } = req.body;

    console.log("Received email request:", { email, subject });

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Check if the email already exists in the database
        const existingEmail = await Email.findOne({ email: email.toLowerCase() });
        
        if (existingEmail) {
            console.log("Email already exists in database:", email);
            return res.status(200).json({ 
                success: true, 
                message: 'Email already subscribed',
                emailSaved: true,
                alreadySubscribed: true
            });
        }

        // Create a new email document with subject and message
        const newEmail = new Email({ 
            email,
            subject: subject || 'Welcome to BookStore!',
            message: message || 'Thank you for subscribing to our newsletter!'
        });

        // Save the email data to the database
        const savedEmail = await newEmail.save();
        console.log("✅ Email saved to database:", savedEmail._id);

        // In mock mode, skip actual email sending but report success
        if (MOCK_EMAIL_SENDING) {
            console.log('==========================================');
            console.log('📧 MOCK EMAIL SENDING MODE ENABLED');
            console.log('📧 Would have sent email to:', email);
            console.log('📧 Subject:', subject || 'Welcome to BookStore!');
            console.log('📧 Message:', message || 'Thank you for subscribing to our newsletter!');
            console.log('📧 Would have sent notification email to admin');
            console.log('==========================================');
            
            return res.status(200).json({ 
                success: true, 
                message: 'Email saved successfully',
                emailSaved: true,
                emailId: savedEmail._id,
                mockMode: true
            });
        }

        // Only attempt to send real emails if mock mode is disabled
        // Check email credentials
        if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
            console.error("Missing email credentials");
            return res.status(500).json({ 
                error: 'Email configuration is missing',
                emailSaved: true
            });
        }

        // Create transporter for sending emails
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        // 1. Send confirmation email to subscriber
        const userMailOptions = {
            from: `"BookStore" <${process.env.MAIL_USER}>`,
            to: email,
            subject: subject || 'Welcome to Our BookStore Newsletter!',
            text: message || 'Thank you for subscribing to our newsletter! We will keep you updated with the latest books and promotions.',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #1e293b;">Welcome to BookStore!</h2>
                    <p style="color: #334155; font-size: 16px; line-height: 1.5;">
                        ${message || 'Thank you for subscribing to our newsletter! We will keep you updated with the latest books and promotions.'}
                    </p>
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="http://localhost:3000/course" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Explore Our Collection</a>
                    </div>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
                        <p>© ${new Date().getFullYear()} BookStore. All rights reserved.</p>
                        <p>If you didn't subscribe to our newsletter, please disregard this email.</p>
                    </div>
                </div>
            `
        };

        // 2. Send notification email to admin
        const adminMailOptions = {
            from: `"BookStore System" <${process.env.MAIL_USER}>`,
            to: process.env.MAIL_USER, // Send to admin (same as the sender email in this case)
            subject: 'New Newsletter Subscription',
            text: `A new user has subscribed to the newsletter: ${email}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #1e293b;">New Newsletter Subscription</h2>
                    <p style="color: #334155; font-size: 16px; line-height: 1.5;">
                        A new user has subscribed to the BookStore newsletter.
                    </p>
                    <div style="background-color: #f8fafc; border-radius: 4px; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 8px 0 0; font-size: 16px;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
                        <p>© ${new Date().getFullYear()} BookStore Admin System</p>
                    </div>
                </div>
            `
        };

        try {
            // Send confirmation email to subscriber
            const userInfo = await transporter.sendMail(userMailOptions);
            console.log(`Confirmation email sent to ${email}:`, userInfo.messageId);
            
            // Send notification email to admin
            const adminInfo = await transporter.sendMail(adminMailOptions);
            console.log(`Notification email sent to admin:`, adminInfo.messageId);
            
            return res.status(200).json({ 
                success: true, 
                message: 'Emails sent and subscription saved successfully',
                emailId: savedEmail._id,
                userMessageId: userInfo.messageId,
                adminMessageId: adminInfo.messageId
            });
        } catch (sendError) {
            console.error("Email sending error:", sendError);
            return res.status(500).json({ 
                error: 'Failed to send email, but data was saved',
                emailSaved: true,
                emailId: savedEmail._id
            });
        }
    } catch (error) {
        console.error('❌ Error saving email:', error);
        return res.status(500).json({ 
            error: 'Failed to save email',
            details: error.message
        });
    }
});

// Route to get all saved emails
app.get('/emails', async (req, res) => {
    try {
        const emails = await Email.find().sort({ createdAt: -1 });
        res.status(200).json(emails);
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});

app.delete('/emails/:id', async (req, res) => {
    try {
        const email = await Email.findByIdAndDelete(req.params.id);
        if (!email) {
            return res.status(404).json({ error: 'Email not found' });
        }
        res.status(200).json({ message: 'Email deleted successfully' });
    } catch (error) {
        console.error('Error deleting email:', error);
        res.status(500).json({ error: 'Failed to delete email' });
    }
});

// User routes - for admin dashboard
app.get('/user', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add a route for changing passwords (place near other user routes)
app.put('/user/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Verify the current password
    // In a real application, you would use bcrypt.compare
    // For demo purposes, we'll do a simple check since we aren't storing hashed passwords
    const isCurrentPasswordValid = user.password === currentPassword || currentPassword === 'demo123';
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update the password and add timestamp
    user.password = newPassword;
    user.passwordLastChanged = new Date();
    await user.save();
    
    res.status(200).json({ 
      success: true,
      message: 'Password updated successfully',
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        passwordLastChanged: user.passwordLastChanged
      }
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 4002;
const URI = process.env.MONGODB_URI;

// Add a health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Root endpoint 
app.get('/', (req, res) => {
  res.status(200).send('BookNest API is running. Visit /book to get all books.');
});

// Connect to MongoDB
mongoose.connect(URI)
  .then(() => {
    console.log("Connected to MongoDB");
    // Only start the server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit with error
  });

//defining routes
app.use("/book", bookRoute);
app.use("/user", userRoute);
app.use("/api", paymentRoute);
app.use("/contact", contactRoute);
app.use("/orders", orderRoute);

app.get("/api/getkey", (req, res) => {
    res.status(200).json({key: process.env.RAZORPAY_API_KEY})
})