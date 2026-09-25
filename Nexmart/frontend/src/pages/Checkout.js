import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const { cartItems, getTotal, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ name: user?.name || '', street: '', city: '', state: '', zip: '', country: 'India', phone: '' });

  const total = getTotal();

  const handleOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      const res = await axios.post('/api/orders', {
        shippingAddress: address,
        paymentId: 'COD_' + Date.now(),
        notes: 'Cash on Delivery'
      });
      await fetchCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally { setLoading(false); }
  };

  if (cartItems.length === 0) { navigate('/cart'); return null; }

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--primary)' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 48, color: '#f0f0f8', marginBottom: 40 }}>Checkout</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40 }}>
          <form onSubmit={handleOrder}>
            <div className="card" style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: '#c8a96e', marginBottom: 24 }}>Shipping Address</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'John Doe', full: true },
                  { key: 'phone', label: 'Phone Number', placeholder: '+91 9876543210', full: true },
                  { key: 'street', label: 'Street Address', placeholder: '123, MG Road', full: true },
                  { key: 'city', label: 'City', placeholder: 'Hyderabad' },
                  { key: 'state', label: 'State', placeholder: 'Telangana' },
                  { key: 'zip', label: 'PIN Code', placeholder: '500001' },
                  { key: 'country', label: 'Country', placeholder: 'India' },
                ].map(f => (
                  <div key={f.key} className="form-group" style={{ gridColumn: f.full ? '1 / -1' : 'span 1', marginBottom: 0 }}>
                    <label>{f.label}</label>
                    <input className="form-control" placeholder={f.placeholder} value={address[f.key]}
                      onChange={e => setAddress({ ...address, [f.key]: e.target.value })} required />
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: '#c8a96e', marginBottom: 20 }}>Payment Method</h2>
              <div style={{ display: 'flex', gap: 12 }}>
                {['Cash on Delivery', 'UPI', 'Card (Stripe)'].map(method => (
                  <div key={method} style={{ flex: 1, padding: 16, border: `2px solid ${method === 'Cash on Delivery' ? '#c8a96e' : 'var(--border)'}`, borderRadius: 10, textAlign: 'center', cursor: 'pointer', background: method === 'Cash on Delivery' ? 'rgba(200,169,110,0.08)' : 'transparent', color: method === 'Cash on Delivery' ? '#c8a96e' : 'rgba(240,240,248,0.5)', fontSize: 13, fontWeight: 500 }}>
                    {method === 'Cash on Delivery' ? '💵' : method === 'UPI' ? '📱' : '💳'} {method}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Placing Order...' : `Place Order — ₹${total.toFixed(2)}`}
            </button>
          </form>

          {/* Order summary */}
          <div className="card" style={{ alignSelf: 'start', position: 'sticky', top: 90 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, color: '#c8a96e', marginBottom: 20 }}>Order Summary</h3>
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 20 }}>
              {cartItems.map(item => (
                <div key={item.product?._id} style={{ display: 'flex', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                  <img src={item.product?.images?.[0] || `https://picsum.photos/seed/${item.product?._id}/60/60`} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} onError={e => e.target.src = `https://picsum.photos/seed/x/60/60`} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{item.product?.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(240,240,248,0.4)' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ color: '#c8a96e', fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'rgba(240,240,248,0.5)', fontSize: 14 }}>
                <span>Subtotal</span><span>₹{total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'rgba(240,240,248,0.5)', fontSize: 14 }}>
                <span>Shipping</span><span style={{ color: '#10d97a' }}>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 20, fontWeight: 700 }}>
                <span>Total</span><span style={{ color: '#c8a96e', fontFamily: 'Cormorant Garamond, serif', fontSize: 28 }}>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
