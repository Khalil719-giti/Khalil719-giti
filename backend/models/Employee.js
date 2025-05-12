import mongoose from 'mongoose'

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },               // Namn
  role: { type: String, default: 'Undersköterska' },    // Yrkesroll
  personnummer: { type: String, required: true, unique: true }, // Personnummer eller samordningsnummer
  identifierType: { type: String, enum: ['personnummer', 'samordningsnummer'], default: 'personnummer' }, // Typ
  gender: { type: String, enum: ['Man', 'Kvinna'] },    // Kön
  phone: { type: String },                              // Mobilnummer
  employmentStatus: { type: String },                   // Anställningsstatus
  driversLicense: { type: Boolean },                    // Körkort (ja/nej)
  languages: [{ type: String }],                        // Lista över språk
  address: { type: String }                             // Hemadress
})

export default mongoose.model('Employee', employeeSchema)
