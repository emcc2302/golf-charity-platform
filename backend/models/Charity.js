const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  location: String,
  image: String
});

const charitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Charity name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    sparse: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  logo: String,
  images: [String],
  website: String,
  category: {
    type: String,
    enum: ['health', 'education', 'environment', 'poverty', 'sports', 'children', 'animals', 'other'],
    default: 'other'
  },
  country: String,
  registrationNumber: String,
  events: [eventSchema],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  totalReceived: { type: Number, default: 0 },
  subscriberCount: { type: Number, default: 0 }
}, { timestamps: true });

// Text index for search
charitySchema.index({ name: 'text', description: 'text', shortDescription: 'text' });

// Auto-generate slug
charitySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Charity', charitySchema);