const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middlewares/auth');

// Delete comment by id
router.delete('/:id', auth, commentController.deleteComment);

module.exports = router;
