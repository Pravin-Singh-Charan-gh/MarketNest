import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>MarketNest</h1>
        <p style={styles.subtitle}>Create your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input style={styles.input} name="name" placeholder="John Doe"
              value={form.name} onChange={handleChange} required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} name="email" type="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} name="password" type="password" placeholder="Min 6 characters"
              value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          {/* Role selector */}
          <div style={styles.field}>
            <label style={styles.label}>I want to...</label>
            <div style={styles.roleRow}>
              {['customer', 'brand'].map(r => (
                <div
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  style={form.role === r ? styles.roleCardActive : styles.roleCard}
                >
                  <span style={styles.roleIcon}>{r === 'customer' ? '🛍️' : '🏪'}</span>
                  <span style={styles.roleLabel}>
                    {r === 'customer' ? 'Shop Products' : 'Sell Products'}
                  </span>
                  <span style={styles.roleDesc}>
                    {r === 'customer' ? 'Browse as Customer' : 'Register as Brand'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button style={loading ? styles.btnDisabled : styles.btn} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  logo: { fontSize: '28px', fontWeight: '800', color: '#667eea', textAlign: 'center', marginBottom: '8px' },
  subtitle: { textAlign: 'center', color: '#6b7280', marginBottom: '32px', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#374151' },
  input: {
    padding: '12px 16px', borderRadius: '8px',
    border: '1.5px solid #e5e7eb', fontSize: '14px', outline: 'none',
  },
  roleRow: { display: 'flex', gap: '12px' },
  roleCard: {
    flex: 1, padding: '16px', borderRadius: '10px',
    border: '2px solid #e5e7eb', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    transition: 'all 0.2s',
  },
  roleCardActive: {
    flex: 1, padding: '16px', borderRadius: '10px',
    border: '2px solid #667eea', cursor: 'pointer',
    background: '#f0f0ff',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
  },
  roleIcon: { fontSize: '24px' },
  roleLabel: { fontWeight: '700', fontSize: '14px', color: '#374151' },
  roleDesc: { fontSize: '11px', color: '#6b7280' },
  btn: {
    padding: '13px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px',
  },
  btnDisabled: {
    padding: '13px', background: '#9ca3af', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px',
    fontWeight: '600', cursor: 'not-allowed', marginTop: '8px',
  },
  footer: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' },
  link: { color: '#667eea', fontWeight: '600' },
};