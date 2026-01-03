import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

// Page Imports
import Home from './pages/Home';
import LiveMap from './pages/LiveMap';
import Report from './pages/Report';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

// Styles
import './App.css'; // Standard React styling

function App() {
  return (
    <Router>
      <div className="app-container">
        
        {/* Navbar stays at the top of every page */}
        <Navbar />

        {/* This section switches based on the URL */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/report" element={<Report />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;