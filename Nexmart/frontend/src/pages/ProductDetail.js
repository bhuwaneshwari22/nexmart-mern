import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/products/${id}`).then(res => {
      setProduct(res.data);
      setLoading(false);
    }).catch(() => { toast.error('Product not found'); navigate('/products'); });
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await addToCart(product._id, qty);
      toast.success('Added to cart!');
    } catch { toast.error('Failed'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      await axios.post(`/api/products/${id}/review`, review);
      toast.success('Review submitted!');
      const res = await axios.get(`/api/products/${id}`);
      setProduct(res.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
  };

  if (loading) return <div className="loading-center" style={{ paddingTop: 80 }}><div className="spinner" /></div>;
  if (!product) return null;

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const images = product.images?.length > 0 ? product.images : [`https://picsum.photos/seed/${product._id}/600/600`];

  return (
    <div style={{ paddingTop: 80 }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 32, display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, color: 'rgba(240,240,248,0.4)' }}>
          <Link to="/" style={{ color: '#c8a96e' }}>Home</Link> /
          <Link to="/products" style={{ color: '#c8a96e' }}>Products</Link> /
          <span>{product.name}</span>
        </div>

        {/* Main product section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginBottom: 60 }}>
          {/* Images */}
          <div>
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 12, border: '1px solid var(--border)' }}>
              <img src={images[activeImg]} alt={product.name} style={{ width: '100%', height: 480, objectFit: 'cover' }}
                onError={e => { e.target.src = `https://picsum.photos/seed/${product._id}/600/600`; }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)}
                  style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${activeImg === i ? '#c8a96e' : 'var(--border)'}` }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = `https://picsum.photos/seed/${product._id}${i}/80/80`; }} />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            {/* Vendor */}
            <Link to={`/vendor/${product.vendor?._id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 20, padding: '6px 14px', marginBottom: 16, color: '#c8a96e', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
              🏪 {product.vendor?.shopName}
              {product.vendor?.isVerified && <span style={{ color: '#10d97a' }}>✓</span>}
            </Link>

            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 42, fontWeight: 700, color: '#f0f0f8', marginBottom: 16, lineHeight: 1.1 }}>{product.name}</h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ color: '#ffb800', fontSize: 18 }}>{'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}</div>
              <span style={{ color: 'rgba(240,240,248,0.5)', fontSize: 14 }}>({product.totalReviews || 0} reviews)</span>
              <span style={{ color: product.stock > 0 ? '#10d97a' : '#ff4e6a', fontSize: 13, fontWeight: 600 }}>
                {product.stock > 0 ? `✓ ${product.stock} in stock` : '✗ Out of stock'}
              </span>
            </div>

            {/* Price */}
            <div style={{ marginBottom: 32 }}>
              <span style={{ fontSize: 48, fontWeight: 700, color: '#c8a96e', fontFamily: 'Cormorant Garamond, serif' }}>₹{price.toLocaleString()}</span>
              {product.discountPrice > 0 && (
                <span style={{ marginLeft: 12, fontSize: 22, color: 'rgba(240,240,248,0.3)', textDecoration: 'line-through' }}>₹{product.price.toLocaleString()}</span>
              )}
            </div>

            <p style={{ color: 'rgba(240,240,248,0.7)', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>{product.description}</p>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                {product.tags.map(tag => (
                  <span key={tag} style={{ background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#c8a96e' }}>{tag}</span>
                ))}
              </div>
            )}

            {/* Qty + Cart */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 44, height: 52, background: 'transparent', border: 'none', color: '#c8a96e', cursor: 'pointer', fontSize: 20 }}>−</button>
                <span style={{ width: 50, textAlign: 'center', fontSize: 16, fontWeight: 600 }}>{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} style={{ width: 44, height: 52, background: 'transparent', border: 'none', color: '#c8a96e', cursor: 'pointer', fontSize: 20 }}>+</button>
              </div>
              <button onClick={handleAddToCart} className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={product.stock === 0}>
                🛒 Add to Cart
              </button>
            </div>
            <button onClick={() => { handleAddToCart(); navigate('/checkout'); }} className="btn btn-outline btn-lg" style={{ width: '100%' }} disabled={product.stock === 0}>
              Buy Now
            </button>

            {/* Info pills */}
            <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
              {['🚚 Free Delivery', '↩ Easy Returns', '🔒 Secure Payment'].map(item => (
                <span key={item} style={{ fontSize: 12, color: 'rgba(240,240,248,0.5)' }}>{item}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#f0f0f8', marginBottom: 24 }}>Customer Reviews</h2>
            {product.reviews?.length === 0 ? (
              <div style={{ color: 'rgba(240,240,248,0.4)', padding: '40px 0' }}>No reviews yet. Be the first!</div>
            ) : (
              product.reviews?.map((r, i) => (
                <div key={i} className="card" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong>{r.name}</strong>
                    <span style={{ color: '#ffb800' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p style={{ color: 'rgba(240,240,248,0.6)', fontSize: 14 }}>{r.comment}</p>
                  <div style={{ fontSize: 12, color: 'rgba(240,240,248,0.3)', marginTop: 8 }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>

          {user && (
            <div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#f0f0f8', marginBottom: 24 }}>Write a Review</h2>
              <form onSubmit={handleReview} className="card">
                <div className="form-group">
                  <label>Rating</label>
                  <div style={{ display: 'flex', gap: 8, fontSize: 28, cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} onClick={() => setReview({ ...review, rating: star })} style={{ color: star <= review.rating ? '#ffb800' : 'rgba(240,240,248,0.2)', transition: 'color 0.2s' }}>★</span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Comment</label>
                  <textarea className="form-control" rows={4} placeholder="Share your experience..."
                    value={review.comment} onChange={e => setReview({ ...review, comment: e.target.value })}
                    style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Review</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
