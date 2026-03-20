const express = require('express');
const router = express.Router();
const {
  getDraws, getLatestDraw, getDraw,
  simulateDraw, publishDraw, getMyDrawHistory
} = require('../controllers/drawController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getDraws);
router.get('/latest', getLatestDraw);
router.get('/my-history', protect, getMyDrawHistory);
router.get('/:year/:month', getDraw);

// Admin
router.post('/simulate', protect, admin, simulateDraw);
router.put('/:id/publish', protect, admin, publishDraw);

module.exports = router;
