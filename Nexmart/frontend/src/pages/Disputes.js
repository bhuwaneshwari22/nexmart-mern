import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Disputes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderId: '', subject: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dRes, oRes] = await Promise.all([
        axios.get('/api/disputes/my'),
        axios.get('/api/orders/my')
      ]);
      setDisputes(dRes.data);
      setOrders(oRes.data);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/disputes', form);
      toast.success('Dispute filed! Our team will review it.');
      setShowForm(false);
      setForm({ orderId: '', subject: '', description: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to file dispute'); }
  };

  const statusColors = { open: '#ff4e6a', in_review: '#ffb800', resolved: '#10d97a', closed: 'rgba(240,240,248,0.3)' };

  if (loading) return <div className="loading-center" style={{ paddingTop: 80 }}><div className="spinner" /></div>;

  return (
    <div style={{ paddingTop: 80 }}>
      <div style={{ background: 'linear-gradient(180deg,#1a1a2e,#0a0a0f)', padding: '60px 24px 40px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 48, color: '#f0f0f8' }}>Dispute Center</h1>
        <p style={{ color: 'rgba(240,240,248,0.5)', marginTop: 8 }}>Raise and track issues with your orders</p>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: '#f0f0f8' }}>My Disputes</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Raise Dispute</button>
        </div>

        {/* New Dispute Modal */}
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
            <div style={{ background: '#1a1a2e', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 520 }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: '#c8a96e', marginBottom: 28 }}>Raise a Dispute</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Select Order</label>
                  <select className="form-control" value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} required>
                    <option value="">-- Select an order --</option>
                    {orders.map(o => (
                      <option key={o._id} value={o._id}>#{o._id.slice(-8).toUpperCase()} — ₹{o.totalAmount} ({o.orderStatus})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input className="form-control" placeholder="e.g. Wrong item received"
                    value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" rows={4} placeholder="Describe the issue in detail..."
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Dispute</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {disputes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>⚖️</div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, marginBottom: 12, color: '#f0f0f8' }}>No disputes filed</h3>
            <p style={{ color: 'rgba(240,240,248,0.4)', marginBottom: 32 }}>Had an issue with an order? Raise a dispute and we'll help resolve it.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>File Your First Dispute</button>
          </div>
        ) : (
          disputes.map(d => (
            <div key={d._id} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ background: `${statusColors[d.status]}20`, color: statusColors[d.status], border: `1px solid ${statusColors[d.status]}40`, borderRadius: 20, padding: '4px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {d.status.replace('_', ' ')}
                    </span>
                    <span style={{ color: 'rgba(240,240,248,0.3)', fontSize: 12 }}>#{d._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#f0f0f8', marginBottom: 6 }}>{d.subject}</h3>
                  <p style={{ color: 'rgba(240,240,248,0.5)', fontSize: 14, lineHeight: 1.6 }}>{d.description}</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: 13, color: 'rgba(240,240,248,0.4)', marginLeft: 20 }}>
                  <div>Vendor: {d.vendor?.shopName || 'N/A'}</div>
                  <div>Order: ₹{d.order?.totalAmount || 0}</div>
                  <div>{new Date(d.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              {d.resolution && (
                <div style={{ marginTop: 16, padding: 14, background: 'rgba(16,217,122,0.06)', borderRadius: 10, border: '1px solid rgba(16,217,122,0.2)' }}>
                  <div style={{ fontSize: 12, color: '#10d97a', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>✅ Admin Resolution</div>
                  <div style={{ color: 'rgba(240,240,248,0.7)', fontSize: 14 }}>{d.resolution}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Disputes;
