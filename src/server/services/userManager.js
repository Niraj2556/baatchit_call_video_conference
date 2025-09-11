class UserManager {
    constructor() {
        this.users = {};
    }

    addUser(userId, userData) {
        this.users[userId] = userData;
    }

    removeUser(userId) {
        delete this.users[userId];
    }

    getUser(userId) {
        return this.users[userId];
    }

    getAllUsers() {
        return this.users;
    }

    getUsersByRoom(roomId) {
        return Object.entries(this.users)
            .filter(([_, user]) => user.roomId === roomId)
            .map(([id, user]) => ({ id, ...user }));
    }

    getUserCount() {
        return Object.keys(this.users).length;
    }
}

export default UserManager;