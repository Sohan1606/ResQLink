import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Incident from './models/Incident.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- 1. CONNECT TO DATABASE ---
mongoose.connect('mongodb://127.0.0.1:27017/resqlink')
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// --- 2. ROUTES ---

// GET: Check if data exists
app.get('/api/incidents', async (req, res) => {
  try {
    console.log("📥 Fetching all incidents...");
    const incidents = await Incident.find();
    console.log(`✅ Found ${incidents.length} incidents`);
    res.json(incidents);
  } catch (err) {
    console.error("❌ Error fetching:", err);
    res.status(500).json(err);
  }
});

// POST: Save new data
app.post('/api/incidents', async (req, res) => {
  console.log("📨 Received new report:", req.body); // <--- THIS will show us the data coming in
  
  try {
    const newIncident = new Incident(req.body);
    const saved = await newIncident.save();
    console.log("✅ Saved to Database:", saved);
    res.json(saved);
  } catch (err) {
    console.error("❌ Save Failed:", err); // <--- THIS will show us why it failed
    res.status(500).json(err);
  }
});

app.listen(5000, () => console.log('🚀 Server running on port 5000'));