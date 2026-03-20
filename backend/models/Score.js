const mongoose = require('mongoose');

const scoreEntrySchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
    min: [1, 'Score must be at least 1'],
    max: [45, 'Score cannot exceed 45']
  },
  date: {
    type: Date,
    required: true
  }
}, { _id: true });

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  scores: {
    type: [scoreEntrySchema],
    validate: {
      validator: function (v) {
        return v.length <= 5;
      },
      message: 'Cannot store more than 5 scores'
    },
    default: []
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Virtual: average score
scoreSchema.virtual('averageScore').get(function () {
  if (!this.scores.length) return null;
  return this.scores.reduce((sum, s) => sum + s.score, 0) / this.scores.length;
});

// Method: add score (rolling 5)
scoreSchema.methods.addScore = function (score, date) {
  const entry = { score, date: date || new Date() };
  this.scores.unshift(entry); // newest first
  if (this.scores.length > 5) {
    this.scores = this.scores.slice(0, 5);
  }
  this.lastUpdated = new Date();
  return this.save();
};

module.exports = mongoose.model('Score', scoreSchema);
