const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['subscription', 'charity_donation', 'prize_payout'],
    required: true
  },
  amount: { type: Number, required: true }, // in cents
  currency: { type: String, default: 'eur' },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: String,
  stripeInvoiceId: String,
  stripeEventId: String,
  description: String,
  metadata: { type: mongoose.Schema.Types.Mixed },
  // Charity split
  charityAmount: Number,
  charityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },
  prizePoolAmount: Number
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
