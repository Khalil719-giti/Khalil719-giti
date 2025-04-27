// backend/models/Schedule.js

import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kund', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },

  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  effort: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  }
}, { timestamps: true });

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;
