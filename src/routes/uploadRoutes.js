const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

const storage = multer.memoryStorage();
const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const upload = multer({
	storage,
	limits: { fileSize: FILE_SIZE_LIMIT },
	fileFilter: (req, file, cb) => {
		if (ALLOWED_MIMETYPES.includes(file.mimetype)) cb(null, true);
		else cb(new Error('Invalid file type'));
	}
});

const auth = require('../middlewares/auth');

// rate limiter: limit uploads per user
const rateLimit = require('express-rate-limit');
const uploadLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 10, // max 10 uploads per minute per user
	keyGenerator: (req) => (req.user && req.user.id) ? String(req.user.id) : req.ip,
	standardHeaders: true,
	legacyHeaders: false
});

const validate = require('../validators/validate');
const { createAttachmentSchema } = require('../validators/attachment.validator');

router.post('/', auth, uploadLimiter, upload.single('file'), validate(createAttachmentSchema), uploadController.uploadFile);

// List attachments for a defect
router.get('/defect/:id', auth, uploadController.listByDefect);

// Delete an attachment (uploader or admin)
router.delete('/:id', auth, uploadController.deleteAttachment);

module.exports = router;
