import { EventEmitter } from '../utils/eventEmitter.js';
import { DOMUtils } from '../utils/domUtils.js';

class UIManager extends EventEmitter {
    constructor() {
        super();
        this.elements = {};
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.elements = {
            joinScreen: DOMUtils.getElementById('joinScreen'),
            mainApp: DOMUtils.getElementById('mainApp'),
            usernameInput: DOMUtils.getElementById('usernameInput'),
            roomInput: DOMUtils.getElementById('roomInput'),
            joinBtn: DOMUtils.getElementById('joinBtn'),
            leaveRoomBtn: DOMUtils.getElementById('leaveRoom'),
            currentRoom: DOMUtils.getElementById('currentRoom'),
            participantCount: DOMUtils.getElementById('participantCount'),
            localVideo: DOMUtils.getElementById('localVideo'),
            videoGrid: DOMUtils.getElementById('videoGrid'),
            toggleChatBtn: DOMUtils.getElementById('toggleChat'),
            toggleMicBtn: DOMUtils.getElementById('toggleMic'),
            toggleCameraBtn: DOMUtils.getElementById('toggleCamera'),
            chatPanel: DOMUtils.getElementById('chatPanel'),
            chatMessages: DOMUtils.getElementById('chatMessages'),
            messageInput: DOMUtils.getElementById('messageInput'),
            sendBtn: DOMUtils.getElementById('sendBtn'),
            chatBadge: DOMUtils.getElementById('chatBadge'),
            chatNotification: DOMUtils.getElementById('chatNotification'),
            closeChatBtn: DOMUtils.getElementById('closeChatBtn')
        };
    }

    setupEventListeners() {
        this.elements.joinBtn.addEventListener('click', () => this.handleJoinRoom());
        this.elements.leaveRoomBtn.addEventListener('click', () => this.emit('leaveRoom'));
        this.elements.toggleChatBtn.addEventListener('click', () => this.toggleChat());
        this.elements.toggleMicBtn.addEventListener('click', () => this.emit('toggleMic'));
        this.elements.toggleCameraBtn.addEventListener('click', () => this.emit('toggleCamera'));
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.closeChatBtn.addEventListener('click', () => this.closeChat());

        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        [this.elements.usernameInput, this.elements.roomInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleJoinRoom();
            });
        });
    }

    handleJoinRoom() {
        const username = this.elements.usernameInput.value.trim();
        const roomId = this.elements.roomInput.value.trim();
        
        if (!username || !roomId) {
            this.showAlert('Please enter both username and room ID');
            return;
        }
        
        this.emit('joinRoom', { username, roomId });
    }

    showJoinScreen() {
        this.elements.joinScreen.classList.remove('hidden');
        this.elements.mainApp.classList.add('hidden');
    }

    showMainApp(roomId) {
        this.elements.joinScreen.classList.add('hidden');
        this.elements.mainApp.classList.remove('hidden');
        this.elements.currentRoom.textContent = roomId;
        this.updateURL(roomId);
    }

    updateURL(roomId) {
        const newUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
        window.history.pushState({}, '', newUrl);
    }

    setLocalVideo(stream) {
        this.elements.localVideo.srcObject = stream;
    }

    createRemoteVideo(userId, username, stream) {
        const existingWrapper = document.getElementById(`video-${userId}`);
        if (existingWrapper) return;

        const videoWrapper = DOMUtils.createElement('div', {
            id: `video-${userId}`,
            className: 'video-wrapper'
        });

        const video = DOMUtils.createElement('video', {
            autoplay: true,
            srcObject: stream
        });

        const label = DOMUtils.createElement('div', {
            className: 'video-label',
            textContent: username
        });

        const connectionStatus = DOMUtils.createElement('div', {
            className: 'connection-status',
            title: 'Connection: Good'
        });

        const controls = DOMUtils.createElement('div', {
            className: 'video-controls',
            id: `controls-${userId}`
        });

        const micStatus = DOMUtils.createElement('span', {
            className: 'mic-status tooltip',
            id: `mic-${userId}`,
            innerHTML: '<i class="fas fa-microphone"></i>'
        });

        controls.appendChild(micStatus);
        videoWrapper.append(video, connectionStatus, label, controls);
        this.elements.videoGrid.appendChild(videoWrapper);
    }

    removeRemoteVideo(userId) {
        const videoWrapper = document.getElementById(`video-${userId}`);
        if (videoWrapper) {
            videoWrapper.remove();
        }
    }

    updateParticipantCount(count) {
        this.elements.participantCount.textContent = count;
    }

    toggleChat() {
        const isHidden = this.elements.chatPanel.classList.contains('hidden');
        this.elements.chatPanel.classList.toggle('hidden');
        this.elements.toggleChatBtn.classList.toggle('active');
        this.emit('chatToggled', !isHidden);
    }

    closeChat() {
        this.elements.chatPanel.classList.add('hidden');
        this.elements.toggleChatBtn.classList.remove('active');
        this.emit('chatToggled', false);
    }

    sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (message) {
            this.emit('sendMessage', message);
            this.elements.messageInput.value = '';
        }
    }

    addChatMessage(username, message, type = 'user') {
        const messageElement = DOMUtils.createElement('div', {
            className: `message ${type}`
        });

        if (type === 'system') {
            messageElement.innerHTML = `<span class="system-message">${message}</span>`;
        } else {
            messageElement.innerHTML = `
                <div class="message-header">
                    <span class="username">${username}</span>
                    <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="message-content">${DOMUtils.escapeHtml(message)}</div>
            `;
        }

        this.elements.chatMessages.appendChild(messageElement);
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }

    updateChatBadge(count) {
        if (count > 0) {
            this.elements.chatBadge.textContent = count > 99 ? '99+' : count;
            this.elements.chatBadge.classList.remove('hidden');
        } else {
            this.elements.chatBadge.classList.add('hidden');
        }
    }

    updateMicButton(isMuted) {
        this.elements.toggleMicBtn.classList.toggle('muted', isMuted);
        this.elements.toggleMicBtn.innerHTML = isMuted ? 
            '<i class="fas fa-microphone-slash"></i>' : 
            '<i class="fas fa-microphone"></i>';
    }

    updateCameraButton(isOff) {
        this.elements.toggleCameraBtn.classList.toggle('muted', isOff);
        this.elements.toggleCameraBtn.innerHTML = isOff ? 
            '<i class="fas fa-video-slash"></i>' : 
            '<i class="fas fa-video"></i>';
    }

    showAlert(message) {
        alert(message);
    }

    getInitialRoomFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('room');
    }
}

export default UIManager;