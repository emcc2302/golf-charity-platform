const Draw = require('../models/Draw');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const path = require('path');
const fs = require('fs');

// @desc    Upload winner proof
// @route   POST /api/winners/:drawId/:winnerId/proof
exports.uploadProof = asyncHandler(async (req, res) => {
  const draw = await Draw.findById(req.params.drawId);
  if (!draw) throw new AppError('Draw not found', 404);

  const winner = draw.winners.id(req.params.winnerId);
  if (!winner) throw new AppError('Winner entry not found', 404);

  if (winner.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorised to upload proof for this entry', 403);
  }

  if (!req.file) throw new AppError('Please upload a file', 400);

  winner.proofUpload = `/uploads/${req.file.filename}`;
  winner.paymentStatus = 'pending';
  await draw.save();

  res.json({ success: true, message: 'Proof uploaded successfully', proofUrl: winner.proofUpload });
});

// @desc    Get my winnings
// @route   GET /api/winners/my-winnings
exports.getMyWinnings = asyncHandler(async (req, res) => {
  const pipeline = [
    { $match: { status: 'published' } },
    { $unwind: '$winners' },
    { $match: { 'winners.user': req.user._id } },
    {
      $project: {
        month: 1,
        year: 1,
        drawNumbers: 1,
        winner: '$winners'
      }
    },
    { $sort: { year: -1, month: -1 } }
  ];

  const winnings = await Draw.aggregate(pipeline);

  const totals = winnings.reduce((acc, w) => {
    acc.total += w.winner.prizeAmount || 0;
    if (w.winner.paymentStatus === 'paid') acc.paid += w.winner.prizeAmount || 0;
    if (w.winner.paymentStatus === 'pending') acc.pending += w.winner.prizeAmount || 0;
    return acc;
  }, { total: 0, paid: 0, pending: 0 });

  res.json({ success: true, data: { winnings, totals } });
});
