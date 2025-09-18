class PopupManager {
    constructor() {
        this.createPopupContainer();
    }

    createPopupContainer() {
        if (document.getElementById('popup-container')) return;
        
        const container = document.createElement('div');
        container.id = 'popup-container';
        container.className = 'popup-container';
        document.body.appendChild(container);
    }

    showSuccess(message, duration = 3000) {
        this.showPopup(message, 'success', duration);
    }

    showError(message, duration = 4000) {
        this.showPopup(message, 'error', duration);
    }

    showInfo(message, duration = 3000) {
        this.showPopup(message, 'info', duration);
    }

    showLoading(message) {
        return this.showPopup(message, 'loading', 0);
    }

    showPopup(message, type, duration) {
        const popup = document.createElement('div');
        popup.className = `popup popup-${type}`;
        
        const icon = this.getIcon(type);
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-icon">${icon}</div>
                <div class="popup-message">${message}</div>
                ${type !== 'loading' ? '<button class="popup-close">&times;</button>' : ''}
            </div>
        `;

        const container = document.getElementById('popup-container');
        container.appendChild(popup);

        // Animate in
        setTimeout(() => popup.classList.add('show'), 10);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => this.removePopup(popup), duration);
        }

        // Close button
        const closeBtn = popup.querySelector('.popup-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.removePopup(popup);
        }

        return popup;
    }

    removePopup(popup) {
        popup.classList.add('hide');
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 300);
    }

    getIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            info: '<i class="fas fa-info-circle"></i>',
            loading: '<i class="fas fa-spinner fa-spin"></i>'
        };
        return icons[type] || icons.info;
    }
}

export default PopupManager;