// backend/models/Schedule.js
import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  staffId: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  task: { type: String, required: true },
  notes: { type: String },
}, { timestamps: true });

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;
