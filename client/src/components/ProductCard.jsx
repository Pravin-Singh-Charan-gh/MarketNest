import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div style={styles.card} onClick={() => navigate(`/products/${product._id}`)}>
      <div style={styles.imgWrap}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.title} style={styles.img} />
          : <div style={styles.noImg}>No Image</div>
        }
      </div>
      <div style={styles.body}>
        <p style={styles.category}>{product.category}</p>
        <h3 style={styles.title}>{product.title}</h3>
        <p style={styles.brand}>by {product.owner?.name || 'Brand'}</p>
        <div style={styles.footer}>
          <span style={styles.price}>${Number(product.price).toFixed(2)}</span>
          <span style={styles.viewBtn}>View →</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff', borderRadius: '12px',
    overflow: 'hidden', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #f3f4f6',
  },
  imgWrap: { height: '200px', overflow: 'hidden', background: '#f9fafb' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: {
    height: '100%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    color: '#9ca3af', fontSize: '14px',
  },
  body: { padding: '16px' },
  category: {
    fontSize: '11px', fontWeight: '600', color: '#667eea',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
  },
  title: { fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px' },
  brand: { fontSize: '12px', color: '#9ca3af', marginBottom: '12px' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: '18px', fontWeight: '800', color: '#111827' },
  viewBtn: { fontSize: '13px', color: '#667eea', fontWeight: '600' },
};