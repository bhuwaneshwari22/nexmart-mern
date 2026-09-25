import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const tabs = ['Overview', 'Products', 'Orders', 'Commissions', 'Reports'];

const VendorDashboard = () => {
  const { user, vendor } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', discountPrice: '', category: 'Electronics', stock: '', images: [''], tags: '' });

  useEffect(() => {
    if (!user || user.role !== 'vendor') { navigate('/login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vRes, pRes, oRes, cRes] = await Promise.all([
        axios.get('/api/vendors/me/profile'),
        axios.get(`/api/products?vendor=${vendor?._id}&limit=50`),
        axios.get('/api/orders/vendor'),
        axios.get('/api/commission/vendor'),
      ]);
      setStats(vRes.data);
      setProducts(pRes.data.products || []);
      setOrders(oRes.data || []);
      setCommissions(cRes.data || []);
    } catch (err) { toast.error('Failed to load data'); }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const data = { ...productForm, tags: productForm.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editProduct) {
        await axios.put(`/api/products/${editProduct._id}`, data);
        toast.success('Product updated!');
      } else {
        await axios.post('/api/products', data);
        toast.success('Product added!');
      }
      setShowAddProduct(false);
      setEditProduct(null);
      setProductForm({ name: '', description: '', price: '', discountPrice: '', category: 'Electronics', stock: '', images: [''], tags: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await axios.delete(`/api/products/${id}`); toast.success('Deleted'); loadData(); }
    catch { toast.error('Failed'); }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try { await axios.put(`/api/orders/${orderId}/status`, { status }); toast.success('Status updated'); loadData(); }
    catch { toast.error('Failed'); }
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setProductForm({
      name: product.name, description: product.description, price: product.price,
      discountPrice: product.discountPrice || '', category: product.category,
      stock: product.stock, images: product.images?.length ? product.images : [''],
      tags: product.tags?.join(', ') || ''
    });
    setShowAddProduct(true);
  };

  const statusColors = { placed: '#ffb800', confirmed: '#38bdf8', processing: '#a78bfa', shipped: '#fb923c', delivered: '#10d97a', cancelled: '#ff4e6a' };

  return (
    <div style={{ paddingTop: 72, minHeight: '100vh', background: 'var(--primary)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', padding: '40px 32px 0', borderBottom: '1px solid rgba(200,169,110,0.15)' }}>
        <div className="container" style={{ padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: 'linear-gradient(135deg,#c8a96e,#e8cc9e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🏪</div>
            <div>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#f0f0f8' }}>{stats?.shopName || 'My Shop'}</h1>
              <p style={{ color: 'rgba(240,240,248,0.5)', fontSize: 14 }}>{user?.email}</p>
            </div>
            <a href={`http://localhost:5000/reports/vendor-payout/${vendor?._id}`} target="_blank" rel="noreferrer"
              className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}>📄 Payout Statement</a>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0 }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '14px 24px', background: 'transparent', border: 'none',
                borderBottom: `3px solid ${activeTab === tab ? '#c8a96e' : 'transparent'}`,
                color: activeTab === tab ? '#c8a96e' : 'rgba(240,240,248,0.5)',
                cursor: 'pointer', fontSize: 14, fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
                transition: 'all 0.2s'
              }}>{tab}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div>
            <div className="stats-grid" style={{ marginBottom: 40 }}>
              {[
                { icon: '📦', label: 'Total Products', value: products.length },
                { icon: '🛒', label: 'Total Orders', value: orders.length },
                { icon: '💰', label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}` },
                { icon: '💸', label: 'Commission Paid', value: `₹${(stats?.totalCommissionPaid || 0).toLocaleString()}` },
                { icon: '💵', label: 'Net Balance', value: `₹${(stats?.balance || 0).toLocaleString()}` },
                { icon: '⭐', label: 'Shop Rating', value: (stats?.rating || 0).toFixed(1) },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                  <div className="stat-value" style={{ fontSize: 28 }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent orders */}
            <div className="card">
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, color: '#c8a96e', marginBottom: 20 }}>Recent Orders</h3>
              {orders.slice(0, 5).length === 0 ? (
                <p style={{ color: 'rgba(240,240,248,0.4)', textAlign: 'center', padding: 32 }}>No orders yet</p>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Order ID</th><th>Buyer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
                      <tr key={o._id}>
                        <td style={{ color: '#c8a96e', fontWeight: 600 }}>#{o._id.slice(-8).toUpperCase()}</td>
                        <td>{o.buyer?.name || 'N/A'}</td>
                        <td style={{ fontWeight: 600 }}>₹{o.totalAmount.toLocaleString()}</td>
                        <td><span style={{ color: statusColors[o.orderStatus], fontWeight: 600, textTransform: 'capitalize' }}>{o.orderStatus}</span></td>
                        <td style={{ color: 'rgba(240,240,248,0.5)', fontSize: 13 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'Products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#f0f0f8' }}>My Products</h2>
              <button className="btn btn-primary" onClick={() => { setEditProduct(null); setProductForm({ name: '', description: '', price: '', discountPrice: '', category: 'Electronics', stock: '', images: [''], tags: '' }); setShowAddProduct(true); }}>+ Add Product</button>
            </div>

            {showAddProduct && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
                <div style={{ background: '#1a1a2e', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: '#c8a96e', marginBottom: 28 }}>{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  <form onSubmit={handleSaveProduct}>
                    {[
                      { key: 'name', label: 'Product Name', type: 'text', placeholder: 'e.g. Premium Wireless Headphones' },
                      { key: 'price', label: 'Price (₹)', type: 'number', placeholder: '999' },
                      { key: 'discountPrice', label: 'Discount Price (₹)', type: 'number', placeholder: '799 (optional)' },
                      { key: 'stock', label: 'Stock Quantity', type: 'number', placeholder: '50' },
                    ].map(f => (
                      <div key={f.key} className="form-group">
                        <label>{f.label}</label>
                        <input type={f.type} className="form-control" placeholder={f.placeholder}
                          value={productForm[f.key]} onChange={e => setProductForm({ ...productForm, [f.key]: e.target.value })}
                          required={f.key !== 'discountPrice'} />
                      </div>
                    ))}
                    <div className="form-group">
                      <label>Category</label>
                      <select className="form-control" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                        {['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Books', 'Beauty', 'General'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea className="form-control" rows={3} placeholder="Describe your product..."
                        value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} required style={{ resize: 'vertical' }} />
                    </div>
                    <div className="form-group">
                      <label>Image URL</label>
                      <input type="url" className="form-control" placeholder="https://example.com/image.jpg"
                        value={productForm.images[0]} onChange={e => setProductForm({ ...productForm, images: [e.target.value] })} />
                    </div>
                    <div className="form-group">
                      <label>Tags (comma separated)</label>
                      <input className="form-control" placeholder="wireless, headphones, audio"
                        value={productForm.tags} onChange={e => setProductForm({ ...productForm, tags: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editProduct ? 'Update Product' : 'Add Product'}</button>
                      <button type="button" className="btn btn-ghost" onClick={() => setShowAddProduct(false)} style={{ flex: 1 }}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(240,240,248,0.4)' }}>
                <div style={{ fontSize: 60, marginBottom: 12 }}>📦</div>
                <p>No products yet. Add your first product!</p>
              </div>
            ) : (
              <div className="card" style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th><th>Actions</th></tr></thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id}>
                        <td><img src={p.images?.[0] || `https://picsum.photos/seed/${p._id}/60/60`} alt={p.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} onError={e => e.target.src = `https://picsum.photos/seed/${p._id}/60/60`} /></td>
                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                        <td><span className="badge badge-gold">{p.category}</span></td>
                        <td><div style={{ color: '#c8a96e', fontWeight: 600 }}>₹{p.price}</div>{p.discountPrice > 0 && <div style={{ fontSize: 12, color: '#10d97a' }}>Sale: ₹{p.discountPrice}</div>}</td>
                        <td><span style={{ color: p.stock > 10 ? '#10d97a' : p.stock > 0 ? '#ffb800' : '#ff4e6a', fontWeight: 600 }}>{p.stock}</span></td>
                        <td>{p.sold || 0}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                            <button className="btn btn-sm" onClick={() => handleDelete(p._id)} style={{ background: 'rgba(255,78,106,0.1)', border: '1px solid rgba(255,78,106,0.3)', color: '#ff4e6a', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'Orders' && (
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#f0f0f8', marginBottom: 24 }}>Incoming Orders</h2>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(240,240,248,0.4)' }}>
                <div style={{ fontSize: 60, marginBottom: 12 }}>📭</div><p>No orders yet</p>
              </div>
            ) : (
              <div className="card" style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Order ID</th><th>Buyer</th><th>Items</th><th>Amount</th><th>Status</th><th>Date</th><th>Update</th></tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id}>
                        <td style={{ color: '#c8a96e', fontWeight: 600 }}>#{o._id.slice(-8).toUpperCase()}</td>
                        <td>{o.buyer?.name || 'N/A'}<br /><span style={{ fontSize: 12, color: 'rgba(240,240,248,0.4)' }}>{o.buyer?.email}</span></td>
                        <td>{o.items?.length} item(s)</td>
                        <td style={{ fontWeight: 600 }}>₹{o.totalAmount.toLocaleString()}</td>
                        <td><span style={{ color: statusColors[o.orderStatus], fontWeight: 600, textTransform: 'capitalize' }}>{o.orderStatus}</span></td>
                        <td style={{ fontSize: 13, color: 'rgba(240,240,248,0.5)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td>
                          <select style={{ background: '#1e1e2e', border: '1px solid var(--border)', color: '#f0f0f8', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}
                            value={o.orderStatus} onChange={e => handleStatusUpdate(o._id, e.target.value)}>
                            {['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* COMMISSIONS TAB */}
        {activeTab === 'Commissions' && (
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#f0f0f8', marginBottom: 16 }}>Commission Ledger</h2>
            <div style={{ background: 'rgba(200,169,110,0.06)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 12, padding: 20, marginBottom: 32, display: 'flex', gap: 32 }}>
              <div><div style={{ fontSize: 12, color: 'rgba(240,240,248,0.4)', marginBottom: 4 }}>Total Commission Deducted (10%)</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#ff4e6a', fontFamily: 'Cormorant Garamond, serif' }}>₹{commissions.reduce((a, c) => a + c.commissionAmount, 0).toFixed(2)}</div></div>
              <div><div style={{ fontSize: 12, color: 'rgba(240,240,248,0.4)', marginBottom: 4 }}>Net Payout Earned</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#10d97a', fontFamily: 'Cormorant Garamond, serif' }}>₹{commissions.reduce((a, c) => a + c.vendorPayout, 0).toFixed(2)}</div></div>
            </div>
            <div className="card" style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Date</th><th>Order ID</th><th>Order Amount</th><th>Commission (10%)</th><th>Net Payout</th><th>Status</th></tr></thead>
                <tbody>
                  {commissions.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'rgba(240,240,248,0.4)' }}>No commission records</td></tr>
                  ) : commissions.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontSize: 13, color: 'rgba(240,240,248,0.5)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td style={{ color: '#c8a96e' }}>#{c.order?._id?.slice(-8).toUpperCase()}</td>
                      <td>₹{c.orderAmount.toFixed(2)}</td>
                      <td style={{ color: '#ff4e6a', fontWeight: 600 }}>-₹{c.commissionAmount.toFixed(2)}</td>
                      <td style={{ color: '#10d97a', fontWeight: 700 }}>₹{c.vendorPayout.toFixed(2)}</td>
                      <td><span className={`badge badge-${c.status === 'paid' ? 'green' : c.status === 'pending' ? 'yellow' : 'red'}`}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'Reports' && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>📊</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, color: '#f0f0f8', marginBottom: 16 }}>Payout Statement</h2>
            <p style={{ color: 'rgba(240,240,248,0.5)', fontSize: 16, maxWidth: 400, margin: '0 auto 40px' }}>Download your complete payout statement with order-wise commission breakdown. Server-rendered JSP-style report.</p>
            <a href={`http://localhost:5000/reports/vendor-payout/${vendor?._id}`} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">
              📄 Generate Payout Report
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
