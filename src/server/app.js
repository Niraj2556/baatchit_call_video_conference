import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import SocketHandler from './handlers/socketHandler.js';

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
    }

    setupMiddleware() {
        this.app.use(express.static(path.join(__dirname, '../../public')));
    }

    setupRoutes() {
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../../public/index.html'));
        });
    }

    setupSocketHandlers() {
        this.socketHandler.initialize();
    }

    start(port = process.env.PORT || 3000) {
        this.server.listen(port, () => {
            console.log(`VideoChat Pro server running on port ${port}`);
        });
    }
}

export default VideoCallApp;