const express = require('express');
const router = express.Router();
const {
  getCharities, getCharity, selectCharity,
  createCharity, updateCharity, deleteCharity
} = require('../controllers/charityController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getCharities);
router.get('/:id', getCharity);
router.put('/select/:id', protect, selectCharity);

// Admin
router.post('/', protect, admin, createCharity);
router.put('/:id', protect, admin, updateCharity);
router.delete('/:id', protect, admin, deleteCharity);

module.exports = router;
