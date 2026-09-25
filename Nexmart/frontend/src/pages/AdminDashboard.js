import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const tabs = ['Overview', 'Vendors', 'Users', 'Orders', 'Disputes', 'Reports'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [dashboard, setDashboard] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [dRes, vRes, uRes, oRes, dispRes] = await Promise.all([
        axios.get('/api/admin/dashboard'),
        axios.get('/api/admin/vendors'),
        axios.get('/api/admin/users'),
        axios.get('/api/orders/admin/all'),
        axios.get('/api/disputes/admin/all'),
      ]);
      setDashboard(dRes.data);
      setVendors(vRes.data);
      setUsers(uRes.data);
      setOrders(oRes.data);
      setDisputes(dispRes.data);
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  const verifyVendor = async (id) => {
    try { await axios.put(`/api/admin/vendors/${id}/verify`); toast.success('Vendor verified!'); loadAll(); }
    catch { toast.error('Failed'); }
  };

  const toggleVendor = async (id) => {
    try { await axios.put(`/api/admin/vendors/${id}/toggle`); toast.success('Status updated'); loadAll(); }
    catch { toast.error('Failed'); }
  };

  const resolveDispute = async (id) => {
    const resolution = window.prompt('Enter resolution message:');
    if (!resolution) return;
    try { await axios.put(`/api/disputes/${id}/resolve`, { resolution }); toast.success('Dispute resolved'); loadAll(); }
    catch { toast.error('Failed'); }
  };

  const statusColors = { placed: '#ffb800', confirmed: '#38bdf8', processing: '#a78bfa', shipped: '#fb923c', delivered: '#10d97a', cancelled: '#ff4e6a' };

  if (loading) return <div className="loading-center" style={{ paddingTop: 80 }}><div className="spinner" /></div>;

  return (
    <div style={{ paddingTop: 72, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', padding: '40px 32px 0', borderBottom: '1px solid rgba(200,169,110,0.15)' }}>
        <div className="container" style={{ padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#c8a96e,#e8cc9e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>⚙️</div>
            <div>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, color: '#f0f0f8' }}>Admin Control Panel</h1>
              <p style={{ color: 'rgba(240,240,248,0.4)', fontSize: 13 }}>NEXMART Platform Management</p>
            </div>
            <a href="http://localhost:5000/reports/admin-commission" target="_blank" rel="noreferrer"
              className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>📊 Commission Report</a>
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '14px 22px', background: 'transparent', border: 'none',
                borderBottom: `3px solid ${activeTab === tab ? '#c8a96e' : 'transparent'}`,
                color: activeTab === tab ? '#c8a96e' : 'rgba(240,240,248,0.5)',
                cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s'
              }}>{tab}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>

        {/* OVERVIEW */}
        {activeTab === 'Overview' && dashboard && (
          <div>
            <div className="stats-grid" style={{ marginBottom: 40 }}>
              {[
                { icon: '👥', label: 'Total Buyers', value: dashboard.stats.totalUsers, color: '#38bdf8' },
                { icon: '🏪', label: 'Vendors', value: dashboard.stats.totalVendors, color: '#a78bfa' },
                { icon: '📦', label: 'Products', value: dashboard.stats.totalProducts, color: '#34d399' },
                { icon: '🛒', label: 'Total Orders', value: dashboard.stats.totalOrders, color: '#fb923c' },
                { icon: '💰', label: 'Revenue', value: `₹${(dashboard.stats.totalRevenue || 0).toLocaleString()}`, color: '#c8a96e' },
                { icon: '📊', label: 'Commission', value: `₹${(dashboard.stats.totalCommission || 0).toLocaleString()}`, color: '#10d97a' },
                { icon: '⚖️', label: 'Open Disputes', value: dashboard.stats.openDisputes, color: '#ff4e6a' },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, color: '#c8a96e', marginBottom: 20 }}>Recent Orders</h3>
              <table className="data-table">
                <thead><tr><th>Order</th><th>Buyer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {(dashboard.recentOrders || []).map(o => (
                    <tr key={o._id}>
                      <td style={{ color: '#c8a96e', fontWeight: 600 }}>#{o._id.slice(-8).toUpperCase()}</td>
                      <td>{o.buyer?.name}</td>
                      <td>₹{o.totalAmount}</td>
                      <td><span style={{ color: statusColors[o.orderStatus], fontWeight: 600, textTransform: 'capitalize' }}>{o.orderStatus}</span></td>
                      <td style={{ color: 'rgba(240,240,248,0.5)', fontSize: 13 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VENDORS */}
        {activeTab === 'Vendors' && (
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#f0f0f8', marginBottom: 24 }}>All Vendors ({vendors.length})</h2>
            <div className="card" style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Shop</th><th>Owner</th><th>Category</th><th>Sales</th><th>Revenue</th><th>Verified</th><th>Active</th><th>Actions</th></tr></thead>
                <tbody>
                  {vendors.map(v => (
                    <tr key={v._id}>
                      <td style={{ fontWeight: 600 }}>{v.shopName}</td>
                      <td>{v.user?.name}<br /><span style={{ fontSize: 12, color: 'rgba(240,240,248,0.4)' }}>{v.user?.email}</span></td>
                      <td><span className="badge badge-gold">{v.category}</span></td>
                      <td>{v.totalSales || 0}</td>
                      <td style={{ color: '#c8a96e', fontWeight: 600 }}>₹{(v.totalRevenue || 0).toLocaleString()}</td>
                      <td>{v.isVerified ? <span className="badge badge-green">✓ Yes</span> : <span className="badge badge-yellow">Pending</span>}</td>
                      <td>{v.isActive ? <span className="badge badge-green">Active</span> : <span className="badge badge-red">Inactive</span>}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {!v.isVerified && <button className="btn btn-sm btn-success" onClick={() => verifyVendor(v._id)}>Verify</button>}
                          <button className="btn btn-sm" onClick={() => toggleVendor(v._id)}
                            style={{ background: v.isActive ? 'rgba(255,78,106,0.1)' : 'rgba(16,217,122,0.1)', border: `1px solid ${v.isActive ? '#ff4e6a' : '#10d97a'}40`, color: v.isActive ? '#ff4e6a' : '#10d97a', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}>
                            {v.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <a href={`http://localhost:5000/reports/vendor-payout/${v._id}`} target="_blank" rel="noreferrer"
                            className="btn btn-ghost btn-sm">Report</a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'Users' && (
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#f0f0f8', marginBottom: 24 }}>All Users ({users.length})</h2>
            <div className="card" style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td style={{ color: 'rgba(240,240,248,0.6)' }}>{u.email}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-red' : u.role === 'vendor' ? 'badge-gold' : 'badge-blue'}`}>{u.role}</span></td>
                      <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td style={{ color: 'rgba(240,240,248,0.5)', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'Orders' && (
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#f0f0f8', marginBottom: 24 }}>All Orders ({orders.length})</h2>
            <div className="card" style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Order ID</th><th>Buyer</th><th>Vendors</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td style={{ color: '#c8a96e', fontWeight: 600 }}>#{o._id.slice(-8).toUpperCase()}</td>
                      <td>{o.buyer?.name}</td>
                      <td style={{ fontSize: 12, color: 'rgba(240,240,248,0.5)' }}>{[...new Set(o.items?.map(i => i.vendor?.shopName).filter(Boolean))].join(', ') || 'N/A'}</td>
                      <td style={{ fontWeight: 600 }}>₹{o.totalAmount.toLocaleString()}</td>
                      <td><span className={`badge ${o.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'}`}>{o.paymentStatus}</span></td>
                      <td><span style={{ color: statusColors[o.orderStatus], fontWeight: 600, textTransform: 'capitalize' }}>{o.orderStatus}</span></td>
                      <td style={{ fontSize: 13, color: 'rgba(240,240,248,0.5)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DISPUTES */}
        {activeTab === 'Disputes' && (
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#f0f0f8', marginBottom: 24 }}>Dispute Resolution ({disputes.length})</h2>
            {disputes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(240,240,248,0.4)' }}>
                <div style={{ fontSize: 60, marginBottom: 12 }}>⚖️</div><p>No disputes filed</p>
              </div>
            ) : (
              disputes.map(d => (
                <div key={d._id} className="card" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <span className={`badge ${d.status === 'open' ? 'badge-red' : d.status === 'in_review' ? 'badge-yellow' : 'badge-green'}`} style={{ marginBottom: 8, display: 'inline-block' }}>{d.status.replace('_', ' ').toUpperCase()}</span>
                      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#f0f0f8', marginBottom: 6 }}>{d.subject}</h3>
                      <p style={{ color: 'rgba(240,240,248,0.5)', fontSize: 14 }}>{d.description}</p>
                    </div>
                    {(d.status === 'open' || d.status === 'in_review') && (
                      <button className="btn btn-success btn-sm" onClick={() => resolveDispute(d._id)}>Resolve</button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'rgba(240,240,248,0.4)', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <span>👤 Buyer: {d.buyer?.name}</span>
                    <span>🏪 Vendor: {d.vendor?.shopName}</span>
                    <span>📅 {new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                  {d.resolution && (
                    <div style={{ marginTop: 12, padding: 12, background: 'rgba(16,217,122,0.08)', borderRadius: 8, border: '1px solid rgba(16,217,122,0.2)', fontSize: 14, color: '#10d97a' }}>
                      ✅ Resolution: {d.resolution}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* REPORTS */}
        {activeTab === 'Reports' && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>📊</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, color: '#f0f0f8', marginBottom: 32 }}>Platform Reports</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 600, margin: '0 auto' }}>
              <a href="http://localhost:5000/reports/admin-commission" target="_blank" rel="noreferrer" className="card" style={{ display: 'block', textAlign: 'center', padding: 32, textDecoration: 'none', transition: 'all 0.3s', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#c8a96e'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#c8a96e', marginBottom: 8 }}>Commission Summary</div>
                <div style={{ fontSize: 13, color: 'rgba(240,240,248,0.5)' }}>All vendor commissions, payouts, and gross revenue breakdown</div>
              </a>
              {vendors.slice(0, 1).map(v => (
                <a key={v._id} href={`http://localhost:5000/reports/vendor-payout/${v._id}`} target="_blank" rel="noreferrer" className="card" style={{ display: 'block', textAlign: 'center', padding: 32, textDecoration: 'none', transition: 'all 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#c8a96e'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#c8a96e', marginBottom: 8 }}>Vendor Payout Report</div>
                  <div style={{ fontSize: 13, color: 'rgba(240,240,248,0.5)' }}>Individual vendor payout statement with commission deductions</div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
