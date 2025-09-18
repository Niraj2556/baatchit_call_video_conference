import RoomManager from '../services/roomManager.js';
import UserManager from '../services/userManager.js';
import CallHistory from '../models/CallHistory.js';
import User from '../models/User.js';

class SocketHandler {
    constructor(io) {
        this.io = io;
        this.roomManager = new RoomManager();
        this.userManager = new UserManager();
    }

    initialize() {
        this.io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            socket.on('create-room', (data) => this.handleCreateRoom(socket, data));
            socket.on('join-room', (data) => this.handleJoinRoom(socket, data));
            socket.on('offer', (data) => this.handleOffer(socket, data));
            socket.on('answer', (data) => this.handleAnswer(socket, data));
            socket.on('ice-candidate', (data) => this.handleIceCandidate(socket, data));
            socket.on('chat-message', (data) => this.handleChatMessage(socket, data));
            socket.on('mute-status', (data) => this.handleMuteStatus(socket, data));
            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }

    async handleCreateRoom(socket, { username, customRoomId }) {
        const roomId = customRoomId || this.roomManager.generateRoomId();
        const user = { id: socket.id, username };
        
        const result = this.roomManager.createRoom(roomId, user);
        
        if (!result.success) {
            socket.emit('room-error', { error: result.error });
            return;
        }
        
        socket.join(roomId);
        this.userManager.addUser(socket.id, { username, roomId });
        
        // Create call history record
        try {
            const callHistory = new CallHistory({
                roomId,
                participants: [{
                    username,
                    joinTime: new Date()
                }]
            });
            await callHistory.save();
        } catch (error) {
            console.error('Error creating call history:', error);
        }
        
        socket.emit('room-created', { roomId, isCreator: true });
        this.io.to(roomId).emit('room-users', this.roomManager.getRoomUsers(roomId));
        
        console.log(`User ${username} (${socket.id}) created room ${roomId}`);
    }

    async handleJoinRoom(socket, { roomId, username }) {
        if (!this.roomManager.roomExists(roomId)) {
            socket.emit('room-error', { error: 'Room does not exist' });
            return;
        }
        
        socket.join(roomId);
        
        this.userManager.addUser(socket.id, { username, roomId });
        const result = this.roomManager.addUserToRoom(roomId, { id: socket.id, username });
        
        if (!result.success) {
            socket.emit('room-error', { error: result.error });
            return;
        }
        
        // Update call history
        try {
            await CallHistory.findOneAndUpdate(
                { roomId, status: 'active' },
                { 
                    $push: { 
                        participants: {
                            username,
                            joinTime: new Date()
                        }
                    }
                }
            );
        } catch (error) {
            console.error('Error updating call history:', error);
        }
        
        socket.to(roomId).emit('user-joined', { id: socket.id, username });
        
        const existingUsers = this.roomManager.getRoomUsers(roomId)
            .filter(user => user.id !== socket.id);
        socket.emit('existing-users', existingUsers);
        socket.emit('room-joined', { roomId, isCreator: false });
        
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

    async handleDisconnect(socket) {
        const user = this.userManager.getUser(socket.id);
        console.log('User disconnected:', socket.id);
        
        if (user) {
            const roomId = user.roomId;
            
            // Update call history with leave time
            try {
                await CallHistory.findOneAndUpdate(
                    { 
                        roomId, 
                        status: 'active',
                        'participants.username': user.username,
                        'participants.leaveTime': { $exists: false }
                    },
                    { 
                        $set: { 
                            'participants.$.leaveTime': new Date()
                        }
                    }
                );
            } catch (error) {
                console.error('Error updating call history on disconnect:', error);
            }
            
            this.roomManager.removeUserFromRoom(roomId, socket.id);
            
            if (this.roomManager.isRoomEmpty(roomId)) {
                // End call history when room is empty
                try {
                    const callHistory = await CallHistory.findOneAndUpdate(
                        { roomId, status: 'active' },
                        { 
                            status: 'ended',
                            endTime: new Date()
                        }
                    );
                    
                    if (callHistory) {
                        const duration = Math.floor((new Date() - callHistory.startTime) / 1000);
                        callHistory.duration = duration;
                        await callHistory.save();
                    }
                } catch (error) {
                    console.error('Error ending call history:', error);
                }
                
                this.roomManager.deleteRoom(roomId);
            } else {
                socket.to(roomId).emit('user-left', { userId: socket.id, username: user.username });
                this.io.to(roomId).emit('room-users', this.roomManager.getRoomUsers(roomId));
            }
            
            this.userManager.removeUser(socket.id);
        }
    }
}

export default SocketHandler;