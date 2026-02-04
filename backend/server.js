// server.js
// --------------------------------------------------------
// 1. Load Environment Variables BEFORE anything else
// --------------------------------------------------------
import dotenv from 'dotenv';
dotenv.config(); // Render injects these automatically

// --------------------------------------------------------
// 2. Core Imports
// --------------------------------------------------------
import express from 'express';
import http from 'http';
import connectDB from './config/db.js';
import { initializeSocketIO } from './utils/socket.js';
import { startWorker } from './services/jobWorker.js';

// --------------------------------------------------------
// 3. Security & Session Imports
// --------------------------------------------------------
import cors from 'cors';
import errorHandler from './middleware/errorHandler.js';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo'; // FIX: Resolves MemoryStore warning

// --------------------------------------------------------
// 4. Route Imports
// --------------------------------------------------------
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import backendRoutes from './routes/backendRoutes.js';

const app = express();
const server = http.createServer(app);

// --------------------------------------------------------
// 5. Database Connection
// --------------------------------------------------------
connectDB();

import './config/passport.js';

// --------------------------------------------------------
// 6. Global Middleware Setup
// --------------------------------------------------------

// A. FIXED CORS: Allows local dev, local preview, and live site
const allowedOrigins = [
    'http://localhost:5173', // Vite Dev
    'http://localhost:4173', // Vite Preview (Fixes your console error)
    process.env.FRONTEND_URL  // Your Live Netlify URL
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS policy block'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// B. PRODUCTION SESSION SETUP
app.use(session({
    name: 'quantum_session_id',
    secret: process.env.JWT_SECRET || 'agri_fallback_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // Uses your connected Atlas DB
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        secure: process.env.NODE_ENV === 'production', // true for HTTPS on Render
        httpOnly: true,
        sameSite: 'none' // Required for cross-site cookies between Netlify & Render
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// --------------------------------------------------------
// 7. Initialization & Routes
// --------------------------------------------------------
initializeSocketIO(server);

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/backends', backendRoutes);

app.get('/', (req, res) => {
    res.send('Quantum Job Tracker API is running!');
});

app.use(errorHandler);

// --------------------------------------------------------
// 8. Start Server
// --------------------------------------------------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    
    // Bypass Logic: Worker starts normally, but auth handles production checks
    if (process.env.RUN_WORKER === 'true' || process.env.NODE_ENV === 'development') {
        startWorker();
    }
});
