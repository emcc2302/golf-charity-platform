const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, country } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (country) updates.country = country;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    .populate('selectedCharity', 'name logo slug');

  res.json({ success: true, data: user });
});

// @desc    Update charity contribution percent
// @route   PUT /api/users/charity-percent
exports.updateCharityPercent = asyncHandler(async (req, res) => {
  const { percent } = req.body;
  const validated = Math.max(10, Math.min(100, parseInt(percent)));

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { charityContributionPercent: validated },
    { new: true }
  );

  res.json({ success: true, data: { charityContributionPercent: user.charityContributionPercent } });
});

// @desc    Get user dashboard summary
// @route   GET /api/users/dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const Draw = require('../models/Draw');
  const Score = require('../models/Score');
  const Transaction = require('../models/Transaction');

  const [scoreDoc, recentWins, transactions, upcomingDraw] = await Promise.all([
    Score.findOne({ user: req.user._id }),
    Draw.find({ 'winners.user': req.user._id, status: 'published' })
      .sort({ year: -1, month: -1 }).limit(5),
    Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(5),
    Draw.findOne({ status: { $in: ['pending', 'simulated'] } })
      .sort({ year: -1, month: -1 })
  ]);

  const totalWon = recentWins.reduce((acc, draw) => {
    const myWin = draw.winners.find(w => w.user.toString() === req.user._id.toString());
    return acc + (myWin?.prizeAmount || 0);
  }, 0);

  res.json({
    success: true,
    data: {
      user: req.user,
      scores: scoreDoc?.scores || [],
      averageScore: scoreDoc?.averageScore || null,
      recentWins,
      totalWon,
      transactions,
      upcomingDraw
    }
  });
});
