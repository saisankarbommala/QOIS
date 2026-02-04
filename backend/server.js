// server.js
// --------------------------------------------------------
// 1. Load Environment Variables
// --------------------------------------------------------
import dotenv from 'dotenv';
dotenv.config(); 

// --------------------------------------------------------
// 2. Core Imports
// --------------------------------------------------------
import express from 'express';
import http from 'http';
import cors from 'cors';
import session from 'express-session'; // Using default MemoryStore as requested
import passport from 'passport';

import connectDB from './config/db.js';
import { initializeSocketIO } from './utils/socket.js';
import { startWorker } from './services/jobWorker.js';

// --------------------------------------------------------
// 3. Route & Middleware Imports
// --------------------------------------------------------
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import backendRoutes from './routes/backendRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const server = http.createServer(app);

// --------------------------------------------------------
// 4. Connect to MongoDB
// --------------------------------------------------------
connectDB();

import './config/passport.js'; 

// --------------------------------------------------------
// 5. Global Middleware Setup
// --------------------------------------------------------

// 💡 CORS: Updated to allow Dev (5173), Preview (4173), and your Live Netlify URL
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://qops.netlify.app',
    process.env.FRONTEND_URL
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS policy block: Origin not allowed'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 💡 SESSION: Using default MemoryStore (Restored per your request)
app.use(session({
    name: 'quantum_session_id', 
    secret: process.env.JWT_SECRET || 'agri_fallback_secret',
    resave: false, 
    saveUninitialized: false, 
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        secure: process.env.NODE_ENV === 'production', // true for HTTPS on Render
        httpOnly: true,
        sameSite: 'none' // Required for cross-site cookies
    }
}));

app.use(passport.initialize());
app.use(passport.session()); 

// --------------------------------------------------------
// 6. Initialization & Routes
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
// 7. Start Server
// --------------------------------------------------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    
    // Background worker starts in development or if explicitly enabled
    if (process.env.RUN_WORKER === 'true' || process.env.NODE_ENV === 'development') {
        startWorker();
    }
});
