class CallHistoryManager {
    constructor() {
        this.checkAuth();
        this.initializeElements();
        this.setupEventListeners();
        this.loadCallHistory();
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/auth.html';
            return;
        }
    }

    initializeElements() {
        this.backBtn = document.getElementById('backBtn');
        this.historyContainer = document.getElementById('historyContainer');
    }

    setupEventListeners() {
        this.backBtn.addEventListener('click', () => {
            window.location.href = '/';
        });


    }

    async loadCallHistory() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/auth/call-history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.displayCallHistory(data.callHistory);
            } else {
                this.historyContainer.innerHTML = '<div class="error">Failed to load call history</div>';
            }
        } catch (error) {
            this.historyContainer.innerHTML = '<div class="error">Error loading call history</div>';
        }
    }

    displayCallHistory(callHistory) {
        if (callHistory.length === 0) {
            this.historyContainer.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-phone-slash"></i>
                    <h3>No Call History</h3>
                    <p>You haven't made any calls yet.</p>
                </div>
            `;
            return;
        }

        const historyHTML = callHistory.map(call => {
            const startTime = new Date(call.startTime);
            const duration = this.formatDuration(call.duration || 0);
            const participantNames = call.participants.map(p => p.username).join(', ');
            
            return `
                <div class="history-item">
                    <div class="history-icon">
                        <i class="fas fa-video"></i>
                    </div>
                    <div class="history-details">
                        <div class="history-title">Room: ${call.roomId}</div>
                        <div class="history-participants">
                            <i class="fas fa-users"></i> ${participantNames}
                        </div>
                        <div class="history-meta">
                            <span><i class="fas fa-calendar"></i> ${startTime.toLocaleDateString()}</span>
                            <span><i class="fas fa-clock"></i> ${startTime.toLocaleTimeString()}</span>
                            <span><i class="fas fa-stopwatch"></i> ${duration}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.historyContainer.innerHTML = historyHTML;
    }

    formatDuration(seconds) {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }
}

new CallHistoryManager();