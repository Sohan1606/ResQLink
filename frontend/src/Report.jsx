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
    lng: '',
    // 🆕 Additional fields for reporter info (matches backend)
    reporterName: '',
    reporterPhone: '',
    reporterEmail: ''
  });
  const [touched, setTouched] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);
  const submitCountRef = useRef(0);

  const categories = ['Medical', 'Fire', 'Flood', 'Traffic', 'Crime', 'Other'];
  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];

  // 🆕 REVERSE GEOCODING - Convert lat/lng to readable address
  const reverseGeocode = async (lat, lng) => {
    try {
      // Using OpenStreetMap Nominatim (FREE, no API key needed)
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ResQLink Emergency App' // Required by Nominatim
          }
        }
      );

      const data = response.data;
      
      // Extract meaningful location components
      const address = data.address || {};
      const locationParts = [
        address.road || address.suburb || address.neighbourhood,
        address.city || address.town || address.village || address.county,
        address.state,
        address.country
      ].filter(Boolean); // Remove null/undefined values

      const formattedLocation = locationParts.join(', ') || data.display_name || `${lat}, ${lng}`;
      
      return {
        formatted: formattedLocation,
        city: address.city || address.town || address.village || '',
        state: address.state || '',
        country: address.country || '',
        zipCode: address.postcode || ''
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Fallback to coordinates if geocoding fails
      return {
        formatted: `Latitude: ${lat}, Longitude: ${lng}`,
        city: '',
        state: '',
        country: '',
        zipCode: ''
      };
    }
  };

  // Form validation
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
    if (!data.lat || !data.lng) {
      newErrors.location = 'Please detect GPS location or enter manually';
    } else {
      if (isNaN(data.lat) || data.lat < -90 || data.lat > 90) {
        newErrors.lat = 'Invalid latitude (-90 to 90)';
      }
      if (isNaN(data.lng) || data.lng < -180 || data.lng > 180) {
        newErrors.lng = 'Invalid longitude (-180 to 180)';
      }
    }

    // Description validation
    if (data.description?.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    return newErrors;
  }, []);

  // Real-time validation
  const handleChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      const fieldErrors = validateForm(newData);
      setErrors(prevErrors => ({
        ...prevErrors,
        [field]: fieldErrors[field] || null
      }));
      return newData;
    });
    setTouched(prev => ({ ...prev, [field]: true }));
  }, [validateForm]);

  // 🔧 FIXED: Handle GPS location with reverse geocoding
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLat = position.coords.latitude.toFixed(6);
        const newLng = position.coords.longitude.toFixed(6);
        
        // 🆕 Get readable address from coordinates
        const locationData = await reverseGeocode(newLat, newLng);
        
        setFormData(prev => ({
          ...prev,
          lat: newLat,
          lng: newLng,
          location: locationData.formatted // ✅ Human-readable address
        }));
        
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.lat;
          delete newErrors.lng;
          delete newErrors.location;
          return newErrors;
        });
        
        setLocationLoading(false);
        
        // Show success notification
        console.log('✅ Location detected:', {
          coordinates: `${newLat}, ${newLng}`,
          address: locationData.formatted
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        let errorMsg = 'Could not get location.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out.';
            break;
        }
        
        alert(`${errorMsg}\n\nUsing Kalyan area coordinates as fallback.`);
        
        setFormData(prev => ({
          ...prev,
          lat: '19.2438',
          lng: '73.1350',
          location: prev.location || 'Kalyan, Maharashtra, India (fallback)'
        }));
        setLocationLoading(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 
      }
    );
  }, []);

  // 🔧 FIXED: Submit to correct endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    submitCountRef.current += 1;
    const currentSubmitCount = submitCountRef.current;
    
    // Validate form
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      
      // Scroll to first error
      const firstErrorField = Object.keys(formErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // 🔧 FIXED: Changed from /api/incidents to /api/reports
      const response = await axios.post('http://localhost:5000/api/reports', {
        // Send data matching backend schema
        title: formData.title,
        category: formData.category,
        description: formData.description,
        severity: formData.severity,
        location: formData.location, // Readable address
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        reporterName: formData.reporterName || 'Anonymous',
        reporterPhone: formData.reporterPhone || '',
        reporterEmail: formData.reporterEmail || '',
        timestamp: new Date().toISOString()
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('✅ Incident submitted successfully:', response.data);
      setSuccess(true);
      
      // Navigate after success
      setTimeout(() => {
        navigate('/map', { 
          state: { 
            newIncident: response.data?._id || response.data?.incidentId || `RESQ-${currentSubmitCount.toString().padStart(6, '0')}`,
            message: 'Emergency reported successfully!'
          } 
        });
      }, 2000);
      
    } catch (error) {
      console.error("❌ Submission error:", error);
      
      let errorMessage = "Failed to submit report";
      
      if (axios.isCancel(error)) {
        errorMessage = "Request was cancelled. Please try again.";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please check your connection and try again.";
      } else if (!error.response) {
        errorMessage = "⚠️ Cannot connect to backend server.\n\n" +
                      "Make sure backend is running:\n" +
                      "1. cd backend\n" +
                      "2. npm start\n" +
                      "3. Check http://localhost:5000/api/health";
      } else if (error.response.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response.status === 404) {
        errorMessage = "API endpoint not found. Check backend routes.";
      } else if (error.response.status >= 400) {
        errorMessage = error.response.data?.message || "Invalid data. Please check your input.";
      }

      setErrors({ submit: errorMessage });
      
      // Show browser alert for critical errors
      if (!error.response) {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-detect location on component mount (optional)
  useEffect(() => {
    // Uncomment to auto-detect location when form loads
    // getCurrentLocation();
  }, []);

  // Success screen
  if (success) {
    return (
      <div className="success-screen min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <div className="success-card bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-white/50">
          <div className="success-icon w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-2xl animate-bounce">
            ✅
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            SOS Alert Sent!
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Emergency response teams have been notified and are on their way to the location.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-200">
            <p className="text-sm text-gray-700 mb-2 font-semibold">Incident ID</p>
            <p className="text-2xl font-mono font-black text-blue-600 tracking-wider">
              RESQ-{submitCountRef.current.toString().padStart(6, '0')}
            </p>
          </div>
          <div className="action-buttons flex flex-col gap-4">
            <button 
              className="btn btn-primary w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200" 
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
                  lng: '',
                  reporterName: '',
                  reporterPhone: '',
                  reporterEmail: ''
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
        {/* Error Banner */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="text-red-800 font-semibold text-sm leading-relaxed whitespace-pre-line">
                  {errors.submit}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Title Field */}
        <div className="form-group mb-8">
          <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            Incident Title <span className="text-red-500 text-xl">*</span>
          </label>
          <input
            type="text"
            name="title"
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

        {/* Location Field - Enhanced */}
        <div className="form-group mb-8">
          <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            Location <span className="text-red-500 text-xl">*</span>
            {locationLoading && (
              <span className="text-sm text-blue-600 font-normal flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                Detecting location...
              </span>
            )}
          </label>
          <div className="location-inputs flex flex-col sm:flex-row gap-4 mb-3">
            <input
              type="text"
              name="location"
              placeholder="e.g. NH-61 near Kalyan Sector-7, Maharashtra"
              value={formData.location}
              onChange={handleChange('location')}
              className={`flex-1 px-6 py-4 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                errors.location ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              disabled={loading || locationLoading}
            />
            <button
              type="button"
              className="btn btn-secondary flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={getCurrentLocation}
              disabled={loading || locationLoading}
            >
              {locationLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Detecting...
                </>
              ) : (
                <>📍 Get GPS</>
              )}
            </button>
          </div>
          {errors.location && (
            <p className="text-red-600 text-sm font-medium flex items-center gap-1 mb-2">
              <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">!</span>
              {errors.location}
            </p>
          )}
          {formData.lat && formData.lng && (
            <div className="gps-coords text-xs text-emerald-700 bg-emerald-100/80 px-4 py-3 rounded-xl border border-emerald-200 font-mono flex items-center gap-2">
              <span className="text-base">✅</span>
              <div>
                <div className="font-semibold mb-1">GPS Coordinates Locked</div>
                <div>📍 {formData.lat}, {formData.lng}</div>
              </div>
            </div>
          )}
        </div>

        {/* Description Field */}
        <div className="form-group mb-10">
          <label className="block text-lg font-bold text-gray-800 mb-3">Description (Optional)</label>
          <textarea
            rows="4"
            name="description"
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
          disabled={loading || locationLoading}
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

        {/* Helper text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By submitting, you confirm this is a genuine emergency requiring immediate response.
        </p>
      </form>
    </div>
  );
};

export default Report;