import { ENV_CONFIG } from '../config.js';

export const CONFIG = {
    BACKEND_URL: ENV_CONFIG.BACKEND_URL,
    ICE_SERVERS: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    },
    MAX_MESSAGES: 30,
    NOTIFICATION_TIMEOUT: 4000,
    RECONNECT_ATTEMPTS: 3,
    RECONNECT_DELAY: 1000
};

export const EVENTS = {
    // Socket events
    JOIN_ROOM: 'join-room',
    USER_JOINED: 'user-joined',
    USER_LEFT: 'user-left',
    EXISTING_USERS: 'existing-users',
    ROOM_USERS: 'room-users',
    OFFER: 'offer',
    ANSWER: 'answer',
    ICE_CANDIDATE: 'ice-candidate',
    CHAT_MESSAGE: 'chat-message',
    MUTE_STATUS: 'mute-status',
    
    // UI events
    TOGGLE_MIC: 'toggleMic',
    TOGGLE_CAMERA: 'toggleCamera',
    SEND_MESSAGE: 'sendMessage',
    JOIN_ROOM_UI: 'joinRoom',
    LEAVE_ROOM: 'leaveRoom',
    CHAT_TOGGLED: 'chatToggled'
};

export const MESSAGE_TYPES = {
    USER: 'user',
    SYSTEM: 'system'
};