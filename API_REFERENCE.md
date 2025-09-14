# Baat Chit - API Reference

## Socket.io Events

### Client → Server Events

#### `join-room`
Join a specific room with username
```javascript
socket.emit('join-room', {
    roomId: string,    // Room identifier
    username: string   // User display name
});
```

#### `offer`
Send WebRTC offer to establish connection
```javascript
socket.emit('offer', {
    target: string,           // Target user socket ID
    offer: RTCSessionDescription  // WebRTC offer
});
```

#### `answer`
Send WebRTC answer to complete connection
```javascript
socket.emit('answer', {
    target: string,            // Target user socket ID
    answer: RTCSessionDescription  // WebRTC answer
});
```

#### `ice-candidate`
Send ICE candidate for connection establishment
```javascript
socket.emit('ice-candidate', {
    target: string,              // Target user socket ID
    candidate: RTCIceCandidate   // ICE candidate
});
```

#### `chat-message`
Send chat message to room
```javascript
socket.emit('chat-message', {
    message: string  // Message content (max 500 chars)
});
```

#### `mute-status`
Broadcast microphone mute status
```javascript
socket.emit('mute-status', {
    isMuted: boolean,   // Mute state
    username: string    // User name
});
```

---

### Server → Client Events

#### `existing-users`
List of users already in the room
```javascript
socket.on('existing-users', (users) => {
    // users: Array<{ id: string, username: string }>
});
```

#### `user-joined`
New user joined the room
```javascript
socket.on('user-joined', (user) => {
    // user: { id: string, username: string }
});
```

#### `user-left`
User left the room
```javascript
socket.on('user-left', (userId) => {
    // userId: string (socket ID)
});
```

#### `room-users`
Updated list of all users in room
```javascript
socket.on('room-users', (users) => {
    // users: Array<{ id: string, username: string }>
});
```

#### `offer`
Incoming WebRTC offer
```javascript
socket.on('offer', (data) => {
    // data: { offer: RTCSessionDescription, sender: string }
});
```

#### `answer`
Incoming WebRTC answer
```javascript
socket.on('answer', (data) => {
    // data: { answer: RTCSessionDescription, sender: string }
});
```

#### `ice-candidate`
Incoming ICE candidate
```javascript
socket.on('ice-candidate', (data) => {
    // data: { candidate: RTCIceCandidate, sender: string }
});
```

#### `chat-message`
Incoming chat message
```javascript
socket.on('chat-message', (data) => {
    // data: { username: string, message: string, timestamp: string }
});
```

#### `mute-status`
User mute status update
```javascript
socket.on('mute-status', (data) => {
    // data: { username: string, userId: string, isMuted: boolean }
});
```

---

## JavaScript API

### Core Functions

#### `joinRoom()`
Join a video call room
```javascript
async function joinRoom() {
    const username = usernameInput.value.trim();
    const roomId = roomInput.value.trim();
    
    if (!username || !roomId) {
        alert('Please enter both username and room ID');
        return;
    }
    
    await startLocalVideo();
    socket.emit('join-room', { roomId, username });
}
```

#### `createPeerConnection(userId)`
Create WebRTC peer connection
```javascript
function createPeerConnection(userId) {
    const peerConnection = new RTCPeerConnection(iceServers);
    
    // Add local stream
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });
    
    return peerConnection;
}
```

#### `toggleMic()`
Toggle microphone on/off
```javascript
function toggleMic() {
    isMicMuted = !isMicMuted;
    localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMicMuted;
    });
    
    // Update UI and broadcast status
    socket.emit('mute-status', { isMuted: isMicMuted, username: currentUsername });
}
```

#### `toggleCamera()`
Toggle camera on/off
```javascript
function toggleCamera() {
    isCameraOff = !isCameraOff;
    localStream.getVideoTracks().forEach(track => {
        track.enabled = !isCameraOff;
    });
}
```

#### `sendMessage()`
Send chat message
```javascript
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || message.length > 500) return;
    
    socket.emit('chat-message', { message });
    messageInput.value = '';
}
```

### Audio Detection API

#### `setupAudioDetection(userId, stream)`
Setup real-time audio level detection
```javascript
function setupAudioDetection(userId, stream) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    microphone.connect(analyser);
    
    // Start detection loop
    detectSpeaking();
}
```

### Chat System API

#### `addChatMessage(username, message, type)`
Add message to chat (with queue processing)
```javascript
function addChatMessage(username, message, type = 'user') {
    messageQueue.push({ username, message, type });
    
    if (!isProcessingMessages) {
        processMessageQueue();
    }
}
```

#### `showChatNotification(username, message)`
Show popup notification for new messages
```javascript
function showChatNotification(username, message) {
    if (!chatPanel.classList.contains('hidden') || username === currentUsername) {
        return;
    }
    
    // Show notification popup
    notificationSender.textContent = username;
    notificationMessage.textContent = message;
    chatNotification.classList.remove('hidden');
}
```

---

## Configuration Options

### ICE Servers
```javascript
const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
        // Add TURN servers for production
    ]
};
```

### Performance Settings
```javascript
const MAX_MESSAGES = 30;        // Chat message limit
const BATCH_SIZE = 3;           // Message processing batch size
const SPEAKING_THRESHOLD = 10;  // Audio detection threshold
const NOTIFICATION_TIMEOUT = 4000; // Auto-hide notifications (ms)
```

### Media Constraints
```javascript
const mediaConstraints = {
    video: true,
    audio: true
    // Add specific constraints:
    // video: { width: 1280, height: 720 }
    // audio: { echoCancellation: true }
};
```

---

## Error Handling

### Common Error Patterns
```javascript
// Media access errors
try {
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
} catch (error) {
    console.error('Media access denied:', error);
    alert('Could not access camera/microphone');
}

// WebRTC connection errors
peerConnection.onconnectionstatechange = () => {
    if (peerConnection.connectionState === 'failed') {
        console.error('WebRTC connection failed');
        // Attempt reconnection
    }
};

// Socket connection errors
socket.on('connect_error', (error) => {
    console.error('Socket connection failed:', error);
});
```

### Browser Compatibility Checks
```javascript
// Check WebRTC support
if (!window.RTCPeerConnection) {
    alert('WebRTC not supported in this browser');
    return;
}

// Check getUserMedia support
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Camera/microphone access not supported');
    return;
}

// Check Web Audio API support
if (!window.AudioContext && !window.webkitAudioContext) {
    console.warn('Audio detection not supported');
    // Fallback to hover-only microphone display
}
```

---

## Data Structures

### Room Management
```javascript
// Server-side room structure
const rooms = {
    "room123": [
        { id: "socket_id_1", username: "Alice" },
        { id: "socket_id_2", username: "Bob" }
    ]
};

// User mapping
const users = {
    "socket_id_1": { username: "Alice", roomId: "room123" },
    "socket_id_2": { username: "Bob", roomId: "room123" }
};
```

### Client-side State
```javascript
// Peer connections
const peerConnections = {
    "socket_id_1": RTCPeerConnection,
    "socket_id_2": RTCPeerConnection
};

// Participants list
const participants = [
    { id: "socket_id_1", username: "Alice" },
    { id: "socket_id_2", username: "Bob" }
];

// Audio contexts for detection
const audioContexts = new Map([
    ["socket_id_1", { audioContext: AudioContext, analyser: AnalyserNode }]
]);
```