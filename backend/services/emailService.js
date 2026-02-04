import dotenv from "dotenv";
dotenv.config();

import nodemailer from 'nodemailer';
import asyncHandler from '../middleware/asyncHandler.js';
import crypto from 'crypto';

// --------------------------------------------------------
// 🛠️ CLOUD-HARDENED TRANSPORTER (Optimized for Render)
// --------------------------------------------------------
const transporter = nodemailer.createTransport({
    // Using 'service' instead of 'host/port' helps Nodemailer 
    // bypass common cloud firewall restrictions for Gmail.
    service: 'gmail', 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // MUST be a 16-character Google App Password
    },
    tls: {
        // Essential to prevent handshake timeouts on cloud networks
        rejectUnauthorized: false,
        minVersion: "TLSv1.2"
    },
    // Increased timeouts to handle Render's "Cold Start" and network latency
    connectionTimeout: 40000, 
    greetingTimeout: 30000,
    socketTimeout: 60000
});

// --------------------------------------------------------
// 🔍 SMTP Handshake Verification
// --------------------------------------------------------
transporter.verify((err, success) => {
    if (err) {
        console.error("❌ SMTP VERIFY ERROR (Cloud Handshake Failed):", err.message);
    } else {
        console.log("✔ SMTP READY: Agriculture Secure Tunnel Established");
    }
});

/**
 * Dispatches a professional, agriculture-themed verification email.
 */
export const sendVerificationEmail = asyncHandler(async (email, otp) => {
    console.log(`📤 Dispatching Quantum Authentication Key to ${email}...`);

    // Generate a unique tracking ID for a professional touch
    const requestId = crypto.randomBytes(3).toString('hex').toUpperCase();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { margin: 0; padding: 0; background-color: #050a0f; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
            .wrapper { width: 100%; background-color: #050a0f; padding: 30px 0; }
            .main-card { 
                max-width: 500px; 
                margin: 0 auto; 
                background: #0d1117; 
                border: 1px solid #30363d; 
                border-radius: 12px; 
                overflow: hidden;
            }
            .header-img { width: 100%; height: 180px; object-fit: cover; border-bottom: 2px solid #2d6a4f; }
            .content { padding: 30px; text-align: center; }
            .badge { 
                display: inline-block; padding: 4px 12px; background: rgba(45, 106, 79, 0.2); 
                color: #74c69d; border: 1px solid #2d6a4f; border-radius: 20px; 
                font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px;
            }
            .title { color: #ffffff; font-size: 22px; margin: 0 0 10px 0; }
            .otp-box { 
                margin: 25px 0; padding: 20px; background: #161b22; 
                border-radius: 8px; border: 1px dashed #2d6a4f;
            }
            .otp-code { 
                font-family: 'Courier New', monospace; font-size: 36px; 
                font-weight: bold; color: #74c69d; letter-spacing: 10px; 
            }
            .footer { padding: 20px; text-align: center; color: #484f58; font-size: 11px; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="main-card">
                <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=600" class="header-img">
                <div class="content">
                    <div class="badge">Quantum-Agri Secure Link</div>
                    <h1 class="title">Verification Required</h1>
                    <p style="color: #8b949e; font-size: 14px;">Use the key below to verify your identity on the <b>Quantum Operational Intelligence System</b>.</p>
                    
                    <div class="otp-box">
                        <div class="otp-code">${otp}</div>
                    </div>

                    <p style="color: #6e7681; font-size: 12px;">Valid for 10 minutes | Request ID: AGRI-${requestId}</p>
                </div>
            </div>
            <div class="footer">
                &copy; 2026 Quantum Agriculture Hub <br>
                Automated System - Please do not reply.
            </div>
        </div>
    </body>
    </html>`;

    const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Quantum Agri-Systems'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `[SECURE] Agri-Link Verification: ${otp}`,
        text: `Your Quantum Verification Code is: ${otp} (Request ID: AGRI-${requestId})`, 
        html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📬 QUANTUM EMAIL DISPATCHED → ID:", info.messageId);
    return info;
});
