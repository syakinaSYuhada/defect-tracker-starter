const express = require('express');
const router = express.Router();
const { listDefects, createDefect, getDefect, updateDefect, deleteDefect } = require('../controllers/defectController');
const validate = require('../validators/validate');
const validateQuery = require('../validators/validateQuery');
const { createDefectSchema, updateDefectSchema } = require('../validators/defect.validator');
const { listDefectsQuerySchema } = require('../validators/defect.query.validator');
const { createCommentSchema } = require('../validators/comment.validator');
const commentController = require('../controllers/commentController');
const auth = require('../middlewares/auth');

router.get('/', validateQuery(listDefectsQuerySchema), listDefects);
router.post('/', auth, validate(createDefectSchema), createDefect);
router.get('/:id', getDefect);
router.patch('/:id', auth, validate(updateDefectSchema), updateDefect);
router.delete('/:id', auth, deleteDefect);
// Comments under a defect
router.get('/:id/comments', commentController.listByDefect);
router.post('/:id/comments', auth, validate(createCommentSchema), commentController.createForDefect);

module.exports = router;
