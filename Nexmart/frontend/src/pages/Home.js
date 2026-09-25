import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const categories = [
  { name: 'Electronics', icon: '💻', color: '#38bdf8' },
  { name: 'Fashion', icon: '👗', color: '#f472b6' },
  { name: 'Home & Living', icon: '🏠', color: '#34d399' },
  { name: 'Sports', icon: '⚽', color: '#fb923c' },
  { name: 'Books', icon: '📚', color: '#a78bfa' },
  { name: 'Beauty', icon: '✨', color: '#fbbf24' },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/products?limit=8').then(res => setFeaturedProducts(res.data.products || []));
    axios.get('/api/vendors').then(res => setVendors(res.data.slice(0, 4) || []));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${search}`);
  };

  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
        paddingTop: 100
      }}>
        {/* Animated background orbs */}
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,169,110,0.08) 0%, transparent 70%)', top: '10%', left: '60%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)', bottom: '20%', left: '20%', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', maxWidth: 800, padding: '0 24px', position: 'relative', animation: 'fadeUp 0.8s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.3)', borderRadius: 30, padding: '8px 20px', marginBottom: 32, fontSize: 13, color: '#c8a96e', letterSpacing: 2, textTransform: 'uppercase' }}>
            ✦ Multi-Vendor Marketplace ✦
          </div>

          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 700, lineHeight: 1, color: '#f0f0f8', marginBottom: 24 }}>
            Shop From<br /><span style={{ background: 'linear-gradient(135deg, #c8a96e, #e8cc9e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>1000+ Sellers</span><br />One Cart
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(240,240,248,0.6)', marginBottom: 48, lineHeight: 1.7, maxWidth: 500, margin: '0 auto 48px' }}>
            Discover unique products from verified vendors across India. Add items from multiple shops to a single cart and checkout seamlessly.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0, maxWidth: 560, margin: '0 auto 48px', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(200,169,110,0.3)', background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(20px)' }}>
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, padding: '18px 24px', background: 'transparent', border: 'none', color: '#f0f0f8', fontSize: 15, fontFamily: 'DM Sans, sans-serif' }}
            />
            <button type="submit" style={{ padding: '18px 28px', background: 'linear-gradient(135deg, #c8a96e, #e8cc9e)', border: 'none', cursor: 'pointer', fontSize: 20 }}>🔍</button>
          </form>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary btn-lg">Explore Products</Link>
            <Link to="/register?role=vendor" className="btn btn-outline btn-lg">Become a Seller</Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'rgba(240,240,248,0.3)', fontSize: 12, letterSpacing: 2 }}>
          <span>SCROLL</span>
          <div style={{ width: 1, height: 50, background: 'linear-gradient(to bottom, rgba(200,169,110,0.5), transparent)', animation: 'shimmer 1.5s ease infinite' }} />
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '80px 24px', background: 'rgba(26,26,46,0.3)' }}>
        <div className="container">
          <div className="stats-grid">
            {[
              { value: '10K+', label: 'Products Listed' },
              { value: '500+', label: 'Verified Vendors' },
              { value: '50K+', label: 'Happy Buyers' },
              { value: '₹2Cr+', label: 'Transactions' },
            ].map(stat => (
              <div key={stat.label} className="stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '80px 24px' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 48 }}>Shop by <span>Category</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
            {categories.map(cat => (
              <Link key={cat.name} to={`/products?category=${cat.name}`}
                style={{
                  background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16,
                  padding: '32px 16px', textAlign: 'center', transition: 'all 0.3s', display: 'block',
                  textDecoration: 'none'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${cat.color}20`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>{cat.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#f0f0f8' }}>{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '80px 24px', background: 'rgba(10,10,15,0.5)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
            <h2 className="section-title">Featured <span>Products</span></h2>
            <Link to="/products" className="btn btn-outline">View All →</Link>
          </div>
          <div className="product-grid">
            {featuredProducts.length > 0 ? featuredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            )) : (
              // Placeholder cards while loading
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ height: 220 }} className="shimmer" />
                  <div style={{ padding: 20 }}>
                    <div style={{ height: 12, borderRadius: 6, marginBottom: 8 }} className="shimmer" />
                    <div style={{ height: 20, borderRadius: 6, marginBottom: 12, width: '70%' }} className="shimmer" />
                    <div style={{ height: 24, borderRadius: 6, width: '40%' }} className="shimmer" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Top Vendors */}
      {vendors.length > 0 && (
        <section style={{ padding: '80px 24px' }}>
          <div className="container">
            <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 48 }}>Top <span>Vendors</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              {vendors.map(vendor => (
                <Link key={vendor._id} to={`/vendor/${vendor._id}`}
                  style={{
                    background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16,
                    padding: 24, display: 'block', transition: 'all 0.3s', textDecoration: 'none'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,169,110,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, #c8a96e, #e8cc9e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🏪</div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f0f0f8', marginBottom: 4 }}>{vendor.shopName}</div>
                      <div style={{ fontSize: 12, color: '#c8a96e' }}>{vendor.category}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(240,240,248,0.5)' }}>
                    <span>⭐ {vendor.rating?.toFixed(1) || '0.0'}</span>
                    <span>{vendor.totalSales || 0} sales</span>
                    {vendor.isVerified && <span style={{ color: '#10d97a' }}>✓ Verified</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #1a1a2e, #0f3460)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 700, color: '#f0f0f8', marginBottom: 20 }}>
            Start Selling on <span style={{ color: '#c8a96e' }}>NEXMART</span> Today
          </h2>
          <p style={{ color: 'rgba(240,240,248,0.6)', fontSize: 18, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
            Join 500+ vendors earning commissions automatically managed. Stripe Connect for seamless payouts.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">Register as Vendor →</Link>
        </div>
      </section>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0;

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product._id}`)}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={product.images?.[0] || `https://picsum.photos/seed/${product._id}/400/300`}
          alt={product.name}
          className="product-card-img"
          onError={e => { e.target.src = `https://picsum.photos/seed/${product._id}/400/300`; }}
        />
        {hasDiscount && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: '#ff4e6a', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
          </div>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-vendor">{product.vendor?.shopName || 'Vendor'}</div>
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-rating">
          {'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}
          <span style={{ color: 'rgba(240,240,248,0.5)', fontSize: 12 }}>({product.totalReviews || 0})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="product-card-price">₹{price.toLocaleString()}</span>
          {hasDiscount && <span className="product-card-old-price">₹{product.price.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
};

export default Home;
