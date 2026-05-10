const express = require('express');
const router = express.Router();
const controller = require('../controllers/actionController');
const auth = require('../middlewares/auth');
const validate = require('../validators/validate');
const { createActionSchema, updateActionSchema } = require('../validators/action.validator');

router.get('/', auth, controller.listActions);
router.post('/', auth, validate(createActionSchema), controller.createAction);
router.get('/:id', auth, controller.getAction);
router.patch('/:id', auth, validate(updateActionSchema), controller.updateAction);

module.exports = router;
