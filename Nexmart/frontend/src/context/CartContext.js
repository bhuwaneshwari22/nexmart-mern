import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/cart');
      setCartItems(res.data.items || []);
      setCartCount(res.data.items?.length || 0);
    } catch (err) {}
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    await axios.post('/api/cart/add', { productId, quantity });
    fetchCart();
  };

  const removeFromCart = async (productId) => {
    await axios.delete(`/api/cart/remove/${productId}`);
    fetchCart();
  };

  const updateQuantity = async (productId, quantity) => {
    await axios.put('/api/cart/update', { productId, quantity });
    fetchCart();
  };

  const clearCart = async () => {
    await axios.delete('/api/cart/clear');
    fetchCart();
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
