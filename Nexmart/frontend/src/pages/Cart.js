import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotal } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) return (
    <div style={{ paddingTop: 80, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 80, marginBottom: 24 }}>🛒</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, color: '#f0f0f8', marginBottom: 16 }}>Your cart is empty</h2>
        <p style={{ color: 'rgba(240,240,248,0.5)', marginBottom: 32 }}>Discover amazing products from our verified vendors</p>
        <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
      </div>
    </div>
  );

  const total = getTotal();
  const commission = total * 0.10;

  // Group by vendor
  const vendorGroups = {};
  cartItems.forEach(item => {
    const vid = item.vendor?._id || 'unknown';
    const vname = item.vendor?.shopName || 'Unknown Vendor';
    if (!vendorGroups[vid]) vendorGroups[vid] = { name: vname, items: [] };
    vendorGroups[vid].items.push(item);
  });

  return (
    <div style={{ paddingTop: 80 }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 48, color: '#f0f0f8', marginBottom: 40 }}>Shopping Cart</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40 }}>
          {/* Cart items grouped by vendor */}
          <div>
            {Object.entries(vendorGroups).map(([vid, group]) => (
              <div key={vid} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid rgba(200,169,110,0.2)', marginBottom: 16 }}>
                  <span style={{ fontSize: 16 }}>🏪</span>
                  <span style={{ color: '#c8a96e', fontWeight: 600 }}>{group.name}</span>
                </div>
                {group.items.map(item => (
                  <div key={item.product?._id} className="card" style={{ display: 'flex', gap: 20, marginBottom: 12, padding: 16 }}>
                    <img
                      src={item.product?.images?.[0] || `https://picsum.photos/seed/${item.product?._id}/120/120`}
                      alt={item.product?.name}
                      style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
                      onError={e => { e.target.src = `https://picsum.photos/seed/${item.product?._id}/120/120`; }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, marginBottom: 8 }}>{item.product?.name}</h3>
                      <div style={{ color: '#c8a96e', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>₹{item.price?.toLocaleString()}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                          <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} style={{ width: 36, height: 36, background: 'transparent', border: 'none', color: '#c8a96e', cursor: 'pointer', fontSize: 18 }}>−</button>
                          <span style={{ padding: '0 12px', fontWeight: 600 }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} style={{ width: 36, height: 36, background: 'transparent', border: 'none', color: '#c8a96e', cursor: 'pointer', fontSize: 18 }}>+</button>
                        </div>
                        <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                        <button onClick={() => { removeFromCart(item.product._id); toast.info('Removed'); }} style={{ marginLeft: 'auto', background: 'rgba(255,78,106,0.1)', border: 'none', color: '#ff4e6a', cursor: 'pointer', padding: '8px 16px', borderRadius: 6, fontSize: 13 }}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div>
            <div className="card" style={{ position: 'sticky', top: 90 }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, marginBottom: 24, color: '#c8a96e' }}>Order Summary</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                <Row label="Subtotal" value={`₹${total.toFixed(2)}`} />
                <Row label="Shipping" value="Free" green />
                <Row label="Platform Fee (10%)" value={`₹${commission.toFixed(2)}`} muted />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                <span style={{ fontSize: 18, fontWeight: 600 }}>Total</span>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#c8a96e', fontFamily: 'Cormorant Garamond, serif' }}>₹{total.toFixed(2)}</span>
              </div>

              <div style={{ background: 'rgba(200,169,110,0.05)', border: '1px solid rgba(200,169,110,0.15)', borderRadius: 8, padding: 12, marginBottom: 24, fontSize: 12, color: 'rgba(240,240,248,0.5)' }}>
                📦 Items from {Object.keys(vendorGroups).length} vendor{Object.keys(vendorGroups).length > 1 ? 's' : ''} — unified checkout
              </div>

              <button onClick={() => navigate('/checkout')} className="btn btn-primary" style={{ width: '100%', padding: 18, fontSize: 16 }}>
                Proceed to Checkout →
              </button>
              <Link to="/products" className="btn btn-ghost" style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, green, muted }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
    <span style={{ color: 'rgba(240,240,248,0.5)' }}>{label}</span>
    <span style={{ color: green ? '#10d97a' : muted ? 'rgba(240,240,248,0.4)' : '#f0f0f8' }}>{value}</span>
  </div>
);

export default Cart;
