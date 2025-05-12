// resetTestData.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Kund from './models/Kund.js';
import Employee from './models/Employee.js';
import Schedule from './models/Schedule.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hemtjanst';

async function resetTestData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Ansluten till databasen');

    const deletedKunder = await Kund.deleteMany({});
    const deletedStaff = await Employee.deleteMany({});
    const deletedSchedules = await Schedule.deleteMany({});

    console.log(`🧹 Rensat:`);
    console.log(`   - ${deletedKunder.deletedCount} kunder`);
    console.log(`   - ${deletedStaff.deletedCount} personal`);
    console.log(`   - ${deletedSchedules.deletedCount} scheman`);

    await mongoose.disconnect();
    console.log('🔌 Frånkopplad från databasen');
  } catch (err) {
    console.error('❌ Fel vid rensning:', err);
    process.exit(1);
  }
}

resetTestData();
