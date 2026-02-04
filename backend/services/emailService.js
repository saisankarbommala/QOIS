import dotenv from "dotenv";
dotenv.config();

import nodemailer from 'nodemailer';
import asyncHandler from '../middleware/asyncHandler.js';
import crypto from 'crypto';

// --------------------------------------------------------
// 🛠️ FINAL CLOUD-HARDENED TRANSPORTER
// --------------------------------------------------------
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Port 465 must use secure: true
    pool: true,   // Keeps the connection open for faster subsequent sends
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // 16-character App Password
    },
    tls: {
        rejectUnauthorized: false,
        servername: 'smtp.gmail.com' // Explicitly set to bypass Render DNS issues
    },
    connectionTimeout: 60000, // Wait up to 1 minute for cloud handshakes
    greetingTimeout: 30000,
    socketTimeout: 60000
});

// Verification check on startup
transporter.verify((err, success) => {
    if (err) {
        console.error("❌ SMTP VERIFY ERROR (Cloud Handshake Failed):", err.message);
    } else {
        console.log("✔ SMTP READY: Agriculture Secure Tunnel Established on Port 465");
    }
});



/**
 * Dispatches a stylish, agriculture-themed verification email.
 */
export const sendVerificationEmail = asyncHandler(async (email, otp) => {
    console.log(`📤 Dispatching Quantum Authentication Key to ${email}...`);

    const requestId = crypto.randomBytes(3).toString('hex').toUpperCase();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { margin: 0; padding: 0; background-color: #050a0f; font-family: 'Segoe UI', Arial, sans-serif; }
            .wrapper { width: 100%; background-color: #050a0f; padding: 30px 0; }
            .main-card { 
                max-width: 500px; margin: 0 auto; background: #0d1117; 
                border: 1px solid #2d6a4f; border-radius: 12px; overflow: hidden;
            }
            .header-img { width: 100%; height: 180px; object-fit: cover; border-bottom: 2px solid #2d6a4f; }
            .content { padding: 30px; text-align: center; }
            .badge { 
                display: inline-block; padding: 4px 12px; background: rgba(45, 106, 79, 0.2); 
                color: #74c69d; border: 1px solid #2d6a4f; border-radius: 20px; 
                font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px;
            }
            .otp-box { margin: 25px 0; padding: 20px; background: #161b22; border-radius: 8px; border: 1px dashed #2d6a4f; }
            .otp-code { font-family: monospace; font-size: 36px; font-weight: bold; color: #74c69d; letter-spacing: 10px; }
            .footer { padding: 20px; text-align: center; color: #484f58; font-size: 11px; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="main-card">
                <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=600" class="header-img">
                <div class="content">
                    <div class="badge">Quantum-Agri Secure Link</div>
                    <h1 style="color:white; font-size: 22px;">Verification Required</h1>
                    <div class="otp-box"><div class="otp-code">${otp}</div></div>
                    <p style="color: #6e7681; font-size: 12px;">Valid for 10 minutes | Request ID: AGRI-${requestId}</p>
                </div>
            </div>
            <div class="footer">&copy; 2026 Quantum Agriculture Hub</div>
        </div>
    </body>
    </html>`;

    const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Quantum Agri-Systems'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `[SECURE] Agri-Link Verification: ${otp}`,
        html: htmlContent,
    };

    // Try sending with a simple retry
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("📬 EMAIL DISPATCHED → ID:", info.messageId);
        return info;
    } catch (err) {
        console.error("❌ Final Mail Dispatch Attempt Failed:", err.message);
        throw err;
    }
});
