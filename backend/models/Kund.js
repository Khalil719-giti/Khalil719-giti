import mongoose from 'mongoose';

const relativeSchema = new mongoose.Schema({
  relation: String,
  name: String,
  phone: String
}, { _id: false });

const effortDetailSchema = new mongoose.Schema({
  time: String,
  days: [String]
}, { _id: false });

const kundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: String,
  personnummer: { type: String, required: true, unique: true }, // Personnummer eller samordningsnummer
  phone: String,
  language: String,
  address: String,
  foodPreference: String,
  foodAllergy: Boolean,
  petAllergy: Boolean,
  specialNeeds: String,
  efforts: [String],
  effortDetails: {
    type: Map,
    of: effortDetailSchema
  },
  relatives: [relativeSchema]
});

const Kund = mongoose.model('Kund', kundSchema);
export default Kund;
