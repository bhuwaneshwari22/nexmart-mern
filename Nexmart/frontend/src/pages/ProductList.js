import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const categories = ['All', 'Electronics', 'Fashion', 'Home & Living', 'Sports', 'Books', 'Beauty', 'General'];

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    fetchProducts();
  }, [category, search, sort, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);
      const res = await axios.get(`/api/products?${params}`);
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error('Failed to load products');
    } finally { setLoading(false); }
  };

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    try {
      await addToCart(productId);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
    setPage(1);
  };

  return (
    <div style={{ paddingTop: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, #1a1a2e, #0a0a0f)', padding: '60px 24px 40px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 48, color: '#f0f0f8', marginBottom: 12 }}>
          {search ? `Results for "${search}"` : category || 'All Products'}
        </h1>
        <p style={{ color: 'rgba(240,240,248,0.5)', fontSize: 16 }}>{total} products found</p>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        <div className="sidebar-layout">
          {/* Sidebar filters */}
          <aside>
            <div className="card" style={{ position: 'sticky', top: 90 }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, marginBottom: 24, color: '#c8a96e' }}>Filters</h3>

              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(240,240,248,0.4)', marginBottom: 16 }}>Category</div>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setFilter('category', cat === 'All' ? '' : cat)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px',
                      background: (category === cat || (cat === 'All' && !category)) ? 'rgba(200,169,110,0.15)' : 'transparent',
                      border: 'none', borderRadius: 8, color: (category === cat || (cat === 'All' && !category)) ? '#c8a96e' : 'rgba(240,240,248,0.6)',
                      cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
                      marginBottom: 4
                    }}
                  >{cat}</button>
                ))}
              </div>

              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(240,240,248,0.4)', marginBottom: 16 }}>Sort By</div>
                {[
                  { value: '', label: 'Latest' },
                  { value: 'price_asc', label: 'Price: Low to High' },
                  { value: 'price_desc', label: 'Price: High to Low' },
                  { value: 'rating', label: 'Highest Rated' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => setFilter('sort', opt.value)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px',
                      background: sort === opt.value ? 'rgba(200,169,110,0.15)' : 'transparent',
                      border: 'none', borderRadius: 8, color: sort === opt.value ? '#c8a96e' : 'rgba(240,240,248,0.6)',
                      cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif', marginBottom: 4, transition: 'all 0.2s'
                    }}
                  >{opt.label}</button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div>
            {loading ? (
              <div className="product-grid">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ height: 220 }} className="shimmer" />
                    <div style={{ padding: 20 }}>
                      <div style={{ height: 10, borderRadius: 4, marginBottom: 8 }} className="shimmer" />
                      <div style={{ height: 18, borderRadius: 4, marginBottom: 10, width: '70%' }} className="shimmer" />
                      <div style={{ height: 22, borderRadius: 4, width: '40%' }} className="shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(240,240,248,0.4)' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, marginBottom: 12 }}>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map(product => {
                    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
                    const hasDiscount = product.discountPrice > 0;
                    return (
                      <div key={product._id} className="product-card" onClick={() => navigate(`/products/${product._id}`)}>
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
                          <Link to={`/vendor/${product.vendor?._id}`} onClick={e => e.stopPropagation()} className="product-card-vendor">
                            {product.vendor?.shopName || 'Vendor'}
                          </Link>
                          <div className="product-card-name">{product.name}</div>
                          <div className="product-card-rating">
                            {'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}
                            <span style={{ color: 'rgba(240,240,248,0.5)', fontSize: 12 }}>({product.totalReviews || 0})</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                            <span className="product-card-price">₹{price.toLocaleString()}</span>
                            {hasDiscount && <span className="product-card-old-price">₹{product.price.toLocaleString()}</span>}
                          </div>
                          <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px' }}
                            onClick={e => handleAddToCart(e, product._id)}
                          >Add to Cart</button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {total > 12 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
                    {Array.from({ length: Math.ceil(total / 12) }).map((_, i) => (
                      <button key={i} onClick={() => setPage(i + 1)}
                        style={{
                          padding: '10px 16px', border: `1px solid ${page === i + 1 ? '#c8a96e' : 'var(--border)'}`,
                          borderRadius: 8, background: page === i + 1 ? '#c8a96e' : 'transparent',
                          color: page === i + 1 ? '#0a0a0f' : 'rgba(240,240,248,0.6)',
                          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: page === i + 1 ? 600 : 400
                        }}
                      >{i + 1}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
