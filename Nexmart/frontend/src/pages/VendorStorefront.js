import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const VendorStorefront = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/vendors/${id}`).then(res => {
      setVendor(res.data.vendor);
      setProducts(res.data.products);
      setLoading(false);
    }).catch(() => { toast.error('Vendor not found'); navigate('/products'); });
  }, [id]);

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    try { await addToCart(productId); toast.success('Added to cart!'); }
    catch { toast.error('Failed to add'); }
  };

  if (loading) return <div className="loading-center" style={{ paddingTop: 80 }}><div className="spinner" /></div>;
  if (!vendor) return null;

  return (
    <div style={{ paddingTop: 72 }}>
      {/* Banner */}
      <div style={{
        height: 280, background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
        display: 'flex', alignItems: 'flex-end', padding: '0 40px 32px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 50%, rgba(200,169,110,0.12) 0%, transparent 70%)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
          <div style={{ width: 90, height: 90, borderRadius: 16, background: 'linear-gradient(135deg,#c8a96e,#e8cc9e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, boxShadow: '0 8px 32px rgba(200,169,110,0.3)' }}>🏪</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, color: '#f0f0f8' }}>{vendor.shopName}</h1>
              {vendor.isVerified && <span style={{ background: 'rgba(16,217,122,0.15)', color: '#10d97a', border: '1px solid rgba(16,217,122,0.3)', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>✓ Verified</span>}
            </div>
            <p style={{ color: 'rgba(240,240,248,0.6)', fontSize: 15, marginBottom: 10 }}>{vendor.shopDescription || 'Welcome to our store!'}</p>
            <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'rgba(240,240,248,0.5)' }}>
              <span>⭐ {vendor.rating?.toFixed(1) || '0.0'} rating</span>
              <span>📦 {vendor.totalSales || 0} sales</span>
              <span>🏷️ {vendor.category}</span>
              <span>📅 Since {new Date(vendor.createdAt).getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#f0f0f8' }}>
            Products <span style={{ color: 'rgba(240,240,248,0.3)', fontSize: 20 }}>({products.length})</span>
          </h2>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(240,240,248,0.4)' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📭</div>
            <p>No products listed yet</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(product => {
              const price = product.discountPrice > 0 ? product.discountPrice : product.price;
              return (
                <div key={product._id} className="product-card" onClick={() => navigate(`/products/${product._id}`)}>
                  <div style={{ position: 'relative' }}>
                    <img src={product.images?.[0] || `https://picsum.photos/seed/${product._id}/400/300`} alt={product.name}
                      className="product-card-img"
                      onError={e => { e.target.src = `https://picsum.photos/seed/${product._id}/400/300`; }} />
                    {product.discountPrice > 0 && (
                      <div style={{ position: 'absolute', top: 12, left: 12, background: '#ff4e6a', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  <div className="product-card-body">
                    <div className="product-card-name">{product.name}</div>
                    <div className="product-card-rating">
                      {'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}
                      <span style={{ color: 'rgba(240,240,248,0.4)', fontSize: 12 }}>({product.totalReviews || 0})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
                      <span className="product-card-price">₹{price.toLocaleString()}</span>
                      {product.discountPrice > 0 && <span className="product-card-old-price">₹{product.price.toLocaleString()}</span>}
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }}
                      onClick={e => handleAddToCart(e, product._id)} disabled={product.stock === 0}>
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorStorefront;
