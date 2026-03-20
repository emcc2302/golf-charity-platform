const Draw = require('../models/Draw');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { randomDraw, algorithmicDraw, calculatePrizePools, runDraw } = require('../utils/drawEngine');
const { sendEmail } = require('../utils/email');

// @desc    Get all published draws
// @route   GET /api/draws
exports.getDraws = asyncHandler(async (req, res) => {
  const draws = await Draw.find({ status: 'published' })
    .populate('winners.user', 'name email')
    .sort({ year: -1, month: -1 })
    .limit(12);

  res.json({ success: true, data: draws });
});

// @desc    Get latest draw
// @route   GET /api/draws/latest
exports.getLatestDraw = asyncHandler(async (req, res) => {
  const draw = await Draw.findOne({ status: 'published' })
    .populate('winners.user', 'name')
    .sort({ year: -1, month: -1 });

  res.json({ success: true, data: draw });
});

// @desc    Get specific draw by month/year
// @route   GET /api/draws/:year/:month
exports.getDraw = asyncHandler(async (req, res) => {
  const draw = await Draw.findOne({
    year: req.params.year,
    month: req.params.month,
    status: 'published'
  }).populate('winners.user', 'name');

  if (!draw) throw new AppError('Draw not found', 404);
  res.json({ success: true, data: draw });
});

// ADMIN: Create/Simulate draw
// @route   POST /api/draws/simulate
exports.simulateDraw = asyncHandler(async (req, res) => {
  const { month, year, drawType } = req.body;
  const now = new Date();
  const drawMonth = month || (now.getMonth() + 1);
  const drawYear = year || now.getFullYear();

  // Check if draw already published for this month
  const existing = await Draw.findOne({ month: drawMonth, year: drawYear, status: 'published' });
  if (existing) throw new AppError('Draw already published for this period', 400);

  // Generate draw numbers
  const drawNumbers = drawType === 'algorithmic'
    ? await algorithmicDraw()
    : randomDraw();

  // Count active subscribers
  const activeSubscribers = await User.countDocuments({
    'subscription.status': 'active',
    'subscription.currentPeriodEnd': { $gt: new Date() }
  });

  // Check for previous jackpot rollover
  const prevDraw = await Draw.findOne({ month: drawMonth - 1 || 12, year: drawMonth === 1 ? drawYear - 1 : drawYear });
  const jackpotCarriedOver = prevDraw?.jackpotRolledOver ? prevDraw.prizePool.fiveMatch : 0;

  const pools = calculatePrizePools(activeSubscribers);
  pools.fiveMatch += jackpotCarriedOver;
  pools.jackpotCarriedOver = jackpotCarriedOver;

  // Run draw to find winners
  const { winners, participantCount } = await runDraw(drawNumbers, drawMonth, drawYear);

  // Build winner entries with prize amounts
  const winnerEntries = [];
  const matchTypes = [
    { key: '5-match', type: '5-match', pool: pools.fiveMatch },
    { key: '4-match', type: '4-match', pool: pools.fourMatch },
    { key: '3-match', type: '3-match', pool: pools.threeMatch }
  ];

  let jackpotRolledOver = false;

  for (const mt of matchTypes) {
    const matchWinners = winners[mt.key];
    if (matchWinners.length === 0 && mt.type === '5-match') {
      jackpotRolledOver = true;
    }
    const prizePerWinner = matchWinners.length > 0 ? Math.floor(mt.pool / matchWinners.length) : 0;
    matchWinners.forEach(w => {
      winnerEntries.push({
        user: w.user,
        matchType: mt.type,
        matchedNumbers: w.matchedNumbers,
        prizeAmount: prizePerWinner,
        paymentStatus: 'pending'
      });
    });
  }

  const simulationData = { drawNumbers, pools, participantCount, winnerCount: winnerEntries.length };

  // Upsert draw record
  let draw = await Draw.findOne({ month: drawMonth, year: drawYear });
  if (draw) {
    draw.drawNumbers = drawNumbers;
    draw.drawType = drawType || 'random';
    draw.prizePool = { ...pools };
    draw.winners = winnerEntries;
    draw.participantCount = participantCount;
    draw.jackpotRolledOver = jackpotRolledOver;
    draw.simulationData = simulationData;
    draw.status = 'simulated';
  } else {
    draw = new Draw({
      month: drawMonth,
      year: drawYear,
      drawNumbers,
      drawType: drawType || 'random',
      prizePool: { ...pools },
      winners: winnerEntries,
      participantCount,
      jackpotRolledOver,
      simulationData,
      status: 'simulated'
    });
  }

  await draw.save();

  res.json({
    success: true,
    message: 'Draw simulated successfully',
    data: { draw, simulationData }
  });
});

// ADMIN: Publish draw
// @route   PUT /api/draws/:id/publish
exports.publishDraw = asyncHandler(async (req, res) => {
  const draw = await Draw.findById(req.params.id).populate('winners.user', 'name email');

  if (!draw) throw new AppError('Draw not found', 404);
  if (draw.status === 'published') throw new AppError('Draw already published', 400);

  draw.status = 'published';
  draw.publishedAt = new Date();
  await draw.save();

  // Notify winners
  for (const winner of draw.winners) {
    if (winner.user?.email) {
      sendEmail({
        to: winner.user.email,
        subject: `🎉 You won in the ${draw.month}/${draw.year} Golf Draw!`,
        html: `<h2>Congratulations ${winner.user.name}!</h2>
               <p>You matched <strong>${winner.matchType}</strong> and won <strong>€${(winner.prizeAmount / 100).toFixed(2)}</strong>!</p>
               <p>Please log in to your dashboard to upload verification proof.</p>`
      }).catch(console.error);
    }
  }

  res.json({ success: true, message: 'Draw published and winners notified', data: draw });
});

// @desc    Get user's draw participation
// @route   GET /api/draws/my-history
exports.getMyDrawHistory = asyncHandler(async (req, res) => {
  const draws = await Draw.find({
    'winners.user': req.user._id,
    status: 'published'
  }).sort({ year: -1, month: -1 });

  const myWins = draws.map(draw => {
    const myWinnerEntry = draw.winners.find(w => w.user.toString() === req.user._id.toString());
    return {
      month: draw.month,
      year: draw.year,
      drawNumbers: draw.drawNumbers,
      myMatch: myWinnerEntry
    };
  });

  res.json({ success: true, data: myWins });
});
