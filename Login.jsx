import React from 'react';

const Login = () => {
  return (
    <div className="flex-center" style={{ height: '80vh' }}>
      <div className="card" style={{ width: '350px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '5px' }}>Agency Login</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>Authorized Personnel Only</p>
        
        <input 
          type="email" 
          placeholder="Agency Email" 
          style={{ width: '90%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: 'none', background: '#0f172a', color: 'white' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          style={{ width: '90%', padding: '12px', marginBottom: '20px', borderRadius: '5px', border: 'none', background: '#0f172a', color: 'white' }}
        />
        
        <button className="btn btn-primary" style={{ width: '100%' }}>Login to Dashboard</button>
      </div>
    </div>
  );
};

export default Login;