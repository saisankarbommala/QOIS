import dotenv from "dotenv";
dotenv.config();

import nodemailer from 'nodemailer';
import asyncHandler from '../middleware/asyncHandler.js';
import crypto from 'crypto';

// --------------------------------------------------------
// 🛠️ CLOUD-PRODUCTION TRANSPORTER
// --------------------------------------------------------
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // Using SSL port 465 is the most reliable for Render
    secure: false, 
    pool: true,   // Keeps the connection open to avoid repeated handshakes
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // 16-character App Password
    },
    tls: {
        rejectUnauthorized: false,
        servername: 'smtp.gmail.com' // Forces the handshake to match the host
    },
    connectionTimeout: 60000, // 60s to allow for cloud latency
    greetingTimeout: 30000,
    socketTimeout: 60000
});

// Handshake verification
transporter.verify((err, success) => {
    if (err) {
        console.error("❌ SMTP VERIFY ERROR (Cloud Handshake Failed):", err.message);
    } else {
        console.log("✔ SMTP READY: Agriculture Secure Tunnel Established");
    }
});



export const sendVerificationEmail = asyncHandler(async (email, otp) => {
    console.log(`📤 Dispatching Quantum Authentication Key to ${email}...`);
    const requestId = crypto.randomBytes(3).toString('hex').toUpperCase();

    const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #050a0f; padding: 40px; text-align: center; color: white;">
        <div style="max-width: 500px; margin: 0 auto; background: #0d1117; border: 1px solid #2d6a4f; border-radius: 12px; overflow: hidden;">
            <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=600" style="width: 100%; height: 150px; object-fit: cover;">
            <div style="padding: 30px;">
                <h2 style="color: #74c69d;">Quantum Agri-Link</h2>
                <p style="color: #8b949e;">Enter this code to verify your secure session:</p>
                <div style="background: #161b22; padding: 20px; border-radius: 8px; border: 1px dashed #2d6a4f; font-size: 32px; letter-spacing: 10px; color: #74c69d; font-weight: bold;">
                    ${otp}
                </div>
                <p style="font-size: 11px; color: #484f58; margin-top: 20px;">ID: AGRI-${requestId} | Secure Quantum Protocol</p>
            </div>
        </div>
    </div>`;

    return await transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'Quantum Agri-Systems'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `[SECURE] Verification Code: ${otp}`,
        html: htmlContent,
    });
});
