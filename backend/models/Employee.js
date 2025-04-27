import mongoose from 'mongoose'

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },               // Namn
  role: { type: String, default: 'Undersköterska' },    // Yrkesroll
  birthdate: { type: String },                          // Födelsedatum (ISO-format)
  gender: { type: String, enum: ['Man', 'Kvinna'] },    // Kön
  driversLicense: { type: Boolean },                    // Körkort (ja/nej)
  languages: [{ type: String }],                        // Lista över språk
  address: { type: String }                             // Hemadress
})

export default mongoose.model('Employee', employeeSchema)
