const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Score = require('../models/Score');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRE || '30d'
});

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  subscription: user.subscription,
  selectedCharity: user.selectedCharity,
  charityContributionPercent: user.charityContributionPercent,
  country: user.country
});

// @route POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, country, selectedCharity, charityContributionPercent } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email and password are required', 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError('Email already registered', 400);

  const user = await User.create({
    name,
    email,
    password,
    country: country || 'IE',
    selectedCharity: selectedCharity || null,
    charityContributionPercent: charityContributionPercent || 10
  });

  // Create empty score record for this user
  await Score.create({ user: user._id, scores: [] });

  const token = generateToken(user._id);

  // Welcome email (non-blocking)
  sendEmail({
    to: email,
    subject: 'Welcome to GolfGives! 🏌️',
    html: `<h2>Welcome, ${name}!</h2><p>Your account has been created. <a href="${process.env.CLIENT_URL}/dashboard/subscribe">Subscribe now</a> to start entering draws and giving back.</p>`
  }).catch(() => {});

  res.status(201).json({ success: true, token, user: userResponse(user) });
});

// @route POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new AppError('Email and password are required', 400);

  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password')
    .populate('selectedCharity', 'name logo slug');

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) throw new AppError('Account has been deactivated', 401);

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);
  res.json({ success: true, token, user: userResponse(user) });
});

// @route GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('selectedCharity', 'name logo slug');
  res.json({ success: true, user });
});

// @route PUT /api/auth/password
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new AppError('Both passwords are required', 400);
  if (newPassword.length < 8) throw new AppError('New password must be at least 8 characters', 400);

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, token: generateToken(user._id), message: 'Password updated successfully' });
});

// @route POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() });

  // Always return same response to prevent email enumeration
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'GolfGives — Password Reset',
    html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Click here to reset your password</a></p><p>This link expires in 30 minutes. If you didn't request this, ignore this email.</p>`
  }).catch(() => {});

  res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
});

// @route PUT /api/auth/reset-password/:token
exports.resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) throw new AppError('Invalid or expired reset token', 400);

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ success: true, token: generateToken(user._id), message: 'Password reset successful' });
});
