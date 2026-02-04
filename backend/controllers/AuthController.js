// controllers/AuthController.js

import User from '../models/User.js';
import Otp from '../models/Otp.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { sendTokenResponse } from '../utils/jwtUtils.js';
import { sendVerificationEmail } from '../services/emailService.js';
import ErrorResponse from '../utils/ErrorResponse.js';

// Detect if we are running on Render (Production)
const isProduction = process.env.NODE_ENV === 'production';

// ------------------------------------------------------------------
// HELPER: Generate OTP, Save to DB, and Send Email
// ------------------------------------------------------------------
const generateAndSaveOtp = async (email) => {
    // 💡 BYPASS: Don't waste time or risk timeouts on Render
    if (isProduction) {
        console.log(`⏩ PRODUCTION BYPASS: Skipping real email for ${email}`);
        return "123456"; // Dummy code (not used in verify step)
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); 

    await Otp.deleteOne({ email });
    await Otp.create({ email, otp: otpCode });

    // REAL EMAIL SENDING
    await sendVerificationEmail(email, otpCode);

    console.log(`📩 OTP ${otpCode} sent to ${email}`);
    return otpCode;
};

// ==================================================================
// 1. SIGNUP FLOW
// ==================================================================

export const signupSendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ErrorResponse('Email already registered. Please log in.', 400);
    }

    // 💡 If live, tell the frontend we skipped it
    if (isProduction) {
        return res.status(200).json({
            success: true,
            message: 'Production Mode: OTP Bypassed for instant registration.',
            bypass: true 
        });
    }

    await generateAndSaveOtp(email);

    res.status(200).json({
        success: true,
        message: 'OTP sent to your email address.',
    });
});

export const signupVerifyOtp = asyncHandler(async (req, res) => {
    const { email, otp, password, name } = req.body;

    // 💡 BYPASS LOGIC: If on Render, skip the Otp.findOne check
    if (!isProduction) {
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) {
            throw new ErrorResponse('Invalid or expired OTP.', 400);
        }
    }

    if (!password || password.length < 8) {
        throw new ErrorResponse('Password must be at least 8 characters long.', 400);
    }

    const user = await User.create({ name, email, password });

    if (!isProduction) await Otp.deleteOne({ email });

    sendTokenResponse(user, 201, res);
});

// ==================================================================
// 2. LOGIN WITH PASSWORD (Always Works)
// ==================================================================

export const loginWithPassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ErrorResponse('Please provide an email and password.', 400);
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
        throw new ErrorResponse('Invalid credentials.', 401);
    }

    sendTokenResponse(user, 200, res);
});

// ==================================================================
// 3. LOGIN WITH OTP
// ==================================================================

export const loginSendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new ErrorResponse('No account found with that email.', 404);
    }

    // 💡 If live, we don't send OTP, we just allow the next step
    if (isProduction) {
        return res.status(200).json({
            success: true,
            message: 'Production Mode: Access granted without OTP.',
            bypass: true
        });
    }

    await generateAndSaveOtp(email);

    res.status(200).json({
        success: true,
        message: 'OTP sent to your registered email.',
    });
});

export const loginVerifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new ErrorResponse('User not found.', 404);

    // 💡 BYPASS LOGIC: Skip record check if live
    if (!isProduction) {
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) {
            throw new ErrorResponse('Invalid or expired OTP.', 400);
        }
        await Otp.deleteOne({ email });
    }

    sendTokenResponse(user, 200, res);
});
