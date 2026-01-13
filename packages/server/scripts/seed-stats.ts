#!/usr/bin/env node
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import pc from 'picocolors';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:root@localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'admin';

async function seedStats() {
  console.log(pc.blue('Connecting to MongoDB...'));

  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
  const db = mongoose.connection;

  const today = new Date().toISOString().split('T')[0];

  const statsData = {
    _id: 'global_stats',
    totalHaikusGenerated: 1250,
    totalGamesPlayed: 450,
    totalGamesWon: 320,
    totalEmoticonScratches: 890,
    totalHaikuReveals: 560,
    todayHaikusGenerated: 42,
    todayEmoticonScratches: 15,
    todayHaikuReveals: 8,
    todayGamesPlayed: 12,
    todayGamesWon: 9,
    currentDay: today,
    lastUpdated: new Date(),
  };

  console.log(pc.blue('Updating globalstats collection...'));
  console.log(pc.gray(`Current day: ${today}`));

  await db.collection('globalstats').updateOne(
    { _id: 'global_stats' } as object,
    { $set: statsData },
    { upsert: true },
  );

  console.log(pc.green('Stats seeded successfully!'));
  console.log(pc.gray(JSON.stringify(statsData, null, 2)));

  await mongoose.disconnect();
  process.exit(0);
}

seedStats().catch((err) => {
  console.error(pc.red('Error seeding stats:'), err);
  process.exit(1);
});
