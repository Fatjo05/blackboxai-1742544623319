# Modern Streaming Application

A full-featured streaming application built with modern web technologies that supports video recording, live preview, playback, and recording history management.

## Features

- 📹 Live video recording with camera preview
- ⏯️ Video playback controls (play, pause, stop)
- 📥 Download recordings
- 📚 Recording history management
- 🔐 User authentication
- 💅 Modern, responsive UI with Tailwind CSS
- 🎨 Clean animations and transitions
- ⌨️ Keyboard shortcuts support

## Tech Stack

- Frontend:
  - HTML5
  - Tailwind CSS for styling
  - JavaScript (ES6+)
  - MediaRecorder API for video recording
  - Web Storage API for local data persistence
  - Google Fonts & Font Awesome icons

- Backend:
  - Node.js
  - Express.js
  - Multer for file uploads
  - CORS support

## Prerequisites

- Node.js (v14 or higher)
- Modern web browser with MediaRecorder API support
- Webcam and microphone access

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd streaming-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Usage

### Recording

1. Click the "Record" button to start recording
2. Use "Pause" to temporarily pause recording
3. Use "Resume" to continue recording
4. Click "Stop" to end the recording
5. Use "Download" to save the recording locally

### Keyboard Shortcuts

- `Ctrl/Cmd + R`: Start/Stop recording
- `Spacebar`: Play/Pause video playback
- `Esc`: Close modals

### Authentication

- Click the "Login" button to access authenticated features
- Demo mode accepts any valid email/password combination

## Project Structure

```
streaming-app/
├── index.html           # Main HTML file
├── style.css           # Custom styles
├── app.js             # Main application logic
├── components/        # Frontend components
│   ├── recorder.js   # Video recording functionality
│   ├── player.js     # Video playback controls
│   └── history.js    # Recording history management
├── server.js         # Express backend server
├── uploads/          # Directory for stored recordings
└── package.json      # Project dependencies
```

## API Endpoints

- `POST /upload`: Upload a recording
- `GET /history`: Get list of recordings
- `DELETE /recording/:id`: Delete a recording

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development

To run the application in development mode with auto-reload:

```bash
npm run dev
```

## Error Handling

The application includes comprehensive error handling for:
- Media device access
- Recording operations
- File operations
- Network requests
- Authentication

## Security Considerations

- File upload validation
- CORS configuration
- Input sanitization
- Secure file storage

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.