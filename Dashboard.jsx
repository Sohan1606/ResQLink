import React from 'react';
import StatCard from '../components/StatCard';
import IncidentCard from '../components/IncidentCard';
import ResourceCard from '../components/ResourceCard';

const Dashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ borderLeft: '5px solid var(--accent)', paddingLeft: '15px' }}>
        Agency Response Dashboard
      </h2>

      {/* Top Stats Row */}
      <div className="grid-layout" style={{ marginBottom: '30px' }}>
        <StatCard title="Active Incidents" value="12" icon="🔥" color="#ef4444" />
        <StatCard title="Resources Deployed" value="8" icon="🚑" color="#3b82f6" />
        <StatCard title="Pending Reports" value="5" icon="⚠️" color="#f59e0b" />
        <StatCard title="Volunteers Online" value="42" icon="👥" color="#10b981" />
      </div>

      {/* Main Content Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Left Column: Recent Incidents */}
        <div>
          <h3 style={{ color: 'var(--text-dim)' }}>Recent Alerts</h3>
          <IncidentCard 
            title="Fire at City Center" 
            category="Fire" 
            severity="Critical" 
            location="Main Market, Sector 4"
            time="10 mins ago"
          />
          <IncidentCard 
            title="Flash Flood Warning" 
            category="Flood" 
            severity="High" 
            location="Riverside Area"
            time="25 mins ago"
          />
          <IncidentCard 
            title="Medical Emergency" 
            category="Medical" 
            severity="Medium" 
            location="Housing Colony, Block A"
            time="1 hour ago"
          />
        </div>

        {/* Right Column: Available Resources */}
        <div>
          <h3 style={{ color: 'var(--text-dim)' }}>Available Resources</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <ResourceCard 
              type="Ambulance" 
              quantity="3 Units" 
              location="City Hospital" 
              contact="Dr. A. Sharma"
            />
            <ResourceCard 
              type="Food Packs" 
              quantity="500 Pkts" 
              location="Community Center" 
              contact="Relief Team A"
            />
             <ResourceCard 
              type="Rescue Boat" 
              quantity="2 Units" 
              location="Dockyard" 
              contact="Coast Guard"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;