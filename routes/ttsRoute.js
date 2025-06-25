const express = require('express');
const router = express.Router();
const { getTTS } = require('../controllers/ttsController');

router.get('/', getTTS);

module.exports = router;
