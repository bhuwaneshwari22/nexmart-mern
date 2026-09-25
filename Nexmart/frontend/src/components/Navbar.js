import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    background: scrolled ? 'rgba(10,10,15,0.95)' : 'transparent',
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(200,169,110,0.2)' : 'none',
    transition: 'all 0.3s ease', padding: '0 24px',
  };

  return (
    <nav style={navStyle}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #c8a96e, #e8cc9e)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#0a0a0f' }}>N</div>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 700, color: '#f0f0f8', letterSpacing: 2 }}>NEXMART</span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[
            { to: '/products', label: 'Shop' },
            { to: '/products?category=Electronics', label: 'Electronics' },
            { to: '/products?category=Fashion', label: 'Fashion' },
          ].map(link => (
            <Link key={link.to} to={link.to} style={{
              fontSize: 14, fontWeight: 500, color: location.pathname === link.to ? '#c8a96e' : 'rgba(240,240,248,0.8)',
              transition: 'color 0.2s', letterSpacing: 0.5
            }}
              onMouseEnter={e => e.target.style.color = '#c8a96e'}
              onMouseLeave={e => e.target.style.color = location.pathname === link.to ? '#c8a96e' : 'rgba(240,240,248,0.8)'}
            >{link.label}</Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user && (
            <Link to="/cart" style={{ position: 'relative', color: 'var(--text)', fontSize: 20 }}>
              🛒
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -8, right: -8, background: '#c8a96e', color: '#0a0a0f',
                  borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{cartCount}</span>
              )}
            </Link>
          )}

          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{
                display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(200,169,110,0.1)',
                border: '1px solid rgba(200,169,110,0.3)', borderRadius: 8, padding: '8px 16px',
                color: '#c8a96e', cursor: 'pointer', fontSize: 14, fontWeight: 500
              }}>
                {user.name.split(' ')[0]} ▾
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '120%', right: 0, background: '#1a1a2e',
                  border: '1px solid rgba(200,169,110,0.2)', borderRadius: 12, padding: 8,
                  minWidth: 180, zIndex: 100, boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
                }}>
                  {user.role === 'vendor' && <DropItem to="/vendor-dashboard" icon="📊" label="Dashboard" onClick={() => setMenuOpen(false)} />}
                  {user.role === 'admin' && <DropItem to="/admin" icon="⚙️" label="Admin Panel" onClick={() => setMenuOpen(false)} />}
                  <DropItem to="/orders" icon="📦" label="My Orders" onClick={() => setMenuOpen(false)} />
                  <DropItem to="/disputes" icon="⚖️" label="Disputes" onClick={() => setMenuOpen(false)} />
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(200,169,110,0.2)', margin: '8px 0' }} />
                  <button onClick={handleLogout} style={{
                    width: '100%', padding: '10px 16px', background: 'rgba(255,78,106,0.1)',
                    border: 'none', borderRadius: 8, color: '#ff4e6a', cursor: 'pointer',
                    fontSize: 14, textAlign: 'left', display: 'flex', gap: 8, alignItems: 'center'
                  }}>🚪 Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Now</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const DropItem = ({ to, icon, label, onClick }) => (
  <Link to={to} onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
    borderRadius: 8, color: 'rgba(240,240,248,0.8)', fontSize: 14, transition: 'all 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,169,110,0.1)'; e.currentTarget.style.color = '#c8a96e'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(240,240,248,0.8)'; }}
  >{icon} {label}</Link>
);

export default Navbar;
