class StreamPlayer {
    constructor() {
        this.currentVideo = null;
        this.isPlaying = false;
        
        // DOM Elements
        this.preview = document.getElementById('preview');
        
        // Bind methods
        this.playVideo = this.playVideo.bind(this);
        this.pauseVideo = this.pauseVideo.bind(this);
        this.stopVideo = this.stopVideo.bind(this);
        this.handleError = this.handleError.bind(this);
        
        // Initialize event listeners
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Add event listeners for the video element
        this.preview.addEventListener('play', () => {
            this.isPlaying = true;
            this.updateUI();
        });

        this.preview.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updateUI();
        });

        this.preview.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updateUI();
        });

        this.preview.addEventListener('error', this.handleError);
    }

    async playVideo(videoSource) {
        try {
            // If there's an active stream, stop it first
            if (this.preview.srcObject) {
                const stream = this.preview.srcObject;
                stream.getTracks().forEach(track => track.stop());
                this.preview.srcObject = null;
            }

            // Set the video source
            if (typeof videoSource === 'string') {
                // If videoSource is a URL
                this.preview.src = videoSource;
            } else if (videoSource instanceof Blob) {
                // If videoSource is a Blob
                this.preview.src = URL.createObjectURL(videoSource);
            } else {
                throw new Error('Invalid video source');
            }

            this.currentVideo = videoSource;
            
            // Play the video
            await this.preview.play();
            this.showStatus('Video playback started', 'success');
            
        } catch (error) {
            console.error('Error playing video:', error);
            this.handleError(error);
        }
    }

    async pauseVideo() {
        if (this.isPlaying) {
            try {
                await this.preview.pause();
                this.showStatus('Video paused', 'success');
            } catch (error) {
                console.error('Error pausing video:', error);
                this.handleError(error);
            }
        }
    }

    async stopVideo() {
        try {
            await this.preview.pause();
            this.preview.currentTime = 0;
            this.currentVideo = null;
            this.showStatus('Video stopped', 'success');
        } catch (error) {
            console.error('Error stopping video:', error);
            this.handleError(error);
        }
    }

    // Seek to specific time in the video
    seekTo(time) {
        if (this.preview.duration) {
            this.preview.currentTime = Math.min(Math.max(0, time), this.preview.duration);
        }
    }

    // Get current playback time
    getCurrentTime() {
        return this.preview.currentTime;
    }

    // Get video duration
    getDuration() {
        return this.preview.duration;
    }

    // Set playback speed
    setPlaybackSpeed(speed) {
        if (speed >= 0.25 && speed <= 2) {
            this.preview.playbackRate = speed;
            this.showStatus(`Playback speed set to ${speed}x`, 'success');
        }
    }

    // Toggle mute
    toggleMute() {
        this.preview.muted = !this.preview.muted;
        this.showStatus(this.preview.muted ? 'Audio muted' : 'Audio unmuted', 'success');
    }

    // Set volume (0-1)
    setVolume(volume) {
        if (volume >= 0 && volume <= 1) {
            this.preview.volume = volume;
        }
    }

    // Handle video errors
    handleError(error) {
        let errorMessage = 'An error occurred during playback';
        
        if (error.message) {
            errorMessage = error.message;
        } else if (this.preview.error) {
            switch (this.preview.error.code) {
                case 1:
                    errorMessage = 'Video loading aborted';
                    break;
                case 2:
                    errorMessage = 'Network error occurred';
                    break;
                case 3:
                    errorMessage = 'Video decoding failed';
                    break;
                case 4:
                    errorMessage = 'Video not supported';
                    break;
            }
        }
        
        this.showStatus(errorMessage, 'error');
    }

    updateUI() {
        // Update UI elements based on playback state
        if (this.isPlaying) {
            // Add any UI updates for playing state
            this.preview.classList.add('playing');
        } else {
            // Add any UI updates for paused state
            this.preview.classList.remove('playing');
        }
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

    // Clean up resources
    destroy() {
        if (this.preview.src.startsWith('blob:')) {
            URL.revokeObjectURL(this.preview.src);
        }
        this.preview.removeEventListener('error', this.handleError);
        this.currentVideo = null;
    }
}

// Initialize the player when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.streamPlayer = new StreamPlayer();
});