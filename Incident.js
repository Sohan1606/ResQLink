import mongoose from 'mongoose';

const IncidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  severity: { type: String, default: 'Low' },
  location: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Incident', IncidentSchema);