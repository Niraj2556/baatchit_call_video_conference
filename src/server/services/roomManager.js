class RoomManager {
    constructor() {
        this.rooms = {};
    }

    addUserToRoom(roomId, user) {
        if (!this.rooms[roomId]) {
            this.rooms[roomId] = [];
        }
        this.rooms[roomId].push(user);
    }

    removeUserFromRoom(roomId, userId) {
        if (this.rooms[roomId]) {
            this.rooms[roomId] = this.rooms[roomId].filter(u => u.id !== userId);
        }
    }

    getRoomUsers(roomId) {
        return this.rooms[roomId] || [];
    }

    isRoomEmpty(roomId) {
        return !this.rooms[roomId] || this.rooms[roomId].length === 0;
    }

    deleteRoom(roomId) {
        delete this.rooms[roomId];
    }

    getRoomCount() {
        return Object.keys(this.rooms).length;
    }

    getUserCountInRoom(roomId) {
        return this.rooms[roomId] ? this.rooms[roomId].length : 0;
    }
}

export default RoomManager;