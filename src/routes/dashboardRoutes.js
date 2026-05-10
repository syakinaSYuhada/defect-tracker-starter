const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboardController');

router.get('/summary', controller.getSummary);
router.get('/trends', controller.getTrends);
router.get('/by-category', controller.getByCategory);
router.get('/top-recurring', controller.getTopRecurring);

module.exports = router;
