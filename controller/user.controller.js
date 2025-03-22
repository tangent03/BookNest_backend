import bcryptjs from "bcryptjs";
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createToken } from "../middleware/auth.middleware.js";
import User from "../model/user.model.js";

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

export const signup = async(req,res) => {
    try{
        console.log("Signup request received:", req.body);
        const { fullname, email, password } = req.body;
        
        if(!fullname || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }
 
        //Check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            console.log("User already exists:", email);
            return res.status(400).json({message: "User already exists"});
        }

        const hashPassword = await bcryptjs.hash(password, 10);

        const createdUser = new User({
            fullname,
            email,
            password: hashPassword
        });

        const savedUser = await createdUser.save();
        console.log("User created successfully:", savedUser._id);
        
        // Generate JWT token
        const token = createToken(savedUser);
        
        res.status(201).json({
            message: "User created successfully",
            user: {
                _id: savedUser._id,
                fullname: savedUser.fullname,
                email: savedUser.email,
                role: savedUser.role
            },
            token
        });
    }
    catch(error){
        console.log("Signup Error:", error);
        
        // Check for MongoDB duplicate key error (code 11000)
        if(error.code === 11000) {
            return res.status(400).json({message: "User already exists"});
        }
        
        res.status(500).json({message: "Internal server error during signup"});
    }
}

export const login = async(req,res) => {
    try{
        console.log("Login request received:", req.body.email);
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({message: "Email and password are required"});
        }

        // Find the user
        const user = await User.findOne({email});
        
        // If user doesn't exist
        if(!user) {
            console.log("User not found:", email);
            return res.status(400).json({message: "Invalid credentials"});
        }
        
        // Compare passwords using bcrypt
        const isMatch = await bcryptjs.compare(password, user.password);
        
        if(!isMatch) {
            console.log("Password mismatch for:", email);
            return res.status(400).json({message: "Invalid credentials"});
        }
        
        // Generate JWT token
        const token = createToken(user);
        
        // Login successful
        console.log("Login successful for:", email);
        return res.status(200).json({
            message: "Login successful", 
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                passwordLastChanged: user.passwordLastChanged
            },
            token
        });
    }
    catch(error){
        console.log("Login Error:", error);
        res.status(500).json({message: "Internal server error during login"});
    }
}

// Forgot password - send reset email
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Generate random reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Set token and expiration (1 hour)
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        
        await user.save();
        
        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        
        // Email content
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER || 'noreply@booknest.com',
            subject: 'BookNest Password Reset',
            html: `
                <p>You requested a password reset for your BookNest account.</p>
                <p>Please click on the following link to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <p>This link will expire in 1 hour.</p>
            `
        };
        
        // Send email (or mock it for development)
        if (process.env.NODE_ENV === 'production') {
            await transporter.sendMail(mailOptions);
        } else {
            console.log('==========================================');
            console.log('📧 MOCK EMAIL SENDING');
            console.log('📧 Password reset email would be sent to:', email);
            console.log('📧 Reset URL:', resetUrl);
            console.log('==========================================');
        }
        
        res.status(200).json({ 
            message: "Password reset email sent",
            resetSent: true,
            // Don't include resetToken in response in production
            resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: "Error sending reset email" });
    }
};

// Reset password with token
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }
        
        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        
        // Hash new password
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        
        // Update user
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        user.passwordLastChanged = Date.now();
        
        await user.save();
        
        // Generate JWT token for automatic login
        const jwtToken = createToken(user);
        
        res.status(200).json({ 
            message: "Password reset successful",
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                passwordLastChanged: user.passwordLastChanged
            },
            token: jwtToken
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: "Error resetting password" });
    }
};

// Change password while logged in
export const changePassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        
        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ message: "User ID, current password and new password are required" });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Verify current password
        const isMatch = await bcryptjs.compare(currentPassword, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }
        
        // Hash new password
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        
        // Update user
        user.password = hashedPassword;
        user.passwordLastChanged = Date.now();
        
        await user.save();
        
        res.status(200).json({
            success: true,
            message: "Password updated successfully",
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                passwordLastChanged: user.passwordLastChanged
            }
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: "Error changing password" });
    }
};