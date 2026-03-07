import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const CATEGORIES = ['clothing', 'shoes', 'accessories', 'bags', 'jewelry', 'other'];
const EMPTY_FORM = { title: '', description: '', price: '', category: 'clothing', status: 'draft' };

export default function BrandDashboard() {
  const [stats, setStats] = useState({ total: 0, published: 0, archived: 0 });
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, productsRes] = await Promise.all([
        API.get('/dashboard'),
        API.get('/products/brand/my-products'),
      ]);
      setStats(statsRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setFiles([]);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      status: product.status,
    });
    setFiles([]);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Must use FormData because we're sending files
      const formData = new FormData();
      console.log('Files to upload:', files);
      console.log('Files length:', files.length);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('status', form.status);
      files.forEach(f => formData.append('images', f));

      if (editProduct) {
  await API.put(`/products/${editProduct._id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  toast.success('Product updated!');
} else {
  await API.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  toast.success('Product created!');
}

      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.heading}>Brand Dashboard</h1>
          <button onClick={openCreate} style={styles.createBtn}>+ New Product</button>
        </div>

        {/* Stats cards */}
        <div style={styles.statsRow}>
          {[
            { label: 'Total Products', value: stats.total, color: '#667eea', bg: '#ede9fe' },
            { label: 'Published', value: stats.published, color: '#059669', bg: '#d1fae5' },
            { label: 'Archived', value: stats.archived, color: '#d97706', bg: '#fef3c7' },
          ].map(s => (
            <div key={s.label} style={{ ...styles.statCard, background: s.bg }}>
              <p style={{ ...styles.statValue, color: s.color }}>{s.value}</p>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Product list */}
        <h2 style={styles.subheading}>My Products</h2>
        {products.length === 0 ? (
          <div style={styles.empty}>No products yet. Create your first one!</div>
        ) : (
          <div style={styles.productList}>
            {products.map(p => (
              <div key={p._id} style={styles.productRow}>
                <div style={styles.productImg}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.title} style={styles.rowImg} />
                    : <div style={styles.noImg}>📦</div>
                  }
                </div>
                <div style={styles.productInfo}>
                  <p style={styles.productTitle}>{p.title}</p>
                  <p style={styles.productMeta}>{p.category} · ${Number(p.price).toFixed(2)}</p>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  background: p.status === 'published' ? '#d1fae5' : p.status === 'draft' ? '#e0e7ff' : '#fee2e2',
                  color: p.status === 'published' ? '#059669' : p.status === 'draft' ? '#4338ca' : '#dc2626',
                }}>
                  {p.status}
                </span>
                <div style={styles.actions}>
                  <button onClick={() => openEdit(p)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(p._id)} style={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal form */}
      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editProduct ? 'Edit Product' : 'Create Product'}</h2>
              <button onClick={() => setShowForm(false)} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Title</label>
                  <input style={styles.input} value={form.title} required
                    onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Price ($)</label>
                  <input style={styles.input} type="number" value={form.price} required min="0"
                    onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea style={styles.textarea} value={form.description} required rows={3}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Category</label>
                  <select style={styles.input} value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Status</label>
                  <select style={styles.input} value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Images</label>
                <input type="file" multiple accept="image/*"
                  onChange={e => setFiles(Array.from(e.target.files))} />
                {files.length > 0 && (
                  <p style={styles.fileCount}>{files.length} file(s) selected</p>
                )}
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={loading ? styles.btnDisabled : styles.btn} disabled={loading}>
                  {loading ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f9fa' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  heading: { fontSize: '26px', fontWeight: '800', color: '#111827' },
  createBtn: {
    padding: '10px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600',
  },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' },
  statCard: { padding: '24px', borderRadius: '12px', textAlign: 'center' },
  statValue: { fontSize: '36px', fontWeight: '800' },
  statLabel: { fontSize: '13px', color: '#6b7280', marginTop: '4px', fontWeight: '500' },
  subheading: { fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' },
  empty: { textAlign: 'center', padding: '40px', color: '#9ca3af', background: '#fff', borderRadius: '12px' },
  productList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  productRow: {
    display: 'flex', alignItems: 'center', gap: '16px',
    background: '#fff', borderRadius: '10px', padding: '12px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  productImg: { width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 },
  rowImg: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  productInfo: { flex: 1 },
  productTitle: { fontWeight: '600', fontSize: '15px', color: '#111827' },
  productMeta: { fontSize: '13px', color: '#9ca3af', marginTop: '2px' },
  statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' },
  actions: { display: 'flex', gap: '8px' },
  editBtn: { padding: '7px 14px', borderRadius: '6px', background: '#e0e7ff', color: '#4338ca', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  deleteBtn: { padding: '7px 14px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' },
  modal: { background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#111827' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', outline: 'none' },
  textarea: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', outline: 'none', resize: 'vertical' },
  fileCount: { fontSize: '12px', color: '#667eea', marginTop: '4px' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  cancelBtn: { padding: '10px 20px', borderRadius: '8px', background: '#f3f4f6', color: '#374151', border: 'none', cursor: 'pointer', fontWeight: '600' },
  btn: { padding: '10px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnDisabled: { padding: '10px 24px', background: '#9ca3af', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: '600' },
};