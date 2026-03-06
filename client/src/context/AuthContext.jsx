import { createContext, useContext, useState } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage so user stays logged in on page refresh
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;  // return so the login page knows the role to redirect
  };

  const signup = async (name, email, password, role) => {
    await API.post('/auth/signup', { name, email, password, role });
  };

  const logout = async () => {
    await API.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — use this anywhere instead of useContext(AuthContext)
export const useAuth = () => useContext(AuthContext);