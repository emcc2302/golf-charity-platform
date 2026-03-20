const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');

const run = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGO_URI not set in .env');

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    const User    = require('../models/User');
    const Charity = require('../models/Charity');
    const Score   = require('../models/Score');

    // ── Seed charities (safe — won't duplicate) ──────────
    const charityData = [
      { name: 'Irish Cancer Society',  shortDescription: 'Fighting cancer through research and support.', description: 'The Irish Cancer Society funds cancer research and provides support services to patients and families across Ireland.', category: 'health',    country: 'Ireland', isFeatured: true,  website: 'https://www.cancer.ie' },
      { name: 'St. Vincent de Paul',   shortDescription: 'Helping families out of poverty across Ireland.', description: 'SVP is a voluntary charitable organisation providing practical support to people experiencing poverty and social exclusion in Ireland.', category: 'poverty',   country: 'Ireland', isFeatured: true,  website: 'https://www.svp.ie' },
      { name: 'ISPCC Childline',        shortDescription: 'Protecting children and giving them a voice.',   description: 'The ISPCC protects children and young people from abuse and neglect, providing a 24/7 helpline and support services.',              category: 'children',  country: 'Ireland', isFeatured: false },
      { name: 'Pieta House',            shortDescription: 'Mental health and suicide prevention services.',  description: 'Pieta provides a free, therapeutic approach to people who are in suicidal distress and those who engage in self-harm.',            category: 'health',    country: 'Ireland', isFeatured: true },
      { name: 'Concern Worldwide',      shortDescription: "Transforming lives in the world's poorest places.", description: 'Concern Worldwide works to transform the lives of people living in extreme poverty by providing long-term development programs.', category: 'poverty',   country: 'Ireland', isFeatured: false },
    ];

    for (const c of charityData) {
      const exists = await Charity.findOne({ name: c.name });
      if (!exists) {
        await Charity.create(c);
        console.log(`  ✅ Charity created: ${c.name}`);
      } else {
        console.log(`  ⏭️  Charity exists:  ${c.name}`);
      }
    }

    // ── Seed admin (won't overwrite existing) ─────────────
    const adminEmail = 'admin@golfgives.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: 'Admin@123456',
        role: 'admin',
        isEmailVerified: true,
        subscription: { status: 'active', plan: 'yearly', currentPeriodEnd: new Date('2099-01-01') }
      });
      console.log(`\n  ✅ Admin created: ${adminEmail} / Admin@123456`);
    } else {
      // Ensure role is admin
      await User.findOneAndUpdate({ email: adminEmail }, { role: 'admin' });
      console.log(`\n  ⏭️  Admin exists: ${adminEmail}`);
    }

    // ── Seed test user (won't overwrite existing) ─────────
    const testEmail = 'test@golfgives.com';
    const testExists = await User.findOne({ email: testEmail });
    if (!testExists) {
      const firstCharity = await Charity.findOne({});
      const testUser = await User.create({
        name: 'Test Golfer',
        email: testEmail,
        password: 'Test@123456',
        role: 'user',
        isEmailVerified: true,
        selectedCharity: firstCharity?._id,
        charityContributionPercent: 15,
        subscription: {
          status: 'active',
          plan: 'monthly',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
      await Score.create({
        user: testUser._id,
        scores: [
          { score: 28, date: new Date('2026-03-15') },
          { score: 32, date: new Date('2026-03-08') },
          { score: 25, date: new Date('2026-03-01') },
          { score: 30, date: new Date('2026-02-22') },
          { score: 27, date: new Date('2026-02-15') }
        ]
      });
      console.log(`  ✅ Test user created: ${testEmail} / Test@123456`);
    } else {
      console.log(`  ⏭️  Test user exists: ${testEmail}`);
    }

    console.log('\n🎉 Seeding complete!\n');
    console.log('─────────────────────────────────────────');
    console.log('  Admin:     admin@golfgives.com  / Admin@123456');
    console.log('  Test user: test@golfgives.com   / Test@123456');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

run();
