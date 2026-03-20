# Deployment Guide — Vercel + MongoDB Atlas

## Prerequisites
- Vercel account (new, as per requirements)
- MongoDB Atlas account
- Stripe account with products configured (see STRIPE_SETUP.md)

---

## Step 1: MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com → Create free cluster
2. Create a database user (username + password)
3. Whitelist all IPs: `0.0.0.0/0` (for Vercel's dynamic IPs)
4. Click **Connect → Connect your application**
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/golf_charity_db
   ```

---

## Step 2: Deploy Backend to Vercel

1. Push `backend/` folder to a new GitHub repository
2. Go to https://vercel.com → **New Project**
3. Import the backend repository
4. Set **Root Directory** to `.` (the backend folder)
5. Add all environment variables from `.env.example`:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your Atlas connection string |
| `JWT_SECRET` | Random 32+ char string |
| `STRIPE_SECRET_KEY` | `sk_live_xxx` or `sk_test_xxx` |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook dashboard |
| `STRIPE_MONTHLY_PRICE_ID` | `price_xxx` |
| `STRIPE_YEARLY_PRICE_ID` | `price_xxx` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | your Gmail |
| `EMAIL_PASS` | Gmail App Password |
| `EMAIL_FROM` | `noreply@yourdomain.com` |
| `CLIENT_URL` | Your frontend Vercel URL (add after deploying frontend) |

6. Deploy → copy the backend URL (e.g. `https://golf-charity-backend.vercel.app`)

---

## Step 3: Deploy Frontend to Vercel

1. Push `frontend/` folder to a separate new GitHub repository
2. Go to Vercel → **New Project** → Import the frontend repository
3. Set **Framework** to `Create React App`
4. Add environment variables:

| Variable | Value |
|---|---|
| `REACT_APP_API_URL` | `https://your-backend.vercel.app/api` |
| `REACT_APP_STRIPE_PUBLIC_KEY` | `pk_live_xxx` or `pk_test_xxx` |

5. Deploy → copy the frontend URL

---

## Step 4: Update Backend CLIENT_URL

Go back to your backend Vercel project → Settings → Environment Variables

Update `CLIENT_URL` to your frontend URL (e.g. `https://golf-charity-platform.vercel.app`)

Redeploy the backend.

---

## Step 5: Update Stripe Webhook URL

Go to Stripe Dashboard → Developers → Webhooks → Update endpoint URL to your backend URL.

---

## Step 6: Seed the Database (optional)

Run locally with your production MONGO_URI to seed initial charities and test users:

```bash
cd backend
MONGO_URI="your_atlas_uri" npm run seed
```

---

## Step 7: Verify Deployment Checklist

- [ ] Backend health check: `https://your-backend.vercel.app/api/health` returns `{"status":"OK"}`
- [ ] Frontend loads at Vercel URL
- [ ] Login works with seeded credentials
- [ ] Stripe checkout opens when subscribing
- [ ] Webhook events received (check Stripe dashboard)
- [ ] Emails sent on registration (check email inbox)

---

## Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Generate a new app password for "Mail"
4. Use that 16-character password as `EMAIL_PASS`
