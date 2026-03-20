const Charity = require('../models/Charity');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Get all charities
// @route   GET /api/charities
exports.getCharities = asyncHandler(async (req, res) => {
  const { search, category, featured } = req.query;
  const query = { isActive: true };

  // Use regex search instead of $text to avoid needing a text index
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: regex },
      { description: regex },
      { shortDescription: regex }
    ];
  }
  if (category) query.category = category;
  if (featured === 'true') query.isFeatured = true;

  const charities = await Charity.find(query).sort({ isFeatured: -1, name: 1 });
  res.json({ success: true, count: charities.length, data: charities });
});

// @desc    Get single charity
// @route   GET /api/charities/:id
exports.getCharity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try by _id first, then by slug
  let charity = null;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    charity = await Charity.findOne({ _id: id, isActive: true });
  }
  if (!charity) {
    charity = await Charity.findOne({ slug: id, isActive: true });
  }

  if (!charity) throw new AppError('Charity not found', 404);
  res.json({ success: true, data: charity });
});

// @desc    Select charity for user
// @route   PUT /api/charities/select/:id
exports.selectCharity = asyncHandler(async (req, res) => {
  const charity = await Charity.findById(req.params.id);
  if (!charity || !charity.isActive) throw new AppError('Charity not found', 404);

  const { contributionPercent } = req.body;
  const percent = Math.max(10, Math.min(100, contributionPercent || 10));

  const prevCharity = req.user.selectedCharity?.toString();
  const newCharity = req.params.id;

  if (prevCharity && prevCharity !== newCharity) {
    await Charity.findByIdAndUpdate(prevCharity, { $inc: { subscriberCount: -1 } });
    await Charity.findByIdAndUpdate(newCharity, { $inc: { subscriberCount: 1 } });
  } else if (!prevCharity) {
    await Charity.findByIdAndUpdate(newCharity, { $inc: { subscriberCount: 1 } });
  }

  await User.findByIdAndUpdate(req.user._id, {
    selectedCharity: newCharity,
    charityContributionPercent: percent
  });

  res.json({
    success: true,
    message: 'Charity selected successfully',
    data: { charity, contributionPercent: percent }
  });
});

// ADMIN: Create charity
// @route POST /api/charities
exports.createCharity = asyncHandler(async (req, res) => {
  const { name, description, shortDescription, category, country, website, isFeatured } = req.body;

  if (!name || !description) {
    throw new AppError('Name and description are required', 400);
  }

  // Generate slug manually in case pre-save hook hasn't fired
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') +
    '-' + Date.now();

  const charity = await Charity.create({
    name,
    description,
    shortDescription: shortDescription || '',
    category: category || 'other',
    country: country || '',
    website: website || '',
    isFeatured: isFeatured || false,
    slug,
    isActive: true
  });

  res.status(201).json({ success: true, data: charity });
});

// ADMIN: Update charity
// @route PUT /api/charities/:id
exports.updateCharity = asyncHandler(async (req, res) => {
  const charity = await Charity.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!charity) throw new AppError('Charity not found', 404);
  res.json({ success: true, data: charity });
});

// ADMIN: Deactivate charity
// @route DELETE /api/charities/:id
exports.deleteCharity = asyncHandler(async (req, res) => {
  const charity = await Charity.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!charity) throw new AppError('Charity not found', 404);
  res.json({ success: true, message: 'Charity deactivated' });
});