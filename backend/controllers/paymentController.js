const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');

// @desc    Create checkout session
// @route   POST /api/payments/create-session
exports.createCheckoutSession = asyncHandler(async (req, res) => {
  const { plan } = req.body;

  const priceId = plan === 'yearly'
    ? process.env.STRIPE_YEARLY_PRICE_ID
    : process.env.STRIPE_MONTHLY_PRICE_ID;

  if (!priceId) throw new AppError('Invalid subscription plan', 400);

  let customerId = req.user.subscription?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: req.user.email,
      name: req.user.name,
      metadata: { userId: req.user._id.toString() }
    });
    customerId = customer.id;
    await User.findByIdAndUpdate(req.user._id, { 'subscription.stripeCustomerId': customerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    // Pass userId and plan in success URL so we can sync on redirect
    success_url: `${process.env.CLIENT_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/dashboard/subscribe?payment=cancelled`,
    metadata: {
      userId: req.user._id.toString(),
      plan
    }
  });

  res.json({ success: true, url: session.url, sessionId: session.id });
});

// @desc    Sync subscription after successful checkout (called from frontend on ?payment=success)
// @route   POST /api/payments/sync-subscription
exports.syncSubscription = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    // No session ID — just re-fetch current subscription state from Stripe
    const user = await User.findById(req.user._id);
    if (user.subscription?.stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.subscription.stripeCustomerId,
        status: 'active',
        limit: 1
      });

      if (subscriptions.data.length > 0) {
        const sub = subscriptions.data[0];
        const plan = sub.items.data[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly';
        await User.findByIdAndUpdate(req.user._id, {
          'subscription.status': 'active',
          'subscription.plan': plan,
          'subscription.stripeSubscriptionId': sub.id,
          'subscription.currentPeriodEnd': new Date(sub.current_period_end * 1000),
          'subscription.cancelAtPeriodEnd': sub.cancel_at_period_end
        });
        const updatedUser = await User.findById(req.user._id).populate('selectedCharity', 'name logo slug');
        return res.json({ success: true, synced: true, user: updatedUser });
      }
    }
    return res.json({ success: true, synced: false });
  }

  // We have a session ID — retrieve it directly from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription']
  });

  if (session.payment_status === 'paid' && session.subscription) {
    const sub = session.subscription;
    const userId = session.metadata?.userId || req.user._id.toString();
    const plan = session.metadata?.plan || 'monthly';

    await User.findByIdAndUpdate(userId, {
      'subscription.status': 'active',
      'subscription.plan': plan,
      'subscription.stripeSubscriptionId': sub.id || session.subscription,
      'subscription.currentPeriodEnd': new Date((sub.current_period_end || Date.now() / 1000 + 2592000) * 1000),
      'subscription.cancelAtPeriodEnd': false
    });

    // Record transaction if not already recorded
    const existing = await Transaction.findOne({ stripeEventId: session.id });
    if (!existing) {
      const amount = session.amount_total || 0;
      const userDoc = await User.findById(userId);
      const charityAmount = Math.floor(amount * (userDoc?.charityContributionPercent || 10) / 100);
      const prizePoolAmount = Math.floor(amount * 0.50);

      await Transaction.create({
        user: userId,
        type: 'subscription',
        amount,
        currency: session.currency || 'eur',
        status: 'completed',
        stripeEventId: session.id,
        description: `${plan} subscription`,
        charityAmount,
        prizePoolAmount,
        charityId: userDoc?.selectedCharity
      });
    }
  }

  const updatedUser = await User.findById(req.user._id).populate('selectedCharity', 'name logo slug');
  res.json({ success: true, synced: true, user: updatedUser });
});

// @desc    Create portal session (manage subscription)
// @route   POST /api/payments/portal
exports.createPortalSession = asyncHandler(async (req, res) => {
  const customerId = req.user.subscription?.stripeCustomerId;
  if (!customerId) throw new AppError('No subscription found', 400);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.CLIENT_URL}/dashboard/subscribe`
  });

  res.json({ success: true, url: session.url });
});

// @desc    Get subscription details
// @route   GET /api/payments/subscription
exports.getSubscription = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user.subscription?.stripeSubscriptionId) {
    return res.json({ success: true, subscription: null });
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(
    user.subscription.stripeSubscriptionId
  );

  res.json({
    success: true,
    subscription: {
      status: user.subscription.status,
      plan: user.subscription.plan,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      amount: stripeSubscription.items.data[0]?.price?.unit_amount,
      currency: stripeSubscription.currency
    }
  });
});

// @desc    Stripe webhook
// @route   POST /api/payments/webhook
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`✅ Webhook received: ${event.type}`);

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          const userId = session.metadata.userId;
          const plan = session.metadata.plan || 'monthly';

          await User.findByIdAndUpdate(userId, {
            'subscription.status': 'active',
            'subscription.plan': plan,
            'subscription.stripeSubscriptionId': subscription.id,
            'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
            'subscription.cancelAtPeriodEnd': false
          });

          const amount = session.amount_total || 0;
          const user = await User.findById(userId);
          const charityAmount = Math.floor(amount * (user?.charityContributionPercent || 10) / 100);
          const prizePoolAmount = Math.floor(amount * 0.50);

          await Transaction.create({
            user: userId,
            type: 'subscription',
            amount,
            currency: session.currency || 'eur',
            status: 'completed',
            stripeInvoiceId: subscription.latest_invoice,
            stripeEventId: event.id,
            charityAmount,
            prizePoolAmount,
            charityId: user?.selectedCharity,
            description: `${plan} subscription`
          });

          console.log(`✅ Subscription activated for user ${userId}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          const user = await User.findOne({ 'subscription.stripeSubscriptionId': invoice.subscription });
          if (user) {
            await User.findByIdAndUpdate(user._id, {
              'subscription.status': 'active',
              'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000)
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const user = await User.findOne({ 'subscription.stripeCustomerId': invoice.customer });
        if (user) {
          await User.findByIdAndUpdate(user._id, { 'subscription.status': 'lapsed' });
          sendEmail({
            to: user.email,
            subject: 'Payment Failed - Action Required',
            html: `<p>Hi ${user.name}, your Golf Charity subscription payment failed. Please update your payment method.</p>`
          }).catch(console.error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': subscription.id },
          { 'subscription.status': 'cancelled', 'subscription.stripeSubscriptionId': null }
        );
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': subscription.id },
          {
            'subscription.status': subscription.status === 'active' ? 'active' : subscription.status,
            'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
            'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end
          }
        );
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
