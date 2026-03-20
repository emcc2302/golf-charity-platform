const Score = require('../models/Score');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Get user scores
// @route   GET /api/scores
exports.getScores = asyncHandler(async (req, res) => {
  let scoreDoc = await Score.findOne({ user: req.user._id });

  if (!scoreDoc) {
    scoreDoc = await Score.create({ user: req.user._id, scores: [] });
  }

  res.json({
    success: true,
    data: {
      scores: scoreDoc.scores,
      averageScore: scoreDoc.averageScore,
      lastUpdated: scoreDoc.lastUpdated
    }
  });
});

// @desc    Add a score
// @route   POST /api/scores
exports.addScore = asyncHandler(async (req, res) => {
  const { score, date } = req.body;

  if (score < 1 || score > 45) {
    throw new AppError('Score must be between 1 and 45 (Stableford)', 400);
  }

  let scoreDoc = await Score.findOne({ user: req.user._id });

  if (!scoreDoc) {
    scoreDoc = await Score.create({ user: req.user._id, scores: [] });
  }

  await scoreDoc.addScore(score, date ? new Date(date) : new Date());

  res.status(201).json({
    success: true,
    message: 'Score added successfully',
    data: {
      scores: scoreDoc.scores,
      averageScore: scoreDoc.averageScore
    }
  });
});

// @desc    Edit a score entry
// @route   PUT /api/scores/:scoreId
exports.editScore = asyncHandler(async (req, res) => {
  const { score, date } = req.body;
  const { scoreId } = req.params;

  const scoreDoc = await Score.findOne({ user: req.user._id });

  if (!scoreDoc) throw new AppError('No score record found', 404);

  const entry = scoreDoc.scores.id(scoreId);
  if (!entry) throw new AppError('Score entry not found', 404);

  if (score !== undefined) {
    if (score < 1 || score > 45) throw new AppError('Score must be between 1 and 45', 400);
    entry.score = score;
  }
  if (date) entry.date = new Date(date);

  scoreDoc.lastUpdated = new Date();
  await scoreDoc.save();

  res.json({
    success: true,
    message: 'Score updated',
    data: { scores: scoreDoc.scores }
  });
});

// @desc    Delete a score entry
// @route   DELETE /api/scores/:scoreId
exports.deleteScore = asyncHandler(async (req, res) => {
  const scoreDoc = await Score.findOne({ user: req.user._id });
  if (!scoreDoc) throw new AppError('No score record found', 404);

  scoreDoc.scores = scoreDoc.scores.filter(s => s._id.toString() !== req.params.scoreId);
  await scoreDoc.save();

  res.json({ success: true, message: 'Score deleted', data: { scores: scoreDoc.scores } });
});
