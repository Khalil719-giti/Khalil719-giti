import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: String,
  personnummer: { type: String, required: true, unique: true },
  identifierType: { type: String, enum: ['personnummer', 'samordningsnummer'], default: 'personnummer' }
});

export default mongoose.model('Employee', employeeSchema);