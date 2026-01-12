import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Lazy load components for better performance
const Navbar = React.lazy(() => import('./Navbar'));
const Home = React.lazy(() => import('./Home'));
const LiveMap = React.lazy(() => import('./LiveMap'));
const Report = React.lazy(() => import('./Report'));
const Dashboard = React.lazy(() => import('./Dashboard'));
const Login = React.lazy(() => import('./Login'));

// Styles
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function App() {
  return (
    <div className="app-container min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ScrollToTop />
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <Navbar />
        <main className="main-content flex-1 pb-20 md:pb-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/report" element={<Report />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<div className="flex flex-col items-center justify-center h-96 text-gray-500">404 - Page Not Found</div>} />
          </Routes>
        </main>
      </Suspense>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;