import mongoose from 'mongoose';

const IncidentSchema = new mongoose.Schema(
  {
    // 🎯 Core Incident Details
    title: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Medical', 'Fire', 'Security', 'Technical', 'Environmental', 'Other'],
        message: 'Invalid category. Must be one of: Medical, Fire, Security, Technical, Environmental, Other'
      }
    },
    
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    
    severity: {
      type: String,
      required: true,
      enum: {
        values: ['Critical', 'High', 'Medium', 'Low'],
        message: 'Severity must be Critical, High, Medium, or Low',
        default: 'Low'
      }
    },
    
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low', 'Normal'],
      default: 'Normal'
    },
    
    // 📍 Location & Geospatial
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [300, 'Location cannot exceed 300 characters']
    },
    
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere'
      }
    },
    
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    
    // 🚨 Status & Workflow
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Closed', 'Escalated'],
      default: 'Pending'
    },
    
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    
    // 👥 Participants & Reporters
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    responders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    
    // 📊 Audit Trail
    createdAt: {
      type: Date,
      default: Date.now
    },
    
    updatedAt: {
      type: Date,
      default: Date.now
    },
    
    resolvedAt: Date,
    
    // 🚨 Incident Metadata
    estimatedResolutionTime: Number, // in minutes
    
    // 🔔 Notifications
    notificationsSent: {
      type: Map,
      of: Boolean,
      default: {}
    },
    
    // 📝 Comments & History
    comments: [{
      text: {
        type: String,
        required: true,
        trim: true
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    
    // 🔗 Attachments
    attachments: [{
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    // 📈 Analytics & Metrics
    responseTime: Number, // minutes
    resolutionTime: Number, // minutes
    
    // 🏷️ Tags for filtering
    tags: [{
      type: String,
      trim: true
    }]
  },
  {
    // 🔧 Schema Options
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 🌐 Virtual for formatted coordinates
IncidentSchema.virtual('latlng').get(function() {
  if (this.coordinates?.coordinates) {
    return {
      lat: this.coordinates.coordinates[1],
      lng: this.coordinates.coordinates[0]
    };
  }
  return null;
});

// 🔍 Indexes for Performance
IncidentSchema.index({ coordinates: '2dsphere' });
IncidentSchema.index({ status: 1, createdAt: -1 });
IncidentSchema.index({ severity: 1, priority: 1 });
IncidentSchema.index({ category: 1, createdAt: -1 });
IncidentSchema.index({ assignedTo: 1, status: 1 });
IncidentSchema.index({ 'reporter': 1, createdAt: -1 });
IncidentSchema.index({ tags: 1 });

// 📊 Pre-save middleware for auto-updates
IncidentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-calculate response time if status changes to In Progress
  if (this.isModified('status') && this.status === 'In Progress' && !this.responseTime) {
    this.responseTime = Math.round((new Date() - this.createdAt) / (1000 * 60));
  }
  
  // Mark as resolved when status changes to Resolved
  if (this.isModified('status') && this.status === 'Resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
    if (!this.resolutionTime) {
      this.resolutionTime = Math.round((this.resolvedAt - this.createdAt) / (1000 * 60));
    }
  }
  
  next();
});

// 🔒 Instance method for custom JSON output
IncidentSchema.methods.toJSON = function() {
  const incident = this.toObject();
  
  // Clean up sensitive fields for API response
  delete incident.__v;
  
  // Format timestamps
  incident.createdAt = this.createdAt.toISOString();
  if (this.updatedAt) incident.updatedAt = this.updatedAt.toISOString();
  if (this.resolvedAt) incident.resolvedAt = this.resolvedAt.toISOString();
  
  return incident;
};

// 🚀 Static method for advanced queries
IncidentSchema.statics.findNearby = function(lng, lat, maxDistance = 5000) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

// 🎯 Query helper for dashboard stats
IncidentSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$responseTime' },
        avgResolutionTime: { $avg: '$resolutionTime' }
      }
    }
  ]);
};

export default mongoose.model('Incident', IncidentSchema);
