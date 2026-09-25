import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{
    background: '#0a0a0f', borderTop: '1px solid rgba(200,169,110,0.15)',
    padding: '60px 24px 30px', marginTop: 80
  }}>
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 50 }}>
        <div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: '#c8a96e', marginBottom: 12, letterSpacing: 2 }}>NEXMART</div>
          <p style={{ color: 'rgba(240,240,248,0.5)', fontSize: 14, lineHeight: 1.7 }}>
            The premium multi-vendor marketplace connecting buyers with verified sellers across India.
          </p>
        </div>
        <div>
          <h4 style={{ color: '#c8a96e', marginBottom: 16, fontSize: 13, textTransform: 'uppercase', letterSpacing: 2 }}>Shop</h4>
          {['All Products', 'Electronics', 'Fashion', 'Home & Living', 'Sports'].map(item => (
            <Link key={item} to={`/products?category=${item}`} style={{ display: 'block', color: 'rgba(240,240,248,0.5)', fontSize: 14, marginBottom: 8 }}
              onMouseEnter={e => e.target.style.color = '#c8a96e'}
              onMouseLeave={e => e.target.style.color = 'rgba(240,240,248,0.5)'}
            >{item}</Link>
          ))}
        </div>
        <div>
          <h4 style={{ color: '#c8a96e', marginBottom: 16, fontSize: 13, textTransform: 'uppercase', letterSpacing: 2 }}>Sellers</h4>
          {['Register as Vendor', 'Vendor Dashboard', 'Commission Policy', 'Payout Schedule'].map(item => (
            <Link key={item} to="/register" style={{ display: 'block', color: 'rgba(240,240,248,0.5)', fontSize: 14, marginBottom: 8 }}
              onMouseEnter={e => e.target.style.color = '#c8a96e'}
              onMouseLeave={e => e.target.style.color = 'rgba(240,240,248,0.5)'}
            >{item}</Link>
          ))}
        </div>
        <div>
          <h4 style={{ color: '#c8a96e', marginBottom: 16, fontSize: 13, textTransform: 'uppercase', letterSpacing: 2 }}>Support</h4>
          {['Track Order', 'Return Policy', 'Dispute Center', 'Contact Us'].map(item => (
            <Link key={item} to="/disputes" style={{ display: 'block', color: 'rgba(240,240,248,0.5)', fontSize: 14, marginBottom: 8 }}
              onMouseEnter={e => e.target.style.color = '#c8a96e'}
              onMouseLeave={e => e.target.style.color = 'rgba(240,240,248,0.5)'}
            >{item}</Link>
          ))}
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(200,169,110,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <p style={{ color: 'rgba(240,240,248,0.3)', fontSize: 13 }}>© 2024 NEXMART. Built with MongoDB, Express.js, React, Node.js & JSP Reports.</p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Cookies'].map(item => (
            <span key={item} style={{ color: 'rgba(240,240,248,0.3)', fontSize: 13, cursor: 'pointer' }}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
