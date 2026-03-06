import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);

  useEffect(() => {
    API.get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => navigate('/marketplace'));
  }, [id]);

  if (!product) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <button onClick={() => navigate('/marketplace')} style={styles.back}>← Back to Marketplace</button>

        <div style={styles.layout}>
          {/* Images */}
          <div style={styles.imgSection}>
            <div style={styles.mainImgWrap}>
              {product.images?.[selectedImg]
                ? <img src={product.images[selectedImg]} alt={product.title} style={styles.mainImg} />
                : <div style={styles.noImg}>No Image</div>
              }
            </div>
            {product.images?.length > 1 && (
              <div style={styles.thumbRow}>
                {product.images.map((img, i) => (
                  <img
                    key={i} src={img} alt=""
                    style={i === selectedImg ? styles.thumbActive : styles.thumb}
                    onClick={() => setSelectedImg(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={styles.info}>
            <span style={styles.category}>{product.category}</span>
            <h1 style={styles.title}>{product.title}</h1>
            <p style={styles.brand}>by {product.owner?.name}</p>
            <p style={styles.price}>${Number(product.price).toFixed(2)}</p>
            <p style={styles.desc}>{product.description}</p>
            <div style={styles.meta}>
              <span style={styles.metaItem}>📦 Status: {product.status}</span>
              <span style={styles.metaItem}>🗂️ Category: {product.category}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f9fa' },
  loading: { textAlign: 'center', padding: '60px', fontSize: '16px' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  back: {
    background: 'none', border: 'none', color: '#667eea',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginBottom: '24px',
  },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' },
  imgSection: { display: 'flex', flexDirection: 'column', gap: '12px' },
  mainImgWrap: { borderRadius: '12px', overflow: 'hidden', height: '380px', background: '#f3f4f6' },
  mainImg: { width: '100%', height: '100%', objectFit: 'cover' },
  noImg: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' },
  thumbRow: { display: 'flex', gap: '8px' },
  thumb: { width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '2px solid transparent' },
  thumbActive: { width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '2px solid #667eea' },
  info: { display: 'flex', flexDirection: 'column', gap: '16px' },
  category: {
    fontSize: '12px', fontWeight: '700', color: '#667eea',
    textTransform: 'uppercase', letterSpacing: '1px',
  },
  title: { fontSize: '28px', fontWeight: '800', color: '#111827' },
  brand: { fontSize: '14px', color: '#9ca3af' },
  price: { fontSize: '32px', fontWeight: '800', color: '#111827' },
  desc: { fontSize: '15px', color: '#4b5563', lineHeight: '1.7' },
  meta: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' },
  metaItem: { fontSize: '13px', color: '#6b7280' },
};