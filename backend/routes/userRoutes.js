const express = require('express');
const router = express.Router();
const { updateProfile, updateCharityPercent, getDashboard } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', getDashboard);
router.put('/profile', updateProfile);
router.put('/charity-percent', updateCharityPercent);

module.exports = router;
