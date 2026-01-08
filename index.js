import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import Incident from './models/Incident.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --- DATABASE CONNECTION ---
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resqlink');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Gracefully shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});

// --- VALIDATED ROUTES ---

// GET: Fetch incidents with pagination and filtering
app.get('/api/incidents', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    console.log(`📥 Fetching incidents: page=${page}, limit=${limit}`, filter);

    const incidents = await Incident
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Incident.countDocuments(filter);

    console.log(`✅ Found ${incidents.length} incidents (total: ${total})`);
    
    res.json({
      success: true,
      data: incidents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('❌ Error fetching incidents:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incidents',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// POST: Create new incident with validation
app.post('/api/incidents',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('priority').isIn(['low', 'medium', 'high', 'critical']).optional(),
    body('status').isIn(['open', 'in-progress', 'resolved', 'closed']).optional(),
    body('location.lat').optional().isFloat({ min: -90, max: 90 }),
    body('location.lng').optional().isFloat({ min: -180, max: 180 }),
    body('reporter.name').notEmpty().withMessage('Reporter name required'),
    body('reporter.phone').optional().isMobilePhone()
  ],
  async (req, res) => {
    try {
      // Check validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      console.log('📨 New incident report:', {
        title: req.body.title,
        priority: req.body.priority,
        location: req.body.location
      });

      const incidentData = {
        ...req.body,
        status: req.body.status || 'open',
        priority: req.body.priority || 'medium',
        createdAt: new Date()
      };

      const newIncident = new Incident(incidentData);
      const saved = await newIncident.save();

      console.log('✅ Incident saved:', saved._id);

      // Emit real-time notification (if using Socket.io)
      // io.emit('newIncident', saved);

      res.status(201).json({
        success: true,
        data: saved,
        message: 'Incident reported successfully'
      });
    } catch (err) {
      console.error('❌ Save failed:', err);
      
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid data',
          error: err.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to save incident',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

// PUT: Update incident
app.put('/api/incidents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const incident = await Incident.findByIdAndUpdate(
      id, 
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    console.log(`✅ Updated incident ${id}:`, updates.status || updates.priority);
    
    res.json({
      success: true,
      data: incident,
      message: 'Incident updated successfully'
    });
  } catch (err) {
    console.error('❌ Update failed:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update incident',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// DELETE: Delete incident
app.delete('/api/incidents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findByIdAndDelete(id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    console.log(`✅ Deleted incident ${id}`);
    
    res.json({
      success: true,
      message: 'Incident deleted successfully'
    });
  } catch (err) {
    console.error('❌ Delete failed:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete incident'
    });
  }
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Global error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
};

startServer();

export default app;
