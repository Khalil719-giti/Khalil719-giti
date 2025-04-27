// backend/index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import kundRoutes from './routes/kundRoutes.js';
import personalRoutes from './routes/personalRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API-routes
app.use('/api/kunder', kundRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/schedule', scheduleRoutes);


// Starta server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hemtjanst', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Servern körs på port ${PORT}`));
  })
  .catch((err) => console.error('Fel vid anslutning till databasen:', err));
