import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Report = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    category: 'Medical',
    description: '',
    severity: 'Low',
    location: '',
    lat: '',
    lng: ''
  });
  const [touched, setTouched] = useState({});
  const submitCountRef = useRef(0); // Track submit attempts for reference ID

  const categories = ['Medical', 'Fire', 'Hazard', 'Traffic', 'Security', 'Flood', 'Other'];
  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];

  // Form validation - FIXED dependency issues
  const validateForm = useCallback((data) => {
    const newErrors = {};

    // Title validation
    if (!data.title?.trim()) {
      newErrors.title = 'Incident title is required';
    } else if (data.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (data.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Location validation
    if (!data.location?.trim()) {
      newErrors.location = 'Location is required';
    } else if (data.location.length < 3) {
      newErrors.location = 'Location must be at least 3 characters';
    }

    // GPS coordinates validation
    if (data.lat && (isNaN(data.lat) || data.lat < -90 || data.lat > 90)) {
      newErrors.lat = 'Invalid latitude (-90 to 90)';
    }
    if (data.lng && (isNaN(data.lng) || data.lng < -180 || data.lng > 180)) {
      newErrors.lng = 'Invalid longitude (-180 to 180)';
    }

    // Description validation
    if (data.description?.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    return newErrors;
  }, []);

  // FIXED: Real-time validation with proper dependencies
  const handleChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Validate immediately on change
      const fieldErrors = validateForm(newData);
      setErrors(prevErrors => ({
        ...prevErrors,
        [field]: fieldErrors[field] || null
      }));
      return newData;
    });
    setTouched(prev => ({ ...prev, [field]: true }));
  }, [validateForm]);

  // Handle GPS location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude.toFixed(6);
        const newLng = position.coords.longitude.toFixed(6);
        setFormData(prev => ({
          ...prev,
          lat: newLat,
          lng: newLng,
          location: prev.location || `Lat: ${newLat}, Lng: ${newLng}`
        }));
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.lat;
          delete newErrors.lng;
          delete newErrors.location;
          return newErrors;
        });
        setLoading(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        alert('Could not get location. Using Kalyan area coordinates as fallback.');
        setFormData(prev => ({
          ...prev,
          lat: '19.2438',
          lng: '73.1350',
          location: prev.location || 'Kalyan, Maharashtra (fallback)'
        }));
        setLoading(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 
      }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    submitCountRef.current += 1;
    const currentSubmitCount = submitCountRef.current;
    
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }

    setLoading(true);
    setErrors({});

    // Use real GPS if available, otherwise Kalyan fallback
    const lat = formData.lat || (19.2438 + (Math.random() - 0.5) * 0.01).toFixed(6);
    const lng = formData.lng || (73.1350 + (Math.random() - 0.5) * 0.01).toFixed(6);

    try {
      const response = await axios.post('http://localhost:5000/api/incidents', {
        ...formData,
        lat,
        lng,
        timestamp: new Date().toISOString()
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      setSuccess(true);
      // Navigate after success with incident ID
      setTimeout(() => {
        navigate('/map', { 
          state: { 
            newIncident: response.data?.incidentId || `RESQ-${currentSubmitCount.toString().padStart(6, '0')}` 
          } 
        });
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error);
      
      let errorMessage = "Failed to submit report";
      
      if (axios.isCancel(error)) {
        errorMessage = "Request was cancelled. Please try again.";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please check your connection and try again.";
      } else if (!error.response) {
        errorMessage = "Backend server not responding. Start backend with: cd backend && npm start";
      } else if (error.response.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response.status >= 400) {
        errorMessage = error.response.data?.message || "Invalid data. Please check your input.";
      }

      // Use toast-like notification instead of alert for better UX
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="success-screen min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <div className="success-card bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-white/50">
          <div className="success-icon text-6xl mb-6 animate-bounce">✅</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
            Incident Reported Successfully!
          </h2>
          <p className="text-gray-700 mb-8 text-lg leading-relaxed">
            Response teams have been notified. Track status on the live map.
          </p>
          <div className="bg-emerald-50 p-4 rounded-2xl mb-8">
            <p className="text-sm font-mono text-emerald-800 font-semibold">
              Reference ID: <span className="bg-emerald-200 px-3 py-1 rounded-full">RESQ-{submitCountRef.current.toString().padStart(6, '0')}</span>
            </p>
          </div>
          <div className="space-y-4">
            <button 
              className="btn btn-primary w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200" 
              onClick={() => navigate('/map')}
            >
              🗺️ View Live Map
            </button>
            <button 
              className="btn btn-secondary w-full border-2 border-gray-200 hover:border-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-2xl hover:bg-gray-50 transition-all duration-200" 
              onClick={() => {
                setSuccess(false);
                setFormData({
                  title: '',
                  category: 'Medical',
                  description: '',
                  severity: 'Low',
                  location: '',
                  lat: '',
                  lng: ''
                });
                setErrors({});
                setTouched({});
                submitCountRef.current = 0;
              }}
            >
              📋 Report Another Incident
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-container min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 py-12">
      <div className="report-header max-w-2xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center gap-3 bg-red-100 px-6 py-3 rounded-full mb-6 shadow-lg">
          <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            🚨
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">Report Emergency</h1>
            <p className="text-xl text-gray-600 mt-1 font-medium">Real-time reporting → Live tracking → Rapid response</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="report-form max-w-2xl mx-auto bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/50">
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-800 font-semibold">{errors.submit}</p>
          </div>
        )}

        {/* Title Field */}
        <div className="form-group mb-8">
          <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            Incident Title <span className="text-red-500 text-xl">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Multi-vehicle collision on NH-61 near Kalyan"
            value={formData.title}
            onChange={handleChange('title')}
            className={`w-full px-6 py-4 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm ${
              errors.title ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            disabled={loading}
            maxLength={100}
            autoComplete="off"
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-2 font-medium flex items-center gap-1">
              <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">!</span>
              {errors.title}
            </p>
          )}
        </div>

        {/* Category & Severity Row */}
        <div className="form-row grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="form-group">
            <label className="block text-lg font-bold text-gray-800 mb-3">Category <span className="text-red-500">*</span></label>
            <select
              value={formData.category}
              onChange={handleChange('category')}
              disabled={loading}
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="block text-lg font-bold text-gray-800 mb-3">Severity <span className="text-red-500">*</span></label>
            <select
              value={formData.severity}
              onChange={handleChange('severity')}
              disabled={loading}
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {severityLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Field */}
        <div className="form-group mb-8">
          <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            Location <span className="text-red-500 text-xl">*</span>
          </label>
          <div className="location-inputs flex flex-col sm:flex-row gap-4 mb-3">
            <input
              type="text"
              placeholder="e.g. NH-61 near Kalyan Sector-7, Maharashtra"
              value={formData.location}
              onChange={handleChange('location')}
              className={`flex-1 px-6 py-4 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                errors.location ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              disabled={loading}
            />
            <button
              type="button"
              className="btn btn-secondary flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={getCurrentLocation}
              disabled={loading}
            >
              📍 Get GPS
            </button>
          </div>
          {errors.location && (
            <p className="text-red-600 text-sm font-medium flex items-center gap-1 mb-2">
              <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">!</span>
              {errors.location}
            </p>
          )}
          {formData.lat && (
            <div className="gps-coords text-xs text-emerald-700 bg-emerald-100/80 px-4 py-2 rounded-xl border border-emerald-200 font-mono">
              📍 {formData.lat}, {formData.lng}
            </div>
          )}
        </div>

        {/* Description Field */}
        <div className="form-group mb-10">
          <label className="block text-lg font-bold text-gray-800 mb-3">Description (Optional)</label>
          <textarea
            rows="4"
            placeholder="Provide specific details: number of injuries, fire size, traffic blockage extent, visible hazards, etc."
            value={formData.description}
            onChange={handleChange('description')}
            className={`w-full px-6 py-4 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-vertical shadow-sm ${
              errors.description ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            disabled={loading}
            maxLength={500}
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-2 font-medium flex items-center gap-1">
              <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">!</span>
              {errors.description}
            </p>
          )}
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{formData.description.length}/500 characters</span>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="submit-btn w-full bg-gradient-to-r from-red-500 via-red-600 to-orange-600 hover:from-red-600 hover:via-red-700 hover:to-orange-700 text-white font-black py-6 px-8 rounded-3xl text-xl shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Alerting Response Teams...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3 group-hover:scale-110 transition-transform duration-200">
              🚨 Send SOS Alert Now
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default Report;
