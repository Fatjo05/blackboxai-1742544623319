const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 8000;

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `recording-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only video files
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'));
        }
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Routes
app.post('/upload', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const fileData = {
            id: path.parse(req.file.filename).name,
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: `/uploads/${req.file.filename}`,
            timestamp: Date.now()
        };

        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: fileData
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.get('/history', (req, res) => {
    try {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            return res.json([]);
        }

        const files = fs.readdirSync(uploadDir)
            .filter(file => file.startsWith('recording-'))
            .map(filename => {
                const filePath = path.join(uploadDir, filename);
                const stats = fs.statSync(filePath);
                return {
                    id: path.parse(filename).name,
                    filename: filename,
                    path: `/uploads/${filename}`,
                    size: stats.size,
                    timestamp: stats.mtime.getTime()
                };
            })
            .sort((a, b) => b.timestamp - a.timestamp);

        res.json(files);
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve recording history'
        });
    }
});

app.delete('/recording/:id', (req, res) => {
    try {
        const filename = `recording-${req.params.id}`;
        const filePath = path.join(__dirname, 'uploads', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Recording not found'
            });
        }

        fs.unlinkSync(filePath);
        res.json({
            success: true,
            message: 'Recording deleted successfully'
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete recording'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Something went wrong!'
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Upload directory: ${path.join(__dirname, 'uploads')}`);
});