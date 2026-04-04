import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Lock, Mail, Eye, EyeOff, Code2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const schema = yup.object({
  email:    yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, error, clearError, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(location.state?.from?.pathname || '/', { replace: true });
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => () => clearError(), []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError(null);
    const result = await login(data.email, data.password);
    if (!result.success) setLoginError(result.error);
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '36px', height: '36px', border: '2px solid rgba(124,58,237,0.2)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', width: 500, height: 500, background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', top: '-100px', right: '-100px', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 350, height: 350, background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', bottom: '-50px', left: '5%', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 12px 32px rgba(124,58,237,0.35)'
          }}>
            <Code2 size={26} color="white" />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#f1f0ff' }}>
            Portfolio <span style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CMS</span>
          </h1>
          <p style={{ color: '#9490b5', fontSize: '0.85rem', marginTop: '4px' }}>Sign in to your admin account</p>
        </div>

        {/* Card */}
        <div className="dark-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* Error */}
            {(loginError || error) && (
              <div className="alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={14} color="#f87171" />
                <span>{loginError || error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#524f6e' }} />
                <input
                  type="email"
                  placeholder="admin@portfolio.com"
                  disabled={isLoading}
                  className={`dark-input ${errors.email ? 'error' : ''}`}
                  style={{ paddingLeft: '32px' }}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#524f6e' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`dark-input ${errors.password ? 'error' : ''}`}
                  style={{ paddingLeft: '32px', paddingRight: '36px' }}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#524f6e', cursor: 'pointer', display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            {/* Remember */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#7c3aed', width: '14px', height: '14px' }} />
                <span style={{ fontSize: '0.78rem', color: '#9490b5' }}>Remember me</span>
              </label>
              <a href="#" style={{ fontSize: '0.78rem', color: '#8b5cf6', textDecoration: 'none' }}>Forgot password?</a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            >
              {isLoading ? (
                <><div style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Signing In...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#524f6e', marginTop: '1.5rem' }}>
          © {new Date().getFullYear()} Portfolio CMS · Secured by JWT authentication
        </p>
      </div>
    </div>
  );
};

export default Login;
