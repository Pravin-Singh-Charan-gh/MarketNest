import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <span style={styles.logo}>🛍️ MarketNest</span>
      <div style={styles.right}>
        <span style={styles.welcome}>Hi, {user?.name}</span>
        <span style={styles.badge}>{user?.role}</span>
        <button onClick={handleLogout} style={styles.btn}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 32px', height: '64px',
    background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  logo: { fontSize: '20px', fontWeight: '800', color: '#667eea' },
  right: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { fontSize: '14px', color: '#374151' },
  badge: {
    padding: '3px 10px', borderRadius: '20px',
    background: '#ede9fe', color: '#7c3aed',
    fontSize: '12px', fontWeight: '600', textTransform: 'capitalize',
  },
  btn: {
    padding: '8px 16px', borderRadius: '8px',
    background: '#fee2e2', color: '#dc2626',
    border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600',
  },
};