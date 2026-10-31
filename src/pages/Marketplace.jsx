import { useCallback, useEffect, useState } from 'react';
import { ShoppingBag, Plus, X, Tag, User, Phone, CheckCircle, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Books', 'Clothing', 'Services', 'Kitchen', 'Sports', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

function ListingCard({ item, onUpdate, onDelete, currentUserId, isAdmin }) {
  const isOwner = item.seller?._id?.toString() === currentUserId?.toString() || isAdmin;
  const isSold = item.status === 'sold';

  return (
    <div className="glass-card animate-fade-in" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: isSold ? 0.75 : 1 }}>
      {/* Image header */}
      <div style={{ width: '100%', height: 180, background: 'var(--parchment)', position: 'relative', overflow: 'hidden' }}>
        {item.images && item.images[0] ? (
          <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: 'var(--ink-50)' }}>
            🛍️
          </div>
        )}
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(32,38,31,0.7)', backdropFilter: 'blur(4px)', color: '#fff', padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
          {item.category}
        </div>
        {isSold && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#d32f2f', color: '#fff', padding: '4px 16px', borderRadius: 99, fontWeight: 800, fontSize: 14, letterSpacing: '0.06em' }}>SOLD</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: 'var(--ink)', lineHeight: 1.3 }}>{item.title}</h3>
            <span style={{ fontWeight: 800, fontSize: 16, color: item.price === 0 ? '#6E8F73' : 'var(--clay)', flexShrink: 0 }}>
              {item.price === 0 ? 'FREE' : `₹${item.price.toLocaleString('en-IN')}`}
            </span>
          </div>

          <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--ink-70)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12, color: 'var(--ink-50)' }}>
            <span style={{ background: 'rgba(32,38,31,0.05)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{item.condition}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><User style={{ width: 12, height: 12 }} /> {item.seller?.name || 'Resident'}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ paddingTop: 10, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {item.contactInfo ? (
            <span style={{ fontSize: 12, color: 'var(--sage)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Phone style={{ width: 12, height: 12 }} /> {item.contactInfo}
            </span>
          ) : <span />}

          <div style={{ display: 'flex', items: 'center', gap: 6 }}>
            {isOwner && !isSold && (
              <button
                onClick={() => onUpdate(item._id, { status: 'sold' })}
                style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, border: 'none', background: 'rgba(110,143,115,0.15)', color: 'var(--sage)', cursor: 'pointer' }}
              >
                Mark Sold
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => onDelete(item._id)}
                style={{ fontSize: 11, color: 'var(--clay)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                title="Delete listing"
              >
                <Trash2 style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateListingModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Furniture', price: '', condition: 'Good', contactInfo: '', images: [],
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'neighbourhub_preset'); // Uses existing preset or direct upload

    try {
      // If cloudinary direct upload or api upload
      const res = await fetch(`https://api.cloudinary.com/v1_1/ds6qgaafh/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        set('images', [data.secure_url]);
        toast.success('Image uploaded!');
      } else {
        toast.error('Image upload failed');
      }
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/marketplace', {
        ...form,
        price: form.price ? Number(form.price) : 0,
      });
      toast.success('Listing created!');
      onCreated(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(32,38,31,0.4)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', padding: 28, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-50)' }}>
          <X style={{ width: 20, height: 20 }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,var(--sage),var(--clay))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛍️</div>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: 'var(--ink)' }}>New Marketplace Listing</h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-50)' }}>Sell, give away, or offer services to neighbours</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Title *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Wooden Dining Table (4 chairs)" required className="glass-input" style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="glass-input" style={{ width: '100%' }}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Condition</label>
              <select value={form.condition} onChange={e => set('condition', e.target.value)} className="glass-input" style={{ width: '100%' }}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Price (₹) — Leave empty for Free</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" min="0" className="glass-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Phone / Contact Info</label>
              <input type="text" value={form.contactInfo} onChange={e => set('contactInfo', e.target.value)} placeholder="e.g. 9876543210" className="glass-input" style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe condition, pickup instructions, reason for selling..." required rows={3} className="glass-input" style={{ width: '100%', resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: 13 }} />
            {uploading && <p style={{ fontSize: 12, color: 'var(--sage)', marginTop: 4 }}>Uploading image...</p>}
            {form.images[0] && <img src={form.images[0]} alt="Preview" style={{ marginTop: 8, height: 80, borderRadius: 8, objectFit: 'cover' }} />}
          </div>

          <button type="submit" disabled={loading || uploading} style={{ marginTop: 4, padding: '12px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,var(--sage),var(--clay))', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Posting…' : '✓ Post Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Marketplace() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewTab, setViewTab] = useState('browse'); // 'browse' | 'my'
  const isAdmin = user?.role === 'admin';

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const url = viewTab === 'my' ? '/marketplace/my' : `/marketplace${selectedCategory !== 'All' ? `?category=${selectedCategory}` : ''}`;
      const { data } = await api.get(url);
      setListings(data);
    } catch {
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, viewTab]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleUpdate = async (id, updates) => {
    try {
      const { data } = await api.patch(`/marketplace/${id}`, updates);
      setListings(prev => prev.map(l => l._id === id ? data : l));
      toast.success('Listing updated');
    } catch {
      toast.error('Failed to update listing');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    try {
      await api.delete(`/marketplace/${id}`);
      setListings(prev => prev.filter(l => l._id !== id));
      toast.success('Listing removed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete listing';
      toast.error(msg);
      console.error('Delete listing error:', err.response?.data || err);
    }
  };

  const tabBtnStyle = (active) => ({
    padding: '7px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
    background: active ? 'linear-gradient(135deg,var(--sage),var(--clay))' : 'transparent',
    color: active ? '#fff' : 'var(--ink-70)',
    transition: 'all 0.2s',
  });

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,var(--sage),var(--clay))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🛍️</div>
            <div>
              <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: 'var(--ink)' }}>Community Marketplace</h1>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-50)' }}>Buy, sell, share or offer services within your society</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,var(--clay),var(--brick))', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(201,123,90,0.3)' }}>
            <Plus style={{ width: 16, height: 16 }} /> Sell / Post Item
          </button>
        </div>

        {/* View tab (Browse vs My Listings) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--parchment-card)', borderRadius: 12, border: '1px solid var(--line)' }}>
            <button style={tabBtnStyle(viewTab === 'browse')} onClick={() => setViewTab('browse')}>Browse Items</button>
            <button style={tabBtnStyle(viewTab === 'my')} onClick={() => setViewTab('my')}>My Listings</button>
          </div>

          {viewTab === 'browse' && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid var(--line)', cursor: 'pointer', whiteSpace: 'nowrap',
                    background: selectedCategory === cat ? 'var(--ink)' : 'var(--parchment-card)',
                    color: selectedCategory === cat ? '#fff' : 'var(--ink-70)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {[1,2,3,4].map(i => <div key={i} className="glass-card" style={{ height: 260, opacity: 0.4, animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="glass-card" style={{ padding: '64px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
            <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 8 }}>No listings found</p>
            <p style={{ color: 'var(--ink-50)', fontSize: 14 }}>Be the first to post something for sale or free giveaway!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {listings.map(item => (
              <ListingCard
                key={item._id}
                item={item}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                currentUserId={user?._id}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && <CreateListingModal onClose={() => setShowModal(false)} onCreated={item => setListings(prev => [item, ...prev])} />}
    </Layout>
  );
}
