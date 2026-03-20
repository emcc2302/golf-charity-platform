const mongoose = require('mongoose');

const winnerEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  matchType: { type: String, enum: ['5-match', '4-match', '3-match'] },
  matchedNumbers: [Number],
  prizeAmount: Number,
  paymentStatus: {
    type: String,
    enum: ['pending', 'verified', 'paid', 'rejected'],
    default: 'pending'
  },
  proofUpload: String,
  verifiedAt: Date,
  paidAt: Date
});

const drawSchema = new mongoose.Schema({
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  drawNumbers: {
    type: [Number],
    validate: {
      validator: v => v.length === 5,
      message: 'Draw must have exactly 5 numbers'
    }
  },
  drawType: {
    type: String,
    enum: ['random', 'algorithmic'],
    default: 'random'
  },
  status: {
    type: String,
    enum: ['pending', 'simulated', 'published'],
    default: 'pending'
  },
  prizePool: {
    total: { type: Number, default: 0 },
    fiveMatch: { type: Number, default: 0 },
    fourMatch: { type: Number, default: 0 },
    threeMatch: { type: Number, default: 0 },
    jackpotCarriedOver: { type: Number, default: 0 }
  },
  winners: [winnerEntrySchema],
  participantCount: { type: Number, default: 0 },
  jackpotRolledOver: { type: Boolean, default: false },
  simulationData: { type: mongoose.Schema.Types.Mixed },
  publishedAt: Date
}, { timestamps: true });

// Unique per month/year
drawSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Draw', drawSchema);
