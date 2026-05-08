const express = require('express');
const router = express.Router();
const { listDefects, createDefect } = require('../controllers/defectController');

router.get('/', listDefects);
router.post('/', createDefect);

module.exports = router;
