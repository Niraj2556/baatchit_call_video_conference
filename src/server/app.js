import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import SocketHandler from './handlers/socketHandler.js';
import authRoutes from './routes/auth.js';

const JWT_SECRET = 'videochat_secret_key';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VideoCallApp {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server);
        this.socketHandler = new SocketHandler(this.io);
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
        
        // Initialize database for Vercel
        if (process.env.VERCEL) {
            this.initializeForVercel();
        }
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, '../../public')));
    }

    setupRoutes() {
    this.app.use('/api/auth', authRoutes);
        
        // Serve main app or redirect to auth
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../../public/index.html'));
        });
        

        
        this.app.get('/auth.html', (req, res) => {
            res.sendFile(path.join(__dirname, '../../public/auth.html'));
        });
        
        this.app.get('/history.html', (req, res) => {
            res.sendFile(path.join(__dirname, '../../public/history.html'));
        });
    }

    setupSocketHandlers() {
        this.socketHandler.initialize();
    }

    async start(port = process.env.PORT || 3000) {
        try {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://nirajgupta54180_db_user:idxfjMZxQTJmhdMc@cluster0.mfjynmk.mongodb.net/videochat?retryWrites=true&w=majority&appName=Cluster0');
            console.log('Connected to MongoDB');
            
            if (!process.env.VERCEL) {
                this.server.listen(port, () => {
                    console.log(`Baat Chit server running on port ${port}`);
                });
            }
        } catch (error) {
            console.error('Database connection failed:', error);
        }
    }

    // Initialize database connection for Vercel
    async initializeForVercel() {
        if (!mongoose.connection.readyState) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://nirajgupta54180_db_user:idxfjMZxQTJmhdMc@cluster0.mfjynmk.mongodb.net/videochat?retryWrites=true&w=majority&appName=Cluster0');
        }
    }
}

export default VideoCallApp;