import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', form);
      login(res.data);
      toast.success(`Welcome back, ${res.data.name}!`);
      if (res.data.role === 'admin') navigate('/admin');
      else if (res.data.role === 'vendor') navigate('/vendor-dashboard');
      else navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your NEXMART account">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" className="form-control" placeholder="your@email.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" className="form-control" placeholder="••••••••"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px' }} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 24, color: 'rgba(240,240,248,0.5)', fontSize: 14 }}>
          Don't have an account? <Link to="/register" style={{ color: '#c8a96e' }}>Register here</Link>
        </div>
        <div style={{ marginTop: 24, padding: 16, background: 'rgba(200,169,110,0.05)', borderRadius: 8, border: '1px solid rgba(200,169,110,0.15)' }}>
          <p style={{ fontSize: 12, color: 'rgba(240,240,248,0.5)', marginBottom: 8 }}>Demo Accounts:</p>
          <p style={{ fontSize: 12, color: 'rgba(240,240,248,0.4)' }}>Admin: admin@nexmart.com / admin123</p>
          <p style={{ fontSize: 12, color: 'rgba(240,240,248,0.4)' }}>Vendor: vendor@nexmart.com / vendor123</p>
          <p style={{ fontSize: 12, color: 'rgba(240,240,248,0.4)' }}>Buyer: buyer@nexmart.com / buyer123</p>
        </div>
      </form>
    </AuthLayout>
  );
};

export const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer', shopName: '', category: 'Electronics' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', form);
      login(res.data);
      toast.success('Account created successfully!');
      if (res.data.role === 'vendor') navigate('/vendor-dashboard');
      else navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Join NEXMART" subtitle="Create your account and start shopping or selling">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" className="form-control" placeholder="John Doe"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" className="form-control" placeholder="your@email.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" className="form-control" placeholder="Minimum 6 characters"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
        </div>
        <div className="form-group">
          <label>I want to</label>
          <div style={{ display: 'flex', gap: 12 }}>
            {['buyer', 'vendor'].map(r => (
              <button key={r} type="button"
                onClick={() => setForm({ ...form, role: r })}
                style={{
                  flex: 1, padding: '14px', border: `2px solid ${form.role === r ? '#c8a96e' : 'var(--border)'}`,
                  borderRadius: 8, background: form.role === r ? 'rgba(200,169,110,0.1)' : 'var(--surface2)',
                  color: form.role === r ? '#c8a96e' : 'rgba(240,240,248,0.6)', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >{r === 'buyer' ? '🛒 Shop (Buyer)' : '🏪 Sell (Vendor)'}</button>
            ))}
          </div>
        </div>
        {form.role === 'vendor' && (
          <>
            <div className="form-group">
              <label>Shop Name</label>
              <input type="text" className="form-control" placeholder="My Awesome Shop"
                value={form.shopName} onChange={e => setForm({ ...form, shopName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Shop Category</label>
              <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Books', 'Beauty', 'General'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </>
        )}
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px' }} disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account →'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 24, color: 'rgba(240,240,248,0.5)', fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: '#c8a96e' }}>Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

const AuthLayout = ({ title, subtitle, children }) => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(160deg, #0a0a0f 0%, #1a1a2e 100%)', padding: '100px 24px 60px'
  }}>
    <div style={{
      width: '100%', maxWidth: 460, background: 'rgba(26,26,46,0.9)', border: '1px solid rgba(200,169,110,0.2)',
      borderRadius: 24, padding: 48, backdropFilter: 'blur(20px)', boxShadow: '0 40px 80px rgba(0,0,0,0.4)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Link to="/" style={{ display: 'inline-block', fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: '#c8a96e', letterSpacing: 3, marginBottom: 24 }}>NEXMART</Link>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 600, color: '#f0f0f8', marginBottom: 8 }}>{title}</h1>
        <p style={{ color: 'rgba(240,240,248,0.5)', fontSize: 15 }}>{subtitle}</p>
      </div>
      {children}
    </div>
  </div>
);

export default Login;
