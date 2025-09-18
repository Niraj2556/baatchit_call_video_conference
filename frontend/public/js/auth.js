class AuthManager {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.checkAuth();
        this.setupPopupManager();
    this.setupUsernameCheck();
        this.usernameCheckTimeout = null;
    }
    
    setupPopupManager() {
        // Create popup container if it doesn't exist
        if (!document.querySelector('.popup-container')) {
            const container = document.createElement('div');
            container.className = 'popup-container';
            document.body.appendChild(container);
        }
    }
    
    showPopup(message, type = 'error') {
        const container = document.querySelector('.popup-container');
        const popup = document.createElement('div');
        popup.className = `popup popup-${type}`;
        
        const iconMap = {
            error: 'fas fa-exclamation-circle',
            success: 'fas fa-check-circle',
            info: 'fas fa-info-circle'
        };
        
        popup.innerHTML = `
            <div class="popup-content">
                <i class="popup-icon ${iconMap[type]}"></i>
                <div class="popup-message">${message}</div>
                <button class="popup-close">&times;</button>
            </div>
        `;
        
        container.appendChild(popup);
        
        // Show popup
        setTimeout(() => popup.classList.add('show'), 100);
        
        // Auto hide after 4 seconds
        setTimeout(() => this.hidePopup(popup), 4000);
        
        // Close button handler
        popup.querySelector('.popup-close').addEventListener('click', () => this.hidePopup(popup));
    }
    
    hidePopup(popup) {
        popup.classList.add('hide');
        setTimeout(() => popup.remove(), 400);
    }
    
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    validatePassword(password) {
        return password.length >= 4;
    }
    
    validateUsername(username) {
        return username.length >= 2;
    }

    initializeElements() {
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.loginBtn = document.getElementById('loginBtn');
        this.registerBtn = document.getElementById('registerBtn');
        this.authLogoutBtn = document.getElementById('authLogoutBtn');
    }

    setupEventListeners() {
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        this.loginBtn.addEventListener('click', () => this.handleLogin());
        this.registerBtn.addEventListener('click', () => this.handleRegister());
        this.authLogoutBtn?.addEventListener('click', () => this.handleLogout());
        
        // Enter key handlers
        this.loginForm.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
        this.registerForm.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleRegister();
        });
        
        // Password toggle handlers
        this.setupPasswordToggles();
        
        // Setup username checking after DOM is ready
        // setTimeout(() => this.setupUsernameCheck(), 100);
    }

    switchTab(tab) {
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        if (tab === 'login') {
            this.loginForm.classList.remove('hidden');
            this.registerForm.classList.add('hidden');
        } else {
            this.loginForm.classList.add('hidden');
            this.registerForm.classList.remove('hidden');
        }
    }

    async handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!username || !password) {
            this.showPopup('Please fill all fields');
            return;
        }
        
        if (!this.validateUsername(username)) {
            this.showPopup('Username must be at least 2 characters');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/';
            } else {
                this.showPopup(data.error);
            }
        } catch (error) {
            this.showPopup('Login failed. Please try again.');
        }
    }

    async handleRegister() {
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        if (!username || !email || !password || !confirmPassword) {
            this.showPopup('Please fill all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showPopup('Passwords do not match');
            return;
        }
        
        if (!this.validateUsername(username)) {
            this.showPopup('Username must be at least 2 characters');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showPopup('Please enter a valid email address');
            return;
        }
        
        if (!this.validatePassword(password)) {
            this.showPopup('Password must be at least 4 characters long');
            return;
        }
        
    // Username availability check removed; rely on /api/auth/register error

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/';
            } else {
                if (data.error.includes('E11000') && data.error.includes('username')) {
                    this.showPopup('Username is already taken. Please choose another one.');
                } else if (data.error.includes('E11000') && data.error.includes('email')) {
                    this.showPopup('Email is already registered. Please use another email.');
                } else {
                    this.showPopup(data.error);
                }
            }
        } catch (error) {
            this.showPopup('Registration failed. Please try again.');
        }
    }
    
    setupPasswordToggles() {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                const passwordInput = document.getElementById(targetId);
                const icon = button.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    setupUsernameCheck() {
        const usernameInput = document.getElementById('registerUsername');
        if (!usernameInput) return;

        // Create or reuse status text element
        let statusText = usernameInput.parentNode.querySelector('.username-status-text');
        if (!statusText) {
            statusText = document.createElement('div');
            statusText.className = 'username-status-text';
            statusText.style.cssText = 'font-size: 0.75rem; margin-top: 4px; min-height: 16px; color: rgba(255,255,255,0.7);';
            usernameInput.parentNode.appendChild(statusText);
        }

        usernameInput.addEventListener('input', (e) => {
            const username = e.target.value.trim();

            if (this.usernameCheckTimeout) {
                clearTimeout(this.usernameCheckTimeout);
            }

            statusText.textContent = '';
            statusText.style.color = 'rgba(255,255,255,0.7)';

            if (username.length >= 2) {
                statusText.textContent = 'Checking availability...';
                statusText.style.color = '#ff9800';

                this.usernameCheckTimeout = setTimeout(async () => {
                    try {
                        const response = await fetch('http://localhost:3000/api/auth/check-username', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username })
                        });
                        const data = await response.json();
                        if (data.available) {
                            statusText.textContent = '✓ Username available';
                            statusText.style.color = '#4CAF50';
                        } else {
                            statusText.textContent = '✗ Username already taken';
                            statusText.style.color = '#f44336';
                        }
                    } catch (error) {
                        statusText.textContent = '';
                    }
                }, 2000); // 2 seconds debounce
            }
        });
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            // Show logout button if user is logged in
            this.authLogoutBtn?.classList.remove('hidden');
        }
    }
    
    handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.authLogoutBtn?.classList.add('hidden');
        this.showPopup('Logged out successfully', 'success');
    }
}

new AuthManager();