const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');

router.get('/search', busController.searchBuses);
router.get('/:busNumber', busController.getBusDetails);

module.exports = router;