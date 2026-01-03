import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Report = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: 'Medical', description: '', severity: 'Low', location: ''
  });

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Randomize location slightly so markers don't stack exactly on top of each other
    // (This is a hackathon trick to simulate different locations!)
    const randomLat = 19.0760 + (Math.random() - 0.5) * 0.02;
    const randomLng = 72.8777 + (Math.random() - 0.5) * 0.02;

    try {
      await axios.post('http://localhost:5000/api/incidents', {
        ...formData,
        lat: randomLat, 
        lng: randomLng
      });

      alert("✅ Incident Reported Successfully!");
      navigate('/map'); // This sends you to the map
    } catch (error) {
      console.error("Error reporting:", error);
      alert("❌ Failed to report incident.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '80vh', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--accent)' }}>REPORT INCIDENT</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" placeholder="Title (e.g. Fire at Metro Station)" 
            value={formData.title} required
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            style={inputStyle}
          />

          <input 
            type="text" placeholder="Location Name" 
            value={formData.location} required
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            style={inputStyle}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <select style={inputStyle} onChange={(e) => setFormData({...formData, category: e.target.value})}>
              <option>Medical</option><option>Fire</option><option>Flood</option>
            </select>
            <select style={inputStyle} onChange={(e) => setFormData({...formData, severity: e.target.value})}>
              <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
            </select>
          </div>

          <button type="submit" className="btn btn-danger" disabled={loading}>
            {loading ? "Sending..." : "🚨 SUBMIT SOS"}
          </button>
        </form>
      </div>
    </div>
  );
};

const inputStyle = { padding: '10px', borderRadius: '5px', background: '#0f172a', border: '1px solid #334155', color: 'white' };

export default Report;