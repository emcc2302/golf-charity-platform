const Score = require('../models/Score');
const User = require('../models/User');
const Draw = require('../models/Draw');

/**
 * Generate 5 random numbers from 1–45
 */
const randomDraw = () => {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

/**
 * Algorithmic draw — weighted by score frequency across all active subscribers
 * Numbers appearing most/least frequently influence selection
 */
const algorithmicDraw = async () => {
  const activeUsers = await User.find({
    'subscription.status': 'active',
    'subscription.currentPeriodEnd': { $gt: new Date() }
  }).select('_id');

  const userIds = activeUsers.map(u => u._id);

  const scoreDocs = await Score.find({ user: { $in: userIds } });

  // Count frequency of each score number
  const frequency = {};
  for (let i = 1; i <= 45; i++) frequency[i] = 0;

  scoreDocs.forEach(doc => {
    doc.scores.forEach(s => {
      frequency[s.score] = (frequency[s.score] || 0) + 1;
    });
  });

  // Weight: numbers appearing less frequently have slightly higher chance (harder to match)
  // Blend: 60% weighted, 40% pure random for fairness
  const maxFreq = Math.max(...Object.values(frequency)) || 1;
  const weights = Object.entries(frequency).map(([num, freq]) => ({
    num: parseInt(num),
    weight: (1 - freq / maxFreq) * 0.6 + 0.4
  }));

  const totalWeight = weights.reduce((s, w) => s + w.weight, 0);
  const selected = new Set();

  while (selected.size < 5) {
    let rand = Math.random() * totalWeight;
    for (const w of weights) {
      rand -= w.weight;
      if (rand <= 0 && !selected.has(w.num)) {
        selected.add(w.num);
        break;
      }
    }
    // Fallback to avoid infinite loop
    if (selected.size < 5) {
      const remaining = weights.filter(w => !selected.has(w.num));
      if (remaining.length > 0) {
        selected.add(remaining[Math.floor(Math.random() * remaining.length)].num);
      }
    }
  }

  return Array.from(selected).sort((a, b) => a - b);
};

/**
 * Calculate prize pools based on active subscriber count
 */
const calculatePrizePools = (subscriberCount, monthlyAmount = 999) => {
  const totalPool = subscriberCount * monthlyAmount * 0.5; // 50% goes to prize pool
  return {
    total: Math.floor(totalPool),
    fiveMatch: Math.floor(totalPool * 0.40),
    fourMatch: Math.floor(totalPool * 0.35),
    threeMatch: Math.floor(totalPool * 0.25)
  };
};

/**
 * Match user scores against draw numbers
 */
const matchScores = (userScores, drawNumbers) => {
  const userNums = userScores.map(s => s.score);
  const matched = userNums.filter(n => drawNumbers.includes(n));
  return {
    matchCount: matched.length,
    matchedNumbers: matched
  };
};

/**
 * Run draw and find winners
 */
const runDraw = async (drawNumbers, month, year) => {
  const activeUsers = await User.find({
    'subscription.status': 'active',
    'subscription.currentPeriodEnd': { $gt: new Date() }
  }).select('_id');

  const winners = { '5-match': [], '4-match': [], '3-match': [] };
  let participantCount = 0;

  for (const user of activeUsers) {
    const scoreDoc = await Score.findOne({ user: user._id });
    if (!scoreDoc || scoreDoc.scores.length === 0) continue;

    participantCount++;
    const { matchCount, matchedNumbers } = matchScores(scoreDoc.scores, drawNumbers);

    if (matchCount === 5) winners['5-match'].push({ user: user._id, matchedNumbers });
    else if (matchCount === 4) winners['4-match'].push({ user: user._id, matchedNumbers });
    else if (matchCount === 3) winners['3-match'].push({ user: user._id, matchedNumbers });
  }

  return { winners, participantCount };
};

module.exports = { randomDraw, algorithmicDraw, calculatePrizePools, matchScores, runDraw };
