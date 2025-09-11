import { EventEmitter } from '../utils/eventEmitter.js';
import { CONFIG } from '../utils/constants.js';

class ChatManager extends EventEmitter {
    constructor() {
        super();
        this.messages = [];
        this.unreadCount = 0;
        this.isOpen = false;
        this.maxMessages = CONFIG.MAX_MESSAGES;
    }

    addMessage(username, message, type = 'user') {
        const messageData = {
            id: Date.now(),
            username,
            message,
            type,
            timestamp: new Date().toLocaleTimeString()
        };

        this.messages.push(messageData);
        
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(-this.maxMessages);
        }

        if (!this.isOpen && type !== 'system') {
            this.unreadCount++;
        }

        this.emit('messageAdded', messageData);
        return messageData;
    }

    clearUnreadCount() {
        this.unreadCount = 0;
        this.emit('unreadCleared');
    }

    setOpen(isOpen) {
        this.isOpen = isOpen;
        if (isOpen) {
            this.clearUnreadCount();
        }
    }

    getMessages() {
        return this.messages;
    }

    getUnreadCount() {
        return this.unreadCount;
    }

    clear() {
        this.messages = [];
        this.unreadCount = 0;
        this.emit('messagesCleared');
    }
}

export default ChatManager;