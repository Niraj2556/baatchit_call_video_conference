import WebRTCManager from './modules/webrtcManager.js';
import ChatManager from './modules/chatManager.js';
import UIManager from './modules/uiManager.js';
import { EVENTS, MESSAGE_TYPES, CONFIG } from './utils/constants.js';

class VideoCallApp {
    constructor() {
        this.checkAuth();
        this.socket = io(CONFIG.BACKEND_URL);
        this.webrtc = new WebRTCManager();
        this.chat = new ChatManager();
        this.ui = new UIManager();
        
        this.currentRoom = null;
        this.currentUsername = null;
        this.participants = [];
        
        this.initialize();
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/auth.html';
            return false;
        }
        return true;
    }

    initialize() {
        this.setupEventListeners();
        this.initializeFromURL();
    }

    setupEventListeners() {
        // UI Events
        this.ui.on('createRoom', (data) => this.createRoom(data));
        this.ui.on('joinRoom', (data) => this.joinRoom(data));
        this.ui.on('leaveRoom', () => this.leaveRoom());
        this.ui.on('toggleMic', () => this.toggleMicrophone());
        this.ui.on('toggleCamera', () => this.toggleCamera());
        this.ui.on('sendMessage', (message) => this.sendChatMessage(message));
        this.ui.on('chatToggled', (isOpen) => this.chat.setOpen(isOpen));

        // WebRTC Events
        this.webrtc.on('localStreamReady', (stream) => this.ui.setLocalVideo(stream));
        this.webrtc.on('remoteStream', ({ userId, stream }) => this.handleRemoteStream(userId, stream));
        this.webrtc.on('iceCandidate', ({ userId, candidate }) => {
            this.socket.emit(EVENTS.ICE_CANDIDATE, { target: userId, candidate });
        });
        this.webrtc.on('error', (error) => console.error('WebRTC Error:', error));
        this.webrtc.on('connectionLost', ({ userId, state }) => this.handleConnectionLost(userId, state));
        this.webrtc.on('streamEnded', ({ trackKind }) => this.handleStreamEnded(trackKind));

        // Chat Events
        this.chat.on('messageAdded', (message) => {
            this.ui.addChatMessage(message.username, message.message, message.type);
            if (!this.chat.isOpen && message.type !== MESSAGE_TYPES.SYSTEM) {
                this.ui.updateChatBadge(this.chat.getUnreadCount());
            }
        });
        this.chat.on('unreadCleared', () => this.ui.updateChatBadge(0));

        // Socket Events
        this.setupSocketListeners();
    }

    setupSocketListeners() {
        this.socket.on('room-created', (data) => this.handleRoomCreated(data));
        this.socket.on('room-joined', (data) => this.handleRoomJoined(data));
        this.socket.on('room-error', (data) => this.handleRoomError(data));
        this.socket.on(EVENTS.USER_JOINED, (data) => this.handleUserJoined(data));
        this.socket.on(EVENTS.EXISTING_USERS, (users) => this.handleExistingUsers(users));
        this.socket.on(EVENTS.USER_LEFT, (userId) => this.handleUserLeft(userId));
        this.socket.on(EVENTS.ROOM_USERS, (users) => this.updateParticipants(users));
        this.socket.on(EVENTS.OFFER, (data) => this.handleOffer(data));
        this.socket.on(EVENTS.ANSWER, (data) => this.handleAnswer(data));
        this.socket.on(EVENTS.ICE_CANDIDATE, (data) => this.handleIceCandidate(data));
        this.socket.on(EVENTS.CHAT_MESSAGE, (data) => this.handleChatMessage(data));
        this.socket.on(EVENTS.MUTE_STATUS, (data) => this.handleMuteStatus(data));
        this.socket.on('disconnect', () => this.handleDisconnect());
    }

    initializeFromURL() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.username) {
            this.ui.elements.usernameInput.value = user.username;
        }
        
        // Initialize profile info on join screen
        this.ui.updateProfileInfo();
        
        const roomFromUrl = this.ui.getInitialRoomFromURL();
        if (roomFromUrl) {
            this.ui.elements.roomInput.value = roomFromUrl;
        }
    }

    async createRoom({ username, customRoomId }) {
        const loadingPopup = this.ui.showLoading('Setting up your camera and microphone...');
        
        try {
            await this.webrtc.initializeLocalStream();
            
            this.currentUsername = username;
            this.ui.popup.removePopup(loadingPopup);
            
            const creatingPopup = this.ui.showLoading('Creating room...');
            this.socket.emit('create-room', { username, customRoomId });
            
            // Remove loading popup after a delay if no response
            setTimeout(() => {
                if (creatingPopup.parentNode) {
                    this.ui.popup.removePopup(creatingPopup);
                }
            }, 5000);
            
        } catch (error) {
            console.error('Error creating room:', error);
            this.ui.popup.removePopup(loadingPopup);
            this.ui.showAlert('Could not access camera/microphone. Please check your permissions.');
        }
    }

    async joinRoom({ username, roomId }) {
        const loadingPopup = this.ui.showLoading('Setting up your camera and microphone...');
        
        try {
            await this.webrtc.initializeLocalStream();
            
            this.currentUsername = username;
            this.ui.popup.removePopup(loadingPopup);
            
            const joiningPopup = this.ui.showLoading(`Joining room ${roomId}...`);
            this.socket.emit('join-room', { roomId, username });
            
            // Remove loading popup after a delay if no response
            setTimeout(() => {
                if (joiningPopup.parentNode) {
                    this.ui.popup.removePopup(joiningPopup);
                }
            }, 5000);
            
        } catch (error) {
            console.error('Error joining room:', error);
            this.ui.popup.removePopup(loadingPopup);
            this.ui.showAlert('Could not access camera/microphone. Please check your permissions.');
        }
    }

    handleRoomCreated({ roomId, isCreator }) {
        this.currentRoom = roomId;
        this.ui.showMainApp(roomId);
        this.ui.showSuccess(`Room created successfully! ID: ${roomId}`);
        this.chat.addMessage('System', `Room created successfully! Share this ID: ${roomId}`, MESSAGE_TYPES.SYSTEM);
    }

    handleRoomJoined({ roomId, isCreator }) {
        this.currentRoom = roomId;
        this.ui.showMainApp(roomId);
        this.ui.showSuccess(`Successfully joined room: ${roomId}`);
        this.chat.addMessage('System', 'You joined the room', MESSAGE_TYPES.SYSTEM);
    }

    handleRoomError({ error }) {
        this.ui.showAlert(error);
    }

    leaveRoom() {
        this.webrtc.cleanup();
        this.socket.disconnect();
        this.showRatingPopup();
    }

    handleDisconnect() {
        this.showRatingPopup();
    }
    
    returnToHome() {
        // Clean up everything
        this.webrtc.cleanup();
        if (this.socket.connected) {
            this.socket.disconnect();
        }
        
        // Reset state
        this.currentRoom = null;
        this.currentUsername = null;
        this.participants = [];
        
        // Navigate to home
        this.ui.showJoinScreen();
        
        // Reconnect socket for next session
        setTimeout(() => {
            this.socket = io(CONFIG.BACKEND_URL);
            this.setupSocketListeners();
        }, 1000);
    }

    async handleUserJoined({ id, username }) {
        const peerConnection = this.webrtc.createPeerConnection(id);
        const offer = await this.webrtc.createOffer(id);
        
        if (offer) {
            this.socket.emit(EVENTS.OFFER, { target: id, offer });
        }
        
        this.ui.showInfo(`${username} joined the room`);
        this.chat.addMessage('System', `${username} joined the room`, MESSAGE_TYPES.SYSTEM);
    }

    async handleExistingUsers(users) {
        for (const user of users) {
            this.webrtc.createPeerConnection(user.id);
        }
    }

    handleUserLeft(data) {
        const userId = data.userId || data;
        const username = data.username || 'Unknown user';
        
        this.webrtc.closePeerConnection(userId);
        this.ui.removeRemoteVideo(userId);
        
        this.ui.showAlert(`${username} left the call`);
        this.chat.addMessage('System', `${username} left the room`, MESSAGE_TYPES.SYSTEM);
        
        // If only one person left, end the call
        if (this.participants.length <= 2) {
            this.showRatingPopup();
        }
    }

    updateParticipants(users) {
        this.participants = users;
        this.ui.updateParticipantCount(users.length);
    }

    async handleOffer({ offer, sender }) {
        const answer = await this.webrtc.createAnswer(sender, offer);
        if (answer) {
            this.socket.emit(EVENTS.ANSWER, { target: sender, answer });
        }
    }

    async handleAnswer({ answer, sender }) {
        await this.webrtc.handleAnswer(sender, answer);
    }

    async handleIceCandidate({ candidate, sender }) {
        await this.webrtc.addIceCandidate(sender, candidate);
    }

    handleRemoteStream(userId, stream) {
        const participant = this.participants.find(p => p.id === userId);
        const username = participant ? participant.username : 'Unknown';
        this.ui.createRemoteVideo(userId, username, stream);
    }

    handleChatMessage({ username, message, timestamp }) {
        this.chat.addMessage(username, message, MESSAGE_TYPES.USER);
    }

    handleMuteStatus({ username, userId, isMuted }) {
        // Update UI to show mute status for remote user
        const micElement = document.getElementById(`mic-${userId}`);
        if (micElement) {
            micElement.classList.toggle('muted', isMuted);
            micElement.innerHTML = isMuted ? 
                '<i class="fas fa-microphone-slash"></i>' : 
                '<i class="fas fa-microphone"></i>';
        }
    }

    sendChatMessage(message) {
        this.socket.emit(EVENTS.CHAT_MESSAGE, { message });
    }

    toggleMicrophone() {
        const isMuted = this.webrtc.toggleMicrophone();
        this.ui.updateMicButton(isMuted);
        
        this.socket.emit(EVENTS.MUTE_STATUS, {
            username: this.currentUsername,
            isMuted
        });
    }

    toggleCamera() {
        const isOff = this.webrtc.toggleCamera();
        this.ui.updateCameraButton(isOff);
    }

    handleConnectionLost(userId, state) {
        console.log(`Connection lost with user ${userId}: ${state}`);
        
        // If connection is completely failed, end the call
        if (state === 'failed') {
            this.showRatingPopup();
        }
    }

    handleStreamEnded(trackKind) {
        console.log(`${trackKind} track ended`);
        this.showRatingPopup();
    }

    showRatingPopup() {
        // Prevent multiple popups
        if (document.querySelector('.rating-popup-overlay')) return;
        
        const popup = document.createElement('div');
        popup.className = 'rating-popup-overlay';
        popup.innerHTML = `
            <div class="rating-popup">
                <h3>Rate Your Call Experience</h3>
                <div class="rating-stars">
                    <span class="star" data-rating="1">★</span>
                    <span class="star" data-rating="2">★</span>
                    <span class="star" data-rating="3">★</span>
                    <span class="star" data-rating="4">★</span>
                    <span class="star" data-rating="5">★</span>
                </div>
                <textarea placeholder="Optional feedback..." id="ratingComment" maxlength="500"></textarea>
                <div class="rating-buttons">
                    <button id="skipRating" class="btn-secondary">Skip</button>
                    <button id="submitRating" class="btn-primary" disabled>Submit</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        let selectedRating = 0;
        
        // Star rating logic
        popup.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.rating);
                popup.querySelectorAll('.star').forEach((s, i) => {
                    s.classList.toggle('selected', i < selectedRating);
                });
                popup.querySelector('#submitRating').disabled = false;
            });
        });
        
        // Submit rating
        popup.querySelector('#submitRating').addEventListener('click', () => {
            // Show success animation
            popup.querySelector('.rating-popup').innerHTML = `
                <div class="rating-success">
                    <i class="fas fa-check-circle"></i>
                    <h3>Thank You!</h3>
                    <p>Your feedback helps us improve</p>
                </div>
            `;
            
            setTimeout(() => {
                popup.classList.add('fade-out');
                setTimeout(() => {
                    popup.remove();
                    this.returnToHome();
                }, 500);
            }, 1500);
        });
        
        // Skip rating
        popup.querySelector('#skipRating').addEventListener('click', () => {
            popup.classList.add('fade-out');
            setTimeout(() => {
                popup.remove();
                this.returnToHome();
            }, 300);
        });
        
        // Prevent popup from closing accidentally
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                e.stopPropagation();
            }
        });
    }
    


    returnToHome() {
        // Clean up everything
        this.webrtc.cleanup();
        if (this.socket.connected) {
            this.socket.disconnect();
        }
        
        // Reset state
        this.currentRoom = null;
        this.currentUsername = null;
        this.participants = [];
        
        // Navigate to home
        window.location.href = '/';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VideoCallApp();
});