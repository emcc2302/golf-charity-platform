const express = require('express');
const router = express.Router();
const { uploadProof, getMyWinnings } = require('../controllers/winnerController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/my-winnings', getMyWinnings);
router.post('/:drawId/:winnerId/proof', upload.single('proof'), uploadProof);

module.exports = router;
