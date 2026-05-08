const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const defectRoutes = require('./routes/defectRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

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

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = app;
