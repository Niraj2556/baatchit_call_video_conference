class RoomManager {
    constructor() {
        this.rooms = {};
    }

    createRoom(roomId, creator) {
        if (this.rooms[roomId]) {
            return { success: false, error: 'Room already exists' };
        }
        this.rooms[roomId] = {
            users: [creator],
            creator: creator.id,
            createdAt: new Date()
        };
        return { success: true };
    }

    addUserToRoom(roomId, user) {
        if (!this.rooms[roomId]) {
            return { success: false, error: 'Room does not exist' };
        }
        this.rooms[roomId].users.push(user);
        return { success: true };
    }

    removeUserFromRoom(roomId, userId) {
        if (this.rooms[roomId]) {
            this.rooms[roomId].users = this.rooms[roomId].users.filter(u => u.id !== userId);
        }
    }

    getRoomUsers(roomId) {
        return this.rooms[roomId] ? this.rooms[roomId].users : [];
    }

    isRoomEmpty(roomId) {
        return !this.rooms[roomId] || this.rooms[roomId].users.length === 0;
    }

    roomExists(roomId) {
        return !!this.rooms[roomId];
    }

    deleteRoom(roomId) {
        delete this.rooms[roomId];
    }

    getRoomCount() {
        return Object.keys(this.rooms).length;
    }

    getUserCountInRoom(roomId) {
        return this.rooms[roomId] ? this.rooms[roomId].users.length : 0;
    }

    generateRoomId() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
}

export default RoomManager;