class StreamHistory {
    constructor() {
        this.recordings = [];
        this.historyList = document.getElementById('historyList');
        
        // Bind methods
        this.addRecording = this.addRecording.bind(this);
        this.renderHistory = this.renderHistory.bind(this);
        this.loadRecording = this.loadRecording.bind(this);
        this.deleteRecording = this.deleteRecording.bind(this);
        
        // Initialize
        this.loadHistoryFromStorage();
        this.renderHistory();
    }

    loadHistoryFromStorage() {
        try {
            const savedHistory = localStorage.getItem('streamHistory');
            if (savedHistory) {
                this.recordings = JSON.parse(savedHistory);
            }
        } catch (error) {
            console.error('Error loading history:', error);
            this.showStatus('Failed to load recording history', 'error');
        }
    }

    saveHistoryToStorage() {
        try {
            localStorage.setItem('streamHistory', JSON.stringify(this.recordings));
        } catch (error) {
            console.error('Error saving history:', error);
            this.showStatus('Failed to save recording history', 'error');
        }
    }

    addRecording(blob, duration) {
        const recording = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            duration: duration,
            size: blob.size,
            blob: blob,
            url: URL.createObjectURL(blob)
        };

        this.recordings.unshift(recording);
        this.saveHistoryToStorage();
        this.renderHistory();
        this.showStatus('Recording added to history', 'success');
    }

    renderHistory() {
        if (!this.historyList) return;

        this.historyList.innerHTML = '';

        if (this.recordings.length === 0) {
            this.historyList.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    <i class="fas fa-history text-4xl mb-2"></i>
                    <p>No recordings yet</p>
                </div>
            `;
            return;
        }

        this.recordings.forEach(recording => {
            const date = new Date(recording.timestamp);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const duration = this.formatDuration(recording.duration);
            const size = this.formatSize(recording.size);

            const recordingElement = document.createElement('div');
            recordingElement.className = 'history-item bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200';
            recordingElement.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-video text-indigo-600"></i>
                            <span class="font-medium text-gray-900">Recording ${date.toLocaleTimeString()}</span>
                        </div>
                        <div class="text-sm text-gray-500 mt-1">
                            <span><i class="far fa-calendar-alt mr-1"></i>${formattedDate}</span>
                            <span class="mx-2">•</span>
                            <span><i class="far fa-clock mr-1"></i>${duration}</span>
                            <span class="mx-2">•</span>
                            <span><i class="far fa-hdd mr-1"></i>${size}</span>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button 
                            class="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-100 transition-colors duration-200"
                            onclick="window.streamHistory.loadRecording('${recording.id}')"
                            title="Play recording">
                            <i class="fas fa-play"></i>
                        </button>
                        <button 
                            class="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors duration-200"
                            onclick="window.streamHistory.deleteRecording('${recording.id}')"
                            title="Delete recording">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;

            this.historyList.appendChild(recordingElement);
        });
    }

    async loadRecording(id) {
        try {
            const recording = this.recordings.find(r => r.id === id);
            if (!recording) {
                throw new Error('Recording not found');
            }

            // Use the StreamPlayer to play the recording
            if (window.streamPlayer) {
                await window.streamPlayer.playVideo(recording.url);
            }
        } catch (error) {
            console.error('Error loading recording:', error);
            this.showStatus('Failed to load recording', 'error');
        }
    }

    deleteRecording(id) {
        try {
            const index = this.recordings.findIndex(r => r.id === id);
            if (index !== -1) {
                // Revoke the blob URL before removing the recording
                URL.revokeObjectURL(this.recordings[index].url);
                this.recordings.splice(index, 1);
                this.saveHistoryToStorage();
                this.renderHistory();
                this.showStatus('Recording deleted', 'success');
            }
        } catch (error) {
            console.error('Error deleting recording:', error);
            this.showStatus('Failed to delete recording', 'error');
        }
    }

    formatDuration(seconds) {
        if (!seconds) return '00:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    formatSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
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
        this.recordings.forEach(recording => {
            URL.revokeObjectURL(recording.url);
        });
        this.recordings = [];
    }
}

// Initialize the history manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.streamHistory = new StreamHistory();
});