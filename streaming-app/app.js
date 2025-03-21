class StreamApp {
    constructor() {
        this.isAuthenticated = false;
        
        // DOM Elements
        this.loginBtn = document.getElementById('loginBtn');
        this.loginModal = document.getElementById('loginModal');
        this.loginSubmitBtn = document.getElementById('loginSubmitBtn');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        
        // Bind methods
        this.toggleLoginModal = this.toggleLoginModal.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        
        // Initialize
        this.initializeEventListeners();
        this.checkAuthStatus();
    }

    initializeEventListeners() {
        // Login button click
        this.loginBtn.addEventListener('click', this.toggleLoginModal);
        
        // Login form submission
        this.loginSubmitBtn.addEventListener('click', this.handleLogin);
        
        // Close modal when clicking outside
        window.addEventListener('click', this.handleOutsideClick);
        
        // Handle keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.loginModal.classList.contains('hidden')) {
                this.toggleLoginModal();
            }
            if (e.key === 'Enter' && !this.loginModal.classList.contains('hidden')) {
                this.handleLogin();
            }
        });
    }

    toggleLoginModal() {
        this.loginModal.classList.toggle('hidden');
        if (!this.loginModal.classList.contains('hidden')) {
            this.emailInput.focus();
        }
    }

    async handleLogin() {
        try {
            const email = this.emailInput.value.trim();
            const password = this.passwordInput.value;

            if (!email || !password) {
                throw new Error('Please enter both email and password');
            }

            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 1000));

            // For demo purposes, accept any valid email/password
            this.isAuthenticated = true;
            localStorage.setItem('isAuthenticated', 'true');
            
            // Update UI
            this.updateAuthUI();
            this.toggleLoginModal();
            this.showStatus('Successfully logged in', 'success');
            
            // Clear form
            this.emailInput.value = '';
            this.passwordInput.value = '';

        } catch (error) {
            console.error('Login error:', error);
            this.showStatus(error.message, 'error');
        }
    }

    handleOutsideClick(event) {
        if (event.target === this.loginModal) {
            this.toggleLoginModal();
        }
    }

    checkAuthStatus() {
        this.isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        this.updateAuthUI();
    }

    updateAuthUI() {
        if (this.isAuthenticated) {
            this.loginBtn.innerHTML = '<i class="fas fa-sign-out-alt mr-2"></i>Logout';
            this.loginBtn.onclick = () => {
                localStorage.removeItem('isAuthenticated');
                this.isAuthenticated = false;
                this.updateAuthUI();
                this.showStatus('Successfully logged out', 'success');
            };
        } else {
            this.loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Login';
            this.loginBtn.onclick = this.toggleLoginModal;
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showStatus(message, type) {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = message;
        statusElement.className = `fixed bottom-4 right-4 p-4 rounded-md shadow-lg status-message ${type}`;
        statusElement.classList.remove('hidden');

        // Hide the message after 3 seconds
        setTimeout(() => {
            statusElement.classList.add('hidden');
        }, 3000);
    }
}

// Initialize the main app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.streamApp = new StreamApp();

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Only handle shortcuts when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Ctrl/Cmd + R to start/stop recording
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            const recordBtn = document.getElementById('recordBtn');
            if (recordBtn && !recordBtn.disabled) {
                recordBtn.click();
            }
        }

        // Spacebar to play/pause
        if (e.code === 'Space' && window.streamPlayer) {
            e.preventDefault();
            if (window.streamPlayer.isPlaying) {
                window.streamPlayer.pauseVideo();
            } else {
                window.streamPlayer.playVideo();
            }
        }
    });

    // Handle beforeunload event
    window.addEventListener('beforeunload', (e) => {
        // Check if recording is in progress
        if (window.streamRecorder && window.streamRecorder.isRecording) {
            e.preventDefault();
            e.returnValue = 'Recording is still in progress. Are you sure you want to leave?';
        }
    });
});