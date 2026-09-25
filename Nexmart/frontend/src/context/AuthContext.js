import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedVendor = localStorage.getItem('vendor');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedVendor) setVendor(JSON.parse(savedVendor));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const { token, vendor: vendorData, ...userInfo } = userData;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userInfo));
    if (vendorData) localStorage.setItem('vendor', JSON.stringify(vendorData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userInfo);
    setVendor(vendorData || null);
  };

  const logout = () => {
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setVendor(null);
  };

  return (
    <AuthContext.Provider value={{ user, vendor, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
