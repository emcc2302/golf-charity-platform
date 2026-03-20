# ⛳ GolfGives — Golf Charity Subscription Platform

Full-stack MERN application: MongoDB · Express · React · Node.js

---

## ⚡ Quick Start (First Time Setup)

### Step 1 — Backend
```bash
cd backend
cp .env.example .env        # All credentials already filled in
npm install
node utils/seeder.js        # Seeds charities + creates admin account
npm run dev                 # Starts on http://localhost:5000
```

Verify it's running: open http://localhost:5000/api/health

### Step 2 — Frontend (new terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm start                   # Opens http://localhost:3000
```

---

## 🔑 Login Credentials (after seeding)

| Role  | Email                   | Password      |
|-------|-------------------------|---------------|
| Admin | admin@golfgives.com     | Admin@123456  |
| User  | test@golfgives.com      | Test@123456   |

**Admin panel:** http://localhost:3000/admin

---

## 🌍 Environment Variables

All credentials are pre-filled in `backend/.env.example`.

Only thing you may need to change if you create your own MongoDB:
```
MONGO_URI=your_own_atlas_connection_string
```

Both `MONGO_URI` and `MONGODB_URI` are supported.

---

## 🗂️ Project Structure

```
golf-charity-platform/
├── backend/
│   ├── config/db.js              # MongoDB connection (supports both URI names)
│   ├── controllers/              # Route logic
│   ├── middleware/               # Auth, errors, file upload
│   ├── models/                   # Mongoose schemas
│   ├── routes/                   # Express routes
│   ├── utils/                    # Draw engine, email, seeder
│   └── server.js                 # Express app entry point
│
└── frontend/
    └── src/
        ├── components/           # Navbar, Footer, Layouts
        ├── context/AuthContext   # Global auth state
        ├── pages/
        │   ├── admin/            # Admin dashboard pages
        │   ├── auth/             # Login, Register, Reset password
        │   ├── dashboard/        # User dashboard pages
        │   └── public/           # Homepage, Charities, How it works
        └── services/api.js       # All API calls (Axios)
```

---

## ✅ Testing Checklist

- [ ] `localhost:5000/api/health` returns OK
- [ ] Register new user at `localhost:3000/register`
- [ ] Subscribe via Stripe (test card: 4242 4242 4242 4242)
- [ ] Subscription activates after redirect
- [ ] Add golf scores (1–45 Stableford, max 5 stored)
- [ ] Admin login at `localhost:3000/login`
- [ ] Admin panel loads at `localhost:3000/admin`
- [ ] Create charity in admin panel
- [ ] Simulate and publish a draw
- [ ] Winner verification flow

---

## 🚀 Deployment

See `DEPLOYMENT.md` for full Vercel + MongoDB Atlas guide.
