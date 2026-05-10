const express = require('express');
const router = express.Router();
const controller = require('../controllers/referenceController');

router.get('/severities', controller.getSeverities);
router.get('/statuses', controller.getStatuses);
router.get('/defect-types', controller.getDefectTypes);
router.get('/products', controller.getProducts);

module.exports = router;
