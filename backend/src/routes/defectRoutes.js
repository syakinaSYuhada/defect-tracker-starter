const express = require('express');
const router = express.Router();
const { listDefects, createDefect, getDefect } = require('../controllers/defectController');
const commentController = require('../controllers/commentController');
const auth = require('../middlewares/auth');

router.get('/', listDefects);
router.post('/', createDefect);
router.get('/:id', getDefect);
// Comments under a defect
router.get('/:id/comments', commentController.listByDefect);
router.post('/:id/comments', auth, commentController.createForDefect);

module.exports = router;
