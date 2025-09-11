// Shared type definitions and interfaces

export const UserStatus = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    AWAY: 'away'
};

export const ConnectionState = {
    NEW: 'new',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    FAILED: 'failed',
    CLOSED: 'closed'
};

export const MessageType = {
    TEXT: 'text',
    SYSTEM: 'system',
    NOTIFICATION: 'notification'
};

export const EventType = {
    USER_JOINED: 'user-joined',
    USER_LEFT: 'user-left',
    MESSAGE_SENT: 'message-sent',
    MEDIA_TOGGLE: 'media-toggle'
};