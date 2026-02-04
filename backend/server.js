// server.js
import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import http from 'http';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo'; // CRITICAL: This requires npm install
import passport from 'passport';

import connectDB from './config/db.js';
import { initializeSocketIO } from './utils/socket.js';
import { startWorker } from './services/jobWorker.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import backendRoutes from './routes/backendRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const server = http.createServer(app);

connectDB();

import './config/passport.js'; 

// 💡 CORS: Allow Dev (5173), Preview (4173), and Live Netlify
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.FRONTEND_URL
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

// 💡 SESSION: Using MongoStore to fix MemoryStore warning & Render crashes
app.use(session({
    name: 'quantum_session_id', 
    secret: process.env.JWT_SECRET || 'agri_fallback_secret',
    resave: false, 
    saveUninitialized: false, 
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions'
    }),
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24,
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true,
        sameSite: 'none' 
    }
}));

app.use(passport.initialize());
app.use(passport.session()); 

initializeSocketIO(server);

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/backends', backendRoutes);

app.get('/', (req, res) => res.send('Quantum Job Tracker API is running!'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    if (process.env.RUN_WORKER === 'true' || process.env.NODE_ENV === 'development') {
        startWorker();
    }
});
