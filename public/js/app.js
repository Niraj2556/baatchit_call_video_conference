const socket = io();

// DOM Elements
const joinScreen = document.getElementById('joinScreen');
const mainApp = document.getElementById('mainApp');
const usernameInput = document.getElementById('usernameInput');
const roomInput = document.getElementById('roomInput');
const joinBtn = document.getElementById('joinBtn');
const currentRoomSpan = document.getElementById('currentRoom');
const participantCount = document.getElementById('participantCount');
const videoGrid = document.getElementById('videoGrid');
const localVideo = document.getElementById('localVideo');

// Controls
const toggleChatBtn = document.getElementById('toggleChat');
const toggleMicBtn = document.getElementById('toggleMic');
const toggleCameraBtn = document.getElementById('toggleCamera');
const leaveRoomBtn = document.getElementById('leaveRoom');

// Add tooltips to controls
function addTooltips() {
    toggleChatBtn.setAttribute('data-tooltip', 'Toggle Chat');
    toggleChatBtn.classList.add('tooltip');
    
    toggleMicBtn.setAttribute('data-tooltip', 'Toggle Microphone');
    toggleMicBtn.classList.add('tooltip');
    
    toggleCameraBtn.setAttribute('data-tooltip', 'Toggle Camera');
    toggleCameraBtn.classList.add('tooltip');
    
    leaveRoomBtn.setAttribute('data-tooltip', 'Leave Room');
    leaveRoomBtn.classList.add('tooltip');
}

// Chat
const chatPanel = document.getElementById('chatPanel');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatBadge = document.getElementById('chatBadge');
const chatNotification = document.getElementById('chatNotification');
const notificationSender = document.getElementById('notificationSender');
const notificationMessage = document.getElementById('notificationMessage');


// State
let localStream;
let peerConnections = {};
let currentRoom = null;
let currentUsername = null;
let isMicMuted = false;
let isCameraOff = false;
let participants = [];
let unreadMessages = 0;
let notificationTimeout;
const MAX_MESSAGES = 30; // Reduced for better performance
let messageQueue = [];
let isProcessingMessages = false;
let mutedUsers = new Map(); // Track muted users with their IDs
let audioContexts = new Map(); // Track audio contexts for speaking detection

const iceServers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// Initialize
init();
addTooltips();

function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    if (roomFromUrl) {
        roomInput.value = roomFromUrl;
    }
    
    setupEventListeners();
}

function setupEventListeners() {
    joinBtn.addEventListener('click', joinRoom);
    leaveRoomBtn.addEventListener('click', leaveRoom);
    toggleChatBtn.addEventListener('click', toggleChat);
    toggleMicBtn.addEventListener('click', toggleMic);
    toggleCameraBtn.addEventListener('click', toggleCamera);
    closeChatBtn.addEventListener('click', () => {
        chatPanel.classList.add('hidden');
        toggleChatBtn.classList.remove('active');
        toggleChatBtn.setAttribute('data-tooltip', 'Open Chat');
    });
    
    // Click notification to open chat
    chatNotification.addEventListener('click', () => {
        chatNotification.classList.add('hidden');
        if (chatPanel.classList.contains('hidden')) {
            toggleChat();
        }
    });
    sendBtn.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    [usernameInput, roomInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') joinRoom();
        });
    });
}

async function joinRoom() {
    const username = usernameInput.value.trim();
    const roomId = roomInput.value.trim();
    
    if (!username || !roomId) {
        alert('Please enter both username and room ID');
        return;
    }
    
    currentUsername = username;
    currentRoom = roomId;
    
    try {
        await startLocalVideo();
        socket.emit('join-room', { roomId, username });
        
        joinScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        currentRoomSpan.textContent = roomId;
        
        const newUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
        window.history.pushState({}, '', newUrl);
        
        addChatMessage('System', 'You joined the room', 'system');
    } catch (error) {
        console.error('Error joining room:', error);
        alert('Could not access camera/microphone');
    }
}

function leaveRoom() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    
    Object.values(peerConnections).forEach(pc => pc.close());
    peerConnections = {};
    
    socket.disconnect();
    location.reload();
}

async function startLocalVideo() {
    localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    });
    localVideo.srcObject = localStream;
    
    // Setup audio level detection for local video
    setupAudioDetection('local', localStream);
}

function createPeerConnection(userId) {
    const peerConnection = new RTCPeerConnection(iceServers);
    
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        const remoteStream = event.streams[0];
        createRemoteVideo(userId, remoteStream);
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                target: userId,
                candidate: event.candidate
            });
        }
    };

    return peerConnection;
}

