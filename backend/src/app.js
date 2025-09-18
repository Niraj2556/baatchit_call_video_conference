import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import SocketHandler from './handlers/socketHandler.js';
import authRoutes from './routes/auth.js';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
    try {
        const dotenv = await import('dotenv');
        dotenv.config();
    } catch (err) {
        console.log('dotenv not available, using environment variables');
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VideoCallApp {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: process.env.CORS_ORIGIN || "*",
                methods: ["GET", "POST"]
            },
            transports: ['websocket', 'polling'],
            allowEIO3: true
        });
        this.socketHandler = new SocketHandler(this.io);
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    setupRoutes() {
        // Log all requests
        this.app.use((req, res, next) => {
            console.log(`${req.method} ${req.path}`);
            next();
        });
        
        this.app.use('/api/auth', authRoutes);
        
        this.app.get('/health', (req, res) => {
            res.json({ status: 'OK', message: 'Baat Chit Backend is running' });
        });
        

        
        // Catch all 404s
        this.app.use('*', (req, res) => {
            console.log('404 for:', req.method, req.originalUrl);
            res.status(404).json({ error: 'Route not found' });
        });
    }

    setupSocketHandlers() {
        this.socketHandler.initialize();
    }

    async start(port = process.env.PORT || 3000) {
        try {
            const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://nirajgupta54180_db_user:idxfjMZxQTJmhdMc@cluster0.mfjynmk.mongodb.net/videochat?retryWrites=true&w=majority&appName=Cluster0';
            await mongoose.connect(mongoUri);
            console.log('Connected to MongoDB');
            
            this.server.listen(port, () => {
                console.log(`Baat Chit Backend server running on port ${port}`);
            });
        } catch (error) {
            console.error('Database connection failed:', error);
        }
    }
}

export default VideoCallApp;