import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const statusColors = { placed: '#ffb800', confirmed: '#38bdf8', processing: '#a78bfa', shipped: '#fb923c', delivered: '#10d97a', cancelled: '#ff4e6a' };

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/orders/my').then(res => { setOrders(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center" style={{ paddingTop: 80 }}><div className="spinner" /></div>;

  return (
    <div style={{ paddingTop: 80 }}>
      <div style={{ background: 'linear-gradient(180deg,#1a1a2e,#0a0a0f)', padding: '60px 24px 40px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 48, color: '#f0f0f8' }}>My Orders</h1>
        <p style={{ color: 'rgba(240,240,248,0.4)', marginTop: 8 }}>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
      </div>
      <div className="container" style={{ padding: '40px 24px' }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 12 }}>No orders yet</h3>
            <Link to="/products" className="btn btn-primary btn-lg" style={{ marginTop: 16 }}>Start Shopping</Link>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(240,240,248,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Order ID</div>
                  <div style={{ fontWeight: 600, color: '#c8a96e', fontSize: 14 }}>#{order._id.slice(-10).toUpperCase()}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'rgba(240,240,248,0.4)', marginBottom: 4 }}>Date</div>
                  <div style={{ fontSize: 14 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'rgba(240,240,248,0.4)', marginBottom: 4 }}>Total</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#c8a96e', fontFamily: 'Cormorant Garamond, serif' }}>₹{order.totalAmount.toLocaleString()}</div>
                </div>
                <span style={{ background: `${statusColors[order.orderStatus]}20`, color: statusColors[order.orderStatus], border: `1px solid ${statusColors[order.orderStatus]}40`, padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
                  {order.orderStatus}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
                    <img src={item.image || `https://picsum.photos/seed/${item.product}/50/50`} alt={item.name} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} onError={e => e.target.src = `https://picsum.photos/seed/x/50/50`} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(240,240,248,0.4)' }}>Qty: {item.quantity} · ₹{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
              {order.orderStatus === 'delivered' && (
                <div style={{ marginTop: 16 }}>
                  <Link to={`/products/${order.items[0]?.product}`} className="btn btn-outline btn-sm">Write a Review</Link>
                </div>
              )}
              {order.orderStatus === 'placed' && (
                <div style={{ marginTop: 16 }}>
                  <Link to={`/disputes`} className="btn btn-ghost btn-sm">Report Issue</Link>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