function createRemoteVideo(userId, stream) {
    const participant = participants.find(p => p.id === userId);
    const username = participant ? participant.username : 'Unknown';
    
    let videoWrapper = document.getElementById(`video-${userId}`);
    
    if (!videoWrapper) {
        videoWrapper = document.createElement('div');
        videoWrapper.id = `video-${userId}`;
        videoWrapper.className = 'video-wrapper';
        
        const video = document.createElement('video');
        video.autoplay = true;
        video.srcObject = stream;
        
        const label = document.createElement('div');
        label.className = 'video-label';
        label.textContent = username;
        
        // Connection status indicator
        const connectionStatus = document.createElement('div');
        connectionStatus.className = 'connection-status';
        connectionStatus.title = 'Connection: Good';
        
        const controls = document.createElement('div');
        controls.className = 'video-controls';
        controls.id = `controls-${userId}`;
        
        const micStatus = document.createElement('span');
        micStatus.className = 'mic-status tooltip';
        micStatus.id = `mic-${userId}`;
        micStatus.setAttribute('data-tooltip', 'Microphone On');
        micStatus.innerHTML = '<i class="fas fa-microphone"></i>';
        
        controls.appendChild(micStatus);
        videoWrapper.appendChild(video);
        videoWrapper.appendChild(connectionStatus);
        videoWrapper.appendChild(label);
        videoWrapper.appendChild(controls);
        videoGrid.appendChild(videoWrapper);
        
        // Setup audio level detection for remote video
        setupAudioDetection(userId, stream);
        
        // Add hover effect for video wrapper
        videoWrapper.addEventListener('mouseenter', () => {
            videoWrapper.style.transform = 'scale(1.03) translateY(-5px)';
        });
        
        videoWrapper.addEventListener('mouseleave', () => {
            videoWrapper.style.transform = 'scale(1) translateY(0)';
        });
    }
}

function toggleChat() {
    const isHidden = chatPanel.classList.contains('hidden');
    chatPanel.classList.toggle('hidden');
    toggleChatBtn.classList.toggle('active');
    
    toggleChatBtn.setAttribute('data-tooltip', isHidden ? 'Close Chat' : 'Open Chat');
    
    // Clear unread messages when opening chat
    if (isHidden) {
        clearUnreadMessages();
    }
}

function showChatNotification(username, message) {
    // Don't show notification if chat is open or it's own message
    if (!chatPanel.classList.contains('hidden') || username === currentUsername) {
        return;
    }
    
    // Update notification content
    notificationSender.textContent = username;
    notificationMessage.textContent = message;
    
    // Show notification
    chatNotification.classList.remove('hidden');
    
    // Auto-hide after 4 seconds
    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
        chatNotification.classList.add('hidden');
    }, 4000);
}

function updateUnreadCount() {
    unreadMessages++;
    // Cap display at 99+ to prevent UI issues
    chatBadge.textContent = unreadMessages > 99 ? '99+' : unreadMessages;
    chatBadge.classList.remove('hidden');
    
    // Throttle animation to prevent excessive reflows
    if (!chatBadge.dataset.animating) {
        chatBadge.dataset.animating = 'true';
        chatBadge.style.animation = 'bounce 0.6s ease-in-out';
        setTimeout(() => {
            delete chatBadge.dataset.animating;
        }, 600);
    }
}

function clearUnreadMessages() {
    unreadMessages = 0;
    chatBadge.classList.add('hidden');
    chatNotification.classList.add('hidden');
}



function toggleMic() {
    isMicMuted = !isMicMuted;
    localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMicMuted;
    });
    
    toggleMicBtn.classList.toggle('muted', isMicMuted);
    toggleMicBtn.innerHTML = isMicMuted ? 
        '<i class="fas fa-microphone-slash"></i>' : 
        '<i class="fas fa-microphone"></i>';
    
    toggleMicBtn.setAttribute('data-tooltip', isMicMuted ? 'Unmute Microphone' : 'Mute Microphone');
        
    const localMicStatus = document.getElementById('localMic');
    localMicStatus.classList.toggle('muted', isMicMuted);
    localMicStatus.setAttribute('data-tooltip', isMicMuted ? 'Microphone Off' : 'Microphone On');
    
    // Broadcast mute status to other users
    socket.emit('mute-status', { isMuted: isMicMuted, username: currentUsername });
}

function toggleCamera() {
    isCameraOff = !isCameraOff;
    localStream.getVideoTracks().forEach(track => {
        track.enabled = !isCameraOff;
    });
    
    toggleCameraBtn.classList.toggle('muted', isCameraOff);
    toggleCameraBtn.innerHTML = isCameraOff ? 
        '<i class="fas fa-video-slash"></i>' : 
        '<i class="fas fa-video"></i>';
    
    toggleCameraBtn.setAttribute('data-tooltip', isCameraOff ? 'Turn On Camera' : 'Turn Off Camera');
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || message.length > 500) return; // Limit message length
    
    socket.emit('chat-message', { message });
    messageInput.value = '';
}

