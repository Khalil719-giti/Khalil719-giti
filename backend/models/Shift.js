import mongoose from 'mongoose'

const shiftSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  kundId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kund' }, 
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, default: 'Hemtjänst' },
  role: { type: String, default: 'Undersköterska' },
})

export default mongoose.model('Shift', shiftSchema)
