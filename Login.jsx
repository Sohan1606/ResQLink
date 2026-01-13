import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [role, setRole] = useState('community');
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  // 🛡️ Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🚀 Production-ready login mutation
  const loginMutation = useMutation({
    mutationFn: async (selectedRole) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulate API delay (200-800ms for realism)
          const delay = 200 + Math.random() * 600;
          
          // Production: Replace with real auth API
          // await authService.login({ role: selectedRole });
          
          localStorage.setItem('userRole', selectedRole);
          localStorage.setItem('loginTime', Date.now().toString());
          resolve(selectedRole);
        }, delay);
      });
    },
    onSuccess: (userRole) => {
      toast.success(
        `Welcome ${userRole === 'agency' ? 'Agency Responder' : 'Community Member'}!`,
        { 
          duration: 3000,
          position: 'top-right',
          style: {
            background: 'var(--gradient-success)',
            color: 'white',
            backdropFilter: 'blur(20px)',
          }
        }
      );
      
      // Navigate based on role
      const destination = userRole === 'agency' ? '/agency-dashboard' : '/';
      setTimeout(() => navigate(destination, { replace: true }), 800);
    },
    onError: (error) => {
      toast.error('Login failed. Please try again.', {
        duration: 4000,
        position: 'top-right'
      });
    },
  });

  const handleRoleSelect = useCallback((newRole) => {
    if (!loginMutation.isPending) {
      setRole(newRole);
    }
  }, [loginMutation.isPending]);

  const handleLogin = useCallback(() => {
    if (!loginMutation.isPending) {
      loginMutation.mutate(role);
    }
  }, [loginMutation, role]);

  // ♿ Keyboard accessibility
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !loginMutation.isPending) {
      handleLogin();
    }
  }, [handleLogin, loginMutation.isPending]);

  if (!mounted) {
    return (
      <div className="flex-center min-h-screen">
        <div className="loading-skeleton h-64 w-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <main 
      className="min-h-screen flex-center p-4 lg:p-8" 
      role="main"
      aria-label="ResQLink Login"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="card max-w-sm w-full lg:max-w-md"
        role="form"
        aria-labelledby="login-title"
      >
        {/* 🚨 Emergency Branding */}
        <div className="emergency-alert mb-8 p-4 rounded-xl bg-gradient-to-r from-accent/20 to-warning/20 border border-accent/30">
          <div className="flex items-center gap-3">
            <div className="w-3 h-12 bg-gradient-to-b from-accent to-critical rounded-lg shadow-lg" />
            <div>
              <h1 id="login-title" className="text-2xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                ResQLink Access
              </h1>
              <p className="text-sm text-dim mt-1">Emergency Response Platform</p>
            </div>
          </div>
        </div>

        {/* 📝 Role Selection */}
        <div className="space-y-4 mb-8" role="radiogroup" aria-labelledby="role-selection">
          <p className="text-secondary text-center text-lg font-medium mb-6">
            Select your role to continue
          </p>

          {/* Community Member */}
          <button
            className={`btn w-full p-6 text-left transition-all duration-300 group hover:shadow-2xl ${
              role === 'community' 
                ? 'bg-gradient-to-r from-secondary to-blue-600 shadow-lg shadow-blue-500/25 border-2 border-blue-400/50' 
                : 'bg-bg-card/80 hover:bg-bg-card border border-border-hover'
            }`}
            onClick={() => handleRoleSelect('community')}
            disabled={loginMutation.isPending}
            aria-label="Select Community Member role"
            aria-checked={role === 'community'}
            role="radio"
          >
            <div className="flex items-start gap-4">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 transition-all ${
                role === 'community' ? 'bg-white w-3 h-3 shadow-lg' : 'bg-text-dim'
              }`} />
              <div>
                <div className="font-semibold text-lg mb-1 group-hover:text-secondary">
                  👤 Community Member
                </div>
                <div className="text-dim text-sm leading-relaxed">
                  Report incidents, view real-time map, get safety updates
                </div>
              </div>
            </div>
          </button>

          {/* Agency Responder */}
          <button
            className={`btn w-full p-6 text-left transition-all duration-300 group hover:shadow-2xl ${
              role === 'agency' 
                ? 'bg-gradient-to-r from-success to-emerald-600 shadow-lg shadow-emerald-500/25 border-2 border-emerald-400/50' 
                : 'bg-bg-card/80 hover:bg-bg-card border border-border-hover'
            }`}
            onClick={() => handleRoleSelect('agency')}
            disabled={loginMutation.isPending}
            aria-label="Select Agency Responder role"
            aria-checked={role === 'agency'}
            role="radio"
          >
            <div className="flex items-start gap-4">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 transition-all ${
                role === 'agency' ? 'bg-white w-3 h-3 shadow-lg' : 'bg-text-dim'
              }`} />
              <div>
                <div className="font-semibold text-lg mb-1 group-hover:text-success">
                  🏥 Agency Responder
                </div>
                <div className="text-dim text-sm leading-relaxed">
                  Agency dashboard, incident coordination, team dispatch
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* 🚀 Login Button */}
        <button
          className="btn w-full bg-gradient-to-r from-accent to-critical text-white shadow-xl shadow-accent/40 hover:shadow-2xl hover:shadow-accent/50 hover:-translate-y-1 border-2 border-accent/30 font-bold py-5 text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-accent/50 rounded-2xl"
          onClick={handleLogin}
          disabled={loginMutation.isPending}
          aria-label={`Enter ${role === 'agency' ? 'Agency Dashboard' : 'Community Platform'}`}
        >
          {loginMutation.isPending ? (
            <>
              <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Logging in...
            </>
          ) : (
            `🚀 Enter ${role === 'agency' ? 'Agency Dashboard' : 'Community Platform'}`
          )}
        </button>

        {/* ℹ️ Demo Info */}
        <p className="text-xs text-dim mt-6 text-center opacity-75">
          🔓 Demo Mode - No credentials required
        </p>

        {/* 📊 Debug (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 p-2 bg-bg-darker/50 rounded-lg text-xs">
            <summary className="cursor-pointer font-mono">Debug</summary>
            <pre className="mt-2 text-dim">
              Role: {role} | Status: {loginMutation.status}
            </pre>
          </details>
        )}
      </div>
    </main>
  );
};

export default Login;
