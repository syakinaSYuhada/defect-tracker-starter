const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');
const auth = require('../middlewares/auth');
const validate = require('../validators/validate');
const { createReportSchema } = require('../validators/report.validator');

router.get('/', auth, controller.listExports);
router.post('/', auth, validate(createReportSchema), controller.createExport);

module.exports = router;
