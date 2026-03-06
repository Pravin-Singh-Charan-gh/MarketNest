import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['all', 'clothing', 'shoes', 'accessories', 'bags', 'jewelry', 'other'];

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;

      const { data } = await API.get('/products', { params });
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch whenever page, category changes
  useEffect(() => { fetchProducts(); }, [page, category]);

  // Search with debounce — wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchProducts(); }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.heading}>Explore Products</h1>

        {/* Search + Filter bar */}
        <div style={styles.controls}>
          <input
            style={styles.search}
            placeholder="🔍  Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={styles.categories}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                style={category === cat ? styles.catBtnActive : styles.catBtn}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        {loading ? (
          <div style={styles.center}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={styles.center}>No products found.</div>
        ) : (
          <div style={styles.grid}>
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              style={page === 1 ? styles.pgBtnDisabled : styles.pgBtn}
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
            >← Prev</button>
            <span style={styles.pgInfo}>Page {page} of {totalPages}</span>
            <button
              style={page === totalPages ? styles.pgBtnDisabled : styles.pgBtn}
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
            >Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f9fa' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  heading: { fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '24px' },
  controls: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' },
  search: {
    padding: '14px 20px', borderRadius: '10px',
    border: '1.5px solid #e5e7eb', fontSize: '15px',
    outline: 'none', width: '100%', maxWidth: '480px',
  },
  categories: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  catBtn: {
    padding: '7px 16px', borderRadius: '20px',
    border: '1.5px solid #e5e7eb', background: '#fff',
    cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#374151',
  },
  catBtnActive: {
    padding: '7px 16px', borderRadius: '20px',
    border: '1.5px solid #667eea', background: '#667eea',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#fff',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '24px',
  },
  center: { textAlign: 'center', padding: '60px', color: '#6b7280', fontSize: '16px' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '40px' },
  pgBtn: {
    padding: '10px 20px', borderRadius: '8px',
    border: '1.5px solid #667eea', background: '#fff',
    color: '#667eea', cursor: 'pointer', fontWeight: '600',
  },
  pgBtnDisabled: {
    padding: '10px 20px', borderRadius: '8px',
    border: '1.5px solid #e5e7eb', background: '#f9fafb',
    color: '#9ca3af', cursor: 'not-allowed', fontWeight: '600',
  },
  pgInfo: { fontSize: '14px', color: '#6b7280' },
};