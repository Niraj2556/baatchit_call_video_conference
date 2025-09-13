import { EventEmitter } from '../utils/eventEmitter.js';
import { DOMUtils } from '../utils/domUtils.js';
import PopupManager from '../utils/popupManager.js';

class UIManager extends EventEmitter {
    constructor() {
        super();
        this.elements = {};
        this.popup = new PopupManager();
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.elements = {
            joinScreen: DOMUtils.getElementById('joinScreen'),
            mainApp: DOMUtils.getElementById('mainApp'),
            usernameInput: DOMUtils.getElementById('usernameInput'),
            roomInput: DOMUtils.getElementById('roomInput'),
            customRoomInput: DOMUtils.getElementById('customRoomInput'),
            createBtn: DOMUtils.getElementById('createBtn'),
            joinBtn: DOMUtils.getElementById('joinBtn'),
            leaveRoomBtn: DOMUtils.getElementById('leaveRoom'),
            profileBtn: DOMUtils.getElementById('profileBtn'),
            profileDropdown: DOMUtils.getElementById('profileDropdown'),
            profileUsername: DOMUtils.getElementById('profileUsername'),
            profileName: DOMUtils.getElementById('profileName'),
            profileEmail: DOMUtils.getElementById('profileEmail'),
            joinProfileBtn: DOMUtils.getElementById('joinProfileBtn'),
            joinProfileDropdown: DOMUtils.getElementById('joinProfileDropdown'),
            joinProfileUsername: DOMUtils.getElementById('joinProfileUsername'),
            joinHistoryBtn: DOMUtils.getElementById('joinHistoryBtn'),
            joinLogoutBtn: DOMUtils.getElementById('joinLogoutBtn'),
            historyBtn: DOMUtils.getElementById('historyBtn'),
            viewHistoryBtn: DOMUtils.getElementById('viewHistoryBtn'),
            logoutBtn: DOMUtils.getElementById('logoutBtn'),
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
        this.elements.createBtn.addEventListener('click', (e) => {
            this.addClickEffect(e.target);
            this.handleCreateRoom();
        });
        this.elements.joinBtn.addEventListener('click', (e) => {
            this.addClickEffect(e.target);
            this.handleJoinRoom();
        });
        this.elements.leaveRoomBtn.addEventListener('click', () => this.emit('leaveRoom'));
        this.elements.profileBtn?.addEventListener('click', () => this.toggleProfileDropdown());
        this.elements.joinProfileBtn?.addEventListener('click', () => this.toggleJoinProfileDropdown());
        this.elements.historyBtn?.addEventListener('click', () => this.goToHistory());
        this.elements.joinHistoryBtn?.addEventListener('click', () => this.goToHistory());
        this.elements.viewHistoryBtn?.addEventListener('click', () => this.goToHistory());
        this.elements.logoutBtn?.addEventListener('click', () => this.logout());
        this.elements.joinLogoutBtn?.addEventListener('click', () => this.logout());
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.elements.profileBtn?.contains(e.target) && !this.elements.profileDropdown?.contains(e.target)) {
                this.closeProfileDropdown();
            }
            if (!this.elements.joinProfileBtn?.contains(e.target) && !this.elements.joinProfileDropdown?.contains(e.target)) {
                this.closeJoinProfileDropdown();
            }
        });
        this.elements.toggleChatBtn.addEventListener('click', () => this.toggleChat());
        this.elements.toggleMicBtn.addEventListener('click', () => this.emit('toggleMic'));
        this.elements.toggleCameraBtn.addEventListener('click', () => this.emit('toggleCamera'));
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.closeChatBtn.addEventListener('click', () => this.closeChat());

        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        this.elements.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleCreateRoom();
        });
        
        this.elements.customRoomInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleCreateRoom();
        });
        
        this.elements.roomInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleJoinRoom();
        });
    }

    handleCreateRoom() {
        const username = this.elements.usernameInput.value.trim();
        const customRoomId = this.elements.customRoomInput.value.trim();
        
        if (!username) {
            this.showAlert('Please enter your username');
            return;
        }
        
        this.emit('createRoom', { username, customRoomId });
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
        this.updateProfileInfo();
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
        this.popup.showError(message);
    }

    showSuccess(message) {
        this.popup.showSuccess(message);
    }

    showInfo(message) {
        this.popup.showInfo(message);
    }

    showLoading(message) {
        return this.popup.showLoading(message);
    }

    getInitialRoomFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('room');
    }

    addClickEffect(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
    
    goToHistory() {
        window.location.href = '/history.html';
    }
    
    toggleProfileDropdown() {
        this.elements.profileDropdown?.classList.toggle('hidden');
        this.elements.profileBtn?.classList.toggle('active');
    }
    
    closeProfileDropdown() {
        this.elements.profileDropdown?.classList.add('hidden');
        this.elements.profileBtn?.classList.remove('active');
    }
    
    toggleJoinProfileDropdown() {
        this.elements.joinProfileDropdown?.classList.toggle('hidden');
        this.elements.joinProfileBtn?.classList.toggle('active');
    }
    
    closeJoinProfileDropdown() {
        this.elements.joinProfileDropdown?.classList.add('hidden');
        this.elements.joinProfileBtn?.classList.remove('active');
    }
    
    updateProfileInfo() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.username) {
            this.elements.profileUsername.textContent = user.username;
            this.elements.profileName.textContent = user.username;
            this.elements.profileEmail.textContent = user.email || 'No email';
            this.elements.joinProfileUsername.textContent = user.username;
        }
    }
    
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }
}

export default UIManager;