function addChatMessage(username, message, type = 'user') {
    // Queue messages to prevent UI blocking
    messageQueue.push({ username, message, type });
    
    if (!isProcessingMessages) {
        processMessageQueue();
    }
}

function processMessageQueue() {
    if (messageQueue.length === 0) {
        isProcessingMessages = false;
        return;
    }
    
    isProcessingMessages = true;
    
    // Process in small batches
    const batchSize = 3;
    const batch = messageQueue.splice(0, batchSize);
    
    requestAnimationFrame(() => {
        batch.forEach(({ username, message, type }) => {
            renderMessage(username, message, type);
        });
        
        // Continue processing remaining messages
        setTimeout(() => processMessageQueue(), 16); // ~60fps
    });
}

function renderMessage(username, message, type) {
    // Remove oldest messages
    while (chatMessages.children.length >= MAX_MESSAGES) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${username === currentUsername ? 'own' : ''}`;
    
    if (type === 'system') {
        messageDiv.innerHTML = `
            <div class="message-text" style="font-style: italic; opacity: 0.8;">
                ${message}
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="username">${username}</span>
                <span class="timestamp">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="message-text">${message}</div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    
    // Instant scroll without animation to prevent blocking
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Socket Events
socket.on('existing-users', (users) => {
    participants = users;
    users.forEach(user => connectToUser(user.id));
});

socket.on('user-joined', (user) => {
    participants.push(user);
    addChatMessage('System', `${user.username} joined the room`, 'system');
});

socket.on('user-left', (userId) => {
    const participant = participants.find(p => p.id === userId);
    if (participant) {
        addChatMessage('System', `${participant.username} left the room`, 'system');

        participants = participants.filter(p => p.id !== userId);
    }
    
    if (peerConnections[userId]) {
        peerConnections[userId].close();
        delete peerConnections[userId];
    }
    
    const videoElement = document.getElementById(`video-${userId}`);
    if (videoElement) {
        videoElement.remove();
    }
});

socket.on('room-users', (users) => {
    participants = users;
    participantCount.textContent = users.length;
});

socket.on('chat-message', (data) => {
    addChatMessage(data.username, data.message);
    
    // Show notification and update badge if chat is closed
    if (chatPanel.classList.contains('hidden') && data.username !== currentUsername) {
        showChatNotification(data.username, data.message);
        updateUnreadCount();
    }
});

socket.on('offer', async (data) => {
    const peerConnection = createPeerConnection(data.sender);
    peerConnections[data.sender] = peerConnection;

    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit('answer', {
        target: data.sender,
        answer: answer
    });
});

socket.on('answer', async (data) => {
    const peerConnection = peerConnections[data.sender];
    await peerConnection.setRemoteDescription(data.answer);
});

socket.on('ice-candidate', async (data) => {
    const peerConnection = peerConnections[data.sender];
    await peerConnection.addIceCandidate(data.candidate);
});

socket.on('mute-status', (data) => {
    const micIcon = document.getElementById(`mic-${data.userId}`);
    if (micIcon) {
        if (data.isMuted) {
            micIcon.classList.add('muted');
            micIcon.classList.remove('speaking');
            micIcon.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            micIcon.setAttribute('data-tooltip', 'Microphone Off');
        } else {
            micIcon.classList.remove('muted');
            micIcon.innerHTML = '<i class="fas fa-microphone"></i>';
            micIcon.setAttribute('data-tooltip', 'Microphone On');
        }
    }
});

function setupAudioDetection(userId, stream) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        microphone.connect(analyser);
        audioContexts.set(userId, { audioContext, analyser });
        
        function detectSpeaking() {
            analyser.getByteFrequencyData(dataArray);
            
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;
            
            const controlsId = userId === 'local' ? 'localMicStatus' : `controls-${userId}`;
            const micId = userId === 'local' ? 'localMic' : `mic-${userId}`;
            
            const controls = document.getElementById(controlsId);
            const micIcon = document.getElementById(micId);
            
            if (controls && micIcon) {
                if (average > 10) { // Speaking threshold
                    controls.classList.add('speaking');
                    micIcon.classList.add('speaking');
                } else {
                    controls.classList.remove('speaking');
                    micIcon.classList.remove('speaking');
                }
            }
            
            requestAnimationFrame(detectSpeaking);
        }
        
        detectSpeaking();
    } catch (error) {
        console.log('Audio detection not supported:', error);
    }
}

async function connectToUser(userId) {
    const peerConnection = createPeerConnection(userId);
    peerConnections[userId] = peerConnection;

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit('offer', {
        target: userId,
        offer: offer
    });
}