const User = require('../models/User');
const Draw = require('../models/Draw');
const Charity = require('../models/Charity');
const Transaction = require('../models/Transaction');
const Score = require('../models/Score');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
exports.getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeSubscribers,
    totalCharities,
    recentTransactions,
    draws
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ 'subscription.status': 'active' }),
    Charity.countDocuments({ isActive: true }),
    Transaction.find({ type: 'subscription', status: 'completed' })
      .sort({ createdAt: -1 }).limit(10).populate('user', 'name email'),
    Draw.find({ status: 'published' }).sort({ year: -1, month: -1 }).limit(6)
  ]);

  const totalRevenue = await Transaction.aggregate([
    { $match: { type: 'subscription', status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' }, charityTotal: { $sum: '$charityAmount' }, prizeTotal: { $sum: '$prizePoolAmount' } } }
  ]);

  const pendingWinners = await Draw.aggregate([
    { $unwind: '$winners' },
    { $match: { 'winners.paymentStatus': 'pending' } },
    { $count: 'total' }
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      activeSubscribers,
      totalCharities,
      revenue: totalRevenue[0] || { total: 0, charityTotal: 0, prizeTotal: 0 },
      pendingWinnersCount: pendingWinners[0]?.total || 0,
      recentTransactions,
      recentDraws: draws
    }
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
exports.getUsers = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const query = { role: 'user' };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (status) query['subscription.status'] = status;

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query)
      .populate('selectedCharity', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: users,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
  });
});

// @desc    Get single user with full details
// @route   GET /api/admin/users/:id
exports.getUserDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('selectedCharity', 'name logo');
  if (!user) throw new AppError('User not found', 404);

  const [scores, transactions] = await Promise.all([
    Score.findOne({ user: user._id }),
    Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(20)
  ]);

  res.json({ success: true, data: { user, scores, transactions } });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, isActive, 'subscription.status': subStatus } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  if (role) updates.role = role;
  if (isActive !== undefined) updates.isActive = isActive;
  if (subStatus) updates['subscription.status'] = subStatus;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!user) throw new AppError('User not found', 404);

  res.json({ success: true, data: user });
});

// @desc    Edit user scores (admin)
// @route   PUT /api/admin/users/:id/scores
exports.adminEditUserScores = asyncHandler(async (req, res) => {
  const { scores } = req.body; // Array of { score, date }

  let scoreDoc = await Score.findOne({ user: req.params.id });
  if (!scoreDoc) {
    scoreDoc = await Score.create({ user: req.params.id, scores: [] });
  }

  scoreDoc.scores = scores.slice(0, 5).map(s => ({
    score: Math.max(1, Math.min(45, s.score)),
    date: new Date(s.date)
  }));
  scoreDoc.lastUpdated = new Date();
  await scoreDoc.save();

  res.json({ success: true, data: scoreDoc });
});

// @desc    Get all draws for admin
// @route   GET /api/admin/draws
exports.getAllDraws = asyncHandler(async (req, res) => {
  const draws = await Draw.find()
    .populate('winners.user', 'name email')
    .sort({ year: -1, month: -1 });

  res.json({ success: true, data: draws });
});

// @desc    Get winners list
// @route   GET /api/admin/winners
exports.getWinners = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const pipeline = [
    { $match: { status: 'published' } },
    { $unwind: '$winners' },
    ...(status ? [{ $match: { 'winners.paymentStatus': status } }] : []),
    {
      $lookup: {
        from: 'users',
        localField: 'winners.user',
        foreignField: '_id',
        as: 'winners.userDetails'
      }
    },
    { $sort: { year: -1, month: -1 } }
  ];

  const results = await Draw.aggregate(pipeline);
  res.json({ success: true, data: results });
});

// @desc    Update winner payout status
// @route   PUT /api/admin/winners/:drawId/:winnerId
exports.updateWinnerStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // verified, paid, rejected
  const draw = await Draw.findById(req.params.drawId);
  if (!draw) throw new AppError('Draw not found', 404);

  const winner = draw.winners.id(req.params.winnerId);
  if (!winner) throw new AppError('Winner not found', 404);

  winner.paymentStatus = status;
  if (status === 'verified') winner.verifiedAt = new Date();
  if (status === 'paid') winner.paidAt = new Date();

  await draw.save();

  res.json({ success: true, data: winner });
});

// @desc    Get reports
// @route   GET /api/admin/reports
exports.getReports = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (period === 'year' ? 12 : 1), 1);

  const [revenueByMonth, subscriptionsByPlan, charityBreakdown] = await Promise.all([
    Transaction.aggregate([
      { $match: { type: 'subscription', status: 'completed', createdAt: { $gte: start } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$amount' },
          charity: { $sum: '$charityAmount' },
          prizePool: { $sum: '$prizePoolAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    User.aggregate([
      { $match: { 'subscription.status': 'active' } },
      { $group: { _id: '$subscription.plan', count: { $sum: 1 } } }
    ]),
    Transaction.aggregate([
      { $match: { type: 'subscription', status: 'completed', charityId: { $exists: true } } },
      { $group: { _id: '$charityId', total: { $sum: '$charityAmount' } } },
      { $lookup: { from: 'charities', localField: '_id', foreignField: '_id', as: 'charity' } },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ])
  ]);

  res.json({ success: true, data: { revenueByMonth, subscriptionsByPlan, charityBreakdown } });
});
