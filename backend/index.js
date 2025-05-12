// backend/index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import kundRoutes from './routes/kundRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/kunder', kundRoutes);
app.use('/api/staff', employeeRoutes);
app.use('/api/schedule', scheduleRoutes);

// ✅ Only connect to DB and start server if NOT in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;

  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hemtjanst')
    .then(() => {
      app.listen(PORT, () => console.log(`Servern körs på port ${PORT}`));
    })
    .catch((err) => console.error('Fel vid anslutning till databasen:', err));
}

export default app;
