class StreamRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.stream = null;
        this.isRecording = false;
        this.isPaused = false;
        
        // DOM Elements
        this.preview = document.getElementById('preview');
        this.recordBtn = document.getElementById('recordBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.downloadBtn = document.getElementById('downloadBtn');

        // Bind methods
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.pauseRecording = this.pauseRecording.bind(this);
        this.resumeRecording = this.resumeRecording.bind(this);
        this.downloadRecording = this.downloadRecording.bind(this);
        this.handleDataAvailable = this.handleDataAvailable.bind(this);
        
        // Initialize event listeners
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.recordBtn.addEventListener('click', this.startRecording);
        this.stopBtn.addEventListener('click', this.stopRecording);
        this.pauseBtn.addEventListener('click', this.pauseRecording);
        this.resumeBtn.addEventListener('click', this.resumeRecording);
        this.downloadBtn.addEventListener('click', this.downloadRecording);
    }

    async startRecording() {
        try {
            // Request access to media devices
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Set up preview
            this.preview.srcObject = this.stream;
            await this.preview.play();

            // Initialize MediaRecorder
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'video/webm;codecs=vp9,opus'
            });

            // Set up event handlers
            this.mediaRecorder.ondataavailable = this.handleDataAvailable;
            this.mediaRecorder.onstart = () => {
                this.isRecording = true;
                this.updateUI();
                this.showStatus('Recording started', 'success');
            };
            this.mediaRecorder.onpause = () => {
                this.isPaused = true;
                this.updateUI();
                this.showStatus('Recording paused', 'success');
            };
            this.mediaRecorder.onresume = () => {
                this.isPaused = false;
                this.updateUI();
                this.showStatus('Recording resumed', 'success');
            };
            this.mediaRecorder.onstop = () => {
                this.isRecording = false;
                this.updateUI();
                this.showStatus('Recording stopped', 'success');
            };

            // Start recording
            this.recordedChunks = [];
            this.mediaRecorder.start(1000); // Collect data every second

        } catch (error) {
            console.error('Error starting recording:', error);
            this.showStatus('Failed to start recording: ' + error.message, 'error');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.stream.getTracks().forEach(track => track.stop());
            this.preview.srcObject = null;
        }
    }

    pauseRecording() {
        if (this.mediaRecorder && this.isRecording && !this.isPaused) {
            this.mediaRecorder.pause();
        }
    }

    resumeRecording() {
        if (this.mediaRecorder && this.isRecording && this.isPaused) {
            this.mediaRecorder.resume();
        }
    }

    handleDataAvailable(event) {
        if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
        }
    }

    downloadRecording() {
        if (this.recordedChunks.length === 0) {
            this.showStatus('No recording available to download', 'error');
            return;
        }

        const blob = new Blob(this.recordedChunks, {
            type: 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `recording-${new Date().toISOString()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.showStatus('Recording downloaded successfully', 'success');
    }

    updateUI() {
        // Update button states
        this.recordBtn.disabled = this.isRecording;
        this.stopBtn.disabled = !this.isRecording;
        this.pauseBtn.disabled = !this.isRecording || this.isPaused;
        this.resumeBtn.disabled = !this.isRecording || !this.isPaused;
        this.downloadBtn.disabled = this.isRecording || this.recordedChunks.length === 0;

        // Update recording indicator
        if (this.isRecording && !this.isPaused) {
            this.recordBtn.classList.add('recording-active');
        } else {
            this.recordBtn.classList.remove('recording-active');
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

    // Method to check browser compatibility
    static checkCompatibility() {
        return !!(navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia &&
            window.MediaRecorder &&
            MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus'));
    }
}

// Initialize the recorder when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (StreamRecorder.checkCompatibility()) {
        window.streamRecorder = new StreamRecorder();
    } else {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = 'Your browser does not support video recording';
        statusElement.className = 'fixed bottom-4 right-4 p-4 rounded-md shadow-lg status-message error';
        statusElement.classList.remove('hidden');
    }
});