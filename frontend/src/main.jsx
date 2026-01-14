import React from 'react';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// 🛡️ Error Boundary + Global Error Handler
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Global Error:', error, errorInfo);
    // 💾 Log to your error service (Sentry, LogRocket, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-600 flex flex-col items-center justify-center p-6 text-center">
          <div className="emergency-alert mb-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🚨 System Alert
          </h1>
          <p className="text-xl text-white/90 max-w-md mb-8">
            Something went wrong. Emergency services are still operational.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary max-w-sm w-full"
          >
            🔄 Restart Emergency App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ⚡ Performance & Analytics
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry 4xx errors or auth errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
    },
  },
});

// 🖥️ PWA Support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  });
}

// 📊 Performance Monitoring
if (import.meta.env.PROD) {
  // Report to your analytics service
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}

// 🚀 Render with Production Optimizations
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <App />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  backdropFilter: 'blur(20px)',
                },
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
    
);

// 🧹 HMR for development (Vite-specific)
if (import.meta.hot) {
  import.meta.hot.accept();
}