import express from 'express';
import mongoose from 'mongoose';
import employeeRoutes from './routes/employeeRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/staff', employeeRoutes);

if (process.env.NODE_ENV !== 'test') {
  const PORT = 5000;
  mongoose.connect('mongodb://localhost:27017/testapp')
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((err) => console.error('DB connection error:', err));
}

export default app;