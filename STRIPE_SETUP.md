# Stripe Setup Guide

## 1. Create a Stripe Account
Go to https://stripe.com and sign up for a free account.

## 2. Create a Product & Prices

In your Stripe Dashboard:
1. Go to **Products** → **Add Product**
2. Name: "Golf Charity Platform Subscription"
3. Add two prices:
   - Monthly: Recurring, €9.99/month → copy `price_xxxxx` ID
   - Yearly:  Recurring, €99.99/year → copy `price_xxxxx` ID

## 3. Add Price IDs to .env

```
STRIPE_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_YEARLY_PRICE_ID=price_xxxxxxxxxxxxx
```

## 4. Get your API Keys

**Dashboard → Developers → API Keys**

```
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx    # Secret key (backend only)
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxxxx   # Publishable key (frontend)
```

## 5. Set up Webhooks (local dev)

Install Stripe CLI: https://stripe.com/docs/stripe-cli

```bash
# Login
stripe login

# Forward events to your local backend
stripe listen --forward-to localhost:5000/api/payments/webhook

# Copy the webhook signing secret shown in terminal:
# whsec_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

## 6. Set up Webhooks (production)

**Dashboard → Developers → Webhooks → Add Endpoint**

- URL: `https://your-backend.vercel.app/api/payments/webhook`
- Events to listen to:
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.deleted`
  - `customer.subscription.updated`

Copy the signing secret to your production env vars.

## 7. Test with test cards

| Card Number | Description |
|---|---|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0025 0000 3155` | Requires 3D Secure |
| `4000 0000 0000 9995` | Payment declined |

Use any future date for expiry and any 3-digit CVC.
