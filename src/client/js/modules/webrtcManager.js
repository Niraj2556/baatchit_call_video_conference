import { CONFIG } from '../utils/constants.js';
import { EventEmitter } from '../utils/eventEmitter.js';

class WebRTCManager extends EventEmitter {
    constructor() {
        super();
        this.localStream = null;
        this.peerConnections = {};
        this.iceServers = CONFIG.ICE_SERVERS;
    }

    async initializeLocalStream() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            this.emit('localStreamReady', this.localStream);
            return this.localStream;
        } catch (error) {
            this.emit('error', { type: 'media', error });
            throw error;
        }
    }

    createPeerConnection(userId) {
        const peerConnection = new RTCPeerConnection(this.iceServers);
        
        this.localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, this.localStream);
        });

        peerConnection.ontrack = (event) => {
            this.emit('remoteStream', { userId, stream: event.streams[0] });
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.emit('iceCandidate', { userId, candidate: event.candidate });
            }
        };

        peerConnection.onconnectionstatechange = () => {
            this.emit('connectionStateChange', { 
                userId, 
                state: peerConnection.connectionState 
            });
        };

        this.peerConnections[userId] = peerConnection;
        return peerConnection;
    }

    async createOffer(userId) {
        const peerConnection = this.peerConnections[userId];
        if (!peerConnection) return;

        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            return offer;
        } catch (error) {
            this.emit('error', { type: 'offer', error, userId });
        }
    }

    async createAnswer(userId, offer) {
        const peerConnection = this.peerConnections[userId];
        if (!peerConnection) return;

        try {
            await peerConnection.setRemoteDescription(offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            return answer;
        } catch (error) {
            this.emit('error', { type: 'answer', error, userId });
        }
    }

    async handleAnswer(userId, answer) {
        const peerConnection = this.peerConnections[userId];
        if (!peerConnection) return;

        try {
            await peerConnection.setRemoteDescription(answer);
        } catch (error) {
            this.emit('error', { type: 'handleAnswer', error, userId });
        }
    }

    async addIceCandidate(userId, candidate) {
        const peerConnection = this.peerConnections[userId];
        if (!peerConnection) return;

        try {
            await peerConnection.addIceCandidate(candidate);
        } catch (error) {
            this.emit('error', { type: 'iceCandidate', error, userId });
        }
    }

    toggleMicrophone() {
        if (!this.localStream) return false;
        
        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            return !audioTrack.enabled;
        }
        return false;
    }

    toggleCamera() {
        if (!this.localStream) return false;
        
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            return !videoTrack.enabled;
        }
        return false;
    }

    closePeerConnection(userId) {
        if (this.peerConnections[userId]) {
            this.peerConnections[userId].close();
            delete this.peerConnections[userId];
        }
    }

    cleanup() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        
        Object.values(this.peerConnections).forEach(pc => pc.close());
        this.peerConnections = {};
    }
}

export default WebRTCManager;