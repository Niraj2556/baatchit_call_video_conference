import RoomManager from '../services/roomManager.js';
import UserManager from '../services/userManager.js';

class SocketHandler {
    constructor(io) {
        this.io = io;
        this.roomManager = new RoomManager();
        this.userManager = new UserManager();
    }

    initialize() {
        this.io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            socket.on('join-room', (data) => this.handleJoinRoom(socket, data));
            socket.on('offer', (data) => this.handleOffer(socket, data));
            socket.on('answer', (data) => this.handleAnswer(socket, data));
            socket.on('ice-candidate', (data) => this.handleIceCandidate(socket, data));
            socket.on('chat-message', (data) => this.handleChatMessage(socket, data));
            socket.on('mute-status', (data) => this.handleMuteStatus(socket, data));
            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }

    handleJoinRoom(socket, { roomId, username }) {
        socket.join(roomId);
        
        this.userManager.addUser(socket.id, { username, roomId });
        this.roomManager.addUserToRoom(roomId, { id: socket.id, username });
        
        socket.to(roomId).emit('user-joined', { id: socket.id, username });
        
        const existingUsers = this.roomManager.getRoomUsers(roomId)
            .filter(user => user.id !== socket.id);
        socket.emit('existing-users', existingUsers);
        
        this.io.to(roomId).emit('room-users', this.roomManager.getRoomUsers(roomId));
        
        console.log(`User ${username} (${socket.id}) joined room ${roomId}`);
    }

    handleOffer(socket, data) {
        socket.to(data.target).emit('offer', {
            offer: data.offer,
            sender: socket.id
        });
    }

    handleAnswer(socket, data) {
        socket.to(data.target).emit('answer', {
            answer: data.answer,
            sender: socket.id
        });
    }

    handleIceCandidate(socket, data) {
        socket.to(data.target).emit('ice-candidate', {
            candidate: data.candidate,
            sender: socket.id
        });
    }

    handleChatMessage(socket, data) {
        const user = this.userManager.getUser(socket.id);
        if (user) {
            this.io.to(user.roomId).emit('chat-message', {
                username: user.username,
                message: data.message,
                timestamp: new Date().toLocaleTimeString()
            });
        }
    }

    handleMuteStatus(socket, data) {
        const user = this.userManager.getUser(socket.id);
        if (user) {
            socket.to(user.roomId).emit('mute-status', {
                username: data.username,
                userId: socket.id,
                isMuted: data.isMuted
            });
        }
    }

    handleDisconnect(socket) {
        const user = this.userManager.getUser(socket.id);
        console.log('User disconnected:', socket.id);
        
        if (user) {
            const roomId = user.roomId;
            this.roomManager.removeUserFromRoom(roomId, socket.id);
            
            if (this.roomManager.isRoomEmpty(roomId)) {
                this.roomManager.deleteRoom(roomId);
            } else {
                socket.to(roomId).emit('user-left', socket.id);
                this.io.to(roomId).emit('room-users', this.roomManager.getRoomUsers(roomId));
            }
            
            this.userManager.removeUser(socket.id);
        }
    }
}

export default SocketHandler;