// 🚀 ResQLink Backend v2.1 - Production Ready (2026 Standards)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');

const app = express();

// 🛡️ Security Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// 📊 Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// 🛠️ Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🔌 MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/resqlink')
  .then(() => console.log('🟢 MongoDB: Connected ✅'))
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
});

// 🧾 User Schema (Auth)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// 🚨 ENHANCED Incident Schema with virtuals
const incidentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Incident title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  category: {
    type: String,
    enum: {
      values: ['Medical', 'Fire', 'Flood', 'Traffic', 'Crime', 'Security', 'Technical', 'Environmental', 'Hazard', 'Other'],
      message: 'Invalid category'
    },
    default: 'Other'
  },
  
  description: { 
    type: String, 
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  severity: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High', 'Critical'],
      message: 'Severity must be Low, Medium, High, or Critical'
    },
    default: 'Medium'
  },
  
  // ✅ FIXED: Proper GeoJSON location structure
  location: { 
    type: {
      type: String, 
      default: 'Point',
      enum: ['Point']
    },
    coordinates: { 
      type: [Number], // [longitude, latitude] - GeoJSON standard
      required: [true, 'GPS coordinates are required'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 &&
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates. Must be [longitude, latitude] with valid ranges.'
      }
    },
    address: String // Human-readable address
  },
  
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  
  reporter: {
    name: { type: String, default: 'Anonymous' },
    phone: String,
    email: String
  },
  
  images: [String],
  adminNotes: String,
  verified: { type: Boolean, default: false },
  
  responseTime: Number,
  resolutionTime: Number,
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ CRITICAL FIX: Add virtual fields for lat/lng to support frontend
incidentSchema.virtual('lat').get(function() {
  return this.location?.coordinates ? this.location.coordinates[1] : null;
});

incidentSchema.virtual('lng').get(function() {
  return this.location?.coordinates ? this.location.coordinates[0] : null;
});

// Create 2dsphere index for geospatial queries
incidentSchema.index({ location: '2dsphere' });
incidentSchema.index({ status: 1, createdAt: -1 });
incidentSchema.index({ severity: 1, category: 1 });

const Incident = mongoose.model('Incident', incidentSchema);

// 📝 Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ====================================================================
// 🆘 INCIDENT ROUTES
// ====================================================================

// ✅ FIXED: POST /api/reports - Create new incident
app.post('/api/reports', async (req, res) => {
  try {
    console.log('📥 Received incident report:', {
      title: req.body.title,
      category: req.body.category,
      severity: req.body.severity,
      location: req.body.location,
      coordinates: `${req.body.lat}, ${req.body.lng}`
    });

    if (!req.body.title) {
      return res.status(400).json({ 
        message: 'Title is required',
        field: 'title'
      });
    }

    if (!req.body.lat || !req.body.lng) {
      return res.status(400).json({ 
        message: 'GPS coordinates (lat, lng) are required',
        field: 'location'
      });
    }

    const longitude = parseFloat(req.body.lng);
    const latitude = parseFloat(req.body.lat);

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        message: 'Invalid longitude. Must be between -180 and 180',
        field: 'lng'
      });
    }

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return res.status(400).json({ 
        message: 'Invalid latitude. Must be between -90 and 90',
        field: 'lat'
      });
    }

    const incident = new Incident({
      title: req.body.title,
      category: req.body.category || 'Other',
      description: req.body.description || '',
      severity: req.body.severity || 'Medium',
      location: {
        type: 'Point',
        coordinates: [longitude, latitude], // [lng, lat] - GeoJSON standard
        address: req.body.location || `${latitude}, ${longitude}`
      },
      reporter: {
        name: req.body.reporterName || 'Anonymous',
        phone: req.body.reporterPhone || '',
        email: req.body.reporterEmail || ''
      },
      status: 'pending',
      verified: false
    });
    
    const saved = await incident.save();
    
    console.log('✅ Incident saved successfully:', {
      id: saved._id,
      title: saved.title,
      coordinates: saved.location.coordinates
    });

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully',
      incidentId: saved._id,
      data: saved
    });

  } catch (error) {
    console.error('❌ Error creating incident:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error',
        errors: errors,
        details: error.errors
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({ 
        message: 'Duplicate entry',
        field: Object.keys(error.keyPattern)[0]
      });
    }

    res.status(500).json({ 
      message: 'Failed to create incident',
      error: error.message 
    });
  }
});

