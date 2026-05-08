const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const defectRoutes = require('./routes/defectRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// Configure CORS to allow frontend origin (set FRONTEND_URL in env for deployed frontend)
const allowedOrigins = [];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
// common dev origins
allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ ok: true, time: new Date() }));

app.use('/api/auth', authRoutes);
app.use('/api/defects', defectRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/comments', commentRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Generic error handler - return JSON for errors (including Multer errors)
app.use((err, req, res, next) => {
	console.error('Unhandled error:', err && err.message ? err.message : err);
	if (err && err.code && (err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE')) {
		return res.status(400).json({ error: err.message || 'File upload error' });
	}
	if (err && err.message && err.message.toLowerCase().includes('invalid file type')) {
		return res.status(400).json({ error: 'Invalid file type' });
	}
	if (err && err.name === 'MulterError') {
		return res.status(400).json({ error: err.message });
	}
	const status = err && err.status && Number(err.status) ? Number(err.status) : 500;
	const message = err && err.message ? err.message : 'Server error';
	res.status(status).json({ error: message });
});

module.exports = app;
