import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import Email from '../model/email.model.js';

dotenv.config();

// Create a transporter using your email service credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email from contact form
export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and message' });
    }

    // Save the contact information to the database
    try {
      const newEmail = new Email({
        email,
        subject: subject || 'Contact Form Submission',
        message: `From: ${name}\n\n${message}`
      });
      
      const savedEmail = await newEmail.save();
      console.log("Contact email saved to database:", savedEmail._id);
    } catch (dbError) {
      console.error('Error saving contact email to database:', dbError);
      // Continue with sending email even if database save fails
    }

    console.log('Sending email with the following credentials:');
    console.log('Email User:', process.env.EMAIL_USER);
    console.log('Email Pass length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

    // Setup email data
    const mailOptions = {
      from: `"BookStore Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to your own email (or any other designated recipient)
      replyTo: email,
      subject: `Contact Form: ${subject || 'New Message from BookStore'}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">New Message from BookStore Contact Form</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #777;">This email was sent from the BookStore contact form.</p>
        </div>
      `
    };

    // Send confirmation email to the user
    const userMailOptions = {
      from: `"BookStore Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for contacting BookStore',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1e293b; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">BookStore</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #1e293b; margin-top: 0;">Thank You for Reaching Out!</h2>
            <p style="color: #334155; font-size: 16px; line-height: 1.5;">Dear ${name},</p>
            <p style="color: #334155; font-size: 16px; line-height: 1.5;">Thank you for contacting BookStore. We've received your message and appreciate you taking the time to reach out to us.</p>
            <p style="color: #334155; font-size: 16px; line-height: 1.5;">Our team will review your inquiry and get back to you as soon as possible, typically within 24-48 hours.</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #0ea5e9; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="color: #334155; font-size: 16px; margin: 0 0 10px 0;"><strong>Your Message Details:</strong></p>
              <p style="color: #334155; font-size: 15px; margin: 0 0 5px 0;"><strong>Subject:</strong> ${subject || 'No Subject'}</p>
              <p style="color: #334155; font-size: 15px; margin: 0 0 5px 0;"><strong>Sent on:</strong> ${new Date().toLocaleString()}</p>
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                <p style="color: #334155; font-size: 15px; margin: 0 0 5px 0;"><strong>Message:</strong></p>
                <p style="color: #475569; font-size: 15px; line-height: 1.5;">${message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
            
            <p style="color: #334155; font-size: 16px; line-height: 1.5;">If you have any urgent concerns, please feel free to call us at +1 (555) 123-4567.</p>
            
            <p style="color: #334155; font-size: 16px; line-height: 1.5; margin-bottom: 0;">Warm regards,</p>
            <p style="color: #0ea5e9; font-weight: bold; font-size: 18px; margin-top: 5px;">The BookStore Team</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b;">
            <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} BookStore. All rights reserved.</p>
            <p style="margin: 0;">123 Book Street, Reading City</p>
          </div>
        </div>
      `
    };

    try {
      // Send email to admin
      const adminInfo = await transporter.sendMail(mailOptions);
      console.log('Admin email sent: %s', adminInfo.messageId);
      
      // Send confirmation to user
      const userInfo = await transporter.sendMail(userMailOptions);
      console.log('User email sent: %s', userInfo.messageId);
      
      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send email', 
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error('Error in contact route:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Test the email configuration
export const testEmail = async (req, res) => {
  try {
    console.log('Testing email configuration with:');
    console.log('Host:', 'smtp.gmail.com');
    console.log('Port:', 587);
    console.log('User:', process.env.EMAIL_USER);
    
    const testResult = await transporter.verify();
    console.log('Email configuration test result:', testResult);
    
    res.status(200).json({ 
      success: true, 
      message: 'Email configuration is working correctly',
      env: {
        emailUser: process.env.EMAIL_USER ? 'Set' : 'Not set',
        emailPass: process.env.EMAIL_PASS ? 'Set' : 'Not set'
      }
    });
  } catch (error) {
    console.error('Email configuration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Email configuration error', 
      error: error.message,
      env: {
        emailUser: process.env.EMAIL_USER ? 'Set' : 'Not set',
        emailPass: process.env.EMAIL_PASS ? 'Set' : 'Not set'
      }
    });
  }
};

// Get all emails from the database (for admin use)
export const getAllEmails = async (req, res) => {
  try {
    const emails = await Email.find().sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      count: emails.length, 
      data: emails 
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
}; 