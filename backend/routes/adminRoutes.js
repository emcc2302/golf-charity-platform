const express = require('express');
const router = express.Router();
const {
  getAnalytics, getUsers, getUserDetail, updateUser,
  adminEditUserScores, getAllDraws, getWinners,
  updateWinnerStatus, getReports
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

router.get('/analytics', getAnalytics);
router.get('/reports', getReports);

router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id', updateUser);
router.put('/users/:id/scores', adminEditUserScores);

router.get('/draws', getAllDraws);
router.get('/winners', getWinners);
router.put('/winners/:drawId/:winnerId', updateWinnerStatus);

module.exports = router;