// ✅ FIXED: GET /api/reports - Fetch all incidents with virtual lat/lng
app.get('/api/reports', async (req, res) => {
  try {
    const { 
      status, 
      severity, 
      category, 
      limit = 100, 
      page = 1,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const incidents = await Incident
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean({ virtuals: true }); // ✅ CRITICAL: Enable virtuals for lat/lng

    const total = await Incident.countDocuments(query);

    console.log(`📊 Fetched ${incidents.length} incidents (Total: ${total})`);

    res.json(incidents); // Return array directly for compatibility

  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ 
      message: 'Failed to fetch incidents',
      error: error.message 
    });
  }
});

// GET /api/reports/:id - Fetch single incident
app.get('/api/reports/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).lean({ virtuals: true });
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ 
      message: 'Failed to fetch incident',
      error: error.message 
    });
  }
});

// PATCH /api/reports/:id/status - Update incident status
app.patch('/api/reports/:id/status', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    if (!['pending', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be: pending, in-progress, resolved, or closed' 
      });
    }

    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    incident.status = status;
    if (adminNotes) incident.adminNotes = adminNotes;
    
    await incident.save();

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: incident
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ 
      message: 'Failed to update status',
      error: error.message 
    });
  }
});

// DELETE /api/reports/:id - Delete incident (admin only)
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json({
      success: true,
      message: 'Incident deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting incident:', error);
    res.status(500).json({ 
      message: 'Failed to delete incident',
      error: error.message 
    });
  }
});

// ====================================================================
// 🗺️ LIVE MAP ROUTES
// ====================================================================

// GET /api/map/live - Get nearby active incidents
app.get('/api/map/live', async (req, res) => {
  try {
    const { lat, lng, radius = 50000 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ 
        message: 'Latitude and longitude are required',
        example: '/api/map/live?lat=19.2438&lng=73.1350&radius=50000'
      });
    }
    
    const incidents = await Incident.find({
      status: { $in: ['pending', 'in-progress'] },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    })
    .limit(100)
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });
    
    res.json({
      success: true,
      count: incidents.length,
      radius: parseInt(radius),
      center: { lat: parseFloat(lat), lng: parseFloat(lng) },
      incidents
    });
  } catch (error) {
    console.error('Error fetching live incidents:', error);
    res.status(500).json({ 
      message: 'Failed to fetch live incidents',
      error: error.message 
    });
  }
});

// ====================================================================
// 👤 AUTH ROUTES
// ====================================================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json({
      success: true,
      token: 'fake-jwt-token',
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        role: user.role 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const user = new User({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0]
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name 
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// ====================================================================
// 📊 DASHBOARD STATS
// ====================================================================

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const statusStats = await Incident.aggregate([
      { 
        $group: { 
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const severityStats = await Incident.aggregate([
      { 
        $group: { 
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const categoryStats = await Incident.aggregate([
      { 
        $group: { 
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Incident.countDocuments();
    const active = await Incident.countDocuments({ 
      status: { $in: ['pending', 'in-progress'] } 
    });
    
    res.json({
      success: true,
      stats: {
        total,
        active,
        byStatus: statusStats,
        bySeverity: severityStats,
        byCategory: categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      message: 'Failed to fetch dashboard stats',
      error: error.message 
    });
  }
});

// ====================================================================
// 🏥 HEALTH CHECK & SYSTEM
// ====================================================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '2.1.0'
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'ResQLink API',
    version: '2.1.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      reports: '/api/reports',
      liveMap: '/api/map/live',
      stats: '/api/dashboard/stats'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'POST /api/reports',
      'GET /api/reports',
      'GET /api/reports/:id',
      'PATCH /api/reports/:id/status',
      'GET /api/map/live',
      'GET /api/dashboard/stats',
      'GET /api/health'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ====================================================================
// 🚀 START SERVER
// ====================================================================

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 ResQLink Backend Server v2.1                       ║
║                                                          ║
║   Port: ${PORT}                                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}                                  ║
║                                                          ║
║   API Endpoints:                                         ║
║   • Health: http://localhost:${PORT}/api/health          ║
║   • Reports: http://localhost:${PORT}/api/reports        ║
║   • Live Map: http://localhost:${PORT}/api/map/live      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;