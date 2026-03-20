const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  syncSubscription,
  handleWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Webhook must use raw body — BEFORE express.json()
router.post('/webhook', handleWebhook);

router.use(protect);
router.post('/create-session', createCheckoutSession);
router.post('/sync-subscription', syncSubscription);  // ← NEW
router.post('/portal', createPortalSession);
router.get('/subscription', getSubscription);

module.exports = router;